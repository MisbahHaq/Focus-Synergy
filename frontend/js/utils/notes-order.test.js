import { describe, it, expect, vi } from 'vitest';
import { sortNotesByOrder, nextNoteOrder, pendingOrderUpdates, ensureNoteOrder } from './notes-order.js';

const note = (id, extra = {}) => ({ id, title: id, body: '', createdAt: 1000, ...extra });

describe('sortNotesByOrder', () => {
    it('sorts by the order field', () => {
        const input = [note('c', { order: 2 }), note('a', { order: 0 }), note('b', { order: 1 })];
        expect(sortNotesByOrder(input).map(n => n.id)).toEqual(['a', 'b', 'c']);
    });

    it('does not mutate the input array', () => {
        const input = [note('b', { order: 1 }), note('a', { order: 0 })];
        sortNotesByOrder(input);
        expect(input.map(n => n.id)).toEqual(['b', 'a']);
    });

    it('falls back to createdAt when order is missing', () => {
        const input = [note('b', { createdAt: 200 }), note('a', { createdAt: 100 })];
        expect(sortNotesByOrder(input).map(n => n.id)).toEqual(['a', 'b']);
    });

    it('accepts ISO string timestamps for createdAt', () => {
        const input = [
            note('b', { createdAt: '2026-02-01T00:00:00.000Z' }),
            note('a', { createdAt: '2026-01-01T00:00:00.000Z' })
        ];
        expect(sortNotesByOrder(input).map(n => n.id)).toEqual(['a', 'b']);
    });

    it('puts unordered notes after ordered ones', () => {
        const input = [note('new', { createdAt: 1 }), note('a', { order: 0 })];
        expect(sortNotesByOrder(input).map(n => n.id)).toEqual(['a', 'new']);
    });

    it('breaks ties on identical timestamps using the id', () => {
        const input = [note('b', { createdAt: 100 }), note('a', { createdAt: 100 })];
        expect(sortNotesByOrder(input).map(n => n.id)).toEqual(['a', 'b']);
    });

    it('preserves a manual order over creation time', () => {
        // 'a' was created later but was dragged to the top.
        const input = [note('a', { order: 0, createdAt: 900 }), note('b', { order: 1, createdAt: 100 })];
        expect(sortNotesByOrder(input).map(n => n.id)).toEqual(['a', 'b']);
    });
});

describe('dragged sequence', () => {
    it('ranks a dragged list by DOM position, not by the previous order', () => {
        // 'c' dragged from last to first; the old ranks must not win.
        const dragged = [note('c', { order: 2 }), note('a', { order: 0 }), note('b', { order: 1 })];
        expect(pendingOrderUpdates(dragged)).toEqual([
            { id: 'c', order: 0 },
            { id: 'a', order: 1 },
            { id: 'b', order: 2 }
        ]);

        dragged.forEach((n, i) => { n.order = i; });
        expect(sortNotesByOrder(dragged).map(n => n.id)).toEqual(['c', 'a', 'b']);
    });
});

describe('nextNoteOrder', () => {
    it('starts at zero for an empty list', () => {
        expect(nextNoteOrder([])).toBe(0);
    });

    it('starts at zero when no note is ranked', () => {
        expect(nextNoteOrder([note('a'), note('b')])).toBe(0);
    });

    it('continues after the highest rank, not the last position', () => {
        const input = [note('a', { order: 5 }), note('b', { order: 2 })];
        expect(nextNoteOrder(input)).toBe(6);
    });

    it('ignores unranked notes instead of overflowing', () => {
        const input = [note('a', { order: 3 }), note('b')];
        expect(nextNoteOrder(input)).toBe(4);
    });
});

describe('pendingOrderUpdates', () => {
    it('returns nothing when order already matches position', () => {
        const input = [note('a', { order: 0 }), note('b', { order: 1 })];
        expect(pendingOrderUpdates(input)).toEqual([]);
    });

    it('returns only the entries that moved', () => {
        // 'a' is still rank 0 at index 0; only 'b' needs writing.
        const input = [note('a', { order: 0 }), note('b', { order: 5 })];
        expect(pendingOrderUpdates(input)).toEqual([{ id: 'b', order: 1 }]);
    });

    it('backfills order for notes that never had one', () => {
        const input = [note('a'), note('b')];
        expect(pendingOrderUpdates(input)).toEqual([{ id: 'a', order: 0 }, { id: 'b', order: 1 }]);
    });
});

describe('ensureNoteOrder', () => {
    it('ranks and persists legacy notes', () => {
        const adapter = { reorderNotes: vi.fn().mockResolvedValue([]) };
        const input = [note('b', { createdAt: 200 }), note('a', { createdAt: 100 })];

        ensureNoteOrder(input, adapter);

        expect(input.map(n => n.id)).toEqual(['a', 'b']);
        expect(input.map(n => n.order)).toEqual([0, 1]);
        expect(adapter.reorderNotes).toHaveBeenCalledWith([{ id: 'a', order: 0 }, { id: 'b', order: 1 }]);
    });

    it('does not write when every note is already ranked', () => {
        const adapter = { reorderNotes: vi.fn() };
        ensureNoteOrder([note('a', { order: 0 }), note('b', { order: 1 })], adapter);
        expect(adapter.reorderNotes).not.toHaveBeenCalled();
    });

    it('does not write for an empty collection', () => {
        const adapter = { reorderNotes: vi.fn() };
        ensureNoteOrder([], adapter);
        expect(adapter.reorderNotes).not.toHaveBeenCalled();
    });

    it('does not throw when persistence fails', () => {
        const adapter = { reorderNotes: vi.fn().mockRejectedValue(new Error('offline')) };
        expect(() => ensureNoteOrder([note('a')], adapter)).not.toThrow();
    });
});