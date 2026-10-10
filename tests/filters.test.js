import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_FILTERS, deadlineState, filterOpportunities, parseDirectoryState, serializeDirectoryState } from '../src/services/filters.js';
import { canonicalUrl, dedupeOpportunities, isUsefulOpportunity, normalizeOpportunity, replaceSourceOpportunities, sourceKey, stableOpportunityId } from '../src/services/opportunityData.js';

const today = new Date('2026-10-10T12:00:00Z');
const items = [
  { id: 'a', title: 'Software Internship', host: 'Northstar', type: 'Internship', sourceRepo: 'a/roles', location: 'London, UK', deadline: '', stipend: '' },
  { id: 'b', title: 'Research Program', host: '', type: 'Research / REU', sourceRepo: 'b/research', location: 'Remote', deadline: '', stipend: '' },
  { id: 'c', title: 'Summer School', host: 'University', type: 'Summer School', sourceRepo: 'c/schools', location: 'Paris, France', deadline: 'Started 1 September 2027', dates: '1 – 5 February 2027' },
];

test('directory URL state round trips filters and pagination', () => {
  const state = parseDirectoryState('?view=explorer&search=AI&type=Internship&location=europe&source=a%2Froles&sort=title&page=3');
  assert.deepEqual(state, {
    filters: { search: 'AI', type: 'Internship', location: 'europe', repo: 'a/roles', sort: 'title' },
    page: 3,
  });
  const query = serializeDirectoryState(state.filters, state.page, '?view=explorer');
  assert.equal(new URLSearchParams(query).get('view'), 'explorer');
  assert.deepEqual(parseDirectoryState('?' + query), state);
  assert.equal(parseDirectoryState('?location=invalid&sort=invalid&page=-7').page, 1);
});

test('one search and exact facets filter the source directory', () => {
  assert.deepEqual(filterOpportunities(items, { search: 'software northstar', location: 'europe' }).map((item) => item.id), ['a']);
  assert.deepEqual(filterOpportunities(items, { type: 'Research / REU', location: 'remote' }).map((item) => item.id), ['b']);
  assert.deepEqual(filterOpportunities(items, { repo: 'c/schools' }).map((item) => item.id), ['c']);
  assert.equal(sourceKey({ owner: 'a', name: 'roles' }), 'a/roles');
});

test('default order keeps more published details first and preserves raw deadline text', () => {
  assert.equal(DEFAULT_FILTERS.sort, 'details-desc');
  assert.deepEqual(filterOpportunities(items).map((item) => item.id), ['c', 'a', 'b']);
  assert.equal(deadlineState(items[2].deadline, today).kind, 'unknown');
  assert.equal(normalizeOpportunity(items[2]).deadline, 'Started 1 September 2027');
});

test('stable IDs follow source and listing URL across source reordering', () => {
  const source = { owner: 'a', name: 'roles' };
  const old = [
    { id: 'old-1', url: 'https://example.org/jobs/one?utm_source=feed', sourceRepo: 'a/roles', discoveredAt: '2026-10-01' },
    { id: 'old-2', url: 'https://example.org/jobs/two', sourceRepo: 'a/roles', discoveredAt: '2026-10-02' },
  ];
  const fresh = [
    { id: 'new-1', url: 'https://example.org/jobs/new', sourceRepo: 'a/roles', discoveredAt: '2026-10-10' },
    { id: 'new-2', url: 'https://example.org/jobs/one', sourceRepo: 'a/roles', discoveredAt: '2026-10-10' },
  ];
  const updated = replaceSourceOpportunities(old, source, fresh);
  assert.equal(new Set(updated.map((item) => item.id)).size, updated.length);
  assert.equal(updated[1].id, stableOpportunityId(old[0]));
  assert.equal(updated[1].discoveredAt, old[0].discoveredAt);
  assert.equal(canonicalUrl(old[0].url), canonicalUrl(fresh[1].url));
  assert.equal(dedupeOpportunities([{ url: old[0].url }, { url: fresh[1].url }]).length, 1);
});

test('curation still rejects invalid links and expired explicit dates', () => {
  const lead = { title: 'Research internship 2027', url: 'https://example.org/apply', sourceRepo: 'a/roles', deadline: '2026-11-02' };
  assert.equal(isUsefulOpportunity(lead, today), true);
  assert.equal(isUsefulOpportunity({ ...lead, url: 'https://img.shields.io/badge/-Apply-blue' }, today), false);
  assert.equal(isUsefulOpportunity({ ...lead, deadline: '2026-09-01' }, today), false);
});
