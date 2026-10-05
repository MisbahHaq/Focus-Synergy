/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { attachNoteDragHandle, isNotesDragging } from './notes-drag.js';

const CARD_H = 40;
const GAP = 0;

/**
 * Stubs layout so each card's rect reflects its *current* DOM position, which is
 * what the drag logic measures against as it reorders siblings.
 */
function layout() {
    const container = document.getElementById('notesList');
    const rect = (top, height) => ({
        top, bottom: top + height, height,
        left: 0, right: 200, width: 200, x: 0, y: top, toJSON: () => ({})
    });
    container.querySelectorAll('[data-note-id]').forEach(card => {
        const index = Array.from(container.children).indexOf(card);
        card.getBoundingClientRect = () => rect(index * (CARD_H + GAP), CARD_H);
    });
    container.getBoundingClientRect = () => rect(0, 400);
}

function renderNotes(noteIds) {
    const container = document.getElementById('notesList');
    container.innerHTML = '';
    window.state.notes = noteIds.map((id, i) => ({ id, order: i }));
    noteIds.forEach(id => {
        const card = document.createElement('div');
        card.dataset.noteId = id;
        card.innerHTML = '<div><span></span></div>';
        attachNoteDragHandle(card);
        container.appendChild(card);
    });
    layout();
    return container;
}

function pointer(type, y, target) {
    const event = new Event(type, { bubbles: true, cancelable: true });
    event.pointerId = 1;
    event.button = 0;
    event.clientY = y;
    target.dispatchEvent(event);
    return event;
}

const orderIds = () => Array.from(document.querySelectorAll('#notesList [data-note-id]'))
    .map(el => el.dataset.noteId);

describe('notes drag and drop', () => {
    let reorderNotes;

    beforeEach(() => {
        document.body.innerHTML = '<div id="notesList"></div>';
        reorderNotes = vi.fn().mockResolvedValue([]);
        window.storageAdapter = { reorderNotes };
        window.showToast = vi.fn();
        window.renderNotesList = vi.fn();
        window.state = { notes: [] };
    });

    afterEach(() => vi.restoreAllMocks());

    it('adds a grip to each card', () => {
        const container = renderNotes(['a', 'b']);
        expect(container.querySelectorAll('.note-drag-handle')).toHaveLength(2);
    });

    it('reserves space for the grip on the card', () => {
        const container = renderNotes(['a', 'b']);
        expect(container.querySelector('[data-note-id="a"]').classList.contains('pl-10')).toBe(true);
    });

    it('does not open the note when the grip is clicked', () => {
        const container = renderNotes(['a', 'b']);
        const card = container.querySelector('[data-note-id="a"]');
        const opened = vi.fn();
        card.onclick = opened;

        card.querySelector('.note-drag-handle').click();

        expect(opened).not.toHaveBeenCalled();
    });

    it('is not dragging before any interaction', () => {
        renderNotes(['a', 'b']);
        expect(isNotesDragging()).toBe(false);
    });

    it('ignores a press on the card body, leaving click-to-open intact', () => {
        const container = renderNotes(['a', 'b']);
        pointer('pointerdown', 5, container.querySelector('[data-note-id="a"] span'));
        expect(isNotesDragging()).toBe(false);
    });

    it('starts dragging from the grip', () => {
        const container = renderNotes(['a', 'b']);
        pointer('pointerdown', 5, container.querySelector('[data-note-id="a"] .note-drag-handle'));
        expect(isNotesDragging()).toBe(true);
    });

    it('does not start a drag with only one note', () => {
        const container = renderNotes(['a']);
        pointer('pointerdown', 5, container.querySelector('.note-drag-handle'));
        expect(isNotesDragging()).toBe(false);
    });

    it('moves a card downward past the cards it passes', () => {
        const container = renderNotes(['a', 'b', 'c', 'd']);
        pointer('pointerdown', 5, container.querySelector('[data-note-id="a"] .note-drag-handle'));
        pointer('pointermove', 100, container);
        expect(orderIds()).toEqual(['b', 'c', 'a', 'd']);
    });

    it('moves a card upward past the cards it passes', () => {
        const container = renderNotes(['a', 'b', 'c', 'd']);
        pointer('pointerdown', 100, container.querySelector('[data-note-id="d"] .note-drag-handle'));
        pointer('pointermove', 5, container);
        expect(orderIds()).toEqual(['d', 'a', 'b', 'c']);
    });

    it('leaves the order untouched when the pointer does not cross a midpoint', () => {
        const container = renderNotes(['a', 'b', 'c']);
        pointer('pointerdown', 5, container.querySelector('[data-note-id="a"] .note-drag-handle'));
        pointer('pointermove', 25, container);
        expect(orderIds()).toEqual(['a', 'b', 'c']);
    });

    it('clears the drag state and DOM classes on release', () => {
        const container = renderNotes(['a', 'b']);
        pointer('pointerdown', 5, container.querySelector('[data-note-id="a"] .note-drag-handle'));
        pointer('pointermove', 100, container);
        pointer('pointerup', 100, container);

        expect(isNotesDragging()).toBe(false);
        expect(document.querySelector('.note-dragging')).toBeNull();
        expect(document.body.classList.contains('note-drag-active')).toBe(false);
    });

    it('treats pointercancel as a release', () => {
        const container = renderNotes(['a', 'b']);
        pointer('pointerdown', 5, container.querySelector('[data-note-id="a"] .note-drag-handle'));
        pointer('pointercancel', 5, container);
        expect(isNotesDragging()).toBe(false);
    });

    it('persists the new ranks after the drop', async () => {
        const container = renderNotes(['a', 'b', 'c']);
        pointer('pointerdown', 5, container.querySelector('[data-note-id="a"] .note-drag-handle'));
        pointer('pointermove', 100, container);
        await pointer('pointerup', 100, container);

        expect(reorderNotes).toHaveBeenCalledWith([
            { id: 'b', order: 0 },
            { id: 'c', order: 1 },
            { id: 'a', order: 2 }
        ]);
    });

    it('writes only the entries whose rank actually changed', async () => {
        // 'b' dragged down one slot: 'a' and 'd' keep their ranks untouched.
        const container = renderNotes(['a', 'b', 'c', 'd']);
        pointer('pointerdown', 45, container.querySelector('[data-note-id="b"] .note-drag-handle'));
        pointer('pointermove', 100, container);
        await pointer('pointerup', 100, container);

        expect(orderIds()).toEqual(['a', 'c', 'b', 'd']);
        expect(reorderNotes).toHaveBeenCalledWith([
            { id: 'c', order: 1 },
            { id: 'b', order: 2 }
        ]);
    });

    it('does not write when the drop lands on the original position', async () => {
        const container = renderNotes(['a', 'b']);
        pointer('pointerdown', 5, container.querySelector('[data-note-id="a"] .note-drag-handle'));
        pointer('pointermove', 5, container);
        await pointer('pointerup', 5, container);

        expect(reorderNotes).not.toHaveBeenCalled();
    });

    it('updates state so the next render keeps the new order', async () => {
        const container = renderNotes(['a', 'b', 'c']);
        pointer('pointerdown', 5, container.querySelector('[data-note-id="a"] .note-drag-handle'));
        pointer('pointermove', 100, container);
        await pointer('pointerup', 100, container);

        expect(window.state.notes.map(n => n.id)).toEqual(['b', 'c', 'a']);
        expect(window.state.notes.map(n => n.order)).toEqual([0, 1, 2]);
    });

    it('notifies the user and re-renders when the write fails', async () => {
        reorderNotes.mockRejectedValue(new Error('offline'));
        const container = renderNotes(['a', 'b']);
        pointer('pointerdown', 5, container.querySelector('[data-note-id="a"] .note-drag-handle'));
        pointer('pointermove', 100, container);
        await pointer('pointerup', 100, container);
        await Promise.resolve();

        expect(window.showToast).toHaveBeenCalledWith('Could not save the new note order.', 'warning');
    });

    it('refuses to write when the rendered cards are only a subset', async () => {
    // State holds four notes but only two cards rendered: the DOM sequence
    // cannot describe the full collection, so it must not become ranks.
    const container = renderNotes(['a', 'b', 'c', 'd']);
    ['c', 'd'].forEach(id => container.removeChild(container.querySelector(`[data-note-id="${id}"]`)));
    layout();

    pointer('pointerdown', 5, container.querySelector('[data-note-id="a"] .note-drag-handle'));
    pointer('pointermove', 100, container);
    await pointer('pointerup', 100, container);

    expect(reorderNotes).not.toHaveBeenCalled();
    expect(window.renderNotesList).toHaveBeenCalled();
});
});
