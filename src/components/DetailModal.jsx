import React, { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Bookmark, BookmarkCheck, Copy, X } from 'lucide-react';
import { sourceKey } from '../services/opportunityData';
import reposData from '../data/repositories.json';

export default function DetailModal({ opportunity, isOpen, onClose, isSaved, savedDetails, onToggleSave, onUpdateStatus }) {
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('saved');
  const [copied, setCopied] = useState(false);
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  useEffect(() => {
    setNotes(savedDetails?.notes || '');
    setStatus(savedDetails?.status || 'saved');
  }, [savedDetails, opportunity]);
  useEffect(() => {
    if (!isOpen) return;
    const previousFocus = document.activeElement;
    closeRef.current?.focus();
    const keydown = (event) => {
      if (event.key === 'Escape') onClose();
      if (event.key !== 'Tab') return;
      const controls = [...dialogRef.current.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])')];
      if (!controls.length) return;
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && (document.activeElement === first || !dialogRef.current.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !dialogRef.current.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
      }
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', keydown);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', keydown); previousFocus?.focus?.(); };
  }, [isOpen]);
  if (!isOpen || !opportunity) return null;
  const repo = sourceKey(opportunity.sourceRepo);
  const source = reposData.find((item) => sourceKey(item) === repo);
  const sourceUrl = source?.file ? source.url + '/blob/' + source.branch + '/' + source.file : source?.url || 'https://github.com/' + repo;
  const copy = async () => {
    try { await navigator.clipboard.writeText(opportunity.url); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* Clipboard may be unavailable. */ }
  };
  const save = () => {
    if (isSaved) onToggleSave(opportunity);
    else onToggleSave(opportunity, status, notes);
  };
  return (
    <div className="radar-dialog-backdrop" onMouseDown={onClose}>
      <section ref={dialogRef} className="radar-dialog" role="dialog" aria-modal="true" aria-label={opportunity.title} onMouseDown={(event) => event.stopPropagation()}>
        <button ref={closeRef} className="radar-dialog-close" onClick={onClose} aria-label="Close details" type="button"><X size={20} /></button>
        <span className="radar-kicker">{opportunity.type || opportunity.category || 'OPPORTUNITY'} · {repo}</span>
        <h2>{opportunity.title}</h2>
        <p className="radar-dialog-host">{opportunity.host || 'Host unlisted'}</p>
        <p className="radar-dialog-caveat">This is a source listing. Confirm availability, eligibility, and dates on the original page.</p>
        <dl className="radar-detail-grid">
          {opportunity.deadline && <div><dt>Deadline</dt><dd>{opportunity.deadline}</dd></div>}
          {opportunity.location && <div><dt>Location</dt><dd>{opportunity.location}</dd></div>}
          {opportunity.stipend && <div><dt>Funding / fees</dt><dd>{opportunity.stipend}</dd></div>}
          {opportunity.dates && <div><dt>Program dates</dt><dd>{opportunity.dates}</dd></div>}
          {opportunity.eligibility && <div><dt>Audience</dt><dd>{opportunity.eligibility}</dd></div>}
          {opportunity.notes && <div><dt>Source notes</dt><dd>{opportunity.notes}</dd></div>}
          <div><dt>Source</dt><dd><a href={sourceUrl} target="_blank" rel="noopener noreferrer">{repo} <ArrowUpRight size={13} /></a></dd></div>
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
