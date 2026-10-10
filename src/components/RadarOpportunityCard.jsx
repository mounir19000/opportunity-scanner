import React from 'react';
import { ArrowUpRight, Bookmark, CalendarDays, MapPin, Sparkles } from 'lucide-react';
import { daysUntil } from '../lib/opportunity-filter';
import { calculateMatchScore } from '../lib/radar-matcher';

export function deadlineLabel(item) {
  const days = daysUntil(item.deadline);
  if (!item.deadline) return { text: item.deadlineNote ? 'Date varies' : 'Check official site', kind: 'unknown' };
  if (days < 0) return { text: 'Past deadline', kind: 'closed' };
  if (days === 0) return { text: 'Closes today', kind: 'urgent' };
  if (days < 7) return { text: `${days} day${days === 1 ? '' : 's'} left`, kind: 'urgent' };
  if (days < 30) return { text: `${days} days left`, kind: 'soon' };
  return { text: new Date(item.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }), kind: 'open' };
}

export default function RadarOpportunityCard({ opportunity: item, profile, isSaved, onToggleSave, onSelect, view = 'grid' }) {
  const deadline = deadlineLabel(item);
  const score = profile?.targetDegree && profile?.primaryField && profile?.citizenship ? calculateMatchScore(item, profile) : null;
  return <article className={`sch-card ${view === 'list' ? 'list' : ''}`}><div className="sch-card-head"><div className="sch-provider-avatar" aria-hidden="true">{item.provider.slice(0, 2).toUpperCase()}</div><div className="sch-provider"><strong>{item.provider}</strong><span><MapPin size={12}/>{item.countryFlagEmoji} {item.hostCountry}</span></div><span className="sch-type-badge">{item.type}</span></div><h3>{item.title}</h3><p className="sch-card-description">{item.description}</p><div className="sch-funding"><span className={item.funding === 'Fully Funded' ? 'sch-funded-badge' : 'sch-funding-badge'}>{item.funding}</span><strong>{item.financialBenefit}</strong></div><div className="sch-card-tags">{item.degreeLevels.slice(0, 2).map((value) => <span key={value}>{value}</span>)}{item.fieldsOfStudy.slice(0, 2).map((value) => <span key={value}>{value}</span>)}</div><div className="sch-card-footer"><span className={`sch-deadline ${deadline.kind}`}><CalendarDays size={14}/>{deadline.text}</span>{score !== null && <span className="sch-match-badge"><Sparkles size={13}/>{score}% match</span>}<div className="sch-card-actions"><button type="button" className={isSaved ? 'sch-card-save active' : 'sch-card-save'} aria-label={isSaved ? `Remove ${item.title} from watchlist` : `Save ${item.title}`} onClick={() => onToggleSave(item)}><Bookmark size={17} fill={isSaved ? 'currentColor' : 'none'}/></button><button type="button" className="sch-card-cta" onClick={() => onSelect(item)}>View details <ArrowUpRight size={15}/></button></div></div></article>;
}
