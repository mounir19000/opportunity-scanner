import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, LayoutGrid, List, SearchX, SlidersHorizontal, Sparkles } from 'lucide-react';
import HeroRadarSearch from '../components/HeroRadarSearch';
import FilterSidebar from '../components/FilterSidebar';
import FilterBar from '../components/FilterBar';
import RadarOpportunityCard from '../components/RadarOpportunityCard';
import OpportunityCard from '../components/OpportunityCard';
import { mockOpportunities } from '../lib/mock-data';
import { useOpportunityFilter } from '../hooks/useOpportunityFilter';
import { DEFAULT_FILTERS as SOURCE_DEFAULT_FILTERS, filterOpportunities as filterSourceLeads } from '../services/filters';
import { sourceKey } from '../services/opportunityData';

const PAGE_SIZE = 20;
const sortLabels = {
  'deadline-asc': 'Deadline: soonest',
  'radar-match-desc': 'Highest match',
  newest: 'Recently added',
  'title-asc': 'Title A–Z',
};

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

export default function ExplorerPage({ opportunities = [], savedIds = new Set(), onToggleSave, onSelectOpportunity }) {
  const [profile, setProfile] = useState(() => {
    try { return JSON.parse(localStorage.getItem('radar_profile') || 'null'); }
    catch { return null; }
  });
  const [view, setView] = useState('grid');
  const [sourceFilters, setSourceFilters] = useState({ ...SOURCE_DEFAULT_FILTERS });
  const [sourcePage, setSourcePage] = useState(1);

  useEffect(() => {
    if (profile) localStorage.setItem('radar_profile', JSON.stringify(profile));
  }, [profile]);

  const { filters, results, update, clear, searchInput, setSearchInput } = useOpportunityFilter(mockOpportunities, profile);
  const categories = useMemo(() => [...new Set(opportunities.map((item) => item.category).filter(Boolean))].sort(), [opportunities]);
  const types = useMemo(() => [...new Set(opportunities.map((item) => item.type).filter(Boolean))].sort(), [opportunities]);
  const repos = useMemo(() => [...new Set(opportunities.map((item) => sourceKey(item.sourceRepo)).filter(Boolean))].sort(), [opportunities]);
  const effectiveSourceFilters = useMemo(() => ({
    ...sourceFilters,
    search: [filters.searchQuery, sourceFilters.search].filter(Boolean).join(' '),
  }), [filters.searchQuery, sourceFilters]);
  const sourceResults = useMemo(
    () => filterSourceLeads(opportunities, effectiveSourceFilters),
    [opportunities, effectiveSourceFilters],
  );

  useEffect(() => setSourcePage(1), [filters.searchQuery]);
  const pages = Math.max(1, Math.ceil(sourceResults.length / PAGE_SIZE));
  const currentPage = Math.min(sourcePage, pages);
  const sourcePageItems = pageItems(currentPage, pages);
  const visibleSources = sourceResults.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const updateSource = (key, value) => {
    setSourceFilters((previous) => ({ ...previous, [key]: value }));
    setSourcePage(1);
  };
  const resetSource = () => {
    setSourceFilters({ ...SOURCE_DEFAULT_FILTERS });
    setSourcePage(1);
  };
  const changeSourcePage = (page) => {
    if (page < 1 || page > pages || page === currentPage) return;
    setSourcePage(page);
    document.getElementById('source-results')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="sch-page">
      <HeroRadarSearch
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        filters={filters}
        update={update}
        profile={profile}
        setProfile={setProfile}
        total={mockOpportunities.length + opportunities.length}
      />

      <section className="sch-container sch-catalog-summary" id="sch-results" aria-label="Explore listings">
        <div>
          <span className="sch-overline">THE COMPLETE DIRECTORY</span>
          <h2>{(mockOpportunities.length + opportunities.length).toLocaleString()} opportunities to explore</h2>
          <p>The search above covers both collections. Each collection has filters for the details its listings provide.</p>
        </div>
        <div className="sch-catalog-links">
          <a href="#curated-programmes"><strong>{results.length.toLocaleString()}</strong><span>reviewed programmes</span><ArrowRight size={17} /></a>
          <a href="#source-leads"><strong>{sourceResults.length.toLocaleString()}</strong><span>source leads</span><ArrowRight size={17} /></a>
        </div>
      </section>

      <div className="sch-container sch-directory" id="curated-programmes">
        <FilterSidebar filters={filters} update={update} clear={clear} opportunities={mockOpportunities} resultsCount={results.length} />
        <main className="sch-results">
          <div className="sch-results-header">
            <div>
              <span className="sch-overline">REVIEWED PROGRAMMES</span>
              <h2>Find your <em>opportunity.</em></h2>
              <p>Showing <strong>{results.length}</strong> of {mockOpportunities.length} reviewed programmes. Check each official page before applying.</p>
            </div>
            <div className="sch-results-controls">
              <label><SlidersHorizontal size={16} /><span>Sort by</span><select aria-label="Sort reviewed programmes" value={filters.sortBy} onChange={(event) => update('sortBy', event.target.value)}>{Object.entries(sortLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
              <div className="sch-view-toggle" aria-label="Display style">
                <button type="button" className={view === 'grid' ? 'active' : ''} aria-label="Grid view" aria-pressed={view === 'grid'} onClick={() => setView('grid')}><LayoutGrid size={17} /></button>
                <button type="button" className={view === 'list' ? 'active' : ''} aria-label="List view" aria-pressed={view === 'list'} onClick={() => setView('list')}><List size={18} /></button>
              </div>
            </div>
          </div>
          {profile?.targetDegree && profile?.primaryField && profile?.citizenship && <div className="sch-match-note"><Sparkles size={16} /> Match scores use your radar profile. Check each programme’s full eligibility before applying.</div>}
          {results.length ? (
            <div className={`sch-card-grid ${view === 'list' ? 'list' : ''}`}>
              {results.map((item) => <RadarOpportunityCard key={item.id} opportunity={item} profile={profile} isSaved={savedIds.has(item.id)} onToggleSave={onToggleSave} onSelect={onSelectOpportunity} view={view} />)}
            </div>
          ) : (
            <div className="sch-no-results"><SearchX size={38} /><h3>No reviewed programmes match these filters.</h3><p>Try resetting the funding filter or clearing the location restriction.</p><button type="button" onClick={clear}>Clear reviewed filters</button></div>
          )}
          <div className="sch-directory-foot"><span>Reviewed examples · checked 10 October 2026</span><span>Official pages are the authority on dates and eligibility.</span></div>
        </main>
      </div>

      <section className="sch-container sch-source-section" id="source-leads" aria-label="Source leads">
        <div className="sch-source-heading">
          <div><span className="sch-overline">MORE TO EXPLORE</span><h2>Source <em>leads.</em></h2><p>Browse {opportunities.length.toLocaleString()} listings from tracked feeds. Dates, funding and eligibility appear only when a source provides them.</p></div>
          <a href="#sch-results">Back to directory overview ↑</a>
        </div>
        <div className="sch-source-layout">
          <FilterBar filters={sourceFilters} onChange={updateSource} onReset={resetSource} categories={categories} types={types} repos={repos} totalResults={sourceResults.length} />
          <div className="sch-source-results" id="source-results">
            <div className="sch-source-toolbar">
              <div><strong>{sourceResults.length.toLocaleString()} matching leads</strong><span>{sourceFilters.sort === 'details-desc' ? 'More published details first. Check the original listing before applying.' : 'Check the original listing before applying.'}</span></div>
              <label>Sort by <select value={sourceFilters.sort} onChange={(event) => updateSource('sort', event.target.value)}><option value="details-desc">Most details first</option><option value="featured">Source order</option><option value="deadline-asc">Nearest deadline</option><option value="deadline-desc">Latest deadline</option><option value="title">Title A–Z</option><option value="host">Host A–Z</option></select></label>
            </div>
            {visibleSources.length ? (
              <div className="radar-result-list sch-source-list">
                {visibleSources.map((item) => <OpportunityCard key={item.id} opportunity={item} isSaved={savedIds.has(item.id)} onToggleSave={onToggleSave} onSelect={onSelectOpportunity} />)}
              </div>
            ) : (
              <div className="sch-no-results"><SearchX size={38} /><h3>No source leads match these filters.</h3><p>Try a broader search or clear the source filters.</p><button type="button" onClick={resetSource}>Clear source filters</button></div>
            )}
            {pages > 1 && <div className="sch-source-pagination">
              <span>Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, sourceResults.length)} of {sourceResults.length.toLocaleString()} · Page {currentPage} of {pages}</span>
              <nav aria-label="Source lead pages">
                <button type="button" onClick={() => changeSourcePage(currentPage - 1)} disabled={currentPage === 1} aria-label="Previous source page"><ArrowLeft size={17} /></button>
                {sourcePageItems.map((page, index) => page === '…'
                  ? <span className="sch-page-ellipsis" key={`gap-${index}`} aria-hidden="true">…</span>
                  : <button type="button" key={page} className={page === currentPage ? 'active' : ''} aria-label={`Go to source page ${page}`} aria-current={page === currentPage ? 'page' : undefined} onClick={() => changeSourcePage(page)}>{page}</button>)}
                <button type="button" onClick={() => changeSourcePage(currentPage + 1)} disabled={currentPage === pages} aria-label="Next source page"><ArrowRight size={17} /></button>
              </nav>
            </div>}
          </div>
        </div>
      </section>
    </div>
  );
}
