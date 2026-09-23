import React, { useState, useMemo } from 'react';
import {
  Database,
  ExternalLink,
  Search,
  RefreshCw,
  Star,
  CheckCircle2,
  FolderGit2,
  Filter,
} from 'lucide-react';
import reposData from '../data/repositories.json';

export default function SourcesPage({ onFetchRepo, isSyncing, lastFetchedRepo }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const repoList = useMemo(() => {
    return Array.isArray(reposData) ? reposData : (reposData.repositories || []);
  }, []);

  const categories = useMemo(() => {
    const set = new Set();
    repoList.forEach((r) => {
      if (r.category) set.add(r.category);
    });
    return Array.from(set).sort();
  }, [repoList]);

  const filteredRepos = useMemo(() => {
    return repoList.filter((r) => {
      if (selectedCategory !== 'all' && r.category !== selectedCategory) {
        return false;
      }
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesName = r.name?.toLowerCase().includes(q);
        const matchesDesc = r.description?.toLowerCase().includes(q);
        const matchesCat = r.category?.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesCat) return false;
      }
      return true;
    });
  }, [repoList, searchTerm, selectedCategory]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800">
              <Database className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Curated Opportunity Repositories ({repoList.length})
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            A comprehensive index of 99+ top open-source trackers across GitHub, spanning AI/ML summer schools, SWE internships, REUs, scholarships, and diversity programs.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search repositories by name, owner, or topics..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
          />
        </div>

        {/* Category Filter */}
        <div className="md:w-72">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Categories ({repoList.length})</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Repositories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {filteredRepos.map((repo) => {
          const isCurrentFetching = isSyncing && lastFetchedRepo === repo.name;

          return (
            <div
              key={repo.name}
              className="flex flex-col justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 p-5 shadow-sm hover:shadow-md transition duration-200"
            >
              <div>
                {/* Header Category & Stars */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 truncate max-w-[200px]">
                    {repo.category}
                  </span>
                  {repo.stars && (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {repo.stars.toLocaleString()}
                    </span>
                  )}
                </div>

                {/* Repo Name */}
                <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-snug mb-1 font-mono">
                  {repo.name}
                </h3>

                {/* Description */}
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-4">
                  {repo.description || 'Open-source tracker for high-impact opportunities.'}
                </p>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                <a
                  href={`https://github.com/${repo.name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-brand-500 font-medium transition"
                >
                  <FolderGit2 className="w-3.5 h-3.5" />
                  <span>GitHub</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <button
                  onClick={() => onFetchRepo(repo.name)}
                  disabled={isSyncing}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-medium transition disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 text-brand-500 ${isCurrentFetching ? 'animate-spin' : ''}`} />
                  <span>{isCurrentFetching ? 'Fetching...' : 'Fetch'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
