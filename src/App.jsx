import React, { useState, useEffect, useMemo, useCallback } from "react";
import Navbar from "./components/Navbar";
import DetailModal from "./components/DetailModal";
import ExplorerPage from "./pages/ExplorerPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import SourcesPage from "./pages/SourcesPage";
import LogsPage from "./pages/LogsPage";
import SavedPage from "./pages/SavedPage";

import initialOpportunitiesData from "./data/initialOpportunities.json";
import initialLogsData from "./data/initialLogs.json";
import reposData from "./data/repositories.json";

import {
  getSavedItems,
  saveItem,
  updateItemStatus,
  removeSavedItem,
  getIngestionLogs,
  saveIngestionLogs,
  clearIngestionLogs,
  getSettings,
  saveSettings,
} from "./services/storage";

import { fetchRepositoryOpportunities } from "./services/githubFetcher";
import { replaceSourceOpportunities, sourceKey } from "./services/opportunityData";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export default function App() {
  // Theme state (default: dark)
  const [theme, setTheme] = useState(() => {
    const saved = getSettings();
    return saved.theme || "dark";
  });

  // Active navigation tab
  const [activeTab, setActiveTab] = useState("explorer");

  // Opportunities dataset
  const [opportunities, setOpportunities] = useState(() => {
    return Array.isArray(initialOpportunitiesData)
      ? initialOpportunitiesData
      : [];
  });

  // Saved items pipeline
  const [savedItems, setSavedItems] = useState(() => getSavedItems());

  // Ingestion & fetch logs
  const [logs, setLogs] = useState(() => {
    const allowed = new Set((Array.isArray(reposData) ? reposData : reposData.repositories || []).map(sourceKey));
    const stored = getIngestionLogs().filter((log) => allowed.has(log.repo || (log.repoOwner + "/" + log.repoName)));
    if (stored.length > 0) return stored;
    return Array.isArray(initialLogsData) ? initialLogsData : [];
  });

  // Live Syncing state
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastFetchedRepo, setLastFetchedRepo] = useState(null);

  // Modals state
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);

  // Toast notification
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  }, []);

  // Sync theme with HTML class
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    saveSettings({ theme });
  }, [theme]);

  // Persist logs whenever they change
  useEffect(() => {
    saveIngestionLogs(logs);
  }, [logs]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // Saved IDs set for fast O(1) card lookups
  const savedIds = useMemo(() => {
    return new Set(savedItems.map((item) => item.id));
  }, [savedItems]);

  // Count error logs for navbar badge
  const errorLogsCount = useMemo(() => {
    return logs.filter((l) => l.status === "error").length;
  }, [logs]);

  // Bookmark / Save toggle handler
  const handleToggleSave = (opportunity, status = "saved", notes = "") => {
    if (savedIds.has(opportunity.id)) {
      const updated = removeSavedItem(opportunity.id);
      setSavedItems(updated);
      showToast(`Removed "${opportunity.title}" from saved items`, "info");
    } else {
      const updated = saveItem(opportunity, status, notes);
      setSavedItems(updated);
      showToast(`Saved "${opportunity.title}" to your tracker!`, "success");
    }
  };

  // Status / notes update
  const handleUpdateStatus = (id, newStatus, newNotes = null) => {
    const updated = updateItemStatus(id, newStatus, newNotes);
    setSavedItems(updated);
    showToast(`Updated status to: ${newStatus}`, "success");
  };

  // Remove single saved item
  const handleRemoveSaved = (id) => {
    const updated = removeSavedItem(id);
    setSavedItems(updated);
    showToast("Item removed from tracker", "info");
  };

  // Clear logs handler
  const handleClearLogs = () => {
    clearIngestionLogs();
    setLogs([]);
    showToast("Logs history cleared", "info");
  };

  // Extract repositories list
  const repositoryList = useMemo(() => {
    return Array.isArray(reposData) ? reposData : reposData.repositories || [];
  }, []);

  // Fetch single repository live
  const handleFetchRepo = async (repoIdentifier) => {
    setIsSyncing(true);
    setLastFetchedRepo(repoIdentifier);

    // Find repo metadata
    const repoObj = repositoryList.find(
      (repo) => sourceKey(repo) === repoIdentifier || repo.name === repoIdentifier,
    );
    if (!repoObj) {
      setIsSyncing(false);
      setLastFetchedRepo(null);
      showToast("This source is no longer in the curated list.", "error");
      return;
    }

    try {
      const result = await fetchRepositoryOpportunities(repoObj);

      // Prepend new log
      setLogs((prev) => [
        result.log,
        ...prev.filter((l) => (l.repoName || l.repo) !== repoObj.name),
      ]);

      if (result.opportunities.length > 0) {
        setOpportunities((prev) => replaceSourceOpportunities(prev, repoObj, result.opportunities));
        showToast(
          `Success: Extracted ${result.opportunities.length} opportunities from ${repoObj.name}!`,
          "success",
        );
      } else if (result.log.status === "error") {
        showToast(
          `Fetch error for ${repoObj.name}: ${result.log.error}`,
          "error",
        );
      } else {
        showToast(
          `Checked ${repoObj.name}: No structured table entries found.`,
          "info",
        );
      }
    } catch (err) {
      const errorLog = {
        id: `log_${Date.now()}`,
        repoName: repoObj.name,
        repoOwner: repoObj.owner,
        url: repoObj.url,
        status: "error",
        statusCode: 0,
        itemsCount: 0,
        error: err.message || "Fetch failed",
        timestamp: new Date().toISOString(),
      };
      setLogs((prev) => [errorLog, ...prev]);
      showToast(`Error fetching ${repoObj.name}: ${err.message}`, "error");
    } finally {
      setIsSyncing(false);
      setLastFetchedRepo(null);
    }
  };

  // Retry all failed repos
  const handleRetryFailed = async () => {
    const failedRepos = logs.filter((l) => l.status === "error");
    if (failedRepos.length === 0) {
      showToast("No failed repositories to retry.", "info");
      return;
    }

    setIsSyncing(true);
    showToast(`Retrying ${failedRepos.length} failed repositories...`, "info");

    for (const failedLog of failedRepos) {
      const repoName = failedLog.repo || (failedLog.repoOwner + "/" + failedLog.repoName);
      await handleFetchRepo(repoName);
    }
    setIsSyncing(false);
  };

  // Sync / Refresh all top priority repos
  const handleSyncAll = async () => {
    setIsSyncing(true);
    showToast(
      "Refreshing curated source listings...",
      "info",
    );

    const sampleRepos = repositoryList;
    let newItemsCount = 0;

    for (const repo of sampleRepos) {
      setLastFetchedRepo(repo.owner + "/" + repo.name);
      try {
        const res = await fetchRepositoryOpportunities(repo);
        setLogs((prev) => [
          res.log,
          ...prev.filter((l) => (l.repoName || l.repo) !== repo.name),
        ]);
        if (res.opportunities.length > 0) {
          newItemsCount += res.opportunities.length;
          setOpportunities((prev) => replaceSourceOpportunities(prev, repo, res.opportunities));
        }
      } catch (e) {
        console.warn("Error during batch sync", e);
      }
    }

    setIsSyncing(false);
    setLastFetchedRepo(null);
    showToast(
      `Sync completed! ${newItemsCount} opportunity records processed.`,
      "success",
    );
  };

  return (
    <div className="min-h-screen flex flex-col transition-colors" style={{ background: "var(--radar-bg)", color: "var(--radar-ink)" }}>
      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        theme={theme}
        toggleTheme={toggleTheme}
        isSyncing={isSyncing}
        onSyncAll={handleSyncAll}
        savedCount={savedItems.length}
        logsCount={logs.length}
        errorLogsCount={errorLogsCount}
        sourcesCount={repositoryList.length}
      />

      {/* Main Page Routing */}
      <main className="flex-1">
        {activeTab === "explorer" && (
          <ExplorerPage
            opportunities={opportunities}
            savedIds={savedIds}
            onToggleSave={handleToggleSave}
            onSelectOpportunity={(opp) => setSelectedOpportunity(opp)}
            sourcesCount={repositoryList.length}
          />
        )}

        {activeTab === "analytics" && (
          <AnalyticsPage
            opportunities={opportunities}
            onSelectOpportunity={(opp) => setSelectedOpportunity(opp)}
          />
        )}

        {activeTab === "sources" && (
          <SourcesPage
            onFetchRepo={handleFetchRepo}
            isSyncing={isSyncing}
            lastFetchedRepo={lastFetchedRepo}
            opportunities={opportunities}
          />
        )}

        {activeTab === "logs" && (
          <LogsPage
            logs={logs}
            onClearLogs={handleClearLogs}
            onRetryRepo={handleFetchRepo}
            onRetryFailed={handleRetryFailed}
            onSyncAll={handleSyncAll}
            isSyncing={isSyncing}
          />
        )}

        {activeTab === "saved" && (
          <SavedPage
            savedItems={savedItems}
            onUpdateStatus={handleUpdateStatus}
            onRemoveSaved={handleRemoveSaved}
            onSelectOpportunity={(opp) => setSelectedOpportunity(opp)}
            onNavigateToExplorer={() => setActiveTab("explorer")}
          />
        )}
      </main>

      <footer className="radar-footer">
        <span>opportunityradar · {repositoryList.length} reviewed sources</span>
        <span>Leads are gathered from source listings. Check the original page before applying.</span>
      </footer>

      {/* Opportunity Detail Modal */}
      {selectedOpportunity && (
        <DetailModal
          opportunity={selectedOpportunity}
          isOpen={Boolean(selectedOpportunity)}
          onClose={() => setSelectedOpportunity(null)}
          isSaved={savedIds.has(selectedOpportunity.id)}
          savedDetails={savedItems.find((s) => s.id === selectedOpportunity.id)}
          onToggleSave={handleToggleSave}
          onUpdateStatus={handleUpdateStatus}
        />
      )}

      {/* Floating Toast Notification */}
      {toast && (
        <div className="radar-toast">
          {toast.type === "success" && (
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          )}
          {toast.type === "error" && (
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          )}
          {toast.type === "info" && (
            <Info className="w-4 h-4 text-brand-500 shrink-0" />
          )}
          <span className="text-slate-800 dark:text-slate-200">
            {toast.message}
          </span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
