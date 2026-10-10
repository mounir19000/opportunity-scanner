// Robust Multi-Format GitHub Opportunity Fetcher & Parser
// Supports: Markdown tables (with/without outer pipes), HTML <table> elements,
// Markdown bullet lists, Embedded JSON datasets, and configured source files.

import { cleanUnknown, dedupeOpportunities, isUsefulOpportunity, normalizeOpportunity } from './opportunityData.js';

export function cleanText(str) {
  if (!str) return '';
  return str
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&euro;/g, '€')
    .replace(/&pound;/g, '£')
    .replace(/[*_~`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function parseMarkdownLink(str) {
  if (!str) return { text: '', url: '' };
  const match = str.match(/\[([^\]]+)\]\(([^)]+)\)/);
  if (match) {
    return {
      text: cleanText(match[1]),
      url: match[2].trim(),
    };
  }
  const hrefMatch = str.match(/href=["']([^"']+)["']/i);
  if (hrefMatch) {
    return {
      text: cleanText(str),
      url: hrefMatch[1].trim(),
    };
  }
  const rawUrlMatch = str.match(/(https?:\/\/[^\s<)\]]+)/i);
  if (rawUrlMatch) {
    return {
      text: cleanText(str.replace(rawUrlMatch[0], '')) || rawUrlMatch[0],
      url: rawUrlMatch[0],
    };
  }
  return {
    text: cleanText(str),
    url: '',
  };
}

export function inferType(title = '', category = '') {
  const t = (title || '').toLowerCase();
  const c = (category || '').toLowerCase();
  if (t.includes('summer school') || t.includes('winter school') || c.includes('summer school') || t.includes('school'))
    return 'Summer School';
  if (t.includes('intern') || t.includes('co-op') || c.includes('intern'))
    return 'Internship';
  if (t.includes('fellowship') || t.includes('fellow') || c.includes('fellowship'))
    return 'Fellowship';
  if (t.includes('scholarship') || t.includes('scholar') || c.includes('scholarship'))
    return 'Scholarship';
  if (t.includes('grant') || c.includes('grant'))
    return 'Grant';
  if (t.includes('research') || t.includes('reu') || t.includes('surf') || c.includes('research') || c.includes('reu'))
    return 'Research / REU';
  if (t.includes('residency') || c.includes('residency'))
    return 'Residency';
  if (t.includes('hackathon') || t.includes('challenge') || t.includes('contest'))
    return 'Hackathon';
  return 'Opportunity';
}

// 1. Markdown Table Parser
export function parseMarkdownTable(markdownText, repoInfo) {
  const lines = markdownText.split('\n');
  const opportunities = [];
  let inTable = false;
  let headerIndexMap = null;
  let lastHost = '';

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine.includes('|')) {
      if (inTable && rawLine.length === 0) {
        continue;
      }
      inTable = false;
      headerIndexMap = null;
      continue;
    }

    const rawCells = rawLine.split('|').map((c) => c.trim());
    if (rawCells.length > 0 && rawCells[0] === '') rawCells.shift();
    if (rawCells.length > 0 && rawCells[rawCells.length - 1] === '') rawCells.pop();

    if (rawCells.length < 2) continue;

    if (rawCells.every((c) => /^[ \t\-:]+$/.test(c))) {
      inTable = true;
      continue;
    }

    const headerLabels = rawCells.map((cell) => cleanText(cell).toLowerCase().replace(/[^a-z0-9 ]/g, '').trim());
    const knownHeaders = /^(name|company|program|role|position|title|venue|location|city|country|deadline|due|apply by|closes|organizers?|hosts?|university|institute|fee|scholarship|stipend|salary|aid|funding|date|timeline|duration|period|apply|posting|link|url)$/;
    const isHeader = headerLabels.filter((label) => knownHeaders.test(label)).length >= 2
      && headerLabels.some((label) => /^(name|company|program|role|position|title)$/.test(label));

    if (isHeader) {
      headerIndexMap = {};
      rawCells.forEach((c, idx) => {
        const lower = headerLabels[idx];
        if (lower.includes('name') || lower.includes('program') || lower.includes('title') || lower.includes('role') || lower.includes('position')) {
          if (headerIndexMap.title === undefined) headerIndexMap.title = idx;
        }
        if (lower.includes('company') || lower.includes('organizer') || lower.includes('host') || lower.includes('university') || lower.includes('institute')) {
          headerIndexMap.host = idx;
        }
        if (lower.includes('location') || lower.includes('venue') || lower.includes('city') || lower.includes('country')) {
          headerIndexMap.location = idx;
        }
        if (lower.includes('deadline') || lower.includes('due') || lower.includes('apply by') || lower.includes('closes')) {
          headerIndexMap.deadline = idx;
        }
        if (lower.includes('date') || lower.includes('timeline') || lower.includes('duration') || lower.includes('period')) {
          headerIndexMap.dates = idx;
        }
        if (lower === 'fee') headerIndexMap.fee = idx;
        if (lower.includes('stipend') || lower.includes('salary') || lower.includes('aid') || lower.includes('scholarship') || lower.includes('funding')) {
          headerIndexMap.stipend = idx;
        }
        if (lower.includes('apply') || lower.includes('posting') || lower.includes('link') || lower.includes('url')) {
          headerIndexMap.url = idx;
        }
      });
      inTable = true;
      continue;
    }

    if (inTable && headerIndexMap) {
      const titleCell = rawCells[headerIndexMap.title ?? 0] || '';
      const hostCell = headerIndexMap.host !== undefined ? rawCells[headerIndexMap.host] : '';
      const locCell = headerIndexMap.location !== undefined ? rawCells[headerIndexMap.location] : '';
      const deadlineCell = headerIndexMap.deadline !== undefined ? rawCells[headerIndexMap.deadline] : '';
      const datesCell = headerIndexMap.dates !== undefined ? rawCells[headerIndexMap.dates] : '';
      const stipendCell = headerIndexMap.stipend !== undefined ? rawCells[headerIndexMap.stipend] : '';
      const feeCell = headerIndexMap.fee !== undefined ? rawCells[headerIndexMap.fee] : '';
      const urlCell = headerIndexMap.url !== undefined ? rawCells[headerIndexMap.url] : '';

      const parsedTitle = parseMarkdownLink(titleCell);
      const parsedHost = parseMarkdownLink(hostCell);
      const parsedUrl = parseMarkdownLink(urlCell);

      const title = parsedTitle.text || cleanText(titleCell);
      if (!title || title.length < 2 || title.toLowerCase() === 'name' || title.toLowerCase() === 'company') {
        continue;
      }

      let host = parsedHost.text || cleanText(hostCell);
      if (!host || host === '↳' || host === '->') {
        host = lastHost;
      } else {
        lastHost = host;
      }

      const applyUrl = parsedUrl.url || (urlCell.startsWith('http') ? urlCell : '') || parsedTitle.url;
      const location = cleanText(locCell);
      const deadline = cleanText(deadlineCell);
      const dates = cleanText(datesCell);
      const stipend = [cleanText(stipendCell), cleanText(feeCell)].map(cleanUnknown).filter(Boolean).join(' · ');

      const repoIdentifier = `${repoInfo.owner}/${repoInfo.name}`;
      const id = `${repoInfo.owner}_${repoInfo.name}_${opportunities.length + 1}_${title.slice(0, 18).toLowerCase().replace(/[^a-z0-9]/g, '')}`;

      opportunities.push({
        id,
        title,
        host: host || '',
        category: repoInfo.category || 'General',
        type: inferType(title, repoInfo.category),
        location,
        deadline,
        dates,
        stipend,
        notes: `Extracted from ${repoIdentifier} markdown table`,
        url: applyUrl,
        sourceRepo: repoIdentifier,
        discoveredAt: new Date().toISOString(),
      });
    }
  }

  return opportunities;
}

// 2. HTML Table Parser
export function parseHtmlTable(htmlText, repoInfo) {
  const opportunities = [];
  const trMatches = htmlText.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi);
  if (!trMatches || trMatches.length === 0) return opportunities;

  let lastCompany = repoInfo.owner;

  for (let i = 0; i < trMatches.length; i++) {
    const tr = trMatches[i];
    if (tr.includes('<th')) continue;

    const tdMatches = tr.match(/<td[^>]*>([\s\S]*?)<\/td>/gi);
    if (!tdMatches || tdMatches.length < 2) continue;

    const cells = tdMatches.map((td) => cleanText(td));
    const links = [...tr.matchAll(/href=["']([^"']+)["']/gi)].map((m) => m[1]);

    let company = cells[0];
    let role = cells[1];
    let location = cells[2] || '';
    let applyLink = links.find((l) => l.startsWith('http') && !l.includes('simplify.jobs/c/')) || links.find((l) => l.startsWith('http')) || '';

    if (!role || role.length < 2) continue;

    if (!company || company === '↳' || company === '->') {
      company = lastCompany;
    } else {
      lastCompany = company;
    }

    const title = `${company} - ${role}`;
    const repoIdentifier = `${repoInfo.owner}/${repoInfo.name}`;
    const id = `${repoInfo.owner}_${repoInfo.name}_${opportunities.length + 1}_${title.slice(0, 18).toLowerCase().replace(/[^a-z0-9]/g, '')}`;

    opportunities.push({
      id,
      title,
      host: company,
      category: repoInfo.category || 'Tech & Software Engineering Internships',
      type: inferType(role, repoInfo.category),
      location,
      deadline: '',
      dates: '',
      stipend: '',
      notes: '',
      url: applyLink,
      sourceRepo: repoIdentifier,
      discoveredAt: new Date().toISOString(),
    });
  }

  return opportunities;
}

// 3. Bullet List Parser
export function parseMarkdownBullets(markdownText, repoInfo) {
  const lines = markdownText.split('\n');
  const opportunities = [];
  const geographicSections = new Set(['North America', 'Europe', 'Asia', 'Middle East', 'Australia & Oceania', 'Worldwide']);
  let inGeographicSection = false;
  let location = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (repoInfo.locationFromHeadings) {
      const heading = line.match(/^(#{2,4})\s+(.+)$/);
      if (heading) {
        const label = cleanText(heading[2]).replace(/^[^\p{L}]+/u, '');
        if (heading[1].length === 2) {
          inGeographicSection = geographicSections.has(label);
          location = inGeographicSection ? label : '';
        } else if (heading[1].length === 4 && inGeographicSection) {
          location = /Global Programs for Indian Students/i.test(label)
            ? 'Varies by programme'
            : /Multiple Countries/i.test(label) ? 'Multiple countries' : label;
        }
        continue;
      }
      if (!inGeographicSection) continue;
    }
    if (!line.startsWith('-') && !line.startsWith('*') && !/^\d+\./.test(line)) continue;

    const parsed = parseMarkdownLink(line);
    if (!parsed.url || !parsed.text || parsed.text.length < 3) continue;

    if (parsed.text.toLowerCase().includes('table of contents') || parsed.text.toLowerCase().includes('back to top')) {
      continue;
    }

    const repoIdentifier = `${repoInfo.owner}/${repoInfo.name}`;
    const id = `${repoInfo.owner}_${repoInfo.name}_${opportunities.length + 1}_${parsed.text.slice(0, 18).toLowerCase().replace(/[^a-z0-9]/g, '')}`;

    opportunities.push({
      id,
      title: parsed.text,
      host: '',
      category: repoInfo.category || 'General Opportunities',
      type: inferType(parsed.text, repoInfo.category),
      location,
      deadline: '',
      dates: '',
      stipend: '',
      notes: line.replace(/\[([^\]]+)\]\(([^)]+)\)/, '').replace(/^[-*0-9.]+\s*/, '').trim(),
      url: parsed.url,
      sourceRepo: repoIdentifier,
      discoveredAt: new Date().toISOString(),
    });
  }

  return opportunities;
}

async function fetchSourceFile(url, headers) {
  let lastError;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const signal = typeof AbortSignal !== 'undefined' && AbortSignal.timeout
        ? AbortSignal.timeout(10000)
        : undefined;
      const response = await fetch(url, { headers, signal });
      if ((response.status === 429 || response.status >= 500) && attempt === 0) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        continue;
      }
      return response;
    } catch (error) {
      lastError = error;
      if (attempt === 0) await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }
  throw lastError || new Error('Source file request failed');
}

// 4. Master Fetch Function for a Repository
export async function fetchRepositoryOpportunities(repo, token = '') {
  const startTime = Date.now();
  const repoName = repo.name;
  const repoOwner = repo.owner;
  const branches = repo.branch ? [repo.branch] : ['main', 'master', 'dev'];
  const filenames = repo.file ? [repo.file] : ['README.md', 'Readme.md', 'readme.md'];

  const headers = {};
  if (token) {
    headers['Authorization'] = `token ${token}`;
  }

  let content = null;
  let successfulUrl = null;
  let lastError = null;
  let statusCode = 404;

  for (const branch of branches) {
    for (const filename of filenames) {
      const rawUrl = `https://raw.githubusercontent.com/${repoOwner}/${repoName}/${branch}/${filename}`;
      try {
        const res = await fetchSourceFile(rawUrl, headers);
        if (res.ok) {
          content = await res.text();
          successfulUrl = rawUrl;
          statusCode = 200;
          break;
        } else {
          lastError = `HTTP ${res.status}: ${res.statusText}`;
          statusCode = res.status;
        }
      } catch (err) {
        lastError = err.message || 'Network error';
        statusCode = 0;
      }
    }
    if (content) break;
  }

  const durationMs = Date.now() - startTime;
  const repoIdentifier = `${repoOwner}/${repoName}`;

  if (!content) {
    const logEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      repo: repoIdentifier,
      repoName: repoName,
      repoOwner: repoOwner,
      url: repo.url,
      status: 'error',
      statusCode,
      httpStatus: statusCode,
      durationMs,
      itemsCount: 0,
      parsedCount: 0,
      error: lastError || 'Source file not found on configured branches',
      message: lastError || 'Source file not found on configured branches',
      timestamp: new Date().toISOString(),
    };
    return { opportunities: [], log: logEntry };
  }

  let opportunities = parseMarkdownTable(content, repo);
  if (opportunities.length === 0) {
    opportunities = parseHtmlTable(content, repo);
  }
  if (opportunities.length === 0) {
    opportunities = parseMarkdownBullets(content, repo);
  }

  opportunities = dedupeOpportunities(opportunities.map(normalizeOpportunity).filter((item) => isUsefulOpportunity(item)));
  const isSuccess = opportunities.length > 0;
  const logEntry = {
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    repo: repoIdentifier,
    repoName: repoName,
    repoOwner: repoOwner,
    url: repo.url,
    status: isSuccess ? 'success' : 'warning',
    statusCode: 200,
    httpStatus: 200,
    durationMs,
    itemsCount: opportunities.length,
    parsedCount: opportunities.length,
    error: isSuccess ? null : 'Fetched source file successfully, but 0 structured tables or listings were parsed',
    message: isSuccess
      ? `Parsed ${opportunities.length} opportunities from ${successfulUrl.split('/').slice(-2).join('/')}`
      : 'Fetched source file successfully, but 0 structured listings were found',
    timestamp: new Date().toISOString(),
  };

  return { opportunities, log: logEntry };
}
