import { dedupeOpportunities, normalizeOpportunity, sourceKey, usableUrl } from './opportunityData.js';

const CACHE_KEY = 'opportunity_scout_source_cache_v1';

function sourceSignature(sources) {
  return sources.map(sourceKey).sort().join('|');
}

export function normalizeListings(items, sources) {
  if (!Array.isArray(items)) return [];
  const allowed = new Set(sources.map(sourceKey));
  return items
    .filter((item) => item && allowed.has(sourceKey(item.sourceRepo)) && usableUrl(item.url, sourceKey(item.sourceRepo)))
    .map(normalizeOpportunity);
}

export function reconcileSnapshot(snapshot, cached, sources) {
  const published = normalizeListings(Array.isArray(snapshot) ? snapshot : snapshot.items, sources);
  const generatedAt = Array.isArray(snapshot)
    ? published.reduce((latest, item) => item.discoveredAt > latest ? item.discoveredAt : latest, '')
    : snapshot.generatedAt || '';
  const local = normalizeListings(cached?.items, sources);
  const newerSources = new Set(sources.map(sourceKey).filter((key) => cached?.sourceUpdatedAt?.[key] > generatedAt));
  const items = dedupeOpportunities([
    ...published.filter((item) => !newerSources.has(sourceKey(item.sourceRepo))),
    ...local.filter((item) => newerSources.has(sourceKey(item.sourceRepo))),
  ]);
  const sourceUpdatedAt = Object.fromEntries(Object.entries(cached?.sourceUpdatedAt || {})
    .filter(([key, date]) => newerSources.has(key) && date));
  const updatedAt = Object.values(sourceUpdatedAt).reduce((latest, date) => date > latest ? date : latest, generatedAt);
  return { items, updatedAt, sourceUpdatedAt };
}

export function getCachedOpportunities(sources) {
  try {
    const parsed = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
    if (!parsed || parsed.manifest !== sourceSignature(sources) || !Array.isArray(parsed.items) || !parsed.updatedAt) return null;
    const items = normalizeListings(parsed.items, sources);
    return items.length ? { items, updatedAt: parsed.updatedAt, sourceUpdatedAt: parsed.sourceUpdatedAt || {} } : null;
  } catch {
    return null;
  }
}

export function saveCachedOpportunities(items, sources, updatedAt = new Date().toISOString(), sourceUpdatedAt = {}) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ manifest: sourceSignature(sources), items, updatedAt, sourceUpdatedAt }));
    return true;
  } catch {
    return false;
  }
}
