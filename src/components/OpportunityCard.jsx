import React from 'react';
import { ArrowUpRight, Bookmark, BookmarkCheck, CalendarDays, MapPin, Wallet } from 'lucide-react';
import { sourceKey } from '../services/opportunityData';
import { deadlineState } from '../services/filters';

export default function OpportunityCard({ opportunity, isSaved, onToggleSave, onSelect }) {
  const source = sourceKey(opportunity.sourceRepo);
  const deadline = deadlineState(opportunity.deadline);
  return (
    <article className="radar-result-card">
      <div className="radar-result-main">
        <div className="radar-result-topline">
          <span className="radar-type">{opportunity.type || opportunity.category || 'Opportunity'}</span>
          <span className="radar-source">{source}</span>
        </div>
        <button className="radar-result-title" onClick={() => onSelect(opportunity)} type="button">{opportunity.title}</button>
        <p className="radar-result-host">{opportunity.host || 'Host not listed'}</p>
        <div className="radar-meta">
          <span><MapPin size={15} /> {opportunity.location || 'Location unlisted'}</span>
          <span><CalendarDays size={15} /> {opportunity.deadline || 'Deadline unlisted'}{deadline.kind === 'past' ? ' · Past date' : ''}</span>
          <span><Wallet size={15} /> {opportunity.stipend ? 'Funding / fees: ' + opportunity.stipend : 'Funding / fees unlisted'}</span>
        </div>
      </div>
      <div className="radar-result-actions">
        <button onClick={() => onToggleSave(opportunity)} className="radar-save" title={isSaved ? 'Remove saved lead' : 'Save lead'} aria-label={isSaved ? 'Remove saved lead' : 'Save lead'} type="button">
          {isSaved ? <BookmarkCheck size={19} /> : <Bookmark size={19} />}
        </button>
        <a href={opportunity.url} target="_blank" rel="noopener noreferrer" className="radar-open">Open listing <ArrowUpRight size={16} /></a>
      </div>
    </article>
  );
}
