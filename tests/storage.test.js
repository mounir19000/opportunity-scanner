import test from 'node:test';
import assert from 'node:assert/strict';
import { SAVED_STORAGE_KEY, getSavedItems, saveItem, updateItemStatus, removeSavedItem, getIngestionLogs, saveIngestionLogs, clearIngestionLogs } from '../src/services/storage.js';
import { stableOpportunityId } from '../src/services/opportunityData.js';
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

test('saved leads, status, and notes are restored from localStorage on return', () => {
  const original = globalThis.localStorage;
  const storage = memoryStorage();
  globalThis.localStorage = storage;
  try {
    const lead = { title: 'Research Internship', sourceRepo: 'a/roles', url: 'https://example.org/jobs/2' };
    const id = stableOpportunityId(lead);
    saveItem({ ...lead, id }, 'saved', 'Check the deadline');
    assert.equal(JSON.parse(storage.getItem(SAVED_STORAGE_KEY))[0].id, id);
    assert.equal(getSavedItems()[0].notes, 'Check the deadline');

    updateItemStatus(id, 'applied', 'Application submitted');
    const [restored] = getSavedItems();
    assert.equal(restored.status, 'applied');
    assert.equal(restored.notes, 'Application submitted');

    removeSavedItem(id);
    assert.deepEqual(getSavedItems(), []);
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
