// LocalStorage helper for bookmarks, application statuses, notes, and fetch logs
import { stableOpportunityId } from './opportunityData.js';

const SAVED_KEY = 'opportunity_scout_saved';
const LEGACY_SAVED_KEY = 'opportunity_scout_saved_legacy';
const LOGS_KEY = 'opportunity_scout_logs';
const SETTINGS_KEY = 'opportunity_scout_settings';

export const getSavedItems = () => {
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    const legacy = parsed.filter((item) => !item?.url || !item?.sourceRepo);
    let backupSaved = true;
    if (legacy.length) {
      let previousLegacy = [];
      try {
        const stored = JSON.parse(localStorage.getItem(LEGACY_SAVED_KEY) || '[]');
        if (Array.isArray(stored)) previousLegacy = stored;
      } catch { /* A malformed backup should not hide current saves. */ }
      const known = new Set(previousLegacy.map((item) => item.id));
      try {
        localStorage.setItem(LEGACY_SAVED_KEY, JSON.stringify([
          ...previousLegacy,
          ...legacy.filter((item) => !known.has(item?.id)),
        ]));
      } catch {
        backupSaved = false;
      }
    }
    const current = parsed.filter((item) => item?.url && item?.sourceRepo);
    const migrated = current.map((item) => ({ ...item, id: stableOpportunityId(item) }));
    if (backupSaved && (legacy.length || migrated.some((item, index) => item.id !== current[index].id))) {
      try { localStorage.setItem(SAVED_KEY, JSON.stringify(migrated)); }
      catch { /* The in-memory list remains available for this session. */ }
    }
    return migrated;
  } catch (e) {
    console.error('Failed to load saved items from localStorage', e);
    return [];
  }
};

export const saveItem = (opportunity, status = 'saved', notes = '') => {
  try {
    const items = getSavedItems();
    const existingIndex = items.findIndex((item) => item.id === opportunity.id);
    const updatedItem = {
      ...opportunity,
      sourceNotes: opportunity.notes || '',
      savedAt: new Date().toISOString(),
      status, // 'saved', 'applied', 'interviewing', 'offered'
      notes,
    };

    let updatedList;
    if (existingIndex >= 0) {
      updatedList = [...items];
      updatedList[existingIndex] = { ...updatedList[existingIndex], ...updatedItem };
    } else {
      updatedList = [updatedItem, ...items];
    }

    localStorage.setItem(SAVED_KEY, JSON.stringify(updatedList));
    return updatedList;
  } catch (e) {
    console.error('Failed to save item', e);
    return getSavedItems();
  }
};

export const updateItemStatus = (id, newStatus, newNotes = null) => {
  try {
    const items = getSavedItems();
    const updatedList = items.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          status: newStatus,
          notes: newNotes !== null ? newNotes : item.notes,
          updatedAt: new Date().toISOString(),
        };
      }
      return item;
    });
    localStorage.setItem(SAVED_KEY, JSON.stringify(updatedList));
    return updatedList;
  } catch (e) {
    console.error('Failed to update status', e);
    return getSavedItems();
  }
};

export const removeSavedItem = (id) => {
  try {
    const items = getSavedItems();
    const updatedList = items.filter((item) => item.id !== id);
    localStorage.setItem(SAVED_KEY, JSON.stringify(updatedList));
    return updatedList;
  } catch (e) {
    console.error('Failed to remove item', e);
    return getSavedItems();
  }
};

// Logs persistence
export const getIngestionLogs = () => {
  try {
    const raw = localStorage.getItem(LOGS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
};

export const saveIngestionLogs = (logs) => {
  try {
    // Keep most recent 500 logs
    const trimmed = logs.slice(0, 500);
    localStorage.setItem(LOGS_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.error('Failed to persist logs', e);
  }
};

export const clearIngestionLogs = () => {
  try {
    localStorage.removeItem(LOGS_KEY);
  } catch (e) {}
};

// Settings persistence
export const getSettings = () => {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : { theme: 'light' };
  } catch (e) {
    return { theme: 'light' };
  }
};

export const saveSettings = (newSettings) => {
  try {
    const current = getSettings();
    const updated = { ...current, ...newSettings };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    return getSettings();
  }
};

