import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './scholarhub.css';
import Navbar from './components/Navbar';
import DetailModal from './components/DetailModal';
import ExplorerPage from './pages/ExplorerPage';
import SourcesPage from './pages/SourcesPage';
import SavedPage from './pages/SavedPage';
import reposData from './data/repositories.json';
import {
  getSavedItems,
  SAVED_STORAGE_KEY,
  saveItem,
  updateItemStatus,
  removeSavedItem,
  getIngestionLogs,
  saveIngestionLogs,
  clearIngestionLogs,
} from './services/storage';
import { fetchRepositoryOpportunities } from './services/githubFetcher';
import { mergeSourceOpportunities, replaceSourceOpportunities, sourceKey } from './services/opportunityData';
import { getCachedOpportunities, reconcileSnapshot, saveCachedOpportunities } from './services/opportunityCache';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const validViews = new Set(['explorer', 'saved', 'sources']);

function logRepoKey(log) {
  return log.repo || (log.repoOwner && log.repoName ? log.repoOwner + '/' + log.repoName : '');
}

function viewFromUrl() {
  const view = new URLSearchParams(window.location.search).get('view');
  return validViews.has(view) ? view : 'explorer';
}

export default function App() {
  const [theme, setTheme] = useState('light');
  const [activeTab, setActiveTab] = useState(viewFromUrl);
  const [catalog, setCatalog] = useState(() => getCachedOpportunities(reposData) || { items: [], updatedAt: '', sourceUpdatedAt: {} });
  const catalogRef = useRef(catalog);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [savedItems, setSavedItems] = useState(getSavedItems);
  const allowedRepos = useMemo(() => new Set(reposData.map(sourceKey)), []);
  const [logs, setLogs] = useState(() => getIngestionLogs().filter((log) => allowedRepos.has(logRepoKey(log))));
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastFetchedRepo, setLastFetchedRepo] = useState(null);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const showToast = useCallback((message, type = 'info') => {
    window.clearTimeout(toastTimer.current);
    setToast({ message, type });
    toastTimer.current = window.setTimeout(() => setToast(null), 4000);
  }, []);

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => { saveIngestionLogs(logs); }, [logs]);

  useEffect(() => {
    const syncSaved = (event) => {
      if (event.key === SAVED_STORAGE_KEY || event.key === null) setSavedItems(getSavedItems());
    };
    window.addEventListener('storage', syncSaved);
    return () => window.removeEventListener('storage', syncSaved);
  }, []);

  useEffect(() => {
    const onPop = () => setActiveTab(viewFromUrl());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch(import.meta.env.BASE_URL + 'opportunities.json', { cache: 'no-cache' })
      .then((response) => {
        if (!response.ok) throw new Error('Snapshot request failed (' + response.status + ')');
        return response.json();
      })
      .then((snapshot) => {
        if (cancelled) return;
        const next = reconcileSnapshot(snapshot, catalogRef.current, reposData);
        if (!next.items.length) throw new Error('The opportunity snapshot is empty.');
        catalogRef.current = next;
        setCatalog(next);
        setLoading(false);
      })
      .catch((error) => {
        if (cancelled) return;
        setLoadError(error.message || 'Unable to load opportunities.');
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const navigate = (view) => {
    if (!validViews.has(view)) return;
    const url = new URL(window.location.href);
    url.searchParams.set('view', view);
    window.history.pushState(null, '', url.pathname + url.search + url.hash);
    setActiveTab(view);
  };

  const commitListings = (items, source) => {
    const updatedAt = new Date().toISOString();
    const sourceUpdatedAt = { ...catalogRef.current.sourceUpdatedAt, [sourceKey(source)]: updatedAt };
    const next = { items, updatedAt, sourceUpdatedAt };
    catalogRef.current = next;
    setCatalog(next);
    saveCachedOpportunities(items, reposData, updatedAt, sourceUpdatedAt);
  };

  const recordLog = (log) => setLogs((previous) => [{ id: log.id || 'log_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7), ...log }, ...previous].slice(0, 100));

  const refreshSource = async (repo) => {
    let result;
    if (repo.type === 'website') {
      const { fetchWebSource } = await import('../scripts/webFetcher.js');
      const options = repo.id === 'for9a.com'
        ? {}
        : { since: new Date(Date.now() - 30 * 86400000).toISOString() };
      result = await fetchWebSource(repo, options);
    } else {
      result = await fetchRepositoryOpportunities(repo);
    }
    recordLog(result.log);
    if (result.log.status === 'success') {
      const items = repo.type === 'website' && repo.id !== 'for9a.com'
        ? mergeSourceOpportunities(catalogRef.current.items, repo, result.opportunities)
        : replaceSourceOpportunities(catalogRef.current.items, repo, result.opportunities);
      commitListings(items, repo);
    }
    return result;
  };

  const handleFetchRepo = async (repoIdentifier) => {
    if (loading) {
      showToast('The directory is still loading.');
      return;
    }
    const repo = reposData.find((source) => sourceKey(source) === repoIdentifier);
    if (!repo) {
      showToast('This source is no longer in the directory.', 'error');
      return;
    }
    setIsSyncing(true);
    setLastFetchedRepo(repoIdentifier);
    try {
      const result = await refreshSource(repo);
      showToast(result.log.status === 'success'
        ? repo.type === 'website' && repo.id !== 'for9a.com'
          ? 'Checked ' + result.log.parsedCount + ' recent posts from ' + repo.name + '; found ' + result.opportunities.length + ' computing leads.'
          : 'Refreshed ' + result.opportunities.length + ' leads from ' + repo.name + '.'
        : 'Could not refresh ' + repo.name + ': ' + (result.log.error || result.log.message),
      result.log.status === 'success' ? 'success' : 'error');
    } catch (error) {
      recordLog({
        id: 'log_' + Date.now() + '_' + repo.name,
        repo: sourceKey(repo),
        repoName: repo.name,
        repoOwner: repo.owner,
        status: 'error',
        error: error.message,
        itemsCount: 0,
        timestamp: new Date().toISOString(),
      });
      showToast('Could not refresh ' + repo.name + ': ' + error.message, 'error');
    } finally {
      setIsSyncing(false);
      setLastFetchedRepo(null);
    }
  };

  const handleSyncAll = async () => {
    if (loading) {
      showToast('The directory is still loading.');
      return;
    }
    setIsSyncing(true);
    let succeeded = 0;
    let failed = 0;
    for (const repo of reposData) {
      setLastFetchedRepo(sourceKey(repo));
      try {
        const result = await refreshSource(repo);
        if (result.log.status === 'success') succeeded++;
        else failed++;
      } catch (error) {
        failed++;
        recordLog({
          id: 'log_' + Date.now() + '_' + repo.name,
          repo: sourceKey(repo),
          repoName: repo.name,
          repoOwner: repo.owner,
          status: 'error',
          error: error.message,
          itemsCount: 0,
          timestamp: new Date().toISOString(),
        });
      }
    }
    setIsSyncing(false);
    setLastFetchedRepo(null);
    showToast('Refreshed ' + succeeded + ' sources' + (failed ? '; ' + failed + ' failed.' : '.'), failed ? 'error' : 'success');
  };

  const handleRetryFailed = async () => {
    if (loading) {
      showToast('The directory is still loading.');
      return;
    }
    const latest = new Map();
    for (const log of logs) {
      const key = logRepoKey(log);
      if (!latest.has(key)) latest.set(key, log.status);
    }
    const failed = reposData.filter((repo) => latest.get(sourceKey(repo)) === 'error');
    if (!failed.length) {
      showToast('No failed sources to retry.');
      return;
    }
    setIsSyncing(true);
    let succeeded = 0;
    for (const repo of failed) {
      setLastFetchedRepo(sourceKey(repo));
      try {
        const result = await refreshSource(repo);
        if (result.log.status === 'success') succeeded++;
      } catch (error) {
        recordLog({
          id: 'log_' + Date.now() + '_' + repo.name,
          repo: sourceKey(repo),
          status: 'error',
          error: error.message,
          itemsCount: 0,
          timestamp: new Date().toISOString(),
        });
      }
    }
    setIsSyncing(false);
    setLastFetchedRepo(null);
    showToast('Retried ' + failed.length + ' sources; ' + succeeded + ' refreshed.', succeeded === failed.length ? 'success' : 'error');
  };

  const handleToggleSave = (opportunity, status = 'saved', notes = '') => {
    const exists = savedItems.some((item) => item.id === opportunity.id);
    setSavedItems(exists ? removeSavedItem(opportunity.id) : saveItem(opportunity, status, notes));
    showToast(exists ? 'Removed from saved items.' : 'Saved to your tracker.', exists ? 'info' : 'success');
  };

  const handleUpdateStatus = (id, status, notes = null) => {
    setSavedItems(updateItemStatus(id, status, notes));
    showToast('Tracker updated.', 'success');
  };

  const handleRemoveSaved = (id) => {
    setSavedItems(removeSavedItem(id));
    showToast('Item removed from tracker.');
  };

  const handleClearLogs = () => {
    clearIngestionLogs();
    setLogs([]);
    showToast('Refresh history cleared.');
  };

  const opportunities = catalog.items;
  const savedIds = useMemo(() => new Set(savedItems.map((item) => item.id)), [savedItems]);
  const currentById = useMemo(() => new Map(opportunities.map((item) => [item.id, item])), [opportunities]);
  const savedForDisplay = useMemo(() => savedItems.map((saved) => ({
    ...saved,
    ...currentById.get(saved.id),
    status: saved.status,
    notes: saved.notes,
    savedAt: saved.savedAt,
  })), [savedItems, currentById]);

  return (
    <div className="min-h-screen flex flex-col transition-colors" style={{ background: 'var(--radar-bg)', color: 'var(--radar-ink)' }}>
      <Navbar activeTab={activeTab} onNavigate={navigate} theme={theme} toggleTheme={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')} isSyncing={isSyncing || loading} onSyncAll={handleSyncAll} savedCount={savedItems.length} />
      <main className="flex-1">
        {activeTab === 'explorer' && <ExplorerPage opportunities={opportunities} loading={loading} loadError={loadError} sourceCount={reposData.length} savedIds={savedIds} onToggleSave={handleToggleSave} onSelectOpportunity={setSelectedOpportunity} />}
        {activeTab === 'sources' && <SourcesPage opportunities={opportunities} updatedAt={catalog.updatedAt} logs={logs} onFetchRepo={handleFetchRepo} onSyncAll={handleSyncAll} onRetryFailed={handleRetryFailed} onClearLogs={handleClearLogs} isSyncing={isSyncing || loading} lastFetchedRepo={lastFetchedRepo} />}
        {activeTab === 'saved' && <SavedPage savedItems={savedForDisplay} onUpdateStatus={handleUpdateStatus} onRemoveSaved={handleRemoveSaved} onSelectOpportunity={(item) => setSelectedOpportunity(currentById.get(item.id) || { ...item, notes: item.sourceNotes || '' })} onNavigateToExplorer={() => navigate('explorer')} />}
      </main>
      <footer className="radar-footer">
        <span>Opportunity Radar · {opportunities.length.toLocaleString()} source leads · {reposData.length} sources</span>
        <span>Review programme details and deadlines on the original listing before applying.</span>
      </footer>
      {selectedOpportunity && <DetailModal opportunity={selectedOpportunity} isOpen onClose={() => setSelectedOpportunity(null)} isSaved={savedIds.has(selectedOpportunity.id)} savedDetails={savedItems.find((item) => item.id === selectedOpportunity.id)} onToggleSave={handleToggleSave} onUpdateStatus={handleUpdateStatus} />}
      {toast && <div className="radar-toast" role="status">
        {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
        {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />}
        {toast.type === 'info' && <Info className="w-4 h-4 shrink-0" />}
        <span>{toast.message}</span>
        <button type="button" onClick={() => setToast(null)} aria-label="Dismiss notification"><X className="w-3.5 h-3.5" /></button>
      </div>}
    </div>
  );
}
