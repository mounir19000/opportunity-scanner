import React from 'react';
import { ArrowUpRight, Bookmark, ChartNoAxesCombined, Database, ListFilter, Moon, RefreshCw, ScrollText, Sun } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, theme, toggleTheme, isSyncing, onSyncAll, savedCount = 0, errorLogsCount = 0, sourcesCount = 0 }) {
  const tabs = [
    { id: 'explorer', label: 'Explore', icon: ListFilter },
    { id: 'saved', label: 'Saved', icon: Bookmark, count: savedCount },
    { id: 'sources', label: 'Sources', icon: Database, count: sourcesCount },
    { id: 'analytics', label: 'Insights', icon: ChartNoAxesCombined },
    { id: 'logs', label: 'Activity', icon: ScrollText, count: errorLogsCount || null },
  ];
  return (
    <header className="radar-nav">
      <div className="radar-nav-inner">
        <button className="radar-brand" onClick={() => setActiveTab('explorer')} type="button" aria-label="OpportunityRadar home">
          <span className="radar-brand-mark"><ArrowUpRight size={20} strokeWidth={2.5} /></span>
          <span><strong>opportunity<span>radar</span></strong><small>A better place to start.</small></span>
        </button>
        <nav className="radar-tabs" aria-label="Main navigation">
          {tabs.map(({ id, label, icon: Icon, count }) => (
            <button className={activeTab === id ? 'radar-tab active' : 'radar-tab'} key={id} onClick={() => setActiveTab(id)} type="button" aria-current={activeTab === id ? 'page' : undefined}>
              <Icon size={16} /><span>{label}</span>{count ? <b>{count}</b> : null}
            </button>
          ))}
        </nav>
        <div className="radar-nav-actions">
          <button className="radar-sync" onClick={onSyncAll} disabled={isSyncing} type="button" title="Refresh curated sources"><RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} /><span>{isSyncing ? 'Refreshing' : 'Refresh'}</span></button>
          <button className="radar-theme" onClick={toggleTheme} type="button" aria-label={theme === 'dark' ? 'Use light theme' : 'Use dark theme'}>{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}</button>
        </div>
      </div>
    </header>
  );
}
