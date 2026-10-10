import { cleanUnknown, explicitDate, sourceKey } from './opportunityData.js';

export const DEFAULT_FILTERS = Object.freeze({
  search: '',
  type: 'all',
  location: 'all',
  repo: 'all',
  sort: 'details-desc',
});

export const LOCATION_OPTIONS = [
  ['all', 'Anywhere'],
  ['remote', 'Remote or online'],
  ['us', 'United States'],
  ['europe', 'Europe'],
  ['asia', 'Asia'],
  ['global', 'Global'],
];

const SORT_OPTIONS = new Set(['details-desc', 'featured', 'title', 'host']);

export function parseDirectoryState(search) {
  const params = new URLSearchParams(search);
  const location = params.get('location') || 'all';
  const sort = params.get('sort') || DEFAULT_FILTERS.sort;
  return {
    filters: {
      search: params.get('search') || '',
      type: params.get('type') || 'all',
      location: LOCATION_OPTIONS.some(([key]) => key === location) ? location : 'all',
      repo: params.get('source') || 'all',
      sort: SORT_OPTIONS.has(sort) ? sort : DEFAULT_FILTERS.sort,
    },
    page: Math.max(1, Number.parseInt(params.get('page') || '1', 10) || 1),
  };
}

export function serializeDirectoryState(filters, page = 1, search = '') {
  const params = new URLSearchParams(search);
  for (const key of ['search', 'type', 'location', 'source', 'sort', 'page']) params.delete(key);
  if (filters.search) params.set('search', filters.search);
  if (filters.type !== 'all') params.set('type', filters.type);
  if (filters.location !== 'all') params.set('location', filters.location);
  if (filters.repo !== 'all') params.set('source', filters.repo);
  if (filters.sort !== DEFAULT_FILTERS.sort) params.set('sort', filters.sort);
  if (page > 1) params.set('page', String(page));
  return params.toString();
}

export function deadlineState(value, today = new Date()) {
  const raw = cleanUnknown(value);
  const date = explicitDate(raw);
  if (date) {
    const start = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
    return { kind: date.getTime() >= start ? 'upcoming' : 'past', date };
  }
  if (/^rolling$/i.test(raw)) return { kind: 'rolling', date: null };
  return { kind: 'unknown', date: null };
}

function normalize(value) {
  return String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

const DETAIL_FIELDS = ['host', 'location', 'deadline', 'dates', 'stipend', 'notes', 'summary', 'eligibility', 'benefits', 'howToApply', 'applicationUrl'];

function hasDetail(item, field) {
  const value = cleanUnknown(item[field]);
  if (field === 'location' && /^(?:multiple countries|varies by programme)$/i.test(value)) return false;
  return Boolean(value);
}

function detailCount(item) {
  return DETAIL_FIELDS.reduce((count, field) => count + Number(hasDetail(item, field)), 0);
}

function matchesLocation(value, selected) {
  const location = normalize(value);
  if (selected === 'all') return true;
  if (selected === 'remote') return /\b(remote|virtual|online)\b/.test(location);
  if (selected === 'us') return /\b(us|usa|u\.s\.|united states)\b/.test(location);
  if (selected === 'europe') return /\b(europe|germany|france|italy|spain|switzerland|netherlands|united kingdom|uk|belgium|sweden|norway|denmark|finland|austria|ireland|poland)\b/.test(location);
  if (selected === 'asia') return /\b(asia|japan|china|singapore|korea|taiwan|india|hong kong|pakistan|malaysia)\b/.test(location);
  if (selected === 'global') return /\b(global|worldwide|international|multiple countries)\b/.test(location);
  return false;
}

export function filterOpportunities(items, filters = DEFAULT_FILTERS) {
  const selected = { ...DEFAULT_FILTERS, ...filters };
  const queryTerms = normalize(selected.search).trim().split(/\s+/).filter(Boolean);
  const matching = items.filter((item) => {
    const searchable = normalize([item.title, item.host, item.location, item.notes, item.summary, item.eligibility, item.benefits, sourceKey(item.sourceRepo)].join(' '));
    if (!queryTerms.every((term) => searchable.includes(term))) return false;
    if (selected.type !== 'all' && item.type !== selected.type) return false;
    if (selected.repo !== 'all' && sourceKey(item.sourceRepo) !== selected.repo) return false;
    return matchesLocation(item.location, selected.location);
  });

  if (selected.sort === 'details-desc') {
    return matching.map((item, index) => ({ item, index, details: detailCount(item) }))
      .sort((a, b) => b.details - a.details
        || Number(hasDetail(b.item, 'location')) - Number(hasDetail(a.item, 'location'))
        || a.index - b.index)
      .map(({ item }) => item);
  }
  if (selected.sort === 'title') return [...matching].sort((a, b) => a.title.localeCompare(b.title));
  if (selected.sort === 'host') return [...matching].sort((a, b) => (a.host || '').localeCompare(b.host || ''));
  return matching;
}
