import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_FILTERS, deadlineState, filterOpportunities } from '../src/services/filters.js';
import { fundingKind, isUsefulOpportunity, normalizeOpportunity, sourceKey } from '../src/services/opportunityData.js';

const today = new Date('2026-10-05T12:00:00Z');
const items = [
  { title: 'Software Internship', host: 'Northstar', category: 'Internships', type: 'Internship', sourceRepo: 'a/roles', location: 'Austin, USA', deadline: '2026-11-02', stipend: '$25 per hour' },
  { title: 'Research Program', host: 'Institute', category: 'Research', type: 'Research / REU', sourceRepo: { owner: 'b', name: 'research' }, location: 'Remote', deadline: 'Rolling', stipend: 'See program details' },
  { title: 'Summer School', host: 'University', category: 'Summer schools', type: 'Summer School', sourceRepo: 'c/schools', location: 'Paris, France', deadline: '13 June, 2026', stipend: 'Not available' },
];

test('repository filter handles both source shapes', () => {
  assert.equal(sourceKey(items[1].sourceRepo), 'b/research');
  assert.deepEqual(filterOpportunities(items, { repo: 'b/research' }, today).map((x) => x.title), ['Research Program']);
});

test('deadline filter does not mistake unknown or expired dates for upcoming', () => {
  assert.equal(deadlineState('See website / Rolling', today).kind, 'unknown');
  assert.equal(deadlineState('13 June, 2026', today).kind, 'past');
  assert.deepEqual(filterOpportunities(items, { deadline: 'upcoming' }, today).map((x) => x.title), ['Software Internship']);
  assert.deepEqual(filterOpportunities(items, { deadline: 'rolling' }, today).map((x) => x.title), ['Research Program']);
});

test('funding only matches explicit compensation', () => {
  assert.equal(fundingKind('Paid position (Competitive compensation)'), 'unknown');
  assert.equal(fundingKind('Available for students from low-resource backgrounds'), 'unknown');
  assert.deepEqual(filterOpportunities(items, { funding: 'paid' }, today).map((x) => x.title), ['Software Internship']);
});

test('search, facets, and location use complete terms and exact categories', () => {
  assert.deepEqual(filterOpportunities(items, { search: 'software northstar', location: 'us' }, today).map((x) => x.title), ['Software Internship']);
  assert.deepEqual(filterOpportunities(items, { category: 'Research' }, today).map((x) => x.title), ['Research Program']);
  assert.deepEqual(filterOpportunities(items, { location: 'remote' }, today).map((x) => x.title), ['Research Program']);
});

test('dates sort chronologically with unknown dates last', () => {
  assert.deepEqual(filterOpportunities(items, { sort: 'deadline-asc' }, today).map((x) => x.title), ['Summer School', 'Software Internship', 'Research Program']);
});

test('default order puts listings with more actual details first', () => {
  const leads = [
    { title: 'Sparse lead' },
    { title: 'Vague location', location: 'Varies by programme' },
    { title: 'Host only', host: 'Institute' },
    { title: 'Location only', location: 'Canada' },
    { title: 'Detailed programme', host: 'University', location: 'Germany', dates: 'July 2027', stipend: 'Stipend available', notes: 'Open to undergraduates' },
  ];
  assert.equal(DEFAULT_FILTERS.sort, 'details-desc');
  assert.deepEqual(filterOpportunities(leads).map((x) => x.title), [
    'Detailed programme', 'Location only', 'Host only', 'Sparse lead', 'Vague location',
  ]);
  assert.deepEqual(filterOpportunities(leads, { sort: 'featured' }).map((x) => x.title), leads.map((x) => x.title));
});

test('curation rejects badges, repository self-links, and expired listings', () => {
  const base = { title: 'Research internship 2027', url: 'https://example.org/apply', sourceRepo: 'a/roles', deadline: '2026-11-02' };
  assert.equal(isUsefulOpportunity(base, today), true);
  assert.equal(isUsefulOpportunity({ ...base, url: 'https://img.shields.io/badge/-Apply-blue' }, today), false);
  assert.equal(isUsefulOpportunity({ ...base, url: 'https://github.com/a/roles' }, today), false);
  assert.equal(isUsefulOpportunity({ ...base, deadline: '2026-09-01' }, today), false);
});


test('school link uses the verified organizer destination', () => {
  const item = normalizeOpportunity({
    title: '7th Annual Nepal AI School',
    sourceRepo: 'hazratali/awesome-ai-summerschool',
    url: 'https://anais.naamii.org.np/?utm_source=gemini',
  });
  assert.equal(item.url, 'https://www.naamii.org/anais');
});

test('SoRAIM source deadline text is preserved verbatim without treating it as a closing date', () => {
  const lead = {
    title: 'ACM Europe Winter School on Social Robotics, Artificial Intelligence and Multimedia (SoRAIM’27)',
    sourceRepo: 'hazratali/awesome-ai-summerschool',
    url: 'https://project.inria.fr/soraim/',
    deadline: 'Started 1 September 2027',
    dates: '1 – 5 February 2027',
  };
  const normalized = normalizeOpportunity(lead);
  assert.equal(normalized.deadline, 'Started 1 September 2027');
  assert.equal(deadlineState(normalized.deadline, today).kind, 'unknown');
  assert.equal(normalized.applicationOpens, undefined);
  assert.equal(normalizeOpportunity({ ...lead, deadline: '18 October 2026' }).deadline, '18 October 2026');
});
