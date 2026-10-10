export function sourceKey(source) {
  if (typeof source === 'string') return source;
  if (!source) return '';
  return source.owner ? `${source.owner}/${source.name}` : source.name || '';
}

export function canonicalUrl(value) {
  const url = new URL(value);
  url.hash = '';
  for (const key of [...url.searchParams.keys()]) {
    if (/^(utm_|ref$|source$)/i.test(key)) url.searchParams.delete(key);
  }
  url.searchParams.sort();
  if (url.pathname.length > 1) url.pathname = url.pathname.replace(/\/$/, '');
  return url.toString();
}

export function stableOpportunityId(item) {
  try {
    return sourceKey(item.sourceRepo) + '|' + canonicalUrl(item.url);
  } catch {
    return item.id || '';
  }
}

export function usableUrl(value, repoKey = '') {
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol)) return false;
    if (/(^|\.)shields\.io$/.test(url.hostname)) return false;
    if (/\.(svg|png|jpg|jpeg|gif)$/i.test(url.pathname)) return false;
    if (url.hostname === 'github.com' && url.pathname.replace(/\/$/, '').toLowerCase() === `/${repoKey.toLowerCase()}`) return false;
    return true;
  } catch {
    return false;
  }
}

export function cleanUnknown(value) {
  const text = String(value || '').trim();
  if (!text || /^(n\/?a|tbd|unknown|not available|not specified|not mentioned|not announced|to be annou?nced|few available|yes,? available|see (website|details|program)|check (official|program|site)|actively accepting applications|paid position \(competitive compensation\))/i.test(text)) return '';
  if (/^(see website \/ rolling|rolling \/ open|global \/ online|remote \/ us \/ global)/i.test(text)) return '';
  return text;
}

export function explicitDate(value) {
  const text = cleanUnknown(value);
  if (!text || /^(?:started)\b|(?:not|no|unknown|rolling|check|see|open|ongoing)/i.test(text)) return null;
  const iso = text.match(/\b(20\d{2})-(\d{1,2})-(\d{1,2})\b/);
  if (iso) {
    const date = new Date(Date.UTC(+iso[1], +iso[2] - 1, +iso[3]));
    return date.getUTCFullYear() === +iso[1] && date.getUTCMonth() === +iso[2] - 1 && date.getUTCDate() === +iso[3] ? date : null;
  }
  const numeric = text.match(/\b(\d{1,2})\/(\d{1,2})\/(20\d{2})\b/);
  if (numeric) {
    const date = new Date(Date.UTC(+numeric[3], +numeric[2] - 1, +numeric[1]));
    return date.getUTCFullYear() === +numeric[3] && date.getUTCMonth() === +numeric[2] - 1 && date.getUTCDate() === +numeric[1] ? date : null;
  }
  const words = text.match(/(?:\b\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*,?\s+20\d{2}\b|\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+20\d{2}\b)/i);
  if (!words) return null;
  const date = new Date(words[0]);
  return Number.isNaN(date.getTime()) ? null : new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
}

export function normalizeOpportunity(item) {
  const repo = sourceKey(item.sourceRepo);
  // The school organizer's page is reachable; the list's subdomain has a broken TLS chain.
  const url = /^https?:\/\/(?:www\.)?anais\.naamii\.org\.np\//i.test(item.url || '')
    ? 'https://www.naamii.org/anais'
    : item.url;
  return {
    ...item,
    id: stableOpportunityId({ ...item, url }),
    sourceRepo: repo,
    url,
    deadline: cleanUnknown(item.deadline),
    location: cleanUnknown(item.location),
    stipend: explicitDate(item.stipend) || /^(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2}$/i.test(String(item.stipend || '').trim()) ? '' : cleanUnknown(item.stipend),
    dates: cleanUnknown(item.dates),
    notes: /^Extracted from /i.test(item.notes || '') ? '' : cleanUnknown(item.notes),
  };
}

export function isUsefulOpportunity(item, today = new Date()) {
  const repo = sourceKey(item.sourceRepo);
  const title = String(item.title || '').trim();
  if (title.length < 8 || !usableUrl(item.url, repo)) return false;
  if (repo === 'hazratali/awesome-ai-summerschool' && !/\b20\d{2}\b/.test(item.dates || '')) return false;
  if (/\b(?:application closed|applications closed|expired|no longer accepting)\b/i.test([item.title, item.notes, item.deadline].join(' '))) return false;
  if (/^(about|resources?|internships?|research|scholarships?|apply|home|overview|contents|table of contents|back to top|all year|student opportunities)$/i.test(title)) return false;
  if (/(?:20(?:0\d|1\d|2[0-5]))/.test(title) || /(?:20(?:0\d|1\d|2[0-5]))/.test(item.dates || '')) return false;
  const programDate = explicitDate(item.dates);
  if (programDate && programDate.getTime() < Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())) return false;
  const date = explicitDate(item.deadline);
  if (date && date.getTime() < Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())) return false;
  return true;
}

export function dedupeOpportunities(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = canonicalUrl(item.url).toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function replaceSourceOpportunities(previous, source, fresh) {
  const key = sourceKey(source);
  const oldForSource = previous.filter((item) => sourceKey(item.sourceRepo) === key);
  const firstSeenByUrl = new Map(oldForSource.map((item) => [canonicalUrl(item.url), item.discoveredAt]));
  const retained = previous.filter((item) => sourceKey(item.sourceRepo) !== key);
  const updated = fresh.map((item) => ({
    ...item,
    id: stableOpportunityId(item),
    discoveredAt: firstSeenByUrl.get(canonicalUrl(item.url)) || item.discoveredAt,
  }));
  return dedupeOpportunities([...updated, ...retained]);
}
