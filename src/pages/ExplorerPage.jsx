import React, { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, SearchX } from 'lucide-react';
import FilterBar from '../components/FilterBar';
import OpportunityCard from '../components/OpportunityCard';
import { DEFAULT_FILTERS, deadlineState, filterOpportunities } from '../services/filters';
import { sourceKey } from '../services/opportunityData';

const PAGE_SIZE = 20;

export default function ExplorerPage({ opportunities = [], savedIds = new Set(), onToggleSave, onSelectOpportunity, sourcesCount = 0 }) {
  const [filters, setFilters] = useState({ ...DEFAULT_FILTERS });
  const [page, setPage] = useState(1);
  const categories = useMemo(() => [...new Set(opportunities.map((item) => item.category).filter(Boolean))].sort(), [opportunities]);
  const types = useMemo(() => [...new Set(opportunities.map((item) => item.type).filter(Boolean))].sort(), [opportunities]);
  const repos = useMemo(() => [...new Set(opportunities.map((item) => sourceKey(item.sourceRepo)).filter(Boolean))].sort(), [opportunities]);
  const results = useMemo(() => filterOpportunities(opportunities, filters), [opportunities, filters]);
  const dated = useMemo(() => opportunities.filter((item) => deadlineState(item.deadline).kind === 'upcoming').length, [opportunities]);
  const pages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const currentPage = Math.min(page, pages);
  const visible = results.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const update = (key, value) => { setFilters((previous) => ({ ...previous, [key]: value })); setPage(1); };
  const reset = () => { setFilters({ ...DEFAULT_FILTERS }); setPage(1); };

  return (
    <div className="radar-page">
      <section className="radar-hero">
        <div className="radar-hero-copy">
          <div className="radar-eyebrow"><span className="radar-eyebrow-line" /> THE OPPORTUNITY INDEX</div>
          <h1>Find your<br /><em>next move.</em></h1>
          <p>Internships, research programs, and summer schools from a small set of useful sources. Explore the leads, then confirm details with the host.</p>
        </div>
        <div className="radar-hero-metrics">
          <div><strong>{opportunities.length.toLocaleString()}</strong><span>curated leads</span></div>
          <div><strong>{sourcesCount}</strong><span>tracked sources</span></div>
          <div><strong>{dated.toLocaleString()}</strong><span>upcoming dated deadlines</span></div>
        </div>
      </section>

      <div className="radar-content">
        <FilterBar filters={filters} onChange={update} onReset={reset} categories={categories} types={types} repos={repos} totalResults={results.length} />
        <section className="radar-results" aria-label="Search results">
          <div className="radar-results-header">
            <div>
              <span className="radar-kicker">BROWSE THE INDEX</span>
              <h2>{results.length.toLocaleString()} opportunities</h2>
              <p>Source listings can change. Check the original page before applying.</p>
            </div>
            <label className="radar-sort">Sort by
              <select value={filters.sort} onChange={(event) => update('sort', event.target.value)}>
                <option value="featured">Source order</option>
                <option value="deadline-asc">Nearest deadline</option>
                <option value="deadline-desc">Latest deadline</option>
                <option value="title">Title A–Z</option>
                <option value="host">Host A–Z</option>
              </select>
            </label>
          </div>
          {visible.length ? (
            <div className="radar-result-list">
              {visible.map((opportunity) => <OpportunityCard key={opportunity.id} opportunity={opportunity} isSaved={savedIds.has(opportunity.id)} onToggleSave={onToggleSave} onSelect={onSelectOpportunity} />)}
            </div>
          ) : (
            <div className="radar-empty"><SearchX size={30} /><h3>No leads match these filters</h3><p>Try a broader search or clear your filters.</p><button onClick={reset} type="button">Clear filters</button></div>
          )}
          {pages > 1 && <div className="radar-pagination">
            <span>Page {currentPage} of {pages}</span>
            <div>
              <button onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={currentPage === 1} aria-label="Previous page" type="button"><ArrowLeft size={17} /></button>
              <button onClick={() => setPage((value) => Math.min(pages, value + 1))} disabled={currentPage === pages} aria-label="Next page" type="button"><ArrowRight size={17} /></button>
            </div>
          </div>}
        </section>
      </div>
    </div>
  );
}
