import { useEffect, useMemo, useState } from 'react';
import type { FilterState, Opportunity, UserRadarProfile } from '../types/opportunity';
import { DEFAULT_FILTERS, filterOpportunities, parseFilters, serializeFilters } from '../lib/opportunity-filter.ts';

export function useOpportunityFilter(items: Opportunity[], profile?: UserRadarProfile | null) {
  const [filters, setFilters] = useState<FilterState>(() => parseFilters(window.location.search));
  const [searchInput, setSearchInput] = useState(filters.searchQuery);
  useEffect(() => {
    const id = window.setTimeout(() => setFilters((current) => current.searchQuery === searchInput ? current : { ...current, searchQuery: searchInput }), 250);
    return () => window.clearTimeout(id);
  }, [searchInput]);
  useEffect(() => {
    const query = serializeFilters(filters);
    window.history.replaceState(null, '', `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`);
  }, [filters]);
  useEffect(() => {
    const onPop = () => { const next = parseFilters(window.location.search); setFilters(next); setSearchInput(next.searchQuery); };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  const results = useMemo(() => filterOpportunities(items, filters, profile), [items, filters, profile]);
  const update = <K extends keyof FilterState>(key: K, value: FilterState[K]) => setFilters((current) => ({ ...current, [key]: value }));
  const clear = () => { setFilters({ ...DEFAULT_FILTERS }); setSearchInput(''); };
  return { filters, results, update, clear, searchInput, setSearchInput };
}
