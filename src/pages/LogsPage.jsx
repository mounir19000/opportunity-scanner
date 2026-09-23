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
  ShieldAlert,
  Info,
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-lg bg-slate-900 text-brand-400 border border-slate-800">
              <Terminal className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Repository Fetch & Diagnostic Logs
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time tracking of all 99+ repository ingestion requests, HTTP status codes, parsing results, and failure diagnostics.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onSyncAll}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white shadow-sm transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Fetch All Sources'}</span>
          </button>

          {errorCount > 0 && (
            <button
              onClick={onRetryFailed}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-sm transition disabled:opacity-50"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Retry Failed ({errorCount})</span>
            </button>
          )}

          <button
            onClick={handleExportLogs}
            title="Download logs as JSON"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={onClearLogs}
            title="Clear logs history"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400">Total Ingestion Requests</span>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {totalLogs}
          </div>
          <span className="text-[11px] text-slate-400">Across all attempts</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm">
          <span className="text-xs text-emerald-600 dark:text-emerald-400">Successful Fetches</span>
          <div className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {successCount}
          </div>
          <span className="text-[11px] text-slate-400">HTTP 200 OK</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm">
          <span className="text-xs text-rose-600 dark:text-rose-400">Failed / Errored Repos</span>
          <div className="text-xl sm:text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">
            {errorCount}
          </div>
          <span className="text-[11px] text-slate-400">404s, CORS, or moved</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm">
          <span className="text-xs text-brand-600 dark:text-brand-400">Extracted Opportunities</span>
          <div className="text-xl sm:text-2xl font-bold text-brand-600 dark:text-brand-400 mt-1">
            {parsedCount.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-400">Parsed table & list rows</span>
        </div>
      </div>

      {/* GitHub Token / Rate Limit Notice */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 mb-6 text-xs text-slate-600 dark:text-slate-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-medium">
            <Info className="w-4 h-4 text-brand-500 shrink-0" />
            <span>GitHub Raw CDN Rate Limit Note</span>
          </div>
          <button
            onClick={() => setShowTokenSettings(!showTokenSettings)}
            className="text-brand-600 dark:text-brand-400 font-semibold hover:underline flex items-center gap-1"
          >
            <Key className="w-3.5 h-3.5" />
            <span>{showTokenSettings ? 'Hide Token Settings' : 'Add Optional GitHub Token'}</span>
          </button>
        </div>

        {showTokenSettings && (
          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              The app fetches raw files from <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">raw.githubusercontent.com</code> which allows unauthenticated reads. Providing an optional personal access token increases API limits and handles private mirror repos. Your token stays 100% inside your browser's LocalStorage and is never sent to any external server.
            </p>
            <div className="flex items-center gap-2 max-w-md">
              <input
                type="password"
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                className="flex-1 text-xs py-1.5 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
              <button
                onClick={handleSaveToken}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-white font-medium hover:bg-slate-700 transition"
              >
                {tokenSaved ? 'Saved!' : 'Save Token'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 text-xs">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              filterStatus === 'all'
                ? 'bg-brand-500 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            All Logs ({totalLogs})
          </button>
          <button
            onClick={() => setFilterStatus('error')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium transition ${
              filterStatus === 'error'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-rose-600 dark:text-rose-400'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Errors ({errorCount})</span>
          </button>
          <button
            onClick={() => setFilterStatus('success')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium transition ${
              filterStatus === 'success'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-emerald-600 dark:text-emerald-400'
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
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
          />
        </div>
      </div>

      {/* Logs Table / List */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100/70 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3">Repository</th>
              <th className="py-3 px-3">HTTP Code</th>
              <th className="py-3 px-3">Items Parsed</th>
              <th className="py-3 px-4">Message / Diagnostic</th>
              <th className="py-3 px-3">Timestamp</th>
              <th className="py-3 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-mono">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-slate-400 font-sans">
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
                        ? 'bg-rose-50/40 dark:bg-rose-950/20 hover:bg-rose-50/80 dark:hover:bg-rose-950/30'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    {/* Status Icon */}
                    <td className="py-2.5 px-3">
                      {isError ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-900 font-sans">
                          <XCircle className="w-3 h-3 text-rose-500" />
                          <span>Error</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900 font-sans">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          <span>OK</span>
                        </span>
                      )}
                    </td>

                    {/* Repository Name */}
                    <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                      <a
                        href={log.url || `https://github.com/${repoDisplayName}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-brand-500 hover:underline flex items-center gap-1"
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
                            ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                            : statusCode === 404
                            ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {statusCode ? `${statusCode}` : 'ERR'}
                      </span>
                    </td>

                    {/* Parsed Count */}
                    <td className="py-2.5 px-3 font-sans text-slate-700 dark:text-slate-300">
                      <strong className={itemsCount > 0 ? "text-brand-600 dark:text-brand-400 font-bold" : "text-slate-400 font-normal"}>
                        {itemsCount}
                      </strong>
                    </td>

                    {/* Message / Diagnostic */}
                    <td className="py-2.5 px-4 max-w-xs truncate text-[11px] font-sans">
                      <span
                        title={message}
                        className={isError ? 'text-rose-700 dark:text-rose-300 font-medium' : 'text-slate-600 dark:text-slate-400'}
                      >
                        {message}
                      </span>
                    </td>

                    {/* Timestamp */}
                    <td className="py-2.5 px-3 text-[11px] text-slate-400 font-sans whitespace-nowrap">
                      {log.timestamp ? new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'N/A'}
                    </td>

                    {/* Action: Retry Single Repo */}
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => onRetryRepo(repoDisplayName)}
                        disabled={isSyncing}
                        title={`Retry fetching ${repoDisplayName}`}
                        className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-sans text-[11px] font-medium transition disabled:opacity-50"
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
