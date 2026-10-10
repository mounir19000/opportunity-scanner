import React from 'react';
import { ArrowUpRight, Bookmark, Download, Trash2 } from 'lucide-react';
import { sourceKey } from '../services/opportunityData';

const stages = [
  ['saved', 'Saved'],
  ['applied', 'Applied'],
  ['interviewing', 'Interviewing'],
  ['offered', 'Offered'],
];

function csvCell(value) {
  let text = String(value ?? '');
  if (/^[\s]*[=+\-@]/.test(text)) text = "'" + text;
  return '"' + text.replace(/"/g, '""') + '"';
}

export default function SavedPage({ savedItems = [], onUpdateStatus, onRemoveSaved, onSelectOpportunity, onNavigateToExplorer }) {
  const exportCsv = () => {
    const fields = ['title', 'host', 'type', 'location', 'deadline', 'status', 'url', 'sourceRepo', 'notes'];
    const rows = [fields.join(','), ...savedItems.map((item) => fields.map((field) => csvCell(field === 'sourceRepo' ? (item.provider || sourceKey(item.sourceRepo)) : field === 'host' ? (item.provider || item.host) : field === 'location' ? (item.hostCountry || item.location) : field === 'url' ? (item.applicationUrl || item.url) : item[field])).join(','))];
    const url = URL.createObjectURL(new Blob([rows.join('\r\n')], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'opportunity-radar-saved.csv';
    link.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="radar-page radar-inner-page">
      <div className="radar-inner-hero"><span className="radar-kicker">YOUR SHORTLIST</span><h1>Keep the good<br /><em>ones close.</em></h1><p>Your saved leads and notes stay in this browser. Check the original listing before you submit an application.</p></div>
      <div className="radar-inner-content">
        <div className="radar-toolbar"><div><span className="radar-kicker">{savedItems.length} SAVED LEADS</span><h2>Application tracker</h2></div><div className="radar-toolbar-actions">{savedItems.length > 0 && <button onClick={exportCsv} type="button"><Download size={15} /> Export CSV</button>}<button onClick={onNavigateToExplorer} type="button"><ArrowUpRight size={15} /> Explore</button></div></div>
        <div className="radar-stage-strip">{stages.map(([key, label]) => <div key={key}><strong>{savedItems.filter((item) => (item.status || 'saved') === key).length}</strong><span>{label}</span></div>)}</div>
        {savedItems.length ? <div className="radar-saved-list">{savedItems.map((item) => <article className="radar-saved-card" key={item.id}>
          <div className="radar-saved-summary"><span className="radar-type">{item.type || 'Opportunity'} · {item.provider || sourceKey(item.sourceRepo)}</span><button type="button" onClick={() => onSelectOpportunity(item)}>{item.title}</button><p>{item.provider || item.host || 'Host unlisted'} · {item.deadline ? item.deadline : 'Deadline varies'}</p></div>
          <div className="radar-saved-controls"><label>Status<select value={item.status || 'saved'} onChange={(event) => onUpdateStatus(item.id, event.target.value)}>{stages.map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label><label>Notes<textarea key={item.id} defaultValue={item.notes || ''} onBlur={(event) => { if (event.target.value !== (item.notes || '')) onUpdateStatus(item.id, item.status || 'saved', event.target.value); }} placeholder="Next step, contact, reminder..." rows="2" /></label><div><a href={item.applicationUrl || item.url} target="_blank" rel="noopener noreferrer">Open listing <ArrowUpRight size={15} /></a><button onClick={() => onRemoveSaved(item.id)} type="button" aria-label="Remove saved lead"><Trash2 size={16} /></button></div></div>
        </article>)}</div> : <div className="radar-empty"><Bookmark size={30} /><h3>Your shortlist is empty</h3><p>Save a lead in Explore to start tracking it here.</p><button onClick={onNavigateToExplorer} type="button">Explore opportunities</button></div>}
      </div>
    </div>
  );
}
