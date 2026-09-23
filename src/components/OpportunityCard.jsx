import React from "react";
import {
  Calendar,
  MapPin,
  DollarSign,
  Bookmark,
  BookmarkCheck,
  GitBranch,
  ArrowUpRight,
} from "lucide-react";

export default function OpportunityCard({
  opportunity,
  isSaved,
  onToggleSave,
  onSelect,
}) {
  const {
    title,
    host,
    category,
    type,
    location,
    deadline,
    stipend,
    url,
    sourceRepo,
  } = opportunity;

  // Type styling
  const getTypeBadge = (t) => {
    const lower = (t || "").toLowerCase();
    if (lower.includes("summer school") || lower.includes("winter school"))
      return {
        strip: "bg-violet-500",
        badge: "bg-violet-500/10 text-violet-300 border-violet-500/30",
        accent: "from-violet-500/20 to-transparent",
      };
    if (lower.includes("internship") || lower.includes("co-op"))
      return {
        strip: "bg-blue-500",
        badge: "bg-blue-500/10 text-blue-300 border-blue-500/30",
        accent: "from-blue-500/20 to-transparent",
      };
    if (lower.includes("scholarship") || lower.includes("grant"))
      return {
        strip: "bg-emerald-500",
        badge: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
        accent: "from-emerald-500/20 to-transparent",
      };
    if (lower.includes("fellowship") || lower.includes("residency"))
      return {
        strip: "bg-amber-500",
        badge: "bg-amber-500/10 text-amber-300 border-amber-500/30",
        accent: "from-amber-500/20 to-transparent",
      };
    if (lower.includes("research") || lower.includes("reu"))
      return {
        strip: "bg-cyan-500",
        badge: "bg-cyan-500/10 text-cyan-300 border-cyan-500/30",
        accent: "from-cyan-500/20 to-transparent",
      };
    return {
      strip: "bg-slate-500",
      badge: "bg-slate-500/10 text-slate-300 border-slate-500/30",
      accent: "from-slate-500/20 to-transparent",
    };
  };

  const style = getTypeBadge(type);
  const repoDisplayName = typeof sourceRepo === "string" ? sourceRepo : (sourceRepo?.name || "GitHub");

  return (
    <div
      onClick={() => onSelect(opportunity)}
      className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-white/[0.08] dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/65 backdrop-blur-md p-4 sm:p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:border-brand-500/50 cursor-pointer"
    >
      {/* Left accent strip */}
      <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${style.strip}`} />

      {/* Top Header: Host & Bookmark */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2.5 pl-1">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-md bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-[10px] font-mono font-bold text-slate-300 shrink-0">
              {(host || "O").charAt(0).toUpperCase()}
            </div>
            <span className="font-mono text-xs text-slate-400 truncate max-w-[170px]">
              {host || "Verified Organization"}
            </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(opportunity);
            }}
            title={isSaved ? "Remove from saved" : "Save opportunity"}
            className={`p-1.5 rounded-lg border transition ${
              isSaved
                ? "border-brand-500 bg-brand-500/20 text-brand-400"
                : "border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.05]"
            }`}
          >
            {isSaved ? <BookmarkCheck className="w-4 h-4 text-brand-400 fill-brand-400/30" /> : <Bookmark className="w-4 h-4" />}
          </button>
        </div>

        {/* Opportunity Title */}
        <h3 className="font-display font-bold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-brand-400 transition-colors line-clamp-2 leading-snug mb-2 pl-1">
          {title}
        </h3>

        {/* Type & Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3 pl-1">
          <span className={`font-mono text-[10px] font-semibold px-2 py-0.5 rounded-full border ${style.badge}`}>
            {type || "Opportunity"}
          </span>
          {category && (
            <span className="text-[10px] text-slate-400 bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 rounded-md truncate max-w-[160px]">
              {category}
            </span>
          )}
        </div>

        {/* Key Metrics Strip (Stipend & Deadline) */}
        <div className="space-y-1.5 pl-1 mb-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
            <DollarSign className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate font-semibold text-[11px]">
              {stipend || "Check site (Stipend / Free tuition / Aid)"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-[11px]">
            <div className="flex items-center gap-1 text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md truncate">
              <Calendar className="w-3 h-3 shrink-0" />
              <span className="truncate">{deadline || "Rolling"}</span>
            </div>

            <div className="flex items-center gap-1 text-slate-300 bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 rounded-md truncate">
              <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
              <span className="truncate">{location || "Online / Global"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer: Source Repo & Action Link */}
      <div className="pt-2.5 border-t border-white/[0.06] flex items-center justify-between pl-1 text-[11px] font-mono">
        <a
          href={`https://github.com/${repoDisplayName}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1 text-slate-400 hover:text-brand-400 transition truncate max-w-[190px]"
        >
          <GitBranch className="w-3 h-3 text-brand-400 shrink-0" />
          <span className="truncate">{repoDisplayName}</span>
        </a>

        <a
          href={url || `https://github.com/${repoDisplayName}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1 text-brand-400 hover:text-brand-300 font-semibold transition shrink-0"
        >
          <span>Apply</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
