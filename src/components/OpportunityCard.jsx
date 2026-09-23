import React from 'react';
import {
  Calendar,
  MapPin,
  DollarSign,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Building2,
  GitBranch,
  GraduationCap
} from 'lucide-react';

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
    eligibility,
    url,
    sourceRepo,
  } = opportunity;

  // Type styling
  const getTypeColor = (t) => {
    const lower = (t || '').toLowerCase();
    if (lower.includes('summer school') || lower.includes('winter school'))
      return 'bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300 border-violet-200 dark:border-violet-800';
    if (lower.includes('internship'))
      return 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    if (lower.includes('scholarship'))
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    if (lower.includes('fellowship') || lower.includes('grant'))
      return 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800';
    if (lower.includes('research') || lower.includes('reu'))
      return 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800';
    return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
  };

  // Funding status indicator
  const isFunded =
    stipend &&
    !stipend.toLowerCase().includes('fee required') &&
    !stipend.toLowerCase().includes('not available') &&
    !stipend.toLowerCase().includes('na');

  return (
    <div className="group relative flex flex-col justify-between rounded-xl border border-slate-200/90 dark:border-slate-800/90 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-4 sm:p-5 shadow-sm transition-all duration-200 hover:shadow-lg hover:border-brand-500/50 dark:hover:border-brand-500/50">
      {/* Top Header: Category & Bookmark */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${getTypeColor(
                type
              )}`}
            >
              {type || 'Opportunity'}
            </span>
            {category && (
              <span className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md truncate max-w-[140px]">
                {category}
              </span>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(opportunity);
            }}
            title={isSaved ? 'Remove from saved' : 'Save opportunity'}
            className={`p-1.5 rounded-lg transition-colors ${
              isSaved
                ? 'text-brand-600 bg-brand-50 dark:text-brand-400 dark:bg-brand-950/50'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {isSaved ? (
              <BookmarkCheck className="w-4 h-4 fill-current" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Title */}
        <h3
          onClick={() => onSelect(opportunity)}
          className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors cursor-pointer line-clamp-2 leading-snug mb-1.5"
        >
          {title}
        </h3>

        {/* Host / Organization */}
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 mb-3">
          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{host || 'Host Organization'}</span>
        </div>

        {/* Key Info Badges */}
        <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 mb-4">
          {/* Location */}
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{location || 'Remote / Unspecified'}</span>
          </div>

          {/* Deadline */}
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="truncate font-medium text-slate-700 dark:text-slate-300">
              {deadline || 'Check official portal'}
            </span>
          </div>

          {/* Stipend / Funding */}
          <div className="flex items-center gap-2">
            <DollarSign className={`w-3.5 h-3.5 shrink-0 ${isFunded ? 'text-emerald-500' : 'text-slate-400'}`} />
            <span
              className={`truncate font-medium ${
                isFunded
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {stipend || 'Funding info on site'}
            </span>
          </div>

          {/* Eligibility */}
          {eligibility && eligibility !== 'Open to all eligible applicants' && (
            <div className="flex items-center gap-2">
              <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                {eligibility}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer / Attribution & Action Buttons */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
        {/* Source Repo Attribution */}
        <a
          href={sourceRepo?.url || `https://github.com/${sourceRepo?.owner}/${sourceRepo?.name}`}
          target="_blank"
          rel="noopener noreferrer"
          title={`Source repository: ${sourceRepo?.name} by @${sourceRepo?.owner}`}
          className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-brand-500 dark:hover:text-brand-400 transition-colors truncate max-w-[150px]"
        >
          <GitBranch className="w-3 h-3 shrink-0" />
          <span className="truncate">{sourceRepo?.name || 'GitHub'}</span>
        </a>

        {/* Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onSelect(opportunity)}
            className="px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
          >
            Details
          </button>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 dark:bg-brand-500 dark:hover:bg-brand-400 rounded-lg shadow-sm transition"
          >
            <span>Apply</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
