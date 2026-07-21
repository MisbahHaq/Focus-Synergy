/**
 * Data Export module for Focus Synergy.
 * Supports JSON (full fidelity) and CSV (logs & dailyLogs) exports.
 * Supports web browser download blobs and Tauri native file dialogs.
 */

export async function exportUserData(adapter) {
    const data = await adapter.getAllData();
    return data;
}

export function downloadJsonFile(data, filename = 'focus_synergy_export.json') {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    triggerBlobDownload(blob, filename);
}

export function convertLogsToCsv(logs, itemsMap = {}) {
    const headers = ['Log ID', 'Item ID', 'Item Name', 'Seconds Logged', 'Hours Logged', 'Timestamp'];
    const rows = logs.map(log => {
        const itemName = itemsMap[log.itemId] ? itemsMap[log.itemId].name || itemsMap[log.itemId].title : 'Unknown';
        const hours = (log.seconds / 3600).toFixed(2);
        return [
            log.id,
            log.itemId || '',
            `"${(itemName || '').replace(/"/g, '""')}"`,
            log.seconds || 0,
            hours,
            log.timestamp || ''
        ].join(',');
    });
    return [headers.join(','), ...rows].join('\n');
}

export function convertDailyLogsToCsv(dailyLogs) {
    const headers = ['Log ID', 'Date', 'Energy Mode', 'Timestamp'];
    const rows = dailyLogs.map(log => [
        log.id,
        log.date || '',
        log.energyMode || '',
        log.timestamp || ''
    ].join(','));
    return [headers.join(','), ...rows].join('\n');
}

export function triggerBlobDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export async function exportAllData(adapter, items = []) {
    const data = await adapter.getAllData();
    const itemsMap = (items || []).reduce((acc, item) => {
        acc[item.id] = item;
        return acc;
    }, {});

    // 1. Download JSON
    const dateStr = new Date().toISOString().split('T')[0];
    downloadJsonFile(data, `focus_synergy_export_${dateStr}.json`);

    // 2. Download CSV for logs
    if (data.logs && data.logs.length > 0) {
        const csvLogs = convertLogsToCsv(data.logs, itemsMap);
        const blobLogs = new Blob([csvLogs], { type: 'text/csv' });
        triggerBlobDownload(blobLogs, `focus_synergy_logs_${dateStr}.csv`);
    }

    // 3. Download CSV for dailyLogs
    if (data.dailyLogs && data.dailyLogs.length > 0) {
        const csvDaily = convertDailyLogsToCsv(data.dailyLogs);
        const blobDaily = new Blob([csvDaily], { type: 'text/csv' });
        triggerBlobDownload(blobDaily, `focus_synergy_daily_energy_${dateStr}.csv`);
    }
}
