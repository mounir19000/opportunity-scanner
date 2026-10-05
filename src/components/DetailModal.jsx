import React, { useEffect, useState } from 'react';
import { ArrowUpRight, Bookmark, BookmarkCheck, Copy, X } from 'lucide-react';
import { sourceKey } from '../services/opportunityData';

export default function DetailModal({ opportunity, isOpen, onClose, isSaved, savedDetails, onToggleSave, onUpdateStatus }) {
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('saved');
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    setNotes(savedDetails?.notes || '');
    setStatus(savedDetails?.status || 'saved');
  }, [savedDetails, opportunity]);
  useEffect(() => {
    if (!isOpen) return;
    const keydown = (event) => { if (event.key === 'Escape') onClose(); };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', keydown);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', keydown); };
  }, [isOpen, onClose]);
  if (!isOpen || !opportunity) return null;
  const repo = sourceKey(opportunity.sourceRepo);
  const copy = async () => {
    try { await navigator.clipboard.writeText(opportunity.url); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* Clipboard may be unavailable. */ }
  };
  const save = () => {
    if (isSaved) onToggleSave(opportunity);
    else onToggleSave(opportunity, status, notes);
  };
  return (
    <div className="radar-dialog-backdrop" onMouseDown={onClose}>
      <section className="radar-dialog" role="dialog" aria-modal="true" aria-label={opportunity.title} onMouseDown={(event) => event.stopPropagation()}>
        <button className="radar-dialog-close" onClick={onClose} aria-label="Close details" type="button"><X size={20} /></button>
        <span className="radar-kicker">{opportunity.type || opportunity.category || 'OPPORTUNITY'} · {repo}</span>
        <h2>{opportunity.title}</h2>
        <p className="radar-dialog-host">{opportunity.host || 'Host unlisted'}</p>
        <p className="radar-dialog-caveat">This is a source listing. Confirm availability, eligibility, and dates on the original page.</p>
        <dl className="radar-detail-grid">
          <div><dt>Deadline</dt><dd>{opportunity.deadline || 'Unlisted'}</dd></div>
          <div><dt>Location</dt><dd>{opportunity.location || 'Unlisted'}</dd></div>
          <div><dt>Funding / fees</dt><dd>{opportunity.stipend || 'Unlisted'}</dd></div>
          <div><dt>Program dates</dt><dd>{opportunity.dates || 'Unlisted'}</dd></div>
          <div><dt>Audience</dt><dd>{opportunity.eligibility || 'Unlisted'}</dd></div>
          <div><dt>Source</dt><dd><a href={'https://github.com/' + repo} target="_blank" rel="noopener noreferrer">{repo} <ArrowUpRight size={13} /></a></dd></div>
        </dl>
        {isSaved && <div className="radar-dialog-tracker"><label>Status<select value={status} onChange={(event) => { setStatus(event.target.value); onUpdateStatus(opportunity.id, event.target.value, notes); }}><option value="saved">Saved</option><option value="applied">Applied</option><option value="interviewing">Interviewing</option><option value="offered">Offered</option></select></label><label>Private notes<textarea rows="2" value={notes} onChange={(event) => setNotes(event.target.value)} onBlur={() => { if (notes !== (savedDetails?.notes || '')) onUpdateStatus(opportunity.id, status, notes); }} placeholder="Add a reminder or next step..." /></label></div>}
        <div className="radar-dialog-actions">
          <button onClick={save} type="button">{isSaved ? <BookmarkCheck size={17} /> : <Bookmark size={17} />}{isSaved ? 'Remove from saved' : 'Save lead'}</button>
          <button onClick={copy} type="button"><Copy size={16} />{copied ? 'Copied' : 'Copy link'}</button>
          <a href={opportunity.url} target="_blank" rel="noopener noreferrer">Open listing <ArrowUpRight size={16} /></a>
        </div>
      </section>
    </div>
  );
}
