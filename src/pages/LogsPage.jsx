import React, { useMemo, useState } from 'react';
import { Download, RefreshCw, RotateCcw, Trash2 } from 'lucide-react';

export default function LogsPage({ logs = [], onClearLogs, onRetryRepo, onRetryFailed, onSyncAll, isSyncing }) {
  const [status, setStatus] = useState('all');
  const filtered = useMemo(() => logs.filter((log) => status === 'all' || log.status === status), [logs, status]);
  const failed = logs.filter((log) => log.status === 'error').length;
  const exportLogs = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'opportunity-radar-activity.json';
    link.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="radar-page radar-inner-page">
      <div className="radar-inner-hero"><span className="radar-kicker">SOURCE ACTIVITY</span><h1>Refresh<br /><em>history.</em></h1><p>See what happened when a repository was checked. A successful fetch means the listing was parsed, not that applications are open.</p></div>
      <div className="radar-inner-content">
        <div className="radar-toolbar">
          <div><span className="radar-kicker">{logs.length} CHECKS · {failed} ERRORS</span><h2>Recent checks</h2></div>
          <div className="radar-toolbar-actions">
            <button onClick={onSyncAll} disabled={isSyncing} type="button"><RefreshCw size={15} /> Refresh all</button>
            {failed > 0 && <button onClick={onRetryFailed} disabled={isSyncing} type="button"><RotateCcw size={15} /> Retry failed</button>}
            <button onClick={exportLogs} disabled={!logs.length} type="button"><Download size={15} /> Export</button>
            <button onClick={onClearLogs} disabled={!logs.length} type="button"><Trash2 size={15} /> Clear</button>
          </div>
        </div>
        <div className="radar-status-tabs">{['all', 'success', 'warning', 'error'].map((value) => <button key={value} className={status === value ? 'active' : ''} onClick={() => setStatus(value)} type="button">{value}</button>)}</div>
        {filtered.length ? <div className="radar-log-list">{filtered.map((log) => {
          const repo = log.repo || (log.repoOwner && log.repoName ? log.repoOwner + '/' + log.repoName : log.repoName);
          return <article key={log.id} className="radar-log-item"><div><span className={'radar-status ' + log.status}>{log.status}</span><h3>{repo || 'Unknown source'}</h3><p>{log.message || log.error || 'Repository checked.'}</p><small>{log.timestamp ? new Date(log.timestamp).toLocaleString() : 'Time unavailable'} · {log.itemsCount || 0} leads</small></div><button onClick={() => onRetryRepo(repo)} disabled={isSyncing || !repo} type="button"><RefreshCw size={14} /> Retry</button></article>;
        })}</div> : <div className="radar-empty"><h3>No checks to show</h3><p>Refresh a source to see its result here.</p></div>}
      </div>
    </div>
  );
}
