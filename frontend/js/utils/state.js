const globalListeners = new Map();

export function createStore(initialState) {
 const store = new Proxy(initialState, {
 set(target, key, value) {
 const old = target[key];
 target[key] = value;
 if (old !== value && globalListeners.has(key)) {
 globalListeners.get(key).forEach(fn => fn(value, old));
 }
 return true;
 },
 get(target, key) {
 if (typeof target[key] === 'object' && target[key] !== null) {
 return target[key];
 }
 return target[key];
 },
 });
 return store;
}

export function subscribe(key, fn) {
 if (!globalListeners.has(key)) globalListeners.set(key, new Set());
 globalListeners.get(key).add(fn);
 return () => globalListeners.get(key).delete(fn);
}

export function showError(message, context = '') {
 const toast = document.createElement('div');
 toast.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-3 border-2 border-black dark:border-white shadow-brutal text-xs font-extrabold uppercase tracking-wider bg-coral dark:bg-coral text-black flex items-center gap-2 max-w-sm';
 toast.innerHTML = `<span>${message}</span>`;
 document.body.appendChild(toast);
 setTimeout(() => {
 toast.classList.add('opacity-0', 'translate-y-2');
 toast.style.transition = 'opacity 0.3s, transform 0.3s';
 setTimeout(() => toast.remove(), 300);
 }, 5000);
 if (context) console.error(`[${context}] ${message}`);
}

export function showConfirm(message) {
 return new Promise(resolve => {
 const overlay = document.createElement('div');
 overlay.className = 'fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 tab-enter';
 overlay.innerHTML = `
 <div class="bg-white dark:bg-[#262626] border-2 border-black dark:border-white shadow-brutal-lg max-w-sm w-full p-6 space-y-4">
 <p class="text-sm text-black dark:text-white font-bold">${message}</p>
 <div class="flex justify-end gap-2">
 <button id="confirm-cancel" class="px-4 py-2 bg-zinc-100 dark:bg-[#1a1a1a] border-2 border-black dark:border-white text-black dark:text-white font-extrabold uppercase text-xs tracking-wider shadow-brutal-sm hover:shadow-brutal transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-none">Cancel</button>
 <button id="confirm-ok" class="px-4 py-2 bg-canary dark:bg-canary border-2 border-black dark:border-white text-black dark:text-black font-extrabold uppercase text-xs tracking-wider shadow-brutal-sm hover:shadow-brutal transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-none">OK</button>
 </div>
 </div>`;
 document.body.appendChild(overlay);
 document.getElementById('confirm-cancel').onclick = () => { overlay.remove(); resolve(false); };
 document.getElementById('confirm-ok').onclick = () => { overlay.remove(); resolve(true); };
 overlay.addEventListener('click', e => { if (e.target === overlay) { overlay.remove(); resolve(false); } });
 });
}