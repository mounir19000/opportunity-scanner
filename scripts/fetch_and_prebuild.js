import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const reposPath = path.join(__dirname, '../src/data/repositories.json');
const outputPath = path.join(__dirname, '../src/data/initialOpportunities.json');
const logsOutputPath = path.join(__dirname, '../src/data/initialLogs.json');

const reposData = JSON.parse(fs.readFileSync(reposPath, 'utf-8'));
const repositories = reposData.repositories;

console.log(`Starting pre-build fetch for ${repositories.length} repositories...`);

function cleanText(str) {
  if (!str) return '';
  return str
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&euro;/g, '€')
    .replace(/[*_~`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseMarkdownLink(str) {
  if (!str) return { text: '', url: '' };
  const match = str.match(/\[([^\]]+)\]\(([^)]+)\)/);
  if (match) {
    return { text: match[1].trim(), url: match[2].trim() };
  }
  const urlMatch = str.match(/(https?:\/\/[^\s]+)/);
  if (urlMatch) {
    return { text: str.replace(urlMatch[0], '').trim() || urlMatch[0], url: urlMatch[0] };
  }
  return { text: str.replace(/[\[\]*`_]/g, '').trim(), url: '' };
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

function parseMarkdownTable(markdownText, repoInfo) {
  const lines = markdownText.split('\n');
  const opportunities = [];
  let inTable = false;
  let headers = [];
  let headerIndexMap = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('|') && line.endsWith('|')) {
      const cells = line.split('|').slice(1, -1).map(c => c.trim());
      if (cells.every(c => /^[-:\s]+$/.test(c))) continue;

      const isHeader = cells.some(c => {
        const lower = c.toLowerCase();
        return (
          lower.includes('name') || lower.includes('company') || lower.includes('program') ||
          lower.includes('role') || lower.includes('title') || lower.includes('location') ||
          lower.includes('deadline') || lower.includes('stipend') || lower.includes('fee') ||
          lower.includes('eligibility') || lower.includes('rewards')
        );
      });

      if (isHeader) {
        headers = cells.map(c => c.toLowerCase());
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
          if (h.includes('eligibility') || h.includes('level') || h.includes('audience') || h.includes('stage')) {
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

        const parsedTitle = parseMarkdownLink(titleRaw);
        const parsedUrl = parseMarkdownLink(urlRaw);
        const parsedHost = parseMarkdownLink(hostRaw);

        const title = cleanText(parsedTitle.text || titleRaw);
        if (!title || title.length < 2 || title.toLowerCase() === 'name' || title.toLowerCase() === 'company') {
          continue;
        }

        const applyUrl = parsedTitle.url || parsedUrl.url || (urlRaw.startsWith('http') ? urlRaw : '');
        const host = cleanText(parsedHost.text || hostRaw) || repoInfo.owner;
        const location = cleanText(locRaw) || 'Check official site';
        const deadline = cleanText(deadlineRaw) || 'Check official site';
        const stipend = cleanText(stipendRaw) || 'See description';
        const eligibility = cleanText(eligRaw) || repoInfo.target_audience || 'Open to all eligible applicants';

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
            category: repoInfo.category
          },
          discoveredAt: new Date().toISOString()
        });
      }
    }
  }
  return opportunities;
}

function parseMarkdownBullets(markdownText, repoInfo) {
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
          deadline: 'Check official site',
          stipend: 'Funded / See details',
          eligibility: repoInfo.target_audience || 'Eligible applicants',
          description: cleanText(afterText),
          url,
          sourceRepo: {
            name: repoInfo.name,
            owner: repoInfo.owner,
            url: repoInfo.url,
            category: repoInfo.category
          },
          discoveredAt: new Date().toISOString()
        });
      }
    }
  }
  return opportunities;
}

async function fetchRepo(repo) {
  const branches = ['main', 'master'];
  const startTime = Date.now();
  let markdown = null;
  let successBranch = null;
  let lastError = null;

  for (const branch of branches) {
    const rawUrl = `https://raw.githubusercontent.com/${repo.owner}/${repo.name}/${branch}/README.md`;
    try {
      const res = await fetch(rawUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Node.js Opportunity Scout)' }
      });
      if (res.ok) {
        markdown = await res.text();
        successBranch = branch;
        break;
      } else {
        lastError = `HTTP ${res.status}: ${res.statusText}`;
      }
    } catch (e) {
      lastError = e.message;
    }
  }

  const durationMs = Date.now() - startTime;

  if (!markdown) {
    return {
      items: [],
      log: {
        id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        repoName: repo.name,
        repoOwner: repo.owner,
        url: repo.url,
        attemptedBranch: branches.join(', '),
        status: 'error',
        statusCode: 404,
        durationMs,
        itemsCount: 0,
        error: lastError || 'Failed to fetch README from branches: main, master',
        timestamp: new Date().toISOString()
      }
    };
  }

  let items = parseMarkdownTable(markdown, repo);
  if (items.length === 0) {
    items = parseMarkdownBullets(markdown, repo);
  }

  return {
    items,
    log: {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      repoName: repo.name,
      repoOwner: repo.owner,
      url: repo.url,
      attemptedBranch: successBranch,
      status: items.length > 0 ? 'success' : 'warning',
      statusCode: 200,
      durationMs,
      itemsCount: items.length,
      error: items.length === 0 ? 'README fetched successfully, but 0 structured tables or entries found' : null,
      timestamp: new Date().toISOString()
    }
  };
}

async function run() {
  const allOpportunities = [];
  const allLogs = [];

  // Fetch top 35 representative repositories in batches to respect rate limits
  const priorityRepos = repositories.slice(0, 35);

  console.log(`Querying ${priorityRepos.length} primary repositories concurrently...`);

  // Batching 5 at a time
  for (let i = 0; i < priorityRepos.length; i += 5) {
    const batch = priorityRepos.slice(i, i + 5);
    const results = await Promise.all(batch.map(r => fetchRepo(r)));
    for (const res of results) {
      allOpportunities.push(...res.items);
      allLogs.push(res.log);
    }
    console.log(`Progress: ${Math.min(i + 5, priorityRepos.length)} / ${priorityRepos.length} repos processed (${allOpportunities.length} opportunities found)`);
  }

  // Deduplicate by title & host
  const seen = new Set();
  const deduplicated = [];
  for (const item of allOpportunities) {
    const key = `${item.title.toLowerCase()}_${item.host.toLowerCase()}`;
    if (!seen.has(key)) {
      seen.add(key);
      deduplicated.push(item);
    }
  }

  console.log(`Saving ${deduplicated.length} opportunities to ${outputPath}...`);
  fs.writeFileSync(outputPath, JSON.stringify(deduplicated, null, 2), 'utf-8');
  fs.writeFileSync(logsOutputPath, JSON.stringify(allLogs, null, 2), 'utf-8');
  console.log(`Pre-build complete! Logs saved to ${logsOutputPath}.`);
}

run().catch(err => {
  console.error('Fatal pre-build error:', err);
  process.exit(1);
});
