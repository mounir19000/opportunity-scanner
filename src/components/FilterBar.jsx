import React from 'react';
import { Search, RotateCcw } from 'lucide-react';

const fundingOptions = [
  ['all', 'Any funding'],
  ['paid', 'Paid or stipend'],
  ['funded', 'Funded or fee waived'],
  ['travel', 'Travel support'],
];
const deadlineOptions = [
  ['all', 'Any deadline'],
  ['upcoming', 'Upcoming date'],
  ['rolling', 'Rolling'],
  ['dated', 'Has a date'],
];
const locationOptions = [
  ['all', 'Anywhere'],
  ['remote', 'Remote or online'],
  ['us', 'United States'],
  ['europe', 'Europe'],
  ['asia', 'Asia'],
  ['global', 'Global'],
];

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

export default function FilterBar({ filters, onChange, onReset, categories, types, repos, totalResults }) {
  const activeCount = Object.entries(filters).filter(([key, value]) => key !== 'sort' && value !== 'all' && value !== '').length;
  return (
    <aside className="radar-filters" aria-label="Opportunity filters">
      <div className="radar-filter-head">
        <div>
          <span className="radar-kicker">REFINE YOUR SEARCH</span>
          <h2>Filters</h2>
        </div>
        {activeCount > 0 && <button className="radar-reset" onClick={onReset} type="button"><RotateCcw size={14} /> Reset</button>}
      </div>
      <label className="radar-field">
        <span>Search</span>
        <div className="radar-search">
          <Search size={17} />
          <input value={filters.search} onChange={(event) => onChange('search', event.target.value)} placeholder="Role, host, keyword..." type="search" />
        </div>
      </label>
      <Field label="Category" value={filters.category} onChange={(value) => onChange('category', value)} options={ [['all', 'All categories'], ...categories.map((value) => [value, value])] } />
      <Field label="Program type" value={filters.type} onChange={(value) => onChange('type', value)} options={ [['all', 'All types'], ...types.map((value) => [value, value])] } />
      <Field label="Funding" value={filters.funding} onChange={(value) => onChange('funding', value)} options={fundingOptions} />
      <Field label="Deadline" value={filters.deadline} onChange={(value) => onChange('deadline', value)} options={deadlineOptions} />
      <Field label="Location" value={filters.location} onChange={(value) => onChange('location', value)} options={locationOptions} />
      <Field label="Source" value={filters.repo} onChange={(value) => onChange('repo', value)} options={ [['all', 'All sources'], ...repos.map((value) => [value, value])] } />
      <div className="radar-filter-foot">{totalResults.toLocaleString()} matching leads{activeCount ? ' · ' + activeCount + ' active filters' : ''}</div>
    </aside>
  );
}
