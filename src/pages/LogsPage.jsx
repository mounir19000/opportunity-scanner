import React, { useState, useMemo } from 'react';
import {
  Terminal,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Trash2,
  Download,
  Search,
  ExternalLink,
  ShieldCheck,
  Key,
} from 'lucide-react';

export default function LogsPage({
  logs = [],
  onClearLogs,
  onRetryRepo,
  onRetryFailed,
  onSyncAll,
  isSyncing,
}) {
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showTokenSettings, setShowTokenSettings] = useState(false);
  const [githubToken, setGithubToken] = useState(() => {
    return localStorage.getItem('opportunity_scout_github_token') || '';
  });
  const [tokenSaved, setTokenSaved] = useState(false);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (filterStatus === 'error' && log.status !== 'error') return false;
      if (filterStatus === 'success' && log.status !== 'success') return false;
      if (filterStatus === 'warning' && log.status !== 'warning') return false;

      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const repoStr = (log.repo || (log.repoOwner ? `${log.repoOwner}/${log.repoName}` : log.repoName) || '').toLowerCase();
        const msgStr = (log.message || log.error || '').toLowerCase();
        const urlStr = (log.url || '').toLowerCase();
        if (!repoStr.includes(query) && !msgStr.includes(query) && !urlStr.includes(query)) return false;
      }
      return true;
    });
  }, [logs, filterStatus, searchTerm]);

  const totalLogs = logs.length;
  const errorCount = logs.filter((l) => l.status === 'error').length;
  const successCount = logs.filter((l) => l.status === 'success').length;
  const parsedCount = logs.reduce((acc, curr) => acc + (curr.parsedCount !== undefined ? curr.parsedCount : (curr.itemsCount || 0)), 0);

  const handleSaveToken = () => {
    localStorage.setItem('opportunity_scout_github_token', githubToken.trim());
    setTokenSaved(true);
    setTimeout(() => setTokenSaved(false), 2000);
  };

  const handleExportLogs = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `opportunity_radar_logs_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-slate-900 border border-white/[0.08] text-brand-400">
              <Terminal className="w-5 h-5" />
            </div>
            <h1 className="font-display text-xl sm:text-2xl font-bold text-white">
              Repository Ingestion & Diagnostic Logs
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            Real-time telemetry tracking for all 99+ repository sources, HTTP response codes, extracted opportunities, and failure recovery.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onSyncAll}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-semibold bg-brand-600 hover:bg-brand-500 text-white shadow-md shadow-brand-500/20 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync All Sources'}</span>
          </button>

          {errorCount > 0 && (
            <button
              onClick={onRetryFailed}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition disabled:opacity-50"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Retry {errorCount} Failed</span>
            </button>
          )}

          <button
            onClick={() => setShowTokenSettings(!showTokenSettings)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono transition border ${
              showTokenSettings
                ? 'bg-brand-500/10 border-brand-500/30 text-brand-400'
                : 'bg-slate-900/60 hover:bg-slate-800 border-white/[0.08] text-slate-300'
            }`}
          >
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <span>GitHub PAT</span>
          </button>

          <button
            onClick={handleExportLogs}
            disabled={logs.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono bg-slate-900/60 hover:bg-slate-800 border border-white/[0.08] text-slate-300 transition disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>

          <button
            onClick={onClearLogs}
            disabled={logs.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono bg-slate-900/60 hover:bg-rose-500/10 hover:text-rose-400 border border-white/[0.08] text-slate-400 transition disabled:opacity-40"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* GitHub Token Settings Banner */}
      {showTokenSettings && (
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/30 backdrop-blur-md space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-white">GitHub API Rate Limit Elevation</h3>
            </div>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400">
              Optional
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Unauthenticated GitHub requests are capped at 60 requests/hour. Entering a personal access token (with zero permissions needed, public read-only) elevates your limit to 5,000 requests/hour.
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="password"
              value={githubToken}
              onChange={(e) => setGithubToken(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              className="flex-1 px-3 py-2 rounded-xl text-xs font-mono bg-black/40 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-brand-500"
            />
            <button
              onClick={handleSaveToken}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white transition shrink-0"
            >
              {tokenSaved ? 'Saved to Browser!' : 'Save Token'}
            </button>
          </div>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-md">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Total Tracked Repos</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-display text-2xl font-bold text-white font-mono">{totalLogs}</span>
            <span className="text-[11px] text-slate-500">configured</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-md">
          <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400">Healthy & Synchronized</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-display text-2xl font-bold text-emerald-400 font-mono">{successCount}</span>
            <span className="text-[11px] text-emerald-500/70 font-mono">
              {totalLogs > 0 ? `${Math.round((successCount / totalLogs) * 100)}%` : '0%'}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-md">
          <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400">Failed / Rate Limited</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-display text-2xl font-bold text-rose-400 font-mono">{errorCount}</span>
            <span className="text-[11px] text-rose-500/70 font-mono">
              {errorCount === 0 ? 'All 100% OK' : 'Issues logged'}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-md">
          <span className="text-[10px] font-mono uppercase tracking-wider text-brand-400">Opportunities Ingested</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-display text-2xl font-bold text-brand-400 font-mono">{parsedCount.toLocaleString()}</span>
            <span className="text-[11px] text-brand-400/70">items parsed</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-md">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition ${
              filterStatus === 'all'
                ? 'bg-white/10 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({totalLogs})
          </button>
          <button
            onClick={() => setFilterStatus('error')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition ${
              filterStatus === 'error'
                ? 'bg-rose-500/20 text-rose-400 font-semibold border border-rose-500/30'
                : 'text-slate-400 hover:text-rose-400'
            }`}
          >
            Errors ({errorCount})
          </button>
          <button
            onClick={() => setFilterStatus('success')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition ${
              filterStatus === 'success'
                ? 'bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30'
                : 'text-slate-400 hover:text-emerald-400'
            }`}
          >
            Healthy ({successCount})
          </button>
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by repo or error..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs font-mono bg-black/30 border border-white/[0.08] text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="overflow-hidden rounded-2xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-md shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/[0.08] bg-black/20 text-[11px] font-mono uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Repository</th>
                <th className="py-3 px-4 text-center">Items</th>
                <th className="py-3 px-4">Message / Diagnostic</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 font-mono text-xs">
                    No logs matching selected filters
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, idx) => {
                  const repoDisplayName = log.repo || (log.repoOwner ? `${log.repoOwner}/${log.repoName}` : log.repoName) || 'Unknown Source';
                  const isErr = log.status === 'error';
                  const isWarn = log.status === 'warning';
                  const itemsExtracted = log.parsedCount !== undefined ? log.parsedCount : (log.itemsCount || 0);

                  return (
                    <tr
                      key={log.id || `${repoDisplayName}-${idx}`}
                      className="hover:bg-white/[0.02] transition"
                    >
                      <td className="py-3 px-4 whitespace-nowrap">
                        {isErr ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            <XCircle className="w-3 h-3 text-rose-400 shrink-0" />
                            ERROR
                          </span>
                        ) : isWarn ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                            WARN
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                            OK
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-medium text-slate-200">
                            {repoDisplayName}
                          </span>
                          <a
                            href={log.url || `https://github.com/${repoDisplayName}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-500 hover:text-slate-300 transition"
                            title="Open repository on GitHub"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center font-mono">
                        {itemsExtracted > 0 ? (
                          <span className="px-2 py-0.5 rounded-md bg-brand-500/10 text-brand-400 border border-brand-500/20 font-semibold text-[11px]">
                            {itemsExtracted.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[11px]">0</span>
                        )}
                      </td>

                      <td className="py-3 px-4 max-w-md">
                        <p className={`text-xs truncate ${isErr ? 'text-rose-300 font-mono text-[11px]' : 'text-slate-400'}`}>
                          {log.message || log.error || 'Sync completed successfully'}
                        </p>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-slate-500">
                        {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : 'N/A'}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => onRetryRepo(repoDisplayName)}
                          disabled={isSyncing}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/[0.08] transition disabled:opacity-40"
                        >
                          Retry
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
