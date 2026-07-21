/**
 * StorageAdapter interface specification for Focus Synergy.
 * Both Cloud (Firebase) and Local (IndexedDB / SQLite) adapters implement this interface.
 */
export class StorageAdapter {
    /**
     * @returns {'cloud' | 'local'}
     */
    getMode() {
        throw new Error("getMode() not implemented");
    }

    /**
     * Initializes the storage backend (auth check, connection, table setup, etc.).
     */
    async init() {
        throw new Error("init() not implemented");
    }

    // --- Items ---
    async getItems() { throw new Error("getItems() not implemented"); }
    async createItem(itemData) { throw new Error("createItem() not implemented"); }
    async updateItem(id, itemData) { throw new Error("updateItem() not implemented"); }
    async deleteItem(id) { throw new Error("deleteItem() not implemented"); }

    // --- Logs ---
    async getLogs() { throw new Error("getLogs() not implemented"); }
    async createLog(logData) { throw new Error("createLog() not implemented"); }
    async deleteLog(id) { throw new Error("deleteLog() not implemented"); }

    // --- Notes ---
    async getNotes() { throw new Error("getNotes() not implemented"); }
    async upsertNote(noteData) { throw new Error("upsertNote() not implemented"); }
    async deleteNote(id) { throw new Error("deleteNote() not implemented"); }

    // --- Seasons ---
    async getSeasons() { throw new Error("getSeasons() not implemented"); }
    async createSeason(seasonData) { throw new Error("createSeason() not implemented"); }
    async updateSeason(id, seasonData) { throw new Error("updateSeason() not implemented"); }
    async deleteSeason(id) { throw new Error("deleteSeason() not implemented"); }

    // --- Backlog ---
    async getBacklog() { throw new Error("getBacklog() not implemented"); }
    async createBacklogEntry(entryData) { throw new Error("createBacklogEntry() not implemented"); }
    async deleteBacklogEntry(id) { throw new Error("deleteBacklogEntry() not implemented"); }

    // --- Daily Logs ---
    async getDailyLogs() { throw new Error("getDailyLogs() not implemented"); }
    async upsertDailyLog(dailyLogData) { throw new Error("upsertDailyLog() not implemented"); }

    // --- Habit Logs ---
    async getHabitLogs() { throw new Error("getHabitLogs() not implemented"); }
    async upsertHabitLog(habitLogData) { throw new Error("upsertHabitLog() not implemented"); }

    // --- Meta / Profile / Active Timer ---
    async getMeta(metaId) { throw new Error("getMeta() not implemented"); }
    async setMeta(metaId, metaData) { throw new Error("setMeta() not implemented"); }

    // --- Realtime / Event Subscriptions ---
    /**
     * Subscribe to changes for a given collection or metadata doc.
     * @param {string} collectionName 
     * @param {function} callback 
     * @returns {function} unsubscribe function
     */
    subscribe(collectionName, callback) {
        throw new Error("subscribe() not implemented");
    }

    /**
     * Returns all raw user data across all collections for export/migration.
     */
    async getAllData() {
        const [items, logs, notes, seasons, backlog, dailyLogs, habitLogs] = await Promise.all([
            this.getItems(),
            this.getLogs(),
            this.getNotes(),
            this.getSeasons(),
            this.getBacklog(),
            this.getDailyLogs(),
            this.getHabitLogs()
        ]);
        return { items, logs, notes, seasons, backlog, dailyLogs, habitLogs };
    }
}
