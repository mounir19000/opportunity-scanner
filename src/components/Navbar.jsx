import React, { useState } from "react";
import {
  Compass,
  BarChart3,
  Database,
  Terminal,
  Bookmark,
  Sun,
  Moon,
  RefreshCw,
  Rocket,
  Menu,
  X,
  Radio,
} from "lucide-react";

export default function Navbar({
  activeTab,
  setActiveTab,
  theme,
  toggleTheme,
  isSyncing,
  onSyncAll,
  onOpenDeployModal,
  savedCount = 0,
  logsCount = 0,
  errorLogsCount = 0,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: "explorer", label: "Explorer", icon: Compass },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "sources", label: "Sources (99)", icon: Database },
    {
      id: "logs",
      label: "Fetch Logs",
      icon: Terminal,
      badge: errorLogsCount > 0 ? `${errorLogsCount} err` : null,
      badgeColor: "bg-rose-500/20 text-rose-300 border border-rose-500/40",
    },
    {
      id: "saved",
      label: "Tracker",
      icon: Bookmark,
      badge: savedCount > 0 ? savedCount : null,
      badgeColor: "bg-brand-500/20 text-brand-300 border border-brand-500/40",
    },
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] dark:border-slate-800/80 bg-white/90 dark:bg-[#0B0F19]/85 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Live Signal */}
          <div className="flex items-center gap-4">
            <div
              onClick={() => handleNavClick("explorer")}
              className="flex items-center gap-3 cursor-pointer group select-none"
            >
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-cyan-400 p-[1.5px] shadow-lg shadow-brand-500/25 group-hover:scale-105 transition-transform duration-200">
                <div className="w-full h-full rounded-[10px] bg-[#0B0F19] flex items-center justify-center">
                  <Radio className="w-4 h-4 text-cyan-400 group-hover:rotate-45 transition-transform duration-300" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display font-extrabold text-lg tracking-tight bg-gradient-to-r from-slate-900 via-indigo-600 to-brand-600 dark:from-white dark:via-indigo-200 dark:to-cyan-300 bg-clip-text text-transparent">
                    OpportunityRadar
                  </span>
                  <span className="font-mono text-[9px] font-bold tracking-widest px-1.5 py-0.5 rounded bg-brand-500/10 text-brand-400 border border-brand-500/30">
                    INTEL HUB
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  <span className="font-mono text-[10px] text-emerald-400 font-medium tracking-wide">
                    LIVE RADAR ACTIVE
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 dark:bg-slate-900/60 p-1 rounded-xl border border-slate-200/80 dark:border-white/[0.06]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all relative ${
                    isActive
                      ? "bg-brand-600 text-white shadow-sm font-semibold"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Icons & Deploy */}
          <div className="flex items-center gap-2">
            {/* Live Sync Button */}
            <button
              onClick={onSyncAll}
              disabled={isSyncing}
              title="Fetch live updates from GitHub repositories"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border border-slate-200 dark:border-white/[0.08] bg-slate-100 dark:bg-slate-900/80 hover:border-brand-500/50 text-slate-700 dark:text-slate-200 transition shadow-sm disabled:opacity-50"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-brand-400 ${isSyncing ? "animate-spin" : ""}`}
              />
              <span className="hidden lg:inline">{isSyncing ? "Syncing..." : "Sync"}</span>
            </button>

            {/* Deploy Guide Button (1-Click Netlify / Vercel) */}
            <button
              onClick={onOpenDeployModal}
              title="Deploy to Netlify or Vercel"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-brand-600 to-cyan-500 hover:from-brand-500 hover:to-cyan-400 text-white shadow-md shadow-brand-500/20 transition hover:shadow-glow-brand"
            >
              <Rocket className="w-3.5 h-3.5" />
              <span>Deploy</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              className="p-2 rounded-lg border border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-slate-700" />
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg border border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Open navigation menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-slate-200 dark:border-white/[0.08] space-y-1 bg-white/95 dark:bg-[#0B0F19]/95 backdrop-blur-xl">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition ${
                    isActive
                      ? "bg-brand-600 text-white font-semibold"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
}
