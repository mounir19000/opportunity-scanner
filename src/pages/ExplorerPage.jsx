import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, SearchX } from 'lucide-react';
import HeroSearch from '../components/HeroSearch';
import FilterBar from '../components/FilterBar';
import OpportunityCard from '../components/OpportunityCard';
import { DEFAULT_FILTERS, LOCATION_OPTIONS, filterOpportunities, parseDirectoryState, serializeDirectoryState } from '../services/filters';
import { sourceKey } from '../services/opportunityData';

const PAGE_SIZE = 20;

function pageItems(current, total) {
  const visible = new Set([1, total]);
  const start = current <= 3 ? 2 : current >= total - 2 ? Math.max(2, total - 3) : current - 1;
  const end = current <= 3 ? Math.min(total - 1, 4) : current >= total - 2 ? total - 1 : current + 1;
  for (let page = start; page <= end; page++) visible.add(page);
  const sorted = [...visible].sort((a, b) => a - b);
  return sorted.flatMap((page, index) => {
    if (index === 0) return [page];
    const gap = page - sorted[index - 1];
    return gap === 2 ? [page - 1, page] : gap > 2 ? ['…', page] : [page];
  });
}

export default function ExplorerPage({ opportunities = [], loading = false, loadError = '', sourceCount = 0, savedIds = new Set(), onToggleSave, onSelectOpportunity }) {
  const [state, setState] = useState(() => parseDirectoryState(window.location.search));
  const [searchInput, setSearchInput] = useState(state.filters.search);
  const { filters } = state;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setState((current) => current.filters.search === searchInput
        ? current
        : { filters: { ...current.filters, search: searchInput }, page: 1 });
    }, 250);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const query = serializeDirectoryState(filters, state.page, window.location.search);
    window.history.replaceState(null, '', window.location.pathname + (query ? '?' + query : '') + window.location.hash);
  }, [filters, state.page]);

  useEffect(() => {
    const onPop = () => {
      const next = parseDirectoryState(window.location.search);
      setState(next);
      setSearchInput(next.filters.search);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const types = useMemo(() => [...new Set(opportunities.map((item) => item.type).filter(Boolean))].sort(), [opportunities]);
  const repos = useMemo(() => [...new Set(opportunities.map((item) => sourceKey(item.sourceRepo)).filter(Boolean))].sort(), [opportunities]);
  useEffect(() => {
    if (loading || !opportunities.length) return;
    setState((current) => {
      const type = current.filters.type === 'all' || types.includes(current.filters.type) ? current.filters.type : 'all';
      const repo = current.filters.repo === 'all' || repos.includes(current.filters.repo) ? current.filters.repo : 'all';
      return type === current.filters.type && repo === current.filters.repo
        ? current
        : { filters: { ...current.filters, type, repo }, page: 1 };
    });
  }, [loading, opportunities.length, repos, types]);
  const locations = useMemo(() => LOCATION_OPTIONS.filter(([key]) => key === 'all' || key === filters.location || filterOpportunities(opportunities, { ...DEFAULT_FILTERS, location: key }).length > 0), [opportunities, filters.location]);
  const results = useMemo(() => filterOpportunities(opportunities, filters), [opportunities, filters]);
  const pages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const currentPage = Math.min(state.page, pages);
  const visible = results.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => {
    if (!loading && state.page > pages) setState((current) => ({ ...current, page: pages }));
  }, [loading, pages, state.page]);

  const update = (key, value) => setState((current) => ({ filters: { ...current.filters, [key]: value }, page: 1 }));
  const reset = () => {
    setSearchInput('');
    setState({ filters: { ...DEFAULT_FILTERS }, page: 1 });
  };
  const changePage = (page) => {
    if (page < 1 || page > pages || page === currentPage) return;
    setState((current) => ({ ...current, page }));
    document.getElementById('source-results')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="sch-page">
      <HeroSearch search={searchInput} setSearch={setSearchInput} total={opportunities.length} sourceCount={sourceCount} />
      {loadError && opportunities.length > 0 && <p className="sch-container sch-load-notice" role="status">Showing the last copy saved in this browser. The published snapshot could not be loaded.</p>}
      <section className="sch-container sch-source-section sch-source-only" aria-label="Source leads">
        <div className="sch-source-heading">
          <div>
            <span className="sch-overline">THE COMPLETE DIRECTORY</span>
            <h2>Source <em>leads.</em></h2>
            <p>Listings collected from tracked sources. A listing does not confirm that applications are open or that you are eligible.</p>
          </div>
        </div>
        <div className="sch-source-layout">
          <FilterBar filters={filters} onChange={update} onReset={reset} types={types} repos={repos} locations={locations} totalResults={results.length} />
          <div className="sch-source-results" id="source-results">
            <div className="sch-source-toolbar">
              <div><strong>{results.length.toLocaleString()} matching leads</strong><span>Check the original listing before applying.</span></div>
              <label>Sort by <select aria-label="Sort source leads" value={filters.sort} onChange={(event) => update('sort', event.target.value)}>
                <option value="details-desc">Most details first</option>
                <option value="featured">Source order</option>
                <option value="title">Title A–Z</option>
                <option value="host">Host A–Z</option>
              </select></label>
            </div>
            {loading && !opportunities.length ? <div className="sch-no-results"><h3>Loading opportunities…</h3></div>
              : loadError && !opportunities.length ? <div className="sch-no-results"><h3>Could not load the directory.</h3><p>{loadError}</p><button type="button" onClick={() => window.location.reload()}>Try again</button></div>
                : visible.length ? <div className="radar-result-list sch-source-list">
                  {visible.map((item) => <OpportunityCard key={item.id} opportunity={item} isSaved={savedIds.has(item.id)} onToggleSave={onToggleSave} onSelect={onSelectOpportunity} />)}
                </div>
                  : <div className="sch-no-results"><SearchX size={38} /><h3>No leads match these filters.</h3><p>Try a broader search or clear the filters.</p><button type="button" onClick={reset}>Clear filters</button></div>}
            {pages > 1 && <div className="sch-source-pagination">
              <span>Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, results.length)} of {results.length.toLocaleString()} · Page {currentPage} of {pages}</span>
              <nav aria-label="Opportunity pages">
                <button type="button" onClick={() => changePage(currentPage - 1)} disabled={currentPage === 1} aria-label="Previous page"><ArrowLeft size={17} /></button>
                {pageItems(currentPage, pages).map((page, index) => page === '…'
                  ? <span className="sch-page-ellipsis" key={'gap-' + index} aria-hidden="true">…</span>
                  : <button type="button" key={page} className={page === currentPage ? 'active' : ''} aria-label={'Go to page ' + page} aria-current={page === currentPage ? 'page' : undefined} onClick={() => changePage(page)}>{page}</button>)}
                <button type="button" onClick={() => changePage(currentPage + 1)} disabled={currentPage === pages} aria-label="Next page"><ArrowRight size={17} /></button>
              </nav>
            </div>}
          </div>
        </div>
      </section>
    </div>
  );
}
