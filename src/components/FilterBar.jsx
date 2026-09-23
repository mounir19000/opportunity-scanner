import React, { useState } from 'react';
import {
  Search,
  SlidersHorizontal,
  X,
  LayoutGrid,
  List,
  ChevronDown,
  Filter,
  RotateCcw,
} from 'lucide-react';

export default function FilterBar({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  selectedType,
  setSelectedType,
  selectedFunding,
  setSelectedFunding,
  selectedDeadlineFilter,
  setSelectedDeadlineFilter,
  selectedLocation,
  setSelectedLocation,
  selectedRepo,
  setSelectedRepo,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
  totalResults,
  allCategories = [],
  allRepos = [],
  onResetFilters,
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const popularPills = [
    { label: 'All Feeds', value: 'all' },
    { label: '🤖 AI & ML', value: 'AI' },
    { label: '☀️ Summer Schools', value: 'Summer School' },
    { label: '💼 Internships', value: 'Internship' },
    { label: '🎓 Scholarships', value: 'Scholarship' },
    { label: '🔬 Research & REU', value: 'Research' },
    { label: '🌐 Remote Only', value: 'remote' },
  ];

  const hasActiveFilters =
    searchTerm !== '' ||
    selectedCategory !== 'all' ||
    selectedType !== 'all' ||
    selectedFunding !== 'all' ||
    selectedDeadlineFilter !== 'all' ||
    selectedLocation !== 'all' ||
    selectedRepo !== 'all';

  return (
    <div className="space-y-3 mb-6">
      {/* Top Search & Controls Row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5">
        {/* Search Input Box */}
        <div className="relative flex-1 group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-400 transition" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search 3,000+ opportunities by title, host (Google, Stanford, CERN, Palantir...), location, keywords..."
            className="w-full pl-10 pr-20 py-2.5 rounded-xl border border-white/[0.08] bg-slate-900/70 text-xs sm:text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 backdrop-blur-md shadow-inner transition"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {searchTerm ? (
              <button
                onClick={() => setSearchTerm('')}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <span className="hidden sm:inline-block font-mono text-[10px] text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded border border-white/[0.06]">
                ⌘K
              </span>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          {/* Advanced Filters Button */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-mono font-medium transition shadow-sm ${
              showAdvanced || hasActiveFilters
                ? 'border-brand-500/50 bg-brand-500/10 text-brand-300'
                : 'border-white/[0.08] bg-slate-900/70 text-slate-300 hover:border-slate-700 hover:bg-slate-800/60'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-brand-400" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-brand-400 shadow-sm shadow-brand-400 animate-pulse" />
            )}
          </button>

          {/* Sort Selector */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none pl-3 pr-7 py-2.5 rounded-xl border border-white/[0.08] bg-slate-900/70 text-xs font-mono font-medium text-slate-300 hover:border-slate-700 focus:outline-none focus:border-brand-500 cursor-pointer shadow-sm"
            >
              <option value="featured">Featured First</option>
              <option value="deadline-asc">Deadline (Closest)</option>
              <option value="deadline-desc">Deadline (Furthest)</option>
              <option value="title-asc">Title (A-Z)</option>
              <option value="host-asc">Host (A-Z)</option>
              <option value="stipend">Paid / Stipends</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none text-slate-400" />
          </div>

          {/* Grid / Table View Mode Toggle */}
          <div className="flex items-center rounded-xl border border-white/[0.08] bg-slate-900/70 p-0.5 shadow-sm">
            <button
              onClick={() => setViewMode('grid')}
              title="Grid card view"
              className={`p-2 rounded-lg transition ${
                viewMode === 'grid'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              title="Dense table view"
              className={`p-2 rounded-lg transition ${
                viewMode === 'table'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Popular Quick Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        {popularPills.map((pill) => {
          const isActive =
            (pill.value === 'all' && selectedCategory === 'all' && selectedType === 'all' && selectedLocation !== 'remote') ||
            (pill.value === 'AI' && selectedCategory.toLowerCase().includes('ai')) ||
            (pill.value === 'Summer School' && selectedType.toLowerCase().includes('summer school')) ||
            (pill.value === 'Internship' && selectedType.toLowerCase().includes('internship')) ||
            (pill.value === 'Scholarship' && selectedType.toLowerCase().includes('scholarship')) ||
            (pill.value === 'Research' && selectedType.toLowerCase().includes('research')) ||
            (pill.value === 'remote' && selectedLocation === 'remote');

          return (
            <button
              key={pill.value}
              onClick={() => {
                if (pill.value === 'all') {
                  onResetFilters();
                } else if (pill.value === 'remote') {
                  setSelectedLocation(selectedLocation === 'remote' ? 'all' : 'remote');
                } else if (pill.value === 'AI') {
                  setSelectedCategory(selectedCategory.includes('Artificial') ? 'all' : 'Artificial Intelligence');
                } else {
                  setSelectedType(selectedType === pill.value ? 'all' : pill.value);
                }
              }}
              className={`px-3 py-1.5 rounded-full font-mono text-[11px] font-medium whitespace-nowrap transition-all border ${
                isActive
                  ? 'bg-brand-600 text-white border-brand-500 shadow-md shadow-brand-500/25 font-semibold'
                  : 'bg-slate-900/50 border-white/[0.08] text-slate-300 hover:border-slate-700 hover:text-white'
              }`}
            >
              {pill.label}
            </button>
          );
        })}

        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full font-mono text-[11px] text-rose-400 hover:bg-rose-500/10 border border-rose-500/30 font-semibold whitespace-nowrap ml-auto transition"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Advanced Filter Drawer */}
      {showAdvanced && (
        <div className="p-4 rounded-xl border border-white/[0.08] bg-slate-900/95 shadow-xl backdrop-blur-xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 animate-in fade-in duration-150">
          <div>
            <label className="block font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Program Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full text-xs py-2 px-2.5 rounded-lg border border-white/[0.08] bg-slate-800 text-slate-200 focus:outline-none focus:border-brand-500"
            >
              <option value="all">All Types</option>
              <option value="Summer School">Summer School</option>
              <option value="Internship">Internship</option>
              <option value="Scholarship">Scholarship</option>
              <option value="Fellowship">Fellowship</option>
              <option value="Research">Research / REU</option>
              <option value="Grant">Grant</option>
            </select>
          </div>

          <div>
            <label className="block font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Compensation / Funding
            </label>
            <select
              value={selectedFunding}
              onChange={(e) => setSelectedFunding(e.target.value)}
              className="w-full text-xs py-2 px-2.5 rounded-lg border border-white/[0.08] bg-slate-800 text-slate-200 focus:outline-none focus:border-brand-500"
            >
              <option value="all">Any Funding Status</option>
              <option value="paid">Paid / Stipend Provided</option>
              <option value="travel">Travel Grants / Aid</option>
              <option value="tuition-free">Free / Tuition Waived</option>
            </select>
          </div>

          <div>
            <label className="block font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Deadline Window
            </label>
            <select
              value={selectedDeadlineFilter}
              onChange={(e) => setSelectedDeadlineFilter(e.target.value)}
              className="w-full text-xs py-2 px-2.5 rounded-lg border border-white/[0.08] bg-slate-800 text-slate-200 focus:outline-none focus:border-brand-500"
            >
              <option value="all">All Deadlines</option>
              <option value="upcoming">Upcoming & Active</option>
              <option value="hasDeadline">Explicit Deadline</option>
              <option value="rolling">Rolling / Open</option>
            </select>
          </div>

          <div>
            <label className="block font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Location / Mode
            </label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full text-xs py-2 px-2.5 rounded-lg border border-white/[0.08] bg-slate-800 text-slate-200 focus:outline-none focus:border-brand-500"
            >
              <option value="all">All Locations</option>
              <option value="remote">Remote / Virtual</option>
              <option value="us">United States</option>
              <option value="europe">Europe</option>
              <option value="asia">Asia</option>
              <option value="international">Global / Worldwide</option>
            </select>
          </div>

          <div>
            <label className="block font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Source Repository
            </label>
            <select
              value={selectedRepo}
              onChange={(e) => setSelectedRepo(e.target.value)}
              className="w-full text-xs py-2 px-2.5 rounded-lg border border-white/[0.08] bg-slate-800 text-slate-200 focus:outline-none focus:border-brand-500 truncate"
            >
              <option value="all">All 99+ GitHub Trackers</option>
              {allRepos.map((repo) => (
                <option key={repo} value={repo}>
                  {repo}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Results Count Banner */}
      <div className="flex items-center justify-between font-mono text-xs text-slate-400 px-1">
        <span>
          Showing <strong className="text-white font-bold">{totalResults.toLocaleString()}</strong> verified opportunities
        </span>
        {hasActiveFilters && (
          <span className="text-brand-400 text-[11px] font-semibold">
            ● Active filters applied
          </span>
        )}
      </div>
    </div>
  );
}
