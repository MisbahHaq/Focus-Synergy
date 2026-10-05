import { pendingOrderUpdates } from '../utils/notes-order.js';

const CONTAINER_ID = 'notesList';
const CARD_SELECTOR = '[data-note-id]';
const EDGE_SCROLL_ZONE = 32;
const EDGE_SCROLL_STEP = 12;

let dragState = null;
let boundContainer = null;

export function isNotesDragging() {
    return dragState !== null;
}

function getContainer() {
    return document.getElementById(CONTAINER_ID);
}

function getCards() {
    const container = getContainer();
    return container ? Array.from(container.querySelectorAll(CARD_SELECTOR)) : [];
}

/**
 * Adds the grip affordance to a rendered card. Only the grip starts a drag, so
 * the card body keeps its normal click-to-open behaviour.
 */
export function attachNoteDragHandle(card) {
    const handle = document.createElement('button');
    handle.type = 'button';
    handle.className = 'note-drag-handle absolute left-1.5 top-1/2 -translate-y-1/2 p-1 text-zinc-300 dark:text-zinc-600 hover:text-ink dark:hover:text-white cursor-grab active:cursor-grabbing touch-none transition';
    handle.title = 'Drag to reorder';
    handle.setAttribute('aria-label', 'Drag to reorder note');
    handle.innerHTML = '<i data-lucide="grip-vertical" class="w-4 h-4"></i>';

    card.prepend(handle);
    // The grip is absolutely positioned over the card, so the text needs room.
    card.classList.add('pl-10');
    // A drag ends on the handle, so the click that follows must not open the note.
    handle.addEventListener('click', e => e.stopPropagation());

    bindListeners();
}

/** Pointer capture is not universally available; the drag works without it. */
function capturePointer(el, pointerId) {
    if (typeof el.setPointerCapture !== 'function') return;
    try {
        el.setPointerCapture(pointerId);
    } catch {
        // Pointer already released, or capture unsupported for this pointer.
    }
}

function releasePointer(el, pointerId) {
    if (typeof el.hasPointerCapture !== 'function' || !el.hasPointerCapture(pointerId)) return;
    try {
        el.releasePointerCapture(pointerId);
    } catch {
        // Already released.
    }
}

/**
 * Pointer Events rather than HTML5 drag-and-drop: HTML5 DnD is unreliable inside
 * Tauri's WebViews and has no touch or pen support.
 */
function bindListeners() {
    const container = getContainer();
    if (!container || container === boundContainer) return;

    // The previous list may have been torn down mid-drag (tab switch, logout).
    // Clearing here stops a stale drag from blocking every future render.
    endDrag();
    boundContainer = container;

    container.addEventListener('pointerdown', onPointerDown);
    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerup', onPointerUp);
    container.addEventListener('pointercancel', onPointerUp);
}

function onPointerDown(event) {
    const handle = event.target.closest('.note-drag-handle');
    if (!handle || event.button !== 0) return;

    const card = handle.closest(CARD_SELECTOR);
    if (!card || getCards().length < 2) return;

    event.preventDefault();
    event.stopPropagation();
    capturePointer(handle, event.pointerId);

    dragState = { card, handle, container: card.parentElement, pointerId: event.pointerId, startY: event.clientY };
    card.classList.add('note-dragging');
    document.body.classList.add('note-drag-active');
}

function onPointerMove(event) {
    const state = dragState;
    if (!state || event.pointerId !== state.pointerId) return;
    event.preventDefault();

    const { card, container } = state;
    card.style.transform = `translateY(${event.clientY - state.startY}px)`;

    // The dragged card belongs immediately before the first sibling whose
    // midpoint sits below the pointer.
    let target = null;
    for (const sibling of getCards()) {
        if (sibling === card) continue;
        const rect = sibling.getBoundingClientRect();
        if (event.clientY < rect.top + rect.height / 2) {
            target = sibling;
            break;
        }
    }

    if (card.nextElementSibling !== target) {
        const before = card.getBoundingClientRect().top;
        container.insertBefore(card, target);
        // Shifting the baseline by the layout delta keeps the card visually still.
        state.startY += card.getBoundingClientRect().top - before;
        card.style.transform = `translateY(${event.clientY - state.startY}px)`;
    }

    const bounds = container.getBoundingClientRect();
    if (event.clientY < bounds.top + EDGE_SCROLL_ZONE) container.scrollTop -= EDGE_SCROLL_STEP;
    else if (event.clientY > bounds.bottom - EDGE_SCROLL_ZONE) container.scrollTop += EDGE_SCROLL_STEP;
}

/** Clears drag state and the visual affordances it owns. */
function endDrag(event) {
    const state = dragState;
    if (!state) return;

    dragState = null;
    state.card.style.transform = '';
    state.card.classList.remove('note-dragging');
    document.body.classList.remove('note-drag-active');
    if (event) releasePointer(state.handle, event.pointerId);
}

function onPointerUp(event) {
    if (!dragState || event.pointerId !== dragState.pointerId) return;

    endDrag(event);

    const orderedIds = getCards().map(el => el.dataset.noteId);
    const byId = new Map(window.state.notes.map(n => [n.id, n]));
    const reordered = orderedIds.map(id => byId.get(id)).filter(Boolean);

    // A subset render (e.g. the search box changed mid-drag) does not describe
    // the full collection, so its positions cannot be turned into ranks.
    if (reordered.length !== window.state.notes.length) {
        if (typeof window.renderNotesList === 'function') window.renderNotesList();
        return;
    }

    // The stored `order` values still describe the old sequence, so the diff has
    // to be taken before the DOM order is written back onto the notes.
    const updates = pendingOrderUpdates(reordered);
    reordered.forEach((note, index) => { note.order = index; });
    window.state.notes = reordered;

    if (typeof window.renderNotesList === 'function') window.renderNotesList();
    if (updates.length === 0) return;

    window.storageAdapter.reorderNotes(updates).catch(e => {
        console.error('[NOTES] failed to persist note order:', e);
        if (typeof window.showToast === 'function') {
            window.showToast('Could not save the new note order.', 'warning');
        }
    });
}