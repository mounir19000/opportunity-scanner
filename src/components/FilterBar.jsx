import React from 'react';
import { RotateCcw } from 'lucide-react';

function Field({ label, value, options, onChange }) {
  return (
    <label className="radar-field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map(([key, name]) => <option key={key} value={key}>{name}</option>)}
      </select>
    </label>
  );
}

export default function FilterBar({ filters, onChange, onReset, types, repos, locations, totalResults }) {
  const activeCount = ['search', 'type', 'location', 'repo'].filter((key) => filters[key] && filters[key] !== 'all').length;
  return (
    <aside className="radar-filters" aria-label="Opportunity filters">
      <div className="radar-filter-head">
        <div>
          <span className="radar-kicker">REFINE YOUR SEARCH</span>
          <h2>Filters</h2>
        </div>
        {activeCount > 0 && <button className="radar-reset" onClick={onReset} type="button"><RotateCcw size={14} /> Reset</button>}
      </div>
      <Field label="Program type" value={filters.type} onChange={(value) => onChange('type', value)} options={ [['all', 'All types'], ...types.map((value) => [value, value])] } />
      <Field label="Location" value={filters.location} onChange={(value) => onChange('location', value)} options={locations} />
      <Field label="Source" value={filters.repo} onChange={(value) => onChange('repo', value)} options={ [['all', 'All sources'], ...repos.map((value) => [value, value])] } />
      <div className="radar-filter-foot">{totalResults.toLocaleString()} matching leads{activeCount ? ' · ' + activeCount + ' active filters' : ''}</div>
    </aside>
  );
}
