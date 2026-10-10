import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_FILTERS, daysUntil, filterOpportunities, parseFilters, serializeFilters } from '../src/lib/opportunity-filter.ts';
import { calculateMatchScore } from '../src/lib/radar-matcher.ts';
import { mockOpportunities } from '../src/lib/mock-data.ts';

const make = (id, overrides = {}) => ({ id, title: id, provider: 'Provider', hostCountry: 'Germany', fieldsOfStudy: ['Engineering'], degreeLevels: ['Masters'], eligibleNationalities: ['All'], type: 'Scholarship', funding: 'Fully Funded', region: 'Europe', deadline: null, isOpen: false, postedDate: '2026-10-01', ...overrides });

test('URL filters round trip and ignore unsupported facet values', () => {
  const filters = parseFilters('?type=Scholarship&type=Grant&funding=Fully+Funded&search=Google&sort=title-asc&type=Invalid');
  assert.deepEqual(filters.types, ['Scholarship', 'Grant']);
  assert.equal(filters.searchQuery, 'Google');
  assert.deepEqual(parseFilters('?' + serializeFilters(filters)), filters);
});

test('facet values use OR within a facet and AND across facets', () => {
  const items = [make('a'), make('b', { type: 'Grant', funding: 'Fully Funded' }), make('c', { type: 'Grant', funding: 'Prize Pool' })];
  const filters = { ...DEFAULT_FILTERS, types: ['Scholarship', 'Grant'], fundingCoverages: ['Fully Funded'] };
  assert.deepEqual(filterOpportunities(items, filters).map((item) => item.id), ['a', 'b']);
});

test('no IELTS quick filter only includes explicitly flagged records', () => {
  const items = [make('listed', { noIeltsRequired: true }), make('unknown')];
  const filters = parseFilters('?noIelts=1');
  assert.deepEqual(filterOpportunities(items, filters).map((item) => item.id), ['listed']);
  assert.equal(serializeFilters(filters), 'noIelts=1');
});

test('match score uses 35/35/30 weights with open disciplines', () => {
  const profile = { targetDegree: 'Masters', primaryField: 'Computer Science & AI', citizenship: 'Algeria' };
  assert.equal(calculateMatchScore(make('a', { fieldsOfStudy: ['All Disciplines'] }), profile), 100);
  assert.equal(calculateMatchScore(make('b', { eligibleNationalities: ['France'], fieldsOfStudy: ['Engineering'] }), profile), 35);
});

test('date-only deadlines last through the published UTC day and closed dates sort last', () => {
  const now = new Date('2026-10-14T11:00:00Z');
  assert.equal(daysUntil('2026-10-14', now), 0);
  const items = [make('closed', { deadline: '2026-10-01' }), make('undated'), make('open', { deadline: '2026-10-20', isOpen: true })];
  assert.deepEqual(filterOpportunities(items, DEFAULT_FILTERS, null, now).map((item) => item.id), ['open', 'undated', 'closed']);
});

test('curated catalogue has complete official links and unambiguous published dates', () => {
  assert.ok(mockOpportunities.length >= 12);
  assert.equal(new Set(mockOpportunities.map((item) => item.id)).size, mockOpportunities.length);
  for (const item of mockOpportunities) {
    assert.ok(item.title && item.provider && item.description && item.requirements.length && item.documentsRequired.length);
    assert.equal(new URL(item.applicationUrl).protocol, 'https:');
    assert.equal(new URL(item.sourceUrl).protocol, 'https:');
    if (item.deadline) assert.match(item.deadline, /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}Z)?$/);
  }
});
