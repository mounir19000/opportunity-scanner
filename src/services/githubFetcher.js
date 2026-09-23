// GitHub Opportunity Fetcher & Markdown Parser
// Fetches raw content from GitHub repositories and extracts structured opportunities
// Logs all successes and errors for the Logs diagnostic view.

// Helper to clean Markdown links [Text](URL) -> { text, url }
export function parseMarkdownLink(str) {
  if (!str) return { text: '', url: '' };
  const match = str.match(/\[([^\]]+)\]\(([^)]+)\)/);
  if (match) {
    return {
      text: match[1].trim(),
      url: match[2].trim(),
    };
  }
  // Try raw URL
  const urlMatch = str.match(/(https?:\/\/[^\s]+)/);
  if (urlMatch) {
    return {
      text: str.replace(urlMatch[0], '').trim() || urlMatch[0],
      url: urlMatch[0],
    };
  }
  return {
    text: str.replace(/[\[\]*`_]/g, '').trim(),
    url: '',
  };
}

// Clean HTML tags and markdown decorations
export function cleanText(str) {
  if (!str) return '';
  return str
    .replace(/<[^>]*>/g, ' ') // Strip HTML tags
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&euro;/g, '€')
    .replace(/[*_~`]/g, '') // Strip markdown formatting
    .replace(/\s+/g, ' ')
    .trim();
}

// Parse Markdown Table Rows
export function parseMarkdownTable(markdownText, repoInfo) {
  const lines = markdownText.split('\n');
  const opportunities = [];
  let inTable = false;
  let headers = [];
  let headerIndexMap = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Check if line looks like a table row
    if (line.startsWith('|') && line.endsWith('|')) {
      const cells = line
        .split('|')
        .slice(1, -1)
        .map((c) => c.trim());

      // If this is separator row (|---|---|)
      if (cells.every((c) => /^[ \t\-:]+$/.test(c))) {
        continue;
      }

      // Check if this looks like a header row
      const isHeader = cells.some((c) => {
        const lower = c.toLowerCase();
        return (
          lower.includes('name') ||
          lower.includes('company') ||
          lower.includes('program') ||
          lower.includes('role') ||
          lower.includes('title') ||
          lower.includes('location') ||
          lower.includes('deadline') ||
          lower.includes('stipend') ||
          lower.includes('fee') ||
          lower.includes('eligibility')
        );
      });

      if (isHeader) {
        headers = cells.map((c) => c.toLowerCase());
        headerIndexMap = {};
        headers.forEach((h, idx) => {
          if (h.includes('name') || h.includes('program') || h.includes('role') || h.includes('title')) {
            if (headerIndexMap.title === undefined) headerIndexMap.title = idx;
          }
          if (h.includes('company') || h.includes('organizer') || h.includes('university') || h.includes('institute') || h.includes('host') || h.includes('provider')) {
            headerIndexMap.host = idx;
          }
          if (h.includes('location') || h.includes('venue') || h.includes('city') || h.includes('dest')) {
            headerIndexMap.location = idx;
          }
          if (h.includes('deadline') || h.includes('apply by') || h.includes('date') || h.includes('timeline')) {
            headerIndexMap.deadline = idx;
          }
          if (h.includes('stipend') || h.includes('fee') || h.includes('scholarship') || h.includes('aid') || h.includes('funding') || h.includes('reward') || h.includes('salary')) {
            headerIndexMap.stipend = idx;
          }
          if (h.includes('eligibility') || h.includes('level') || h.includes('audience') || h.includes('stage') || h.includes('qualification')) {
            headerIndexMap.eligibility = idx;
          }
          if (h.includes('apply') || h.includes('link') || h.includes('application')) {
            headerIndexMap.url = idx;
          }
        });
        inTable = true;
        continue;
      }

      if (inTable && cells.length >= 2) {
        const titleRaw = cells[headerIndexMap.title ?? 0] || '';
        const hostRaw = headerIndexMap.host !== undefined ? cells[headerIndexMap.host] : '';
        const locRaw = headerIndexMap.location !== undefined ? cells[headerIndexMap.location] : '';
        const deadlineRaw = headerIndexMap.deadline !== undefined ? cells[headerIndexMap.deadline] : '';
        const stipendRaw = headerIndexMap.stipend !== undefined ? cells[headerIndexMap.stipend] : '';
        const eligRaw = headerIndexMap.eligibility !== undefined ? cells[headerIndexMap.eligibility] : '';
        const urlRaw = headerIndexMap.url !== undefined ? cells[headerIndexMap.url] : '';

        // Extract title link
        const parsedTitle = parseMarkdownLink(titleRaw);
        const parsedUrl = parseMarkdownLink(urlRaw);
        const parsedHost = parseMarkdownLink(hostRaw);

        const title = cleanText(parsedTitle.text || titleRaw);
        if (!title || title.length < 2 || title.toLowerCase() === 'name' || title.toLowerCase() === 'company') {
          continue;
        }

        const applyUrl = parsedTitle.url || parsedUrl.url || (urlRaw.startsWith('http') ? urlRaw : '');
        const host = cleanText(parsedHost.text || hostRaw) || repoInfo.owner;
        const location = cleanText(locRaw) || 'Check details';
        const deadline = cleanText(deadlineRaw) || 'Check official site';
        const stipend = cleanText(stipendRaw) || 'See description';
        const eligibility = cleanText(eligRaw) || repoInfo.target_audience || 'Open to eligible applicants';

        const id = `${repoInfo.owner}_${repoInfo.name}_${opportunities.length + 1}_${title.substring(0, 20).toLowerCase().replace(/[^a-z0-9]/g, '')}`;

        opportunities.push({
          id,
          title,
          host,
          category: repoInfo.category || 'General Opportunities',
          type: inferType(title, repoInfo.category),
          location,
          deadline,
          stipend,
          eligibility,
          url: applyUrl || repoInfo.url,
          sourceRepo: {
            name: repoInfo.name,
            owner: repoInfo.owner,
            url: repoInfo.url,
            category: repoInfo.category,
          },
          discoveredAt: new Date().toISOString(),
        });
      }
    } else {
      if (inTable && line.length === 0) {
        // Table ended, but there could be more tables below
      }
    }
  }

  return opportunities;
}

// Parse markdown bullet lists: - [Name](url) - Details
export function parseMarkdownBullets(markdownText, repoInfo) {
  const lines = markdownText.split('\n');
  const opportunities = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if ((line.startsWith('- [') || line.startsWith('* [') || line.startsWith('1. [')) && line.includes('](')) {
      const linkMatch = line.match(/[*-]?\s*\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch) {
        const title = cleanText(linkMatch[1]);
        const url = linkMatch[2];
        const afterText = line.substring(linkMatch[0].length).replace(/^[\s\-–—:]+/, '').trim();

        if (title.length < 2 || url.startsWith('#') || title.toLowerCase().includes('contribute') || title.toLowerCase().includes('table of contents')) {
          continue;
        }

        const id = `${repoInfo.owner}_${repoInfo.name}_b_${opportunities.length + 1}_${title.substring(0, 20).toLowerCase().replace(/[^a-z0-9]/g, '')}`;

        opportunities.push({
          id,
          title,
          host: repoInfo.owner,
          category: repoInfo.category || 'General Opportunities',
          type: inferType(title, repoInfo.category),
          location: 'See details',
          deadline: extractDeadline(afterText) || 'Check official site',
          stipend: extractFunding(afterText) || 'Funded / See details',
          eligibility: repoInfo.target_audience || 'Eligible applicants',
          description: cleanText(afterText),
          url,
          sourceRepo: {
            name: repoInfo.name,
            owner: repoInfo.owner,
            url: repoInfo.url,
            category: repoInfo.category,
          },
          discoveredAt: new Date().toISOString(),
        });
      }
    }
  }

  return opportunities;
}

// Parse JSON data if repository has embedded open-opportunity-index or json
export function parseEmbeddedJson(text, repoInfo) {
  const opportunities = [];
  try {
    const dataMatch = text.match(/const\s+OPPORTUNITIES\s*=\s*(\[[\s\S]*?\]);/) || text.match(/DATA\s*=\s*(\[[\s\S]*?\]);/);
    if (dataMatch) {
      // Evaluate or parse safely
      const jsonStr = dataMatch[1]
        .replace(/'/g, '"')
        .replace(/(\w+):/g, '"$1":')
        .replace(/,\s*]/g, ']');
      const items = JSON.parse(jsonStr);
      if (Array.isArray(items)) {
        items.forEach((item, idx) => {
          opportunities.push({
            id: `${repoInfo.owner}_${repoInfo.name}_json_${idx + 1}`,
            title: item.name || item.title,
            host: item.provider || item.organization || repoInfo.owner,
            category: repoInfo.category,
            type: item.type ? item.type.toUpperCase() : 'SCHOLARSHIP / RESEARCH',
            location: item.dest || item.location || 'Worldwide',
            deadline: item.deadline || 'Check website',
            stipend: item.funding ? `${item.funding.toUpperCase()} (${item.fundNote || ''})` : 'Funded',
            eligibility: item.scopeNote || (item.levels ? item.levels.join(', ') : 'International'),
            description: item.desc || '',
            url: item.link || item.url || repoInfo.url,
            sourceRepo: {
              name: repoInfo.name,
              owner: repoInfo.owner,
              url: repoInfo.url,
              category: repoInfo.category,
            },
            discoveredAt: new Date().toISOString(),
          });
        });
      }
    }
  } catch (e) {
    // Not JSON, ignore
  }
  return opportunities;
}

function inferType(title, category = '') {
  const t = title.toLowerCase();
  const c = category.toLowerCase();
  if (t.includes('summer school') || t.includes('winter school') || c.includes('summer') || c.includes('school')) return 'Summer School';
  if (t.includes('intern') || c.includes('intern')) return 'Internship';
  if (t.includes('fellowship') || c.includes('fellow')) return 'Fellowship';
  if (t.includes('scholarship') || c.includes('scholar')) return 'Scholarship';
  if (t.includes('grant') || c.includes('grant')) return 'Grant';
  if (t.includes('research') || t.includes('reu') || t.includes('surf') || c.includes('research')) return 'Research / REU';
  if (t.includes('hackathon') || t.includes('contest') || t.includes('challenge') || c.includes('competition')) return 'Competition';
  return 'Program';
}

function extractDeadline(text) {
  if (!text) return '';
  const match = text.match(/(deadline|due|by|closes?|ends?):?\s*([A-Za-z0-9,\s\-–]+)/i);
  return match ? match[0].substring(0, 30) : '';
}

function extractFunding(text) {
  if (!text) return '';
  const match = text.match(/(\$[\d,]+|\€[\d,]+|£[\d,]+|INR\s*[\d,]+|stipend|paid|free|funded)/i);
  return match ? match[0] : '';
}

// Fetch a single repository's README
export async function fetchRepositoryOpportunities(repo, token = '') {
  const startTime = Date.now();
  const branches = ['main', 'master'];
  let markdown = null;
  let successBranch = null;
  let lastError = null;

  const headers = {};
  if (token) {
    headers['Authorization'] = `token ${token}`;
  }

  for (const branch of branches) {
    const rawUrl = `https://raw.githubusercontent.com/${repo.owner}/${repo.name}/${branch}/README.md`;
    try {
      const res = await fetch(rawUrl, { headers });
      if (res.ok) {
        markdown = await res.text();
        successBranch = branch;
        break;
      } else {
        lastError = `HTTP ${res.status}: ${res.statusText} (${rawUrl})`;
      }
    } catch (err) {
      lastError = err.message || 'Network error (CORS or offline)';
    }
  }

  const durationMs = Date.now() - startTime;

  if (!markdown) {
    const logEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      repoName: repo.name,
      repoOwner: repo.owner,
      url: repo.url,
      attemptedBranch: branches.join(', '),
      status: 'error',
      statusCode: 404,
      durationMs,
      itemsCount: 0,
      error: lastError || 'Failed to fetch README from main or master branch',
      timestamp: new Date().toISOString(),
    };
    return { opportunities: [], log: logEntry };
  }

  // Parse opportunities from markdown
  let parsed = parseMarkdownTable(markdown, repo);
  if (parsed.length === 0) {
    parsed = parseMarkdownBullets(markdown, repo);
  }
  if (parsed.length === 0) {
    parsed = parseEmbeddedJson(markdown, repo);
  }

  const logEntry = {
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    repoName: repo.name,
    repoOwner: repo.owner,
    url: repo.url,
    attemptedBranch: successBranch,
    status: parsed.length > 0 ? 'success' : 'warning',
    statusCode: 200,
    durationMs,
    itemsCount: parsed.length,
    error: parsed.length === 0 ? 'Fetched README successfully, but found 0 structured table entries.' : null,
    timestamp: new Date().toISOString(),
  };

  return { opportunities: parsed, log: logEntry };
}
