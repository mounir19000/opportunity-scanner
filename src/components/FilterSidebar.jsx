import React, { useEffect, useMemo, useState } from 'react';
import { Check, SlidersHorizontal, X } from 'lucide-react';
import { TYPE_OPTIONS, FUNDING_OPTIONS, DEGREE_OPTIONS, FIELD_OPTIONS, REGION_OPTIONS } from '../lib/opportunity-filter';
import { filterOpportunities } from '../lib/opportunity-filter';

const groups = [['types', 'Opportunity type', TYPE_OPTIONS], ['fundingCoverages', 'Funding level', FUNDING_OPTIONS], ['degreeLevels', 'Academic level', DEGREE_OPTIONS], ['regions', 'Destination', REGION_OPTIONS], ['fieldsOfStudy', 'Field of study', FIELD_OPTIONS]];

export default function FilterSidebar({ filters, update, clear, opportunities, resultsCount }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (event) => { if (event.key === 'Escape') setMobileOpen(false); };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey); };
  }, [mobileOpen]);
  const selected = groups.flatMap(([key]) => filters[key].map((value) => [key, value]));
  const activeCount = selected.length + Number(filters.urgency !== 'all') + Number(Boolean(filters.minFunding)) + Number(Boolean(filters.noIeltsOnly));
  const toggle = (key, value) => update(key, filters[key].includes(value) ? filters[key].filter((x) => x !== value) : [...filters[key], value]);
  const activeChips = [
    ...selected,
    ...(filters.minFunding ? [['minFunding', 'Fully funded only']] : []),
    ...(filters.noIeltsOnly ? [['noIeltsOnly', 'No IELTS required']] : []),
    ...(filters.urgency !== 'all' ? [['urgency', filters.urgency === 'open-anytime' ? 'Open / rolling' : filters.urgency === 'closing-in-7-days' ? 'Closing in 7 days' : 'Closing in 30 days']] : []),
  ];
  const removeChip = (key, value) => key === 'urgency' ? update('urgency', 'all') : key === 'minFunding' || key === 'noIeltsOnly' ? update(key, false) : toggle(key, value);
  const countsBase = useMemo(() => Object.fromEntries(groups.map(([key]) => [key, filterOpportunities(opportunities, { ...filters, [key]: [] })])), [opportunities, filters]);
  const content = <><div className="sch-filter-title"><div><span className="sch-overline">REFINE YOUR SEARCH</span><h2>Filters <span>{activeCount}</span></h2></div><button type="button" onClick={clear}>Reset all</button></div>{activeChips.length > 0 && <div className="sch-active-filters">{activeChips.map(([key, value]) => <button key={`${key}-${value}`} type="button" onClick={() => removeChip(key, value)}>{value}<X size={12}/></button>)}</div>}{groups.map(([key, label, options]) => <details key={key} className="sch-filter-group" open><summary>{label}<span>−</span></summary><div>{options.map((option) => { const active = filters[key].includes(option); const count = countsBase[key].filter((item) => key === 'types' ? item.type === option : key === 'fundingCoverages' ? item.funding === option : key === 'degreeLevels' ? item.degreeLevels.includes(option) : key === 'fieldsOfStudy' ? item.fieldsOfStudy.includes(option) : item.region === option).length; return <label key={option} className={active ? 'sch-check-row active' : 'sch-check-row'}><input type="checkbox" checked={active} onChange={() => toggle(key, option)}/><span className="sch-checkbox">{active && <Check size={13}/>}</span><span className="sch-check-label">{option}</span><small>{count}</small></label>; })}</div></details>)}<fieldset className="sch-filter-group sch-urgency"><legend>Deadline</legend>{[['all', 'All deadlines'], ['closing-in-7-days', 'Closing in 7 days'], ['closing-in-30-days', 'Closing in 30 days'], ['open-anytime', 'Open / rolling']].map(([value, label]) => <label key={value} className="sch-check-row"><input type="radio" name="urgency" checked={filters.urgency === value} onChange={() => update('urgency', value)}/><span className="sch-radio"/><span className="sch-check-label">{label}</span></label>)}</fieldset></>;
  return <><aside className="sch-sidebar">{content}</aside><button className="sch-mobile-filter-button" type="button" onClick={() => setMobileOpen(true)}><SlidersHorizontal size={18}/> Filters {activeCount > 0 && <b>{activeCount}</b>}</button>{mobileOpen && <div className="sch-filter-overlay" onMouseDown={() => setMobileOpen(false)}><section className="sch-filter-sheet" role="dialog" aria-modal="true" aria-label="Opportunity filters" onMouseDown={(event) => event.stopPropagation()}><div className="sch-sheet-top"><strong>FILTER OPPORTUNITIES</strong><button type="button" aria-label="Close filters" onClick={() => setMobileOpen(false)}><X/></button></div>{content}<button className="sch-sheet-apply" type="button" onClick={() => setMobileOpen(false)}>Show {resultsCount} opportunities</button></section></div>}</>;
}
