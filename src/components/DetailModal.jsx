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
  const sourceName = source?.name || repo;
  const sourceUrl = opportunity.sourceUrl || (source?.file ? source.url + '/blob/' + source.branch + '/' + source.file : source?.url || 'https://github.com/' + repo);
  const copy = async () => {
    try { await navigator.clipboard.writeText(opportunity.url); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* Clipboard may be unavailable. */ }
  };
  const save = () => {
    if (isSaved) onToggleSave(opportunity);
    else onToggleSave(opportunity, status, notes);
  };
  return (
    <div className="sch-detail-backdrop" onMouseDown={onClose}>
      <section ref={dialogRef} className="sch-detail-modal" role="dialog" aria-modal="true" aria-labelledby="sch-detail-title" onMouseDown={(event) => event.stopPropagation()}>
        <header className="sch-detail-header">
          <div className="sch-detail-topline">
            <span className="sch-detail-eyebrow">OPPORTUNITY DETAILS</span>
            <button ref={closeRef} className="sch-detail-close" onClick={onClose} aria-label="Close details" type="button"><X size={20} /></button>
          </div>
          <div className="sch-detail-tags">
            <span>{opportunity.type || opportunity.category || 'Opportunity'}</span>
            <span>{sourceName}</span>
          </div>
          <h2 id="sch-detail-title">{opportunity.title}</h2>
          <p>{opportunity.host || 'Host unlisted'}</p>
        </header>
        <div className="sch-detail-body">
          <p className="sch-detail-caveat">Confirm availability and dates on the original listing before applying.</p>
          {opportunity.summary && <section className="sch-detail-section"><h3>Overview</h3><p>{opportunity.summary}</p></section>}
          <dl className="sch-detail-grid">
            {opportunity.publishedAt && <div><dt>Source posted</dt><dd>{new Date(opportunity.publishedAt).toLocaleDateString()}</dd></div>}
            {opportunity.deadline && <div><dt>Deadline</dt><dd>{opportunity.deadline}</dd></div>}
            {opportunity.location && <div><dt>Location</dt><dd>{opportunity.location}</dd></div>}
            {opportunity.stipend && <div><dt>Funding / fees</dt><dd>{opportunity.stipend}</dd></div>}
            {opportunity.dates && <div><dt>Program dates</dt><dd>{opportunity.dates}</dd></div>}
            <div><dt>Source</dt><dd><a href={sourceUrl} target="_blank" rel="noopener noreferrer">{sourceName} <ArrowUpRight size={14} /></a></dd></div>
          </dl>
          {opportunity.notes && <section className="sch-detail-section"><h3>Source notes</h3><p>{opportunity.notes}</p></section>}
          {opportunity.eligibility && <section className="sch-detail-section"><h3>Eligibility</h3><p>{opportunity.eligibility}</p></section>}
          {opportunity.benefits && <section className="sch-detail-section"><h3>Benefits</h3><p>{opportunity.benefits}</p></section>}
          {opportunity.howToApply && <section className="sch-detail-section"><h3>How to apply</h3><p>{opportunity.howToApply}</p></section>}
          {isSaved && <section className="sch-detail-tracker" aria-label="Your application tracker">
            <h3>Your tracker</h3>
            <div className="sch-detail-tracker-fields">
              <label>Status<select value={status} onChange={(event) => { setStatus(event.target.value); onUpdateStatus(opportunity.id, event.target.value, notes); }}><option value="saved">Saved</option><option value="applied">Applied</option><option value="interviewing">Interviewing</option><option value="offered">Offered</option></select></label>
              <label>Private notes<textarea rows="2" value={notes} onChange={(event) => setNotes(event.target.value)} onBlur={() => { if (notes !== (savedDetails?.notes || '')) onUpdateStatus(opportunity.id, status, notes); }} placeholder="Add a reminder or next step..." /></label>
            </div>
          </section>}
        </div>
        <footer className="sch-detail-actions">
          <button className="sch-button sch-button-light" onClick={save} type="button">{isSaved ? <BookmarkCheck size={17} /> : <Bookmark size={17} />}{isSaved ? 'Remove from saved' : 'Save lead'}</button>
          <button className="sch-button sch-button-light" onClick={copy} type="button"><Copy size={16} />{copied ? 'Copied' : 'Copy link'}</button>
          <a className="sch-button sch-button-primary" href={opportunity.url} target="_blank" rel="noopener noreferrer">Open listing <ArrowUpRight size={16} /></a>
          {opportunity.applicationUrl && <a className="sch-button sch-button-light" href={opportunity.applicationUrl} target="_blank" rel="noopener noreferrer">Application link <ArrowUpRight size={16} /></a>}
        </footer>
      </section>
    </div>
  );
}
