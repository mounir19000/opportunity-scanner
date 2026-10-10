import React, { useState } from 'react';
import { Bookmark, Database, Menu, Moon, RefreshCw, ScanSearch, Search, Sun, X } from 'lucide-react';

const tabs = [
  ['explorer', 'Explore', Search],
  ['saved', 'Saved', Bookmark],
  ['sources', 'Sources', Database],
];

function linkFor(view) {
  const params = new URLSearchParams(window.location.search);
  params.set('view', view);
  return window.location.pathname + '?' + params.toString();
}

export default function Navbar({ activeTab, onNavigate, theme, toggleTheme, isSyncing, onSyncAll, savedCount = 0 }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const select = (event, view) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    onNavigate(view);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sch-nav">
      <div className="sch-nav-inner">
        <a className="sch-brand" href={linkFor('explorer')} onClick={(event) => select(event, 'explorer')} aria-label="Opportunity Scanner home">
          <span className="sch-logo"><ScanSearch size={22} strokeWidth={2.8} /></span>
          <span>OPPORTUNITY<span className="sch-brand-accent">SCANNER</span><small>FIND YOUR NEXT BIG THING</small></span>
        </a>
        <nav className={menuOpen ? 'sch-nav-links open' : 'sch-nav-links'} aria-label="Main navigation">
          {tabs.map(([id, label, Icon]) => <a key={id} href={linkFor(id)} className={activeTab === id ? 'active' : ''} onClick={(event) => select(event, id)} aria-current={activeTab === id ? 'page' : undefined}><Icon size={16} />{label}{id === 'saved' && savedCount > 0 && <b>{savedCount}</b>}</a>)}
        </nav>
        <div className="sch-nav-actions">
          <button type="button" className="sch-icon-button" onClick={toggleTheme} aria-label={theme === 'dark' ? 'Use light theme' : 'Use dark theme'}>{theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}</button>
          <button type="button" className="sch-refresh" onClick={onSyncAll} disabled={isSyncing} title="Refresh source leads"><RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} /><span>Refresh feeds</span></button>
          <button type="button" className="sch-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen}>{menuOpen ? <X /> : <Menu />}</button>
        </div>
      </div>
    </header>
  );
}
