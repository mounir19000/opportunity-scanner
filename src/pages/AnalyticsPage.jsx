import React, { useMemo } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { deadlineState } from '../services/filters';
import { sourceKey } from '../services/opportunityData';

function distribution(items, key) {
  const counts = new Map();
  items.forEach((item) => counts.set(key(item) || 'Unspecified', (counts.get(key(item) || 'Unspecified') || 0) + 1));
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

export default function AnalyticsPage({ opportunities = [], onSelectOpportunity }) {
  const sourceStats = useMemo(() => distribution(opportunities, (item) => sourceKey(item.sourceRepo)), [opportunities]);
  const typeStats = useMemo(() => distribution(opportunities, (item) => item.type), [opportunities]);
  const upcoming = useMemo(() => opportunities.filter((item) => deadlineState(item.deadline).kind === 'upcoming').sort((a, b) => deadlineState(a.deadline).date - deadlineState(b.deadline).date), [opportunities]);
  const unknown = opportunities.filter((item) => deadlineState(item.deadline).kind === 'unknown').length;
  const maxSource = sourceStats[0]?.[1] || 1;
  const maxType = typeStats[0]?.[1] || 1;
  return (
    <div className="radar-page radar-inner-page">
      <div className="radar-inner-hero"><span className="radar-kicker">THE INDEX IN NUMBERS</span><h1>Know the<br /><em>coverage.</em></h1><p>These figures describe the bundled source snapshot. They are not a measure of open applications.</p></div>
      <div className="radar-inner-content">
        <div className="radar-insight-strip">
          <div><strong>{opportunities.length.toLocaleString()}</strong><span>Curated leads</span></div>
          <div><strong>{sourceStats.length}</strong><span>Sources</span></div>
          <div><strong>{upcoming.length}</strong><span>Future dated deadlines</span></div>
          <div><strong>{unknown.toLocaleString()}</strong><span>Deadline unlisted</span></div>
        </div>
        <div className="radar-insight-grid">
          <section className="radar-panel"><span className="radar-kicker">WHERE LEADS COME FROM</span><h2>Sources</h2><div className="radar-bars">{sourceStats.map(([name, count]) => <div className="radar-bar-row" key={name}><div><span>{name}</span><b>{count.toLocaleString()}</b></div><i style={{ width: String((count / maxSource) * 100) + '%' }} /></div>)}</div></section>
          <section className="radar-panel"><span className="radar-kicker">WHAT THE INDEX COVERS</span><h2>Program types</h2><div className="radar-bars">{typeStats.map(([name, count]) => <div className="radar-bar-row" key={name}><div><span>{name}</span><b>{count.toLocaleString()}</b></div><i style={{ width: String((count / maxType) * 100) + '%' }} /></div>)}</div></section>
        </div>
        <section className="radar-panel"><span className="radar-kicker">DATES FOUND IN SOURCE LISTINGS</span><h2>Upcoming deadlines</h2><p className="radar-panel-note">Only explicit future dates appear here. Confirm every deadline on the official program page.</p>
          {upcoming.length ? <div className="radar-simple-list">{upcoming.slice(0, 12).map((item) => <button key={item.id} onClick={() => onSelectOpportunity(item)} type="button"><span><strong>{item.title}</strong><small>{item.host || sourceKey(item.sourceRepo)}</small></span><span>{item.deadline}<ArrowUpRight size={16} /></span></button>)}</div> : <p className="radar-panel-note">No future dated deadlines are present in this snapshot.</p>}
        </section>
      </div>
    </div>
  );
}
