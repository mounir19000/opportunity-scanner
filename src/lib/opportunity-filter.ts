import type { FilterState, Opportunity, UserRadarProfile } from '../types/opportunity';
import { calculateMatchScore } from './radar-matcher.ts';

export const DEFAULT_FILTERS: FilterState = { searchQuery: '', types: [], fundingCoverages: [], degreeLevels: [], fieldsOfStudy: [], regions: [], urgency: 'all', minFunding: false, noIeltsOnly: false, sortBy: 'deadline-asc' };
export const FILTER_KEYS = { types: 'type', fundingCoverages: 'funding', degreeLevels: 'degree', fieldsOfStudy: 'field', regions: 'region' } as const;
export const TYPE_OPTIONS = ['Scholarship', 'Fellowship', 'Grant', 'Research Internship', 'Hackathon', 'Exchange Program'] as const;
export const FUNDING_OPTIONS = ['Fully Funded', 'Partially Funded', 'Tuition Waiver', 'Stipend Only', 'Prize Pool'] as const;
export const DEGREE_OPTIONS = ['High School', 'Undergraduate', 'Masters', 'PhD', 'Postdoctoral', 'Open to All'] as const;
export const FIELD_OPTIONS = ['Computer Science & AI', 'Engineering', 'Natural Sciences', 'Medicine & Healthcare', 'Business & Economics', 'Humanities & Social Sciences', 'Arts & Design', 'All Disciplines'] as const;
export const REGION_OPTIONS = ['North America', 'Europe', 'Asia & Pacific', 'Remote / Global'] as const;
export const SORT_OPTIONS = ['deadline-asc', 'radar-match-desc', 'newest', 'title-asc'] as const;

export function parseFilters(search: string): FilterState {
  const params = new URLSearchParams(search);
  const choices = (key: string, allowed: readonly string[]) => params.getAll(key).flatMap((value) => value.split(',')).filter((value) => allowed.includes(value));
  const urgency = params.get('urgency');
  const sortBy = params.get('sort');
  return {
    searchQuery: params.get('search') || '',
    types: choices('type', TYPE_OPTIONS) as FilterState['types'],
    fundingCoverages: choices('funding', FUNDING_OPTIONS) as FilterState['fundingCoverages'],
    degreeLevels: choices('degree', DEGREE_OPTIONS) as FilterState['degreeLevels'],
    fieldsOfStudy: choices('field', FIELD_OPTIONS) as FilterState['fieldsOfStudy'],
    regions: choices('region', REGION_OPTIONS),
    urgency: ['all', 'closing-in-7-days', 'closing-in-30-days', 'open-anytime'].includes(urgency || '') ? urgency as FilterState['urgency'] : 'all',
    minFunding: params.get('minFunding') === '1',
    noIeltsOnly: params.get('noIelts') === '1',
    sortBy: SORT_OPTIONS.includes(sortBy as FilterState['sortBy']) ? sortBy as FilterState['sortBy'] : 'deadline-asc',
  };
}

export function serializeFilters(filters: FilterState): string {
  const params = new URLSearchParams();
  if (filters.searchQuery) params.set('search', filters.searchQuery);
  for (const [property, key] of Object.entries(FILTER_KEYS)) for (const value of filters[property as keyof typeof FILTER_KEYS] as string[]) params.append(key, value);
  if (filters.urgency !== 'all') params.set('urgency', filters.urgency);
  if (filters.minFunding) params.set('minFunding', '1');
  if (filters.noIeltsOnly) params.set('noIelts', '1');
  if (filters.sortBy !== 'deadline-asc') params.set('sort', filters.sortBy);
  return params.toString();
}

export function daysUntil(deadline: string | null, now = new Date()): number | null {
  if (!deadline) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(deadline)) {
    const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
    return Math.round((Date.parse(`${deadline}T00:00:00Z`) - today) / 86400000);
  }
  const end = new Date(deadline).getTime();
  return Number.isFinite(end) ? Math.ceil((end - now.getTime()) / 86400000) : null;
}

export function filterOpportunities(items: Opportunity[], filters: FilterState, profile?: UserRadarProfile | null, now = new Date()): Opportunity[] {
  const query = filters.searchQuery.toLocaleLowerCase().trim();
  return items.filter((item) => {
    const days = daysUntil(item.deadline, now);
    return (!query || [item.title, item.provider, item.hostCountry, ...item.fieldsOfStudy].join(' ').toLocaleLowerCase().includes(query))
      && (!filters.types.length || filters.types.includes(item.type))
      && (!filters.fundingCoverages.length || filters.fundingCoverages.includes(item.funding))
      && (!filters.degreeLevels.length || filters.degreeLevels.some((level) => item.degreeLevels.includes(level)))
      && (!filters.fieldsOfStudy.length || filters.fieldsOfStudy.some((field) => item.fieldsOfStudy.includes(field)))
      && (!filters.regions.length || filters.regions.includes(item.region))
      && (!filters.minFunding || item.funding === 'Fully Funded')
      && (!filters.noIeltsOnly || item.noIeltsRequired === true)
      && (filters.urgency === 'all' || (filters.urgency === 'open-anytime' ? item.isOpen && !item.deadline : item.isOpen && days !== null && days >= 0 && days < (filters.urgency === 'closing-in-7-days' ? 7 : 30)));
  }).sort((a, b) => {
    switch (filters.sortBy) {
      case 'radar-match-desc': return (profile ? calculateMatchScore(b, profile) - calculateMatchScore(a, profile) : 0) || a.title.localeCompare(b.title);
      case 'newest': return b.postedDate.localeCompare(a.postedDate);
      case 'title-asc': return a.title.localeCompare(b.title);
      default: {
        const rank = (item: Opportunity) => !item.deadline ? 1 : daysUntil(item.deadline, now)! < 0 ? 2 : 0;
        return rank(a) - rank(b) || (a.deadline ? new Date(a.deadline).getTime() : Infinity) - (b.deadline ? new Date(b.deadline).getTime() : Infinity);
      }
    }
  });
}
