import React, { useMemo } from 'react';
import { ArrowUpRight, RefreshCw, RotateCcw, Trash2 } from 'lucide-react';
import InteriorHero from '../components/InteriorHero';
import reposData from '../data/repositories.json';
import { sourceKey } from '../services/opportunityData';

export default function SourcesPage({ onFetchRepo, onSyncAll, onRetryFailed, onClearLogs, isSyncing, lastFetchedRepo, opportunities = [], updatedAt = '', logs = [] }) {
  const counts = useMemo(() => {
    const map = new Map();
    opportunities.forEach((item) => map.set(sourceKey(item.sourceRepo), (map.get(sourceKey(item.sourceRepo)) || 0) + 1));
    return map;
  }, [opportunities]);
  const latest = new Map();
  for (const log of logs) {
    const key = log.repo || (log.repoOwner && log.repoName ? log.repoOwner + '/' + log.repoName : '');
    if (key && !latest.has(key)) latest.set(key, log.status);
  }
  const failed = [...latest.values()].filter((status) => status === 'error').length;

  return (
    <div className="sch-page sch-interior-page">
      <InteriorHero
        eyebrow="THE SOURCE DESK"
        title="Small list."
        accent="Better signal."
        description="These sources provide the leads in Explore. Website refresh checks recent posts or active listings; the scheduled snapshot scans the full recent archive. Confirm eligibility and dates on each original page."
        metric={reposData.length.toLocaleString()}
        metricLabel="tracked sources"
      />
      <section className="sch-container sch-interior-content" aria-label="Source coverage">
        <div className="sch-interior-heading">
          <div>
            <span className="sch-overline">SOURCE COVERAGE</span>
            <h2>{reposData.length} sources <em>· {opportunities.length.toLocaleString()} leads.</em></h2>
            {updatedAt && <p className="sch-updated">Directory copy updated {new Date(updatedAt).toLocaleString()}</p>}
          </div>
          <div className="sch-interior-actions"><button className="sch-button sch-button-primary" type="button" onClick={onSyncAll} disabled={isSyncing}><RefreshCw size={15} className={isSyncing ? 'animate-spin' : ''} /> Refresh all sources</button></div>
        </div>
        <div className="sch-directory-grid">
          {reposData.map((repo, index) => {
            const key = sourceKey(repo);
            const sourceUrl = repo.file ? repo.url + '/blob/' + repo.branch + '/' + repo.file : repo.url;
            return <article className="sch-directory-card" key={key}>
              <div className="sch-directory-card-top"><span>{String(index + 1).padStart(2, '0')} / {repo.category}</span><strong>{counts.get(key) || 0} leads</strong></div>
              <h3>{repo.name}</h3>
              <p>{repo.description}</p>
              <div className="sch-directory-focus">{repo.focus}</div>
              <div className="sch-directory-card-actions">
                <a className="sch-button sch-button-primary" href={sourceUrl} target="_blank" rel="noopener noreferrer">{repo.type === 'website' ? 'View website' : repo.file ? 'View source file' : 'View repository'} <ArrowUpRight size={15} /></a>
                <button className="sch-button sch-button-light" onClick={() => onFetchRepo(key)} disabled={isSyncing} type="button" aria-label={`Refresh ${repo.name}`}><RefreshCw size={14} className={lastFetchedRepo === key ? 'animate-spin' : ''} /> {lastFetchedRepo === key ? 'Refreshing…' : 'Refresh'}</button>
              </div>
            </article>;
          })}
        </div>
        <details className="sch-activity">
          <summary>Refresh activity {logs.length > 0 && <span>· {logs.length} checks{failed > 0 ? ' · ' + failed + ' errors' : ''}</span>}</summary>
          <p>These checks are stored in this browser. A successful fetch means a source was parsed; it does not verify individual applications.</p>
          <div className="sch-interior-actions">
            {failed > 0 && <button className="sch-button sch-button-light" type="button" onClick={onRetryFailed} disabled={isSyncing}><RotateCcw size={15} /> Retry failed</button>}
            {logs.length > 0 && <button className="sch-button sch-button-light" type="button" onClick={onClearLogs}><Trash2 size={15} /> Clear history</button>}
          </div>
          {logs.length > 0 ? <div className="sch-log-list">
            {logs.slice(0, 30).map((log) => <article className="sch-log-item" key={log.id}>
              <div><span className={'sch-status ' + log.status}>{log.status}</span><h3>{log.repo || (log.repoOwner + '/' + log.repoName)}</h3><p>{log.message || log.error || 'Source checked.'}</p><small>{log.timestamp ? new Date(log.timestamp).toLocaleString() : 'Time unavailable'} · {log.itemsCount || 0} leads</small></div>
              <button className="sch-button sch-button-light" type="button" onClick={() => onFetchRepo(log.repo || (log.repoOwner + '/' + log.repoName))} disabled={isSyncing}><RefreshCw size={14} /> Retry</button>
            </article>)}
          </div> : <p>No refresh activity in this browser yet.</p>}
        </details>
      </section>
    </div>
  );
}
