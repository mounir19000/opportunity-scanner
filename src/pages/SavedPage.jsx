import React, { useState } from 'react';
import {
  Bookmark,
  ExternalLink,
  Trash2,
  Download,
  Calendar,
  Building2,
  MapPin,
  Kanban,
  List,
  Sparkles,
  ChevronRight,
  Clock,
  CheckCircle,
} from 'lucide-react';

const STAGES = [
  { id: 'saved', label: 'Saved', color: 'border-slate-300 dark:border-slate-700 bg-slate-100/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300' },
  { id: 'applied', label: 'Applied', color: 'border-blue-300 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300' },
  { id: 'interviewing', label: 'Interviewing', color: 'border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300' },
  { id: 'offered', label: 'Offered / Accepted', color: 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300' },
];

export default function SavedPage({
  savedItems = [],
  onUpdateStatus,
  onRemoveSaved,
  onSelectOpportunity,
  onNavigateToExplorer,
}) {
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'list'

  const handleExportCSV = () => {
    if (savedItems.length === 0) return;
    const headers = ['Title', 'Host', 'Type', 'Category', 'Location', 'Deadline', 'Status', 'URL', 'Source Repo', 'Notes'];
    const rows = savedItems.map((item) => [
      `"${(item.title || '').replace(/"/g, '""')}"`,
      `"${(item.host || '').replace(/"/g, '""')}"`,
      `"${(item.type || '').replace(/"/g, '""')}"`,
      `"${(item.category || '').replace(/"/g, '""')}"`,
      `"${(item.location || '').replace(/"/g, '""')}"`,
      `"${(item.deadline || '').replace(/"/g, '""')}"`,
      `"${(item.status || 'saved').replace(/"/g, '""')}"`,
      `"${(item.url || '').replace(/"/g, '""')}"`,
      `"${(item.sourceRepo || '').replace(/"/g, '""')}"`,
      `"${(item.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `opportunity-applications-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800">
              <Bookmark className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Application Tracker ({savedItems.length})
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Track your pipeline from bookmarking to application submissions, interview rounds, and offers.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {savedItems.length > 0 && (
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          )}

          {/* View Mode Toggle */}
          <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-0.5">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-2 rounded-lg transition ${
                viewMode === 'kanban'
                  ? 'bg-brand-500 text-white'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Kanban Board"
            >
              <Kanban className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition ${
                viewMode === 'list'
                  ? 'bg-brand-500 text-white'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {savedItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 my-6">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-950/50 flex items-center justify-center text-brand-500 mb-3">
            <Bookmark className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1">
            Your application pipeline is currently empty
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-4">
            Browse through 2,600+ opportunities in the Explorer and click the bookmark icon to start tracking your applications.
          </p>
          <button
            onClick={onNavigateToExplorer}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-brand-600 hover:bg-brand-500 text-white transition shadow-sm"
          >
            <span>Explore Opportunities</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : viewMode === 'kanban' ? (
        /* Kanban Pipeline View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {STAGES.map((stage) => {
            const itemsInStage = savedItems.filter(
              (item) => (item.status || 'saved') === stage.id
            );

            return (
              <div
                key={stage.id}
                className="flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 p-3.5 min-h-[500px]"
              >
                {/* Stage Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      {stage.label}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {itemsInStage.length}
                    </span>
                  </div>
                </div>

                {/* Stage Items Column */}
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {itemsInStage.length === 0 ? (
                    <div className="h-32 flex items-center justify-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                      No items
                    </div>
                  ) : (
                    itemsInStage.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 shadow-sm hover:shadow transition group relative cursor-pointer"
                        onClick={() => onSelectOpportunity(item)}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                            {item.type || 'Opportunity'}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onRemoveSaved(item.id);
                            }}
                            className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                            title="Remove from saved"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-2 mb-1 group-hover:text-brand-500 transition">
                          {item.title}
                        </h4>

                        {item.host && (
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mb-2">
                            {item.host}
                          </div>
                        )}

                        {item.deadline && (
                          <div className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 mb-2">
                            <Clock className="w-3 h-3" />
                            <span>Deadline: {item.deadline}</span>
                          </div>
                        )}

                        {/* Move stage selector */}
                        <div
                          className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span className="text-[10px] text-slate-400 font-medium">Stage:</span>
                          <select
                            value={item.status || 'saved'}
                            onChange={(e) => onUpdateStatus(item.id, e.target.value)}
                            className="text-[10px] font-semibold py-0.5 px-1.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none"
                          >
                            <option value="saved">📌 Saved</option>
                            <option value="applied">🚀 Applied</option>
                            <option value="interviewing">🗣️ Interview</option>
                            <option value="offered">🎉 Offered</option>
                          </select>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="space-y-3 mb-8">
          {savedItems.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectOpportunity(item)}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 shadow-sm hover:shadow transition cursor-pointer"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
                    {item.type || 'Opportunity'}
                  </span>
                  <span className="text-xs text-slate-400">{item.location || 'Global / Online'}</span>
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {item.title}
                </h3>
                {item.host && <p className="text-xs text-slate-500">{item.host}</p>}
                {item.notes && (
                  <p className="text-xs italic text-brand-600 dark:text-brand-400 bg-brand-50/50 dark:bg-brand-950/30 p-1.5 rounded">
                    "{item.notes}"
                  </p>
                )}
              </div>

              <div
                className="flex items-center gap-3 self-end sm:self-center"
                onClick={(e) => e.stopPropagation()}
              >
                <select
                  value={item.status || 'saved'}
                  onChange={(e) => onUpdateStatus(item.id, e.target.value)}
                  className="text-xs font-semibold py-1.5 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                >
                  <option value="saved">📌 Saved</option>
                  <option value="applied">🚀 Applied</option>
                  <option value="interviewing">🗣️ Interviewing</option>
                  <option value="offered">🎉 Offered</option>
                </select>

                <button
                  onClick={() => onRemoveSaved(item.id)}
                  className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

