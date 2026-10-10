import { normalizeOpportunity, sourceKey, usableUrl } from './opportunityData.js';

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

export function getCachedOpportunities(sources) {
  try {
    const parsed = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
    if (!parsed || parsed.manifest !== sourceSignature(sources) || !Array.isArray(parsed.items) || !parsed.updatedAt) return null;
    const items = normalizeListings(parsed.items, sources);
    return items.length ? { items, updatedAt: parsed.updatedAt } : null;
  } catch {
    return null;
  }
}

export function saveCachedOpportunities(items, sources, updatedAt = new Date().toISOString()) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ manifest: sourceSignature(sources), items, updatedAt }));
    return true;
  } catch {
    return false;
  }
}
