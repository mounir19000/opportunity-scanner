import React from 'react';
import { ArrowUpRight, Bookmark, Download, Trash2 } from 'lucide-react';
import InteriorHero from '../components/InteriorHero';
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
    <div className="sch-page sch-interior-page">
      <InteriorHero
        eyebrow="YOUR SHORTLIST"
        title="Keep the good"
        accent="ones close."
        description="Your saved leads and notes stay in this browser. Check the original listing before you submit an application."
        metric={savedItems.length.toLocaleString()}
        metricLabel="saved leads"
      />
      <section className="sch-container sch-interior-content" aria-label="Application tracker">
        <div className="sch-interior-heading">
          <div>
            <span className="sch-overline">{savedItems.length} SAVED LEADS</span>
            <h2>Application <em>tracker.</em></h2>
          </div>
          <div className="sch-interior-actions">
            {savedItems.length > 0 && <button className="sch-button sch-button-light" onClick={exportCsv} type="button"><Download size={15} /> Export CSV</button>}
            <button className="sch-button sch-button-primary" onClick={onNavigateToExplorer} type="button">Explore <ArrowUpRight size={15} /></button>
          </div>
        </div>
        <div className="sch-stage-strip" aria-label="Application status totals">
          {stages.map(([key, label], index) => <div className="sch-stage-card" key={key}>
            <span className="sch-stage-index">0{index + 1} / {label}</span>
            <strong>{savedItems.filter((item) => (item.status || 'saved') === key).length}</strong>
          </div>)}
        </div>
        {savedItems.length ? <div className="sch-saved-list">{savedItems.map((item) => <article className="sch-saved-card" key={item.id}>
          <div className="sch-saved-summary">
            <span className="sch-card-overline">{item.type || 'Opportunity'} · {item.provider || sourceKey(item.sourceRepo)}</span>
            <button type="button" onClick={() => onSelectOpportunity(item)}>{item.title}</button>
            <p>{item.provider || item.host || 'Host unlisted'} <span aria-hidden="true">·</span> {item.deadline || 'Deadline varies'}</p>
          </div>
          <div className="sch-saved-controls">
            <label>Status<select value={item.status || 'saved'} onChange={(event) => onUpdateStatus(item.id, event.target.value)}>{stages.map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
            <label>Notes<textarea key={item.id} defaultValue={item.notes || ''} onBlur={(event) => { if (event.target.value !== (item.notes || '')) onUpdateStatus(item.id, item.status || 'saved', event.target.value); }} placeholder="Next step, contact, reminder..." rows="2" /></label>
            <div className="sch-saved-card-actions">
              <a className="sch-button sch-button-light" href={item.applicationUrl || item.url} target="_blank" rel="noopener noreferrer">Open listing <ArrowUpRight size={15} /></a>
              <button className="sch-button sch-button-icon" onClick={() => onRemoveSaved(item.id)} type="button" aria-label={`Remove ${item.title} from saved leads`}><Trash2 size={16} /></button>
            </div>
          </div>
        </article>)}</div> : <div className="sch-empty"><Bookmark size={32} /><h3>Your shortlist is empty</h3><p>Save a lead in Explore to start tracking it here.</p><button className="sch-button sch-button-primary" onClick={onNavigateToExplorer} type="button">Explore opportunities <ArrowUpRight size={15} /></button></div>}
      </section>
    </div>
  );
}
