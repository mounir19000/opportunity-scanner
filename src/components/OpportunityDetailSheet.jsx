import React, { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Bookmark, CalendarPlus, Check, ChevronRight, Clock3, MapPin, X } from 'lucide-react';
import { deadlineLabel } from './RadarOpportunityCard';

function downloadCalendar(item) {
  if (!item.deadline) return;
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(item.deadline);
  const stamp = dateOnly ? item.deadline.replace(/-/g, '') : new Date(item.deadline).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const escape = (text) => text.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/[,;]/g, '\\$&');
  const endStamp = dateOnly ? new Date(Date.parse(item.deadline + 'T00:00:00Z') + 86400000).toISOString().slice(0, 10).replace(/-/g, '') : stamp;
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Opportunity Radar//EN', 'BEGIN:VEVENT', `UID:${item.id}@opportunityradar`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`, `${dateOnly ? 'DTSTART;VALUE=DATE' : 'DTSTART'}:${stamp}`, `${dateOnly ? 'DTEND;VALUE=DATE' : 'DTEND'}:${endStamp}`, `SUMMARY:${escape(item.title + ' application deadline')}`, `DESCRIPTION:${escape('Verify the deadline and apply at ' + item.applicationUrl)}`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
  const link = document.createElement('a'); link.href = url; link.download = `${item.slug}-deadline.ics`; document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function OpportunityDetailSheet({ opportunity: item, onClose, isSaved, onToggleSave }) {
  const [checked, setChecked] = useState({});
  const closeRef = useRef(null);
  useEffect(() => { setChecked({}); }, [item?.id]);
  useEffect(() => {
    if (!item) return;
    const onKey = (event) => { if (event.key === 'Escape') onClose(); };
    const previousFocus = document.activeElement;
    closeRef.current?.focus();
    document.body.style.overflow = 'hidden'; window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey); previousFocus?.focus?.(); };
  }, [item, onClose]);
  if (!item) return null;
  const deadline = deadlineLabel(item);
  return <div className="sch-detail-overlay" onMouseDown={onClose}><aside className="sch-detail-sheet" role="dialog" aria-modal="true" aria-label={item.title} onMouseDown={(event) => event.stopPropagation()}><div className="sch-detail-top"><span>OPPORTUNITY DETAILS</span><button ref={closeRef} type="button" onClick={onClose} aria-label="Close details"><X size={22}/></button></div><div className="sch-detail-scroll"><div className="sch-detail-hero"><span className="sch-type-badge">{item.type}</span><h2>{item.title}</h2><p><MapPin size={15}/>{item.provider} · {item.countryFlagEmoji} {item.hostCountry}</p><div className="sch-detail-status"><span className={item.funding === 'Fully Funded' ? 'sch-funded-badge' : 'sch-funding-badge'}>{item.funding}</span><span className={`sch-deadline ${deadline.kind}`}><Clock3 size={15}/>{deadline.text}</span></div></div><div className="sch-detail-section sch-benefit"><span className="sch-overline">THE OPPORTUNITY</span><h3>What’s covered</h3><p>{item.financialBenefit}</p><p>{item.description}</p></div><div className="sch-detail-section"><span className="sch-overline">CHECK YOUR FIT</span><h3>Eligibility checklist</h3><p>Use this as a planning aid. The official call has the full rules.</p><div className="sch-checklist">{item.requirements.map((requirement, index) => <label key={index}><input type="checkbox" checked={Boolean(checked[index])} onChange={() => setChecked((current) => ({ ...current, [index]: !current[index] }))}/><span>{checked[index] && <Check size={14}/>}</span>{requirement}</label>)}</div></div><div className="sch-detail-section"><span className="sch-overline">PLAN AHEAD</span><h3>Application timeline</h3><div className="sch-timeline"><div><span>01</span><strong>Opening</strong><small>{item.openingDate ? new Date(item.openingDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : 'Check programme page'}</small></div><ChevronRight size={18}/><div><span>02</span><strong>Deadline</strong><small>{item.deadline ? new Date(item.deadline).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : 'Varies by round'}</small></div><ChevronRight size={18}/><div><span>03</span><strong>Results</strong><small>{item.resultDate ? new Date(item.resultDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : 'Provider announces'}</small></div></div>{item.deadlineNote && <p className="sch-deadline-note">{item.deadlineNote}</p>}</div><div className="sch-detail-section"><span className="sch-overline">GET READY</span><h3>Documents to prepare</h3><ul className="sch-documents">{(item.documentsRequired || []).map((document) => <li key={document}><Check size={16}/>{document}</li>)}</ul></div><p className="sch-source-note">Reviewed 10 October 2026. Dates, awards and eligibility can change. Confirm everything on the <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer">official source</a> before applying. {item.noIeltsRequired && 'The published rules do not list IELTS; other language requirements may apply.'}</p></div><div className="sch-detail-actions"><button type="button" className="sch-card-save" onClick={() => onToggleSave(item)} aria-label={isSaved ? 'Remove from watchlist' : 'Save to watchlist'}><Bookmark size={18} fill={isSaved ? 'currentColor' : 'none'}/></button>{item.deadline && <button type="button" className="sch-calendar" onClick={() => downloadCalendar(item)}><CalendarPlus size={17}/> Calendar</button>}<a href={item.applicationUrl} target="_blank" rel="noopener noreferrer">Apply on official site <ArrowUpRight size={17}/></a></div></aside></div>;
}
