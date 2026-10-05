import React, { useState, useEffect } from "react";
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
  Share2,
  Check,
} from "lucide-react";

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
  const [personalNotes, setPersonalNotes] = useState("");
  const [appStatus, setAppStatus] = useState("saved");

  useEffect(() => {
    if (savedDetails) {
      setPersonalNotes(savedDetails.notes || "");
      setAppStatus(savedDetails.status || "saved");
    } else {
      setPersonalNotes("");
      setAppStatus("saved");
    }
  }, [savedDetails, opportunity]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
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

  const repoDisplayName = typeof sourceRepo === "string" ? sourceRepo : (sourceRepo?.name || "GitHub");
  const repoUrl = typeof sourceRepo === "string" ? `https://github.com/${sourceRepo}` : (sourceRepo?.url || `https://github.com/${repoDisplayName}`);

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
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80    duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/[0.1] bg-[#0F172A] text-slate-100  p-6 sm:p-8 "
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition border border-transparent hover:border-white/[0.08]"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header Tags */}
        <div className="flex flex-wrap items-center gap-2 mb-3 pr-10">
          <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
            {type || "Opportunity"}
          </span>
          {category && (
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-white/[0.06]">
              {category}
            </span>
          )}
          {location && (
            <span className="flex items-center gap-1 font-mono text-xs text-slate-400 bg-slate-800/60 px-2.5 py-1 rounded-md border border-white/[0.06]">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              {location}
            </span>
          )}
        </div>

        {/* Title & Host */}
        <h2 className="font-display text-xl sm:text-2xl font-bold text-white leading-tight mb-2">
          {title}
        </h2>
        {host && (
          <div className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-6">
            <Building2 className="w-4 h-4 text-brand-400" />
            <span>Presented by <strong className="text-white font-semibold">{host}</strong></span>
          </div>
        )}

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4 rounded-xl bg-slate-900 border border-white/[0.08] mb-6 font-mono">
          {/* Deadline */}
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Application Deadline
              </div>
              <div className="text-sm font-semibold text-amber-300 mt-0.5">
                {deadline || "Check official site / Rolling"}
              </div>
              {dates && (
                <div className="text-[11px] text-slate-400 mt-1 font-sans">
                  Program Dates: {dates}
                </div>
              )}
            </div>
          </div>

          {/* Stipend / Funding */}
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Compensation / Funding
              </div>
              <div className="text-sm font-semibold text-emerald-300 mt-0.5">
                {stipend || "Check official site (Stipend / Free tuition / Aid)"}
              </div>
            </div>
          </div>
        </div>

        {/* Details & Eligibility */}
        <div className="space-y-4 mb-6 text-sm">
          {eligibility && (
            <div>
              <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2">
                <GraduationCap className="w-4 h-4 text-brand-400" />
                Target Audience & Eligibility
              </h4>
              <div className="p-3.5 rounded-xl bg-slate-900 border border-white/[0.08] text-slate-300 text-xs sm:text-sm leading-relaxed">
                {eligibility}
              </div>
            </div>
          )}

          {notes && notes !== "N/A" && (
            <div>
              <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Additional Information
              </h4>
              <p className="text-slate-300 leading-relaxed text-xs sm:text-sm">
                {notes}
              </p>
            </div>
          )}

          {/* Source Repo Reference */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-brand-500/10 border border-brand-500/20 text-xs font-mono">
            <div className="flex items-center gap-2 text-slate-200 truncate">
              <GitBranch className="w-4 h-4 text-brand-400 shrink-0" />
              <span className="truncate">
                Verified in tracker: <strong className="text-brand-300">{repoDisplayName}</strong>
              </span>
            </div>
            <a
              href={repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1 shrink-0 hover:underline"
            >
              <span>View Source</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Application Tracker & Personal Notes */}
        <div className="p-4 rounded-xl border border-white/[0.08] bg-slate-900 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-300">
              Your Application Pipeline
            </span>
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
              className="font-mono text-xs font-semibold py-1 px-2.5 rounded-lg border border-white/[0.08] bg-slate-800 text-white focus:outline-none focus:border-brand-500"
            >
              <option value="saved">Saved for Later</option>
              <option value="applied">Applied</option>
              <option value="interviewing">Interviewing</option>
              <option value="offered">Offer Received</option>
            </select>
          </div>

          <textarea
            value={personalNotes}
            onChange={(e) => setPersonalNotes(e.target.value)}
            onBlur={handleSaveNotes}
            placeholder="Add personal notes, interview date, or application links (saved locally in browser)..."
            rows={2}
            className="w-full text-xs p-3 rounded-lg border border-white/[0.08] bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />
        </div>

        {/* Action Buttons Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-white/[0.08]">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => onToggleSave(opportunity, appStatus, personalNotes)}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border font-mono text-xs font-semibold transition ${
                isSaved
                  ? "border-brand-500 bg-brand-500/20 text-brand-300"
                  : "border-white/[0.08] hover:bg-slate-800 text-slate-300 hover:text-white"
              }`}
            >
              {isSaved ? (
                <>
                  <BookmarkCheck className="w-4 h-4 text-brand-400" />
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
              className="p-2.5 rounded-xl border border-white/[0.08] text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>
          </div>

          <a
            href={url || repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-cyan-500 hover:from-brand-500 hover:to-cyan-400 text-white font-semibold text-xs sm:text-sm    transition"
          >
            <span>Apply / Visit Official Site</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
