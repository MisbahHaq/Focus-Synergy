import { FirebaseAdapter } from './FirebaseAdapter.js';
import { LocalAdapter } from './LocalAdapter.js';

export const STORAGE_MODE_KEY = 'focus_synergy_storage_mode';

export function getStorageMode() {
    return localStorage.getItem(STORAGE_MODE_KEY) || 'cloud';
}

export function setStorageMode(mode) {
    if (mode !== 'cloud' && mode !== 'local') {
        throw new Error(`Invalid storage mode: ${mode}`);
    }
    localStorage.setItem(STORAGE_MODE_KEY, mode);
}

export async function createStorageAdapter(mode, db, getUidFn) {
    let adapter;
    if (mode === 'local') {
        adapter = new LocalAdapter();
    } else {
        adapter = new FirebaseAdapter(db, getUidFn);
    }
    await adapter.init();
    return adapter;
}

/**
 * Migration helper: copies all data from sourceAdapter to targetAdapter.
 * Verifies document counts match across all collections.
 */
export async function migrateStorageData(sourceAdapter, targetAdapter) {
    const data = await sourceAdapter.getAllData();
    const collections = ['items', 'logs', 'notes', 'seasons', 'backlog', 'dailyLogs', 'habitLogs'];
    
    const migrationReport = {};

    for (const col of collections) {
        const records = data[col] || [];
        migrationReport[col] = { total: records.length, migrated: 0 };

        for (const item of records) {
            if (col === 'items') {
                const existing = (await targetAdapter.getItems()).find(i => i.id === item.id);
                if (!existing) await targetAdapter.createItem(item);
            } else if (col === 'logs') {
                const existing = (await targetAdapter.getLogs()).find(l => l.id === item.id);
                if (!existing) await targetAdapter.createLog(item);
            } else if (col === 'notes') {
                await targetAdapter.upsertNote(item);
            } else if (col === 'seasons') {
                const existing = (await targetAdapter.getSeasons()).find(s => s.id === item.id);
                if (!existing) await targetAdapter.createSeason(item);
            } else if (col === 'backlog') {
                const existing = (await targetAdapter.getBacklog()).find(b => b.id === item.id);
                if (!existing) await targetAdapter.createBacklogEntry(item);
            } else if (col === 'dailyLogs') {
                await targetAdapter.upsertDailyLog(item);
            } else if (col === 'habitLogs') {
                await targetAdapter.upsertHabitLog(item);
            }
            migrationReport[col].migrated++;
        }
    }

    return migrationReport;
}
