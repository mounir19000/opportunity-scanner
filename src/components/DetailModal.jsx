import React, { useState, useEffect } from 'react';
import {
  X,
  ExternalLink,
  Calendar,
  MapPin,
  DollarSign,
  Building2,
  GitBranch,
  GraduationCap,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  Clock,
  Share2,
  Check,
} from 'lucide-react';

export default function DetailModal({
  opportunity,
  isOpen,
  onClose,
  isSaved,
  savedDetails,
  onToggleSave,
  onUpdateStatus,
}) {
  const [copied, setCopied] = useState(false);
  const [personalNotes, setPersonalNotes] = useState('');
  const [appStatus, setAppStatus] = useState('saved');

  useEffect(() => {
    if (savedDetails) {
      setPersonalNotes(savedDetails.notes || '');
      setAppStatus(savedDetails.status || 'saved');
    } else {
      setPersonalNotes('');
      setAppStatus('saved');
    }
  }, [savedDetails, opportunity]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !opportunity) return null;

  const {
    title,
    host,
    category,
    type,
    location,
    deadline,
    dates,
    stipend,
    eligibility,
    notes,
    url,
    sourceRepo,
  } = opportunity;

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url || window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSaveNotes = () => {
    onUpdateStatus(opportunity.id, appStatus, personalNotes);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 md:p-8"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Tags */}
        <div className="flex flex-wrap items-center gap-2 mb-3 pr-10">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-100 dark:bg-brand-950/70 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
            {type || 'Opportunity'}
          </span>
          {category && (
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {category}
            </span>
          )}
          {location && (
            <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 px-2 py-0.5 rounded-md">
              <MapPin className="w-3 h-3 text-rose-500" />
              {location}
            </span>
          )}
        </div>

        {/* Title & Host */}
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-tight mb-2">
          {title}
        </h2>
        {host && (
          <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 mb-5">
            <Building2 className="w-4 h-4 text-slate-400" />
            <span>Hosted by <strong className="text-slate-800 dark:text-slate-200">{host}</strong></span>
          </div>
        )}

        {/* Key Detail Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 mb-6">
          {/* Deadline */}
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Application Deadline
              </div>
              <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                {deadline || 'Check official site / Rolling'}
              </div>
              {dates && (
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Dates: {dates}
                </div>
              )}
            </div>
          </div>

          {/* Stipend / Funding */}
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Stipend / Aid / Salary
              </div>
              <div className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                {stipend || 'Check site (Stipend / Free tuition / Travel aid)'}
              </div>
            </div>
          </div>
        </div>

        {/* Eligibility & Details Section */}
        <div className="space-y-4 mb-6 text-sm">
          {eligibility && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-1.5">
                <GraduationCap className="w-4 h-4 text-brand-500" />
                Eligibility Requirements
              </h4>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                {eligibility}
              </div>
            </div>
          )}

          {notes && notes !== 'N/A' && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Additional Information
              </h4>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-xs sm:text-sm">
                {notes}
              </p>
            </div>
          )}

          {/* Source Repo Reference */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-brand-50/50 dark:bg-brand-950/20 border border-brand-200/60 dark:border-brand-900/50 text-xs">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <GitBranch className="w-4 h-4 text-brand-500" />
              <span>
                Discovered in repository:{' '}
                <strong className="text-brand-600 dark:text-brand-400 font-mono">
                  {sourceRepo}
                </strong>
              </span>
            </div>
            <a
              href={`https://github.com/${sourceRepo}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <span>View Repo</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Application Tracker & Personal Notes */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Your Application Tracker
            </span>
            <div className="flex items-center gap-2">
              <select
                value={appStatus}
                onChange={(e) => {
                  setAppStatus(e.target.value);
                  if (isSaved) {
                    onUpdateStatus(opportunity.id, e.target.value, personalNotes);
                  } else {
                    onToggleSave(opportunity, e.target.value, personalNotes);
                  }
                }}
                className="text-xs font-semibold py-1 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="saved">📌 Saved for Later</option>
                <option value="applied">🚀 Applied</option>
                <option value="interviewing">🗣️ Interviewing</option>
                <option value="offered">🎉 Offer Received</option>
              </select>
            </div>
          </div>

          <textarea
            value={personalNotes}
            onChange={(e) => setPersonalNotes(e.target.value)}
            onBlur={handleSaveNotes}
            placeholder="Add personal notes, interview date, or application links (auto-saved locally)..."
            rows={2}
            className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        {/* Action Buttons Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => onToggleSave(opportunity, appStatus, personalNotes)}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border text-xs font-semibold transition ${
                isSaved
                  ? 'border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-400'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
              }`}
            >
              {isSaved ? (
                <>
                  <BookmarkCheck className="w-4 h-4 text-brand-500" />
                  <span>Saved in Tracker</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4" />
                  <span>Save Opportunity</span>
                </>
              )}
            </button>

            <button
              onClick={handleCopyLink}
              title="Copy opportunity link"
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
            </button>
          </div>

          <a
            href={url || `https://github.com/${sourceRepo}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-md hover:shadow-lg transition"
          >
            <span>Apply / Visit Official Website</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
