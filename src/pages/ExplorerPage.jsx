import React, { useState, useMemo } from 'react';
import StatsOverview from '../components/StatsOverview';
import FilterBar from '../components/FilterBar';
import OpportunityCard from '../components/OpportunityCard';
import OpportunityTable from '../components/OpportunityTable';
import { SearchX, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

const ITEMS_PER_PAGE = 24;

export default function ExplorerPage({
  opportunities = [],
  savedIds = new Set(),
  onToggleSave,
  onSelectOpportunity,
  sourcesCount = 99,
}) {
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedFunding, setSelectedFunding] = useState('all');
  const [selectedDeadlineFilter, setSelectedDeadlineFilter] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedRepo, setSelectedRepo] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);

  // Derived unique lists for filters
  const allCategories = useMemo(() => {
    const set = new Set();
    opportunities.forEach((o) => {
      if (o.category) set.add(o.category);
    });
    return Array.from(set).sort();
  }, [opportunities]);

  const allRepos = useMemo(() => {
    const set = new Set();
    opportunities.forEach((o) => {
      if (o.sourceRepo) set.add(o.sourceRepo);
    });
    return Array.from(set).sort();
  }, [opportunities]);

  // Overall metric counts
  const paidCount = useMemo(() => {
    return opportunities.filter(
      (o) =>
        o.stipend &&
        !o.stipend.toLowerCase().includes('fee required') &&
        !o.stipend.toLowerCase().includes('not available') &&
        !o.stipend.toLowerCase().includes('na')
    ).length;
  }, [opportunities]);

  const upcomingDeadlinesCount = useMemo(() => {
    return opportunities.filter(
      (o) => o.deadline && !o.deadline.toLowerCase().includes('passed')
    ).length;
  }, [opportunities]);

  // Filtering engine
  const filteredOpportunities = useMemo(() => {
    return opportunities.filter((item) => {
      // 1. Text Search
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesTitle = item.title?.toLowerCase().includes(query);
        const matchesHost = item.host?.toLowerCase().includes(query);
        const matchesDesc = item.notes?.toLowerCase().includes(query);
        const matchesLocation = item.location?.toLowerCase().includes(query);
        const matchesRepo = item.sourceRepo?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesHost && !matchesDesc && !matchesLocation && !matchesRepo) {
          return false;
        }
      }

      // 2. Category
      if (selectedCategory !== 'all') {
        if (!item.category || !item.category.toLowerCase().includes(selectedCategory.toLowerCase())) {
          return false;
        }
      }

      // 3. Type
      if (selectedType !== 'all') {
        if (!item.type || !item.type.toLowerCase().includes(selectedType.toLowerCase())) {
          return false;
        }
      }

      // 4. Funding
      if (selectedFunding !== 'all') {
        const stipendLower = (item.stipend || '').toLowerCase();
        if (selectedFunding === 'paid') {
          if (
            !stipendLower ||
            stipendLower.includes('not available') ||
            stipendLower.includes('fee required') ||
            stipendLower.includes('na')
          ) {
            return false;
          }
        } else if (selectedFunding === 'travel') {
          if (!stipendLower.includes('travel') && !stipendLower.includes('grant') && !stipendLower.includes('aid')) {
            return false;
          }
        } else if (selectedFunding === 'tuition-free') {
          if (!stipendLower.includes('free') && !stipendLower.includes('waive') && !stipendLower.includes('funded')) {
            return false;
          }
        }
      }

      // 5. Deadline status
      if (selectedDeadlineFilter !== 'all') {
        const dl = (item.deadline || '').toLowerCase();
        if (selectedDeadlineFilter === 'upcoming') {
          if (!dl || dl.includes('passed') || dl.includes('closed') || dl.includes('expired')) {
            return false;
          }
        } else if (selectedDeadlineFilter === 'hasDeadline') {
          if (!dl || dl === 'n/a' || dl.includes('tbd') || dl.includes('check')) {
            return false;
          }
        } else if (selectedDeadlineFilter === 'rolling') {
          if (!dl.includes('rolling') && !dl.includes('open') && !dl.includes('anytime')) {
            return false;
          }
        }
      }

      // 6. Location
      if (selectedLocation !== 'all') {
        const loc = (item.location || '').toLowerCase();
        if (selectedLocation === 'remote') {
          if (!loc.includes('remote') && !loc.includes('virtual') && !loc.includes('online')) {
            return false;
          }
        } else if (selectedLocation === 'us') {
          if (!loc.includes('usa') && !loc.includes('united states') && !loc.includes('us')) {
            return false;
          }
        } else if (selectedLocation === 'europe') {
          const euKeywords = ['europe', 'germany', 'uk', 'france', 'italy', 'spain', 'switzerland', 'netherlands'];
          if (!euKeywords.some((k) => loc.includes(k))) return false;
        } else if (selectedLocation === 'asia') {
          const asiaKeywords = ['asia', 'japan', 'china', 'singapore', 'korea', 'taiwan', 'india'];
          if (!asiaKeywords.some((k) => loc.includes(k))) return false;
        } else if (selectedLocation === 'international') {
          if (!loc.includes('international') && !loc.includes('worldwide') && !loc.includes('global')) {
            return false;
          }
        }
      }

      // 7. Source Repo
      if (selectedRepo !== 'all') {
        if (item.sourceRepo !== selectedRepo) return false;
      }

      return true;
    });
  }, [
    opportunities,
    searchTerm,
    selectedCategory,
    selectedType,
    selectedFunding,
    selectedDeadlineFilter,
    selectedLocation,
    selectedRepo,
  ]);

  // Sorting
  const sortedOpportunities = useMemo(() => {
    const list = [...filteredOpportunities];
    if (sortBy === 'title-asc') {
      return list.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    }
    if (sortBy === 'host-asc') {
      return list.sort((a, b) => (a.host || '').localeCompare(b.host || ''));
    }
    if (sortBy === 'stipend') {
      return list.sort((a, b) => ((b.stipend || '').length > 5 ? 1 : -1));
    }
    if (sortBy === 'deadline-asc') {
      return list.sort((a, b) => {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return a.deadline.localeCompare(b.deadline);
      });
    }
    if (sortBy === 'deadline-desc') {
      return list.sort((a, b) => {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return b.deadline.localeCompare(a.deadline);
      });
    }
    return list; // featured
  }, [filteredOpportunities, sortBy]);

  // Reset page on filter changes
  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedType('all');
    setSelectedFunding('all');
    setSelectedDeadlineFilter('all');
    setSelectedLocation('all');
    setSelectedRepo('all');
    setSortBy('featured');
    setCurrentPage(1);
  };

  // Pagination calculation
  const totalPages = Math.ceil(sortedOpportunities.length / ITEMS_PER_PAGE) || 1;
  const validCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);
  const startIndex = (validCurrentPage - 1) * ITEMS_PER_PAGE;
  const paginatedOpportunities = sortedOpportunities.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Hero KPI Bar */}
      <StatsOverview
        totalCount={opportunities.length}
        paidCount={paidCount}
        upcomingDeadlinesCount={upcomingDeadlinesCount}
        sourcesCount={sourcesCount}
      />

      {/* Filter and Search Bar */}
      <FilterBar
        searchTerm={searchTerm}
        setSearchTerm={(term) => {
          setSearchTerm(term);
          setCurrentPage(1);
        }}
        selectedCategory={selectedCategory}
        setSelectedCategory={(cat) => {
          setSelectedCategory(cat);
          setCurrentPage(1);
        }}
        selectedType={selectedType}
        setSelectedType={(t) => {
          setSelectedType(t);
          setCurrentPage(1);
        }}
        selectedFunding={selectedFunding}
        setSelectedFunding={(f) => {
          setSelectedFunding(f);
          setCurrentPage(1);
        }}
        selectedDeadlineFilter={selectedDeadlineFilter}
        setSelectedDeadlineFilter={(d) => {
          setSelectedDeadlineFilter(d);
          setCurrentPage(1);
        }}
        selectedLocation={selectedLocation}
        setSelectedLocation={(loc) => {
          setSelectedLocation(loc);
          setCurrentPage(1);
        }}
        selectedRepo={selectedRepo}
        setSelectedRepo={(repo) => {
          setSelectedRepo(repo);
          setCurrentPage(1);
        }}
        sortBy={sortBy}
        setSortBy={setSortBy}
        viewMode={viewMode}
        setViewMode={setViewMode}
        totalResults={filteredOpportunities.length}
        allCategories={allCategories}
        allRepos={allRepos}
        onResetFilters={handleResetFilters}
      />

      {/* Main Content Area */}
      {paginatedOpportunities.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 my-6">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
            <SearchX className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1">
            No matching opportunities found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-4">
            Try adjusting your search query, selecting "All" categories, or clearing active filters.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-brand-600 hover:bg-brand-500 text-white transition shadow-sm"
          >
            Clear All Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {paginatedOpportunities.map((opportunity) => (
            <OpportunityCard
              key={opportunity.id}
              opportunity={opportunity}
              isSaved={savedIds.has(opportunity.id)}
              onToggleSave={onToggleSave}
              onSelect={onSelectOpportunity}
            />
          ))}
        </div>
      ) : (
        <div className="mb-8">
          <OpportunityTable
            opportunities={paginatedOpportunities}
            savedIds={savedIds}
            onToggleSave={onToggleSave}
            onSelect={onSelectOpportunity}
            sortConfig={{ key: sortBy, direction: 'asc' }}
            onSort={(key) => {
              if (key === 'title') setSortBy('title-asc');
              if (key === 'deadline') setSortBy('deadline-asc');
              if (key === 'type') setSortBy('featured');
            }}
          />
        </div>
      )}

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
          <div>
            Showing <strong className="text-slate-800 dark:text-slate-200">{startIndex + 1}</strong> to{' '}
            <strong className="text-slate-800 dark:text-slate-200">
              {Math.min(startIndex + ITEMS_PER_PAGE, sortedOpportunities.length)}
            </strong>{' '}
            of <strong className="text-slate-800 dark:text-slate-200">{sortedOpportunities.length}</strong> opportunities
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={validCurrentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition"
              title="First Page"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={validCurrentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 py-1 font-semibold text-slate-800 dark:text-slate-200">
              Page {validCurrentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={validCurrentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={validCurrentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition"
              title="Last Page"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
