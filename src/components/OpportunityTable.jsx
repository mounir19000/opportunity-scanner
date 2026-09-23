import React from "react";
import { Bookmark, BookmarkCheck, ArrowUpDown, ArrowUpRight } from "lucide-react";

export default function OpportunityTable({
  opportunities,
  savedIds,
  onToggleSave,
  onSelect,
  sortConfig,
  onSort,
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-white/[0.08] bg-slate-900/60 backdrop-blur-md shadow-lg">
      <table className="w-full text-left text-xs">
        <thead className="bg-slate-800/60 text-slate-300 font-mono font-semibold border-b border-white/[0.08] uppercase tracking-wider text-[10px]">
          <tr>
            <th className="py-3 px-3 w-10 text-center">Save</th>
            <th
              onClick={() => onSort("title")}
              className="py-3 px-4 cursor-pointer hover:text-brand-400 transition select-none"
            >
              <div className="flex items-center gap-1.5">
                <span>Program & Host</span>
                <ArrowUpDown className="w-3 h-3 opacity-60" />
              </div>
            </th>
            <th
              onClick={() => onSort("type")}
              className="py-3 px-3 cursor-pointer hover:text-brand-400 transition select-none"
            >
              <div className="flex items-center gap-1.5">
                <span>Type</span>
                <ArrowUpDown className="w-3 h-3 opacity-60" />
              </div>
            </th>
            <th className="py-3 px-3">Location</th>
            <th
              onClick={() => onSort("deadline")}
              className="py-3 px-3 cursor-pointer hover:text-brand-400 transition select-none"
            >
              <div className="flex items-center gap-1.5">
                <span>Deadline</span>
                <ArrowUpDown className="w-3 h-3 opacity-60" />
              </div>
            </th>
            <th className="py-3 px-3">Compensation / Aid</th>
            <th className="py-3 px-3">Source Repository</th>
            <th className="py-3 px-4 text-right">Apply</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.04]">
          {opportunities.map((item) => {
            const isSaved = savedIds.has(item.id);
            const repoDisplayName = typeof item.sourceRepo === "string" ? item.sourceRepo : (item.sourceRepo?.name || "GitHub");

            return (
              <tr
                key={item.id}
                onClick={() => onSelect(item)}
                className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
              >
                <td
                  className="py-3 px-3 text-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSave(item);
                  }}
                >
                  <button
                    className={`p-1.5 rounded-lg border transition ${
                      isSaved
                        ? "border-brand-500 bg-brand-500/20 text-brand-400"
                        : "border-transparent text-slate-500 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    {isSaved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                  </button>
                </td>

                <td className="py-3 px-4">
                  <div className="font-display font-semibold text-slate-100 group-hover:text-brand-400 transition line-clamp-1">
                    {item.title}
                  </div>
                  {item.host && (
                    <div className="text-[11px] font-mono text-slate-400 truncate max-w-xs">
                      {item.host}
                    </div>
                  )}
                </td>

                <td className="py-3 px-3 whitespace-nowrap">
                  <span className="font-mono text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-white/[0.06]">
                    {item.type || "Program"}
                  </span>
                </td>

                <td className="py-3 px-3 text-slate-300 font-mono text-[11px] whitespace-nowrap max-w-[130px] truncate">
                  {item.location || "Online"}
                </td>

                <td className="py-3 px-3 whitespace-nowrap">
                  <span className="font-mono text-[11px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    {item.deadline || "Rolling"}
                  </span>
                </td>

                <td className="py-3 px-3 font-mono text-[11px] text-emerald-400 max-w-[160px] truncate">
                  {item.stipend || "Check site"}
                </td>

                <td className="py-3 px-3 font-mono text-[11px] text-slate-400 max-w-[150px] truncate">
                  <a
                    href={`https://github.com/${repoDisplayName}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="hover:text-brand-400 hover:underline"
                  >
                    {repoDisplayName}
                  </a>
                </td>

                <td className="py-3 px-4 text-right whitespace-nowrap">
                  <a
                    href={item.url || `https://github.com/${repoDisplayName}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-semibold bg-brand-500/10 text-brand-300 border border-brand-500/30 hover:bg-brand-500 hover:text-white transition"
                  >
                    <span>Visit</span>
                    <ArrowUpRight className="w-3 h-3" />
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
