import React from 'react';
import { ExternalLink, Bookmark, BookmarkCheck, ArrowUpDown } from 'lucide-react';

export default function OpportunityTable({
  opportunities,
  savedIds,
  onToggleSave,
  onSelect,
  sortConfig,
  onSort,
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm">
      <table className="w-full text-left text-xs sm:text-sm">
        <thead className="bg-slate-100/70 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[11px]">
          <tr>
            <th className="py-3 px-3 w-10 text-center">Save</th>
            <th
              onClick={() => onSort('title')}
              className="py-3 px-4 cursor-pointer hover:text-brand-500 transition select-none"
            >
              <div className="flex items-center gap-1">
                <span>Opportunity & Host</span>
                <ArrowUpDown className="w-3 h-3 opacity-60" />
              </div>
            </th>
            <th
              onClick={() => onSort('type')}
              className="py-3 px-3 cursor-pointer hover:text-brand-500 transition select-none"
            >
              <div className="flex items-center gap-1">
                <span>Type</span>
                <ArrowUpDown className="w-3 h-3 opacity-60" />
              </div>
            </th>
            <th className="py-3 px-3">Location</th>
            <th
              onClick={() => onSort('deadline')}
              className="py-3 px-3 cursor-pointer hover:text-brand-500 transition select-none"
            >
              <div className="flex items-center gap-1">
                <span>Deadline</span>
                <ArrowUpDown className="w-3 h-3 opacity-60" />
              </div>
            </th>
            <th className="py-3 px-3">Stipend / Aid</th>
            <th className="py-3 px-3">Source Repo</th>
            <th className="py-3 px-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {opportunities.map((item) => {
            const isSaved = savedIds.has(item.id);
            return (
              <tr
                key={item.id}
                onClick={() => onSelect(item)}
                className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
              >
                <td
                  className="py-3 px-3 text-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSave(item);
                  }}
                >
                  <button
                    className={`p-1 rounded transition ${
                      isSaved
                        ? 'text-brand-600 dark:text-brand-400'
                        : 'text-slate-300 hover:text-slate-500'
                    }`}
                  >
                    {isSaved ? (
                      <BookmarkCheck className="w-4 h-4 fill-current" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                  </button>
                </td>
                <td className="py-3 px-4 max-w-xs">
                  <div className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 truncate">
                    {item.title}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {item.host}
                  </div>
                </td>
                <td className="py-3 px-3 whitespace-nowrap">
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {item.type || 'Program'}
                  </span>
                </td>
                <td className="py-3 px-3 max-w-[140px] truncate text-slate-600 dark:text-slate-400">
                  {item.location || 'Remote / Check'}
                </td>
                <td className="py-3 px-3 whitespace-nowrap font-medium text-slate-700 dark:text-slate-300">
                  {item.deadline || 'TBA'}
                </td>
                <td className="py-3 px-3 max-w-[160px] truncate text-emerald-600 dark:text-emerald-400 font-medium">
                  {item.stipend || 'Funded'}
                </td>
                <td className="py-3 px-3 max-w-[130px] truncate text-slate-400 text-xs">
                  <a
                    href={item.sourceRepo?.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="hover:underline hover:text-brand-500"
                  >
                    {item.sourceRepo?.name}
                  </a>
                </td>
                <td className="py-3 px-3 text-right whitespace-nowrap">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 rounded-md transition"
                  >
                    Apply <ExternalLink className="w-3 h-3" />
                  </a>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
