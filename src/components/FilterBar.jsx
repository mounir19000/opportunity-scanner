import React, { useState } from 'react';
import {
  Search,
  SlidersHorizontal,
  X,
  LayoutGrid,
  List,
  Sparkles,
  ChevronDown,
  Filter,
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
  allTypes = [],
  allLocations = [],
  allRepos = [],
  onResetFilters,
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const popularPills = [
    { label: 'All', value: 'all' },
    { label: '🤖 AI & ML', value: 'AI' },
    { label: '☀️ Summer Schools', value: 'Summer School' },
    { label: '💼 Internships', value: 'Internship' },
    { label: '🎓 Scholarships', value: 'Scholarship' },
    { label: '🔬 Research & REU', value: 'Research' },
    { label: '🌍 Remote Only', value: 'remote' },
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
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search 2,600+ opportunities by title, host (Google, Stanford, CERN...), location, keyword..."
            className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 shadow-sm"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Action Buttons: Sort, Advanced Filters Toggle, View Switcher */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          {/* Advanced Filters Button */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-medium transition shadow-sm ${
              showAdvanced || hasActiveFilters
                ? 'border-brand-500/50 bg-brand-50/70 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-brand-500"></span>
            )}
          </button>

          {/* Sort Selector */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/50 cursor-pointer shadow-sm"
            >
              <option value="featured">Featured / Default</option>
              <option value="deadline-asc">Deadline (Closest first)</option>
              <option value="deadline-desc">Deadline (Furthest first)</option>
              <option value="title-asc">Title (A-Z)</option>
              <option value="host-asc">Host (A-Z)</option>
              <option value="stipend">Paid / Stipend first</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none text-slate-400" />
          </div>

          {/* Grid / Table View Mode Toggle */}
          <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-0.5 shadow-sm">
            <button
              onClick={() => setViewMode('grid')}
              title="Grid card view"
              className={`p-2 rounded-lg transition ${
                viewMode === 'grid'
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              title="Dense table view"
              className={`p-2 rounded-lg transition ${
                viewMode === 'table'
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Popular Quick Pills */}
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
                  setSelectedCategory(selectedCategory === 'Artificial Intelligence & Machine Learning' ? 'all' : 'Artificial Intelligence & Machine Learning');
                } else {
                  setSelectedType(selectedType === pill.value ? 'all' : pill.value);
                }
              }}
              className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-all border ${
                isActive
                  ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                  : 'bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {pill.label}
            </button>
          );
        })}

        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent font-medium whitespace-nowrap ml-auto"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Advanced Filter Drawdown */}
      {showAdvanced && (
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 shadow-lg backdrop-blur-md grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Opportunity Type */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full text-xs py-2 px-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
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

          {/* Funding / Stipend */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Funding & Stipend
            </label>
            <select
              value={selectedFunding}
              onChange={(e) => setSelectedFunding(e.target.value)}
              className="w-full text-xs py-2 px-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="all">Any Funding Status</option>
              <option value="paid">Paid / Stipend Provided</option>
              <option value="travel">Travel Grants / Aid Available</option>
              <option value="tuition-free">Free / Tuition Waived</option>
            </select>
          </div>

          {/* Deadline Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Deadline
            </label>
            <select
              value={selectedDeadlineFilter}
              onChange={(e) => setSelectedDeadlineFilter(e.target.value)}
              className="w-full text-xs py-2 px-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="all">All Deadlines</option>
              <option value="upcoming">Upcoming & Active</option>
              <option value="hasDeadline">Specified Deadline</option>
              <option value="rolling">Rolling / Open</option>
            </select>
          </div>

          {/* Location / Remote */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Location
            </label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full text-xs py-2 px-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="all">All Locations</option>
              <option value="remote">Remote / Virtual</option>
              <option value="us">United States</option>
              <option value="europe">Europe</option>
              <option value="asia">Asia</option>
              <option value="international">International / Worldwide</option>
            </select>
          </div>

          {/* Source Repository */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Source Repository
            </label>
            <select
              value={selectedRepo}
              onChange={(e) => setSelectedRepo(e.target.value)}
              className="w-full text-xs py-2 px-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500 truncate"
            >
              <option value="all">All 99+ Sources</option>
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
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
        <span>
          Showing <strong className="text-slate-800 dark:text-slate-200 font-semibold">{totalResults.toLocaleString()}</strong> matching opportunities
        </span>
        {hasActiveFilters && (
          <span className="text-[11px] text-brand-600 dark:text-brand-400">
            Active filters applied
          </span>
        )}
      </div>
    </div>
  );
}
