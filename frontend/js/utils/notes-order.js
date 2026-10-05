/**
 * Ordering helpers for the Notes Workspace.
 *
 * Notes are ranked by a numeric `order` field. Legacy notes created before that
 * field existed are backfilled with sequential ranks so a manual drag order has
 * something stable to build on.
 */

function toMillis(value) {
    if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
    if (typeof value === 'string') {
        const parsed = Date.parse(value);
        return Number.isNaN(parsed) ? 0 : parsed;
    }
    return 0;
}

function orderOf(note) {
    return Number.isFinite(note.order) ? note.order : Number.MAX_SAFE_INTEGER;
}

function createdMillis(note) {
    return toMillis(note.createdAt ?? note.updatedAt);
}

/**
 * Returns a new array sorted by the user-defined `order` field. Notes without an
 * `order` keep their relative position after ranked notes, falling back to
 * creation time and then id so the result is stable.
 */
export function sortNotesByOrder(notes) {
    return [...notes].sort((a, b) => {
        const byOrder = orderOf(a) - orderOf(b);
        if (byOrder !== 0) return byOrder;
        const byCreated = createdMillis(a) - createdMillis(b);
        if (byCreated !== 0) return byCreated;
        return String(a.id).localeCompare(String(b.id));
    });
}

/**
 * `order` value for a new note so it lands at the bottom of the list.
 * Ignores unranked notes, whose sentinel would otherwise overflow.
 */
export function nextNoteOrder(notes) {
    const ranked = notes.filter(n => Number.isFinite(n.order));
    if (ranked.length === 0) return 0;
    return Math.max(...ranked.map(n => n.order)) + 1;
}

/**
 * Rank entries that still need to be written, i.e. the ones whose stored
 * `order` does not already match their position.
 */
export function pendingOrderUpdates(notes) {
    return notes.flatMap((note, index) =>
        note.order === index ? [] : [{ id: note.id, order: index }]
    );
}

/**
 * Gives every unranked note a sequential rank, normalises the array to match,
 * and persists the result. No-ops once the whole collection is ranked.
 */
export function ensureNoteOrder(notes, storageAdapter) {
    if (!notes.length) return;
    if (pendingOrderUpdates(notes).length === 0) return;

    // Snapshot the stored ranks first: once the new ones are applied in place every
    // note would look up to date and the payload would come out empty.
    const stored = new Map(notes.map(note => [note.id, note.order]));

    const ranked = sortNotesByOrder(notes);
    const updates = [];
    ranked.forEach((note, index) => {
        if (stored.get(note.id) !== index) updates.push({ id: note.id, order: index });
        note.order = index;
    });
    notes.splice(0, notes.length, ...ranked);

    storageAdapter.reorderNotes(updates)
        .catch(e => console.error('[NOTES] failed to backfill note order:', e));
}