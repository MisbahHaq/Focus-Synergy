import { StorageAdapter } from './StorageAdapter.js';

export class LocalAdapter extends StorageAdapter {
    constructor() {
        super();
        this.dbName = 'FocusSynergyLocalDB';
        this.dbVersion = 1;
        this.db = null;
        this.subscribers = new Map(); // colName -> Set of callbacks
    }

    getMode() {
        return 'local';
    }

    async init() {
        if (this.db) return true;
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                const collections = ['items', 'logs', 'notes', 'seasons', 'backlog', 'dailyLogs', 'habitLogs', 'meta'];
                collections.forEach(col => {
                    if (!db.objectStoreNames.contains(col)) {
                        db.createObjectStore(col, { keyPath: 'id' });
                    }
                });
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve(true);
            };

            request.onerror = (event) => {
                console.error("IndexedDB initialization error:", event.target.error);
                reject(event.target.error);
            };
        });
    }

    _generateId() {
        return 'loc_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7);
    }

    _notify(colName) {
        if (this.subscribers.has(colName)) {
            this._getAllFromStore(colName).then(data => {
                this.subscribers.get(colName).forEach(cb => cb(data));
            });
        }
    }

    _notifyMeta(metaId) {
        const key = `meta/${metaId}`;
        if (this.subscribers.has(key)) {
            this.getMeta(metaId).then(data => {
                this.subscribers.get(key).forEach(cb => cb(data));
            });
        }
    }

    async _getAllFromStore(storeName) {
        await this.init();
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(storeName, 'readonly');
            const store = tx.objectStore(storeName);
            const req = store.getAll();
            req.onsuccess = () => resolve(req.result || []);
            req.onerror = () => reject(req.error);
        });
    }

    async _getDocFromStore(storeName, id) {
        await this.init();
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(storeName, 'readonly');
            const store = tx.objectStore(storeName);
            const req = store.get(id);
            req.onsuccess = () => resolve(req.result || null);
            req.onerror = () => reject(req.error);
        });
    }

    async _putDocToStore(storeName, doc) {
        await this.init();
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(storeName, 'readwrite');
            const store = tx.objectStore(storeName);
            const req = store.put(doc);
            req.onsuccess = () => resolve(doc);
            req.onerror = () => reject(req.error);
        });
    }

    async _deleteDocFromStore(storeName, id) {
        await this.init();
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(storeName, 'readwrite');
            const store = tx.objectStore(storeName);
            const req = store.delete(id);
            req.onsuccess = () => resolve(id);
            req.onerror = () => reject(req.error);
        });
    }

    // --- Items ---
    async getItems() {
        return await this._getAllFromStore('items');
    }

    async createItem(itemData) {
        const item = {
            id: this._generateId(),
            ...itemData,
            createdAt: itemData.createdAt || Date.now()
        };
        await this._putDocToStore('items', item);
        this._notify('items');
        return item;
    }

    async updateItem(id, itemData) {
        const existing = await this._getDocFromStore('items', id) || { id };
        const updated = { ...existing, ...itemData };
        await this._putDocToStore('items', updated);
        this._notify('items');
        return updated;
    }

    async deleteItem(id) {
        await this._deleteDocFromStore('items', id);
        this._notify('items');
        return id;
    }

    // --- Logs ---
    async getLogs() {
        const logs = await this._getAllFromStore('logs');
        return logs.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    }

    async createLog(logData) {
        const log = {
            id: this._generateId(),
            ...logData,
            timestamp: logData.timestamp || Date.now()
        };
        await this._putDocToStore('logs', log);
        this._notify('logs');
        return log;
    }

    async deleteLog(id) {
        await this._deleteDocFromStore('logs', id);
        this._notify('logs');
        return id;
    }

    // --- Notes ---
    async getNotes() {
        return await this._getAllFromStore('notes');
    }

    async upsertNote(noteData) {
        const id = noteData.id || this._generateId();
        const existing = await this._getDocFromStore('notes', id) || {};
        const note = {
            id,
            title: noteData.title || '',
            body: noteData.body || '',
            updatedAt: Date.now(),
            createdAt: existing.createdAt || Date.now(),
            ...noteData
        };
        await this._putDocToStore('notes', note);
        this._notify('notes');
        return note;
    }

    async deleteNote(id) {
        await this._deleteDocFromStore('notes', id);
        this._notify('notes');
        return id;
    }

    // --- Seasons ---
    async getSeasons() {
        return await this._getAllFromStore('seasons');
    }

    async createSeason(seasonData) {
        const season = {
            id: this._generateId(),
            ...seasonData,
            createdAt: Date.now()
        };
        await this._putDocToStore('seasons', season);
        this._notify('seasons');
        return season;
    }

    async updateSeason(id, seasonData) {
        const existing = await this._getDocFromStore('seasons', id) || { id };
        const updated = { ...existing, ...seasonData };
        await this._putDocToStore('seasons', updated);
        this._notify('seasons');
        return updated;
    }

    async deleteSeason(id) {
        await this._deleteDocFromStore('seasons', id);
        this._notify('seasons');
        return id;
    }

    // --- Backlog ---
    async getBacklog() {
        return await this._getAllFromStore('backlog');
    }

    async createBacklogEntry(entryData) {
        const entry = {
            id: this._generateId(),
            ...entryData,
            createdAt: Date.now()
        };
        await this._putDocToStore('backlog', entry);
        this._notify('backlog');
        return entry;
    }

    async deleteBacklogEntry(id) {
        await this._deleteDocFromStore('backlog', id);
        this._notify('backlog');
        return id;
    }

    // --- Daily Logs ---
    async getDailyLogs() {
        return await this._getAllFromStore('dailyLogs');
    }

    async upsertDailyLog(dailyLogData) {
        const id = dailyLogData.id || dailyLogData.date;
        const existing = await this._getDocFromStore('dailyLogs', id) || {};
        const doc = { id, ...existing, ...dailyLogData };
        await this._putDocToStore('dailyLogs', doc);
        this._notify('dailyLogs');
        return doc;
    }

    // --- Habit Logs ---
    async getHabitLogs() {
        return await this._getAllFromStore('habitLogs');
    }

    async upsertHabitLog(habitLogData) {
        const id = habitLogData.id || `${habitLogData.seasonId}_${habitLogData.date}`;
        const existing = await this._getDocFromStore('habitLogs', id) || {};
        const doc = { id, ...existing, ...habitLogData };
        await this._putDocToStore('habitLogs', doc);
        this._notify('habitLogs');
        return doc;
    }

    // --- Meta / Profile / Active Timer ---
    async getMeta(metaId) {
        return await this._getDocFromStore('meta', metaId);
    }

    async setMeta(metaId, metaData) {
        const existing = await this._getDocFromStore('meta', metaId) || {};
        const doc = { id: metaId, ...existing, ...metaData };
        await this._putDocToStore('meta', doc);
        this._notifyMeta(metaId);
        return doc;
    }

    // --- Atomic Start Timer with ActiveTimer Meta ---
    async startItemTimer(itemId, startedAt) {
        await this.setMeta('activeTimer', { itemId, startedAt });
        await this.updateItem(itemId, { isRunning: true, startedAt });
    }

    async stopItemTimer(itemId, newAccumulatedSeconds) {
        await this.setMeta('activeTimer', { itemId: null, startedAt: null });
        await this.updateItem(itemId, { isRunning: false, startedAt: null, accumulatedSeconds: newAccumulatedSeconds });
    }

    // --- Realtime / Event Subscriptions ---
    subscribe(key, callback) {
        if (!this.subscribers.has(key)) {
            this.subscribers.set(key, new Set());
        }
        this.subscribers.get(key).add(callback);

        // Immediately trigger initial callback with current data
        if (key.startsWith('meta/')) {
            const metaId = key.split('/')[1];
            this.getMeta(metaId).then(data => callback(data));
        } else {
            this._getAllFromStore(key).then(data => callback(data));
        }

        // Return unsubscribe function
        return () => {
            if (this.subscribers.has(key)) {
                this.subscribers.get(key).delete(callback);
            }
        };
    }
}
