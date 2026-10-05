import React, { useMemo, useState } from 'react';
import { ArrowUpRight, RefreshCw, Search } from 'lucide-react';
import reposData from '../data/repositories.json';
import { sourceKey } from '../services/opportunityData';

export default function SourcesPage({ onFetchRepo, isSyncing, lastFetchedRepo, opportunities = [] }) {
  const [search, setSearch] = useState('');
  const counts = useMemo(() => {
    const map = new Map();
    opportunities.forEach((item) => map.set(sourceKey(item.sourceRepo), (map.get(sourceKey(item.sourceRepo)) || 0) + 1));
    return map;
  }, [opportunities]);
  const sources = reposData.filter((repo) => [repo.owner, repo.name, repo.category, repo.focus].join(' ').toLowerCase().includes(search.toLowerCase().trim()));
  return (
    <div className="radar-page radar-directory">
      <section className="radar-directory-hero">
        <span className="radar-kicker">THE SOURCE DESK</span>
        <h1>Small list.<br /><em>Better signal.</em></h1>
        <p>These repositories produced relevant listings with usable destination links in our last review. A link here does not confirm that an application is still open.</p>
      </section>
      <div className="radar-directory-content">
        <div className="radar-directory-bar">
          <div><span className="radar-kicker">CURATED DIRECTORY</span><h2>{sources.length} sources</h2></div>
          <label className="radar-directory-search"><Search size={17} /><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search sources..." /></label>
        </div>
        <div className="radar-source-grid">
          {sources.map((repo, index) => {
            const key = sourceKey(repo);
            return <article className="radar-source-card" key={key}>
              <div className="radar-source-top"><span>{String(index + 1).padStart(2, '0')} / {repo.category}</span><strong>{counts.get(key) || 0} leads</strong></div>
              <h3>{repo.name}</h3>
              <p>{repo.description}</p>
              <div className="radar-source-focus">{repo.focus}</div>
              <div className="radar-source-actions">
                <a href={repo.url} target="_blank" rel="noopener noreferrer">View repository <ArrowUpRight size={15} /></a>
                <button onClick={() => onFetchRepo(key)} disabled={isSyncing} type="button"><RefreshCw size={14} className={lastFetchedRepo === key ? 'animate-spin' : ''} /> Refresh</button>
              </div>
            </article>;
          })}
        </div>
        {!sources.length && <p className="radar-source-empty">No source matches that search.</p>}
      </div>
    </div>
  );
}
