import React, { useMemo } from 'react';
import { ArrowUpRight, RefreshCw, RotateCcw, Trash2 } from 'lucide-react';
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
    <div className="radar-page radar-directory">
      <section className="radar-directory-hero">
        <span className="radar-kicker">THE SOURCE DESK</span>
        <h1>Small list.<br /><em>Better signal.</em></h1>
        <p>These repositories provide the leads in Explore. A source listing does not confirm that an application is still open.</p>
      </section>
      <div className="radar-directory-content">
        <div className="radar-directory-bar">
          <div><span className="radar-kicker">SOURCE COVERAGE</span><h2>{reposData.length} sources · {opportunities.length.toLocaleString()} leads</h2>{updatedAt && <small>Directory copy updated {new Date(updatedAt).toLocaleString()}</small>}</div>
          <button className="radar-source-refresh-all" type="button" onClick={onSyncAll} disabled={isSyncing}><RefreshCw size={15} className={isSyncing ? 'animate-spin' : ''} /> Refresh all</button>
        </div>
        <div className="radar-source-grid">
          {reposData.map((repo, index) => {
            const key = sourceKey(repo);
            const sourceUrl = repo.file ? repo.url + '/blob/' + repo.branch + '/' + repo.file : repo.url;
            return <article className="radar-source-card" key={key}>
              <div className="radar-source-top"><span>{String(index + 1).padStart(2, '0')} / {repo.category}</span><strong>{counts.get(key) || 0} leads</strong></div>
              <h3>{repo.name}</h3>
              <p>{repo.description}</p>
              <div className="radar-source-focus">{repo.focus}</div>
              <div className="radar-source-actions">
                <a href={sourceUrl} target="_blank" rel="noopener noreferrer">{repo.file ? 'View source file' : 'View repository'} <ArrowUpRight size={15} /></a>
                <button onClick={() => onFetchRepo(key)} disabled={isSyncing} type="button"><RefreshCw size={14} className={lastFetchedRepo === key ? 'animate-spin' : ''} /> Refresh</button>
              </div>
            </article>;
          })}
        </div>
        <details className="radar-activity">
          <summary>Refresh activity {logs.length > 0 && <span>· {logs.length} checks{failed > 0 ? ' · ' + failed + ' errors' : ''}</span>}</summary>
          <p>These checks are stored in this browser. A successful fetch means a source was parsed; it does not verify individual applications.</p>
          <div className="radar-toolbar-actions">
            {failed > 0 && <button type="button" onClick={onRetryFailed} disabled={isSyncing}><RotateCcw size={15} /> Retry failed</button>}
            {logs.length > 0 && <button type="button" onClick={onClearLogs}><Trash2 size={15} /> Clear history</button>}
          </div>
          {logs.length > 0 ? <div className="radar-log-list">
            {logs.slice(0, 30).map((log) => <article className="radar-log-item" key={log.id}>
              <div><span className={'radar-status ' + log.status}>{log.status}</span><h3>{log.repo || (log.repoOwner + '/' + log.repoName)}</h3><p>{log.message || log.error || 'Source checked.'}</p><small>{log.timestamp ? new Date(log.timestamp).toLocaleString() : 'Time unavailable'} · {log.itemsCount || 0} leads</small></div>
              <button type="button" onClick={() => onFetchRepo(log.repo || (log.repoOwner + '/' + log.repoName))} disabled={isSyncing}><RefreshCw size={14} /> Retry</button>
            </article>)}
          </div> : <p>No refresh activity in this browser yet.</p>}
        </details>
      </div>
    </div>
  );
}
