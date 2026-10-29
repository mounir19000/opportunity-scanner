import React from 'react';
import { ArrowUpRight, Bookmark, BookmarkCheck, CalendarDays, MapPin, Wallet } from 'lucide-react';
import { sourceKey } from '../services/opportunityData';
import { deadlineState } from '../services/filters';
import reposData from '../data/repositories.json';

export default function OpportunityCard({ opportunity, isSaved, onToggleSave, onSelect }) {
  const source = sourceKey(opportunity.sourceRepo);
  const sourceLabel = reposData.find((entry) => sourceKey(entry) === source)?.displayName || source;
  const deadline = deadlineState(opportunity.deadline);
  return (
    <article className="scanner-result-card">
      <div className="scanner-result-main">
        <div className="scanner-result-topline">
          <span className="scanner-type">{opportunity.type || opportunity.category || 'Opportunity'}</span>
          <span className="scanner-source">{sourceLabel}</span>
        </div>
        <button className="scanner-result-title" onClick={() => onSelect(opportunity)} type="button">{opportunity.title}</button>
        <p className="scanner-result-host">{opportunity.host || 'Host not listed'}</p>
        {(opportunity.location || opportunity.deadline || opportunity.stipend) && <div className="scanner-meta">
          {opportunity.location && <span><MapPin size={15} /> {opportunity.location}</span>}
          {opportunity.deadline && <span><CalendarDays size={15} /> {opportunity.deadline}{deadline.kind === 'past' ? ' · Past date' : ''}</span>}
          {opportunity.stipend && <span><Wallet size={15} /> Funding / fees: {opportunity.stipend}</span>}
        </div>}
      </div>
      <div className="scanner-result-actions">
        <button onClick={() => onToggleSave(opportunity)} className="scanner-save" title={isSaved ? 'Remove saved lead' : 'Save lead'} aria-label={isSaved ? 'Remove saved lead' : 'Save lead'} type="button">
          {isSaved ? <BookmarkCheck size={19} /> : <Bookmark size={19} />}
        </button>
        <a href={opportunity.url} target="_blank" rel="noopener noreferrer" className="scanner-open">Open listing <ArrowUpRight size={16} /></a>
      </div>
    </article>
  );
}
