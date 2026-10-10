import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { getSavedItems, getIngestionLogs, saveIngestionLogs, clearIngestionLogs } from '../src/services/storage.js';
import { normalizeOpportunity, stableOpportunityId } from '../src/services/opportunityData.js';
import { getCachedOpportunities, saveCachedOpportunities } from '../src/services/opportunityCache.js';

function memoryStorage() {
  const data = new Map();
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: (key) => data.delete(key),
  };
}

test('saved legacy IDs migrate to stable source URL IDs', () => {
  const original = globalThis.localStorage;
  const storage = memoryStorage();
  globalThis.localStorage = storage;
  try {
    const item = { id: 'old-row-1', title: 'Software Internship', sourceRepo: 'a/roles', url: 'https://example.org/jobs/1?utm_source=feed', status: 'applied', notes: 'Follow up' };
    storage.setItem('opportunity_scout_saved', JSON.stringify([item]));
    const [saved] = getSavedItems();
    assert.equal(saved.id, stableOpportunityId(item));
    assert.equal(saved.status, 'applied');
    assert.equal(saved.notes, 'Follow up');
    assert.equal(JSON.parse(storage.getItem('opportunity_scout_saved'))[0].id, saved.id);
  } finally {
    globalThis.localStorage = original;
  }
});

test('old hand-written programme saves leave the active directory without losing notes', () => {
  const original = globalThis.localStorage;
  const storage = memoryStorage();
  globalThis.localStorage = storage;
  try {
    const legacy = { id: 'chevening-andorra-2027', title: 'Chevening', applicationUrl: 'https://example.org', notes: 'Keep this note' };
    storage.setItem('opportunity_scout_saved', JSON.stringify([legacy]));
    assert.deepEqual(getSavedItems(), []);
    assert.equal(JSON.parse(storage.getItem('opportunity_scout_saved_legacy'))[0].notes, 'Keep this note');
  } finally {
    globalThis.localStorage = original;
  }
});

test('clearing refresh history stays cleared', () => {
  const original = globalThis.localStorage;
  globalThis.localStorage = memoryStorage();
  try {
    saveIngestionLogs([{ id: 'one', status: 'success' }]);
    assert.equal(getIngestionLogs().length, 1);
    clearIngestionLogs();
    assert.deepEqual(getIngestionLogs(), []);
  } finally {
    globalThis.localStorage = original;
  }
});

test('refreshed leads survive reload and invalidate when the source list changes', () => {
  const original = globalThis.localStorage;
  globalThis.localStorage = memoryStorage();
  try {
    const sources = [{ owner: 'a', name: 'roles' }];
    const lead = { id: 'old-row', title: 'Software Internship', sourceRepo: 'a/roles', url: 'https://example.org/jobs/1' };
    assert.equal(saveCachedOpportunities([lead], sources, '2026-10-10T12:00:00Z'), true);
    const cached = getCachedOpportunities(sources);
    assert.equal(cached.items[0].id, stableOpportunityId(lead));
    assert.equal(cached.updatedAt, '2026-10-10T12:00:00Z');
    assert.equal(getCachedOpportunities([{ owner: 'b', name: 'research' }]), null);
  } finally {
    globalThis.localStorage = original;
  }
});

test('public snapshot contains source listings with stable IDs after normalization', () => {
  const snapshot = JSON.parse(fs.readFileSync(new URL('../public/opportunities.json', import.meta.url), 'utf8'));
  assert.ok(snapshot.generatedAt);
  assert.ok(snapshot.items.length > 0);
  const ids = snapshot.items.map((item) => normalizeOpportunity(item).id);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(snapshot.items.every((item) => item.url && item.sourceRepo));
});
