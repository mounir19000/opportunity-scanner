import { cleanUnknown, explicitDate, fundingKind, sourceKey } from './opportunityData.js';

export const DEFAULT_FILTERS = Object.freeze({
  search: '',
  category: 'all',
  type: 'all',
  funding: 'all',
  deadline: 'all',
  location: 'all',
  repo: 'all',
  sort: 'details-desc',
});

export function deadlineState(value, today = new Date()) {
  const raw = cleanUnknown(value);
  const date = explicitDate(raw);
  if (date) {
    const start = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
    return { kind: date.getTime() >= start ? 'upcoming' : 'past', date };
  }
  if (/\brolling\b/i.test(raw)) return { kind: 'rolling', date: null };
  return { kind: 'unknown', date: null };
}

function normalize(value) {
  return String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

const DETAIL_FIELDS = ['host', 'location', 'deadline', 'dates', 'stipend', 'eligibility', 'notes'];

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
  if (selected === 'global') return /\b(global|worldwide|international)\b/.test(location);
  return false;
}

export function filterOpportunities(items, filters = DEFAULT_FILTERS, today = new Date()) {
  filters = { ...DEFAULT_FILTERS, ...filters };
  const queryTerms = normalize(filters.search).trim().split(/\s+/).filter(Boolean);
  const matching = items.filter((item) => {
    const searchable = normalize([item.title, item.host, item.location, item.notes, item.eligibility, sourceKey(item.sourceRepo)].join(' '));
    if (!queryTerms.every((term) => searchable.includes(term))) return false;
    if (filters.category !== 'all' && item.category !== filters.category) return false;
    if (filters.type !== 'all' && item.type !== filters.type) return false;
    if (filters.repo !== 'all' && sourceKey(item.sourceRepo) !== filters.repo) return false;
    if (filters.funding !== 'all' && fundingKind(item.stipend) !== filters.funding) return false;
    if (filters.deadline !== 'all') {
      const state = deadlineState(item.deadline, today);
      if (filters.deadline === 'dated' && !state.date) return false;
      if (filters.deadline !== 'dated' && state.kind !== filters.deadline) return false;
    }
    if (!matchesLocation(item.location, filters.location)) return false;
    return true;
  });

  if (filters.sort === 'details-desc') {
    return matching.map((item, index) => ({ item, index, details: detailCount(item) }))
      .sort((a, b) => b.details - a.details
        || Number(hasDetail(b.item, 'location')) - Number(hasDetail(a.item, 'location'))
        || a.index - b.index)
      .map(({ item }) => item);
  }
  if (filters.sort === 'title') return [...matching].sort((a, b) => a.title.localeCompare(b.title));
  if (filters.sort === 'host') return [...matching].sort((a, b) => (a.host || '').localeCompare(b.host || ''));
  if (filters.sort === 'deadline-asc' || filters.sort === 'deadline-desc') {
    const direction = filters.sort === 'deadline-asc' ? 1 : -1;
    return [...matching].sort((a, b) => {
      const dateA = explicitDate(a.deadline)?.getTime();
      const dateB = explicitDate(b.deadline)?.getTime();
      if (dateA == null) return dateB == null ? 0 : 1;
      if (dateB == null) return -1;
      return (dateA - dateB) * direction;
    });
  }
  return matching;
}
