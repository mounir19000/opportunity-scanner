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
  Info,
  Key,
  RotateCw,
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

  // Filter logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // Status filter
      if (filterStatus === 'error' && log.status !== 'error') return false;
      if (filterStatus === 'success' && log.status !== 'success') return false;
      if (filterStatus === 'warning' && log.status !== 'warning') return false;

      // Text search
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

  // Aggregate stats
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
    downloadAnchor.setAttribute('download', `opportunity-radar-logs-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
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
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-500/20 transition disabled:opacity-50"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Retry Failed ({errorCount})</span>
            </button>
          )}

          <button
            onClick={handleExportLogs}
            title="Download diagnostic logs JSON"
            className="p-2 rounded-xl border border-white/[0.08] bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 transition"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={onClearLogs}
            title="Clear logs history"
            className="p-2 rounded-xl border border-white/[0.08] bg-slate-900 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI HUD Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="relative overflow-hidden p-4 rounded-xl border border-white/[0.08] bg-slate-900/60 backdrop-blur-md">
          <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider">Total Repositories</span>
          <div className="font-mono text-2xl font-bold text-white mt-1">
            {totalLogs}
          </div>
          <span className="font-mono text-[10px] text-slate-500">Tracked in registry</span>
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-500 opacity-60" />
        </div>

        <div className="relative overflow-hidden p-4 rounded-xl border border-emerald-500/20 bg-slate-900/60 backdrop-blur-md">
          <span className="font-mono text-[10px] text-emerald-400 uppercase tracking-wider">Successful Fetches</span>
          <div className="font-mono text-2xl font-bold text-emerald-400 mt-1">
            {successCount}
          </div>
          <span className="font-mono text-[10px] text-slate-500">HTTP 200 OK response</span>
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-emerald-500 opacity-60" />
        </div>

        <div className="relative overflow-hidden p-4 rounded-xl border border-rose-500/20 bg-slate-900/60 backdrop-blur-md">
          <span className="font-mono text-[10px] text-rose-400 uppercase tracking-wider">Failed / Errored</span>
          <div className="font-mono text-2xl font-bold text-rose-400 mt-1">
            {errorCount}
          </div>
          <span className="font-mono text-[10px] text-slate-500">404s or branch issues</span>
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-rose-500 opacity-60" />
        </div>

        <div className="relative overflow-hidden p-4 rounded-xl border border-cyan-500/20 bg-slate-900/60 backdrop-blur-md">
          <span className="font-mono text-[10px] text-cyan-400 uppercase tracking-wider">Extracted Opportunities</span>
          <div className="font-mono text-2xl font-bold text-cyan-400 mt-1">
            {parsedCount.toLocaleString()}
          </div>
          <span className="font-mono text-[10px] text-slate-500">Parsed table & list rows</span>
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-cyan-500 opacity-60" />
        </div>
      </div>

      {/* GitHub Token / Rate Limit Notice */}
      <div className="p-4 rounded-xl border border-white/[0.08] bg-slate-900/50 text-xs text-slate-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">Client-Side CORS Ingestion Architecture</span>
          </div>
          <button
            onClick={() => setShowTokenSettings(!showTokenSettings)}
            className="text-brand-400 hover:text-brand-300 font-mono text-[11px] font-semibold flex items-center gap-1 transition"
          >
            <Key className="w-3.5 h-3.5" />
            <span>{showTokenSettings ? 'Hide Token Settings' : 'Add Optional GitHub Token'}</span>
          </button>
        </div>

        {showTokenSettings && (
          <div className="mt-3 pt-3 border-t border-white/[0.06] space-y-2">
            <p className="text-[11px] text-slate-400 leading-relaxed">
              The app fetches raw files directly from <code className="font-mono text-brand-300 bg-white/[0.05] px-1 py-0.5 rounded">raw.githubusercontent.com</code>. Providing an optional personal access token increases API limits to 5,000 req/hr. Your token is stored purely in your browser's LocalStorage and is never transmitted to any third party.
            </p>
            <div className="flex items-center gap-2 max-w-md">
              <input
                type="password"
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                className="flex-1 font-mono text-xs py-1.5 px-3 rounded-lg border border-white/[0.08] bg-slate-950 text-white focus:outline-none focus:border-brand-500"
              />
              <button
                onClick={handleSaveToken}
                className="px-3 py-1.5 rounded-lg font-mono text-xs bg-brand-600 text-white font-semibold hover:bg-brand-500 transition"
              >
                {tokenSaved ? 'Saved!' : 'Save Token'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-xs font-mono">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filterStatus === 'all'
                ? 'bg-brand-600 text-white font-semibold'
                : 'bg-slate-900 border border-white/[0.08] text-slate-300 hover:text-white'
            }`}
          >
            All Logs ({totalLogs})
          </button>
          <button
            onClick={() => setFilterStatus('error')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition ${
              filterStatus === 'error'
                ? 'bg-rose-600 text-white font-semibold'
                : 'bg-slate-900 border border-white/[0.08] text-rose-400 hover:bg-rose-500/10'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Errors ({errorCount})</span>
          </button>
          <button
            onClick={() => setFilterStatus('success')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition ${
              filterStatus === 'success'
                ? 'bg-emerald-600 text-white font-semibold'
                : 'bg-slate-900 border border-white/[0.08] text-emerald-400 hover:bg-emerald-500/10'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Success ({successCount})</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by repo or message..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-white/[0.08] bg-slate-900 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-brand-500"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="overflow-x-auto rounded-xl border border-white/[0.08] bg-slate-900/60 backdrop-blur-md shadow-lg">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-slate-800/60 text-slate-300 font-semibold border-b border-white/[0.08] uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3">Repository</th>
              <th className="py-3 px-3">HTTP Code</th>
              <th className="py-3 px-3">Parsed</th>
              <th className="py-3 px-4">Message / Diagnostic</th>
              <th className="py-3 px-3">Timestamp</th>
              <th className="py-3 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500 font-sans">
                  No log entries match the selected filter.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log, index) => {
                const isError = log.status === 'error';
                const isSuccess = log.status === 'success';
                const repoDisplayName = log.repo || (log.repoOwner ? `${log.repoOwner}/${log.repoName}` : log.repoName);
                const statusCode = log.statusCode || log.httpStatus;
                const itemsCount = log.parsedCount !== undefined ? log.parsedCount : (log.itemsCount || 0);
                const message = log.message || log.error || 'Successfully fetched and processed.';

                return (
                  <tr
                    key={log.id || index}
                    className={`transition-colors ${
                      isError
                        ? 'bg-rose-500/[0.06] hover:bg-rose-500/[0.12]'
                        : 'hover:bg-slate-800/40'
                    }`}
                  >
                    {/* Status Icon */}
                    <td className="py-2.5 px-3">
                      {isError ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 font-mono">
                          <XCircle className="w-3 h-3 text-rose-400" />
                          <span>ERROR</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>OK</span>
                        </span>
                      )}
                    </td>

                    {/* Repository Name */}
                    <td className="py-2.5 px-3 font-semibold text-slate-200">
                      <a
                        href={log.url || `https://github.com/${repoDisplayName}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-brand-400 hover:underline flex items-center gap-1"
                      >
                        <span>{repoDisplayName}</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                      </a>
                    </td>

                    {/* HTTP Code */}
                    <td className="py-2.5 px-3">
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                          statusCode === 200
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : statusCode === 404
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {statusCode ? `${statusCode}` : 'ERR'}
                      </span>
                    </td>

                    {/* Parsed Count */}
                    <td className="py-2.5 px-3">
                      <strong className={itemsCount > 0 ? 'text-cyan-400 font-bold' : 'text-slate-500 font-normal'}>
                        {itemsCount.toLocaleString()}
                      </strong>
                    </td>

                    {/* Message / Diagnostic */}
                    <td className="py-2.5 px-4 max-w-xs truncate text-[11px] font-sans">
                      <span
                        title={message}
                        className={isError ? 'text-rose-300 font-medium' : 'text-slate-400'}
                      >
                        {message}
                      </span>
                    </td>

                    {/* Timestamp */}
                    <td className="py-2.5 px-3 text-[10px] text-slate-500 whitespace-nowrap">
                      {log.timestamp ? new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'N/A'}
                    </td>

                    {/* Action: Retry Single Repo */}
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => onRetryRepo(repoDisplayName)}
                        disabled={isSyncing}
                        title={`Retry fetching ${repoDisplayName}`}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-semibold border border-white/[0.08] transition disabled:opacity-50"
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
  );
}
