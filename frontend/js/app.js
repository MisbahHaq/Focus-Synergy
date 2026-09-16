
import '../css/styles.css';

import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, addDoc, doc, setDoc, getDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy } from "firebase/firestore";
import { getAuth, getRedirectResult, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signInWithRedirect, updateProfile } from "firebase/auth";
import { createIcons, icons } from 'lucide';

import { createStorageAdapter } from './storage/index.js';
 import { checkBreakReminder, resetTimerNotificationState } from './modules/notifications.js';
 import { calculateSeasonRetrospective, renderRetrospectiveModal } from './modules/retrospective.js';
 import { startOnboardingTour } from './modules/onboarding.js';
 import { isTauriEnv } from './utils/tauri.js';
 import { escapeHtml } from './utils/sanitize.js';
 import { formatTimeHMS, formatHoursAndMins, formatDateRange, getLocalDateStr } from './utils/format.js';
 import { showToast, playSound } from './utils/ui.js';
 import { toggleTheme, applySavedTheme, applyTheme, updateThemeIcon } from './utils/theme.js';
import { createStore, subscribe, showError, showConfirm } from './utils/state.js';

 const GOOGLE_USE_REDIRECT = typeof window !== "undefined" && !!window.__TAURI_INTERNALS__;
 const firebaseConfig = window.__FIREBASE_CONFIG__ || {};

 let _firebaseApp = null;
 let _firestore = null;
 let _authInstance = null;

 function ensureFirebase() {
 if (_firebaseApp) return _firebaseApp;
 if (!firebaseConfig.apiKey) return null;
 if (getApps().length === 0) {
 _firebaseApp = initializeApp(firebaseConfig);
 } else {
 _firebaseApp = getApps()[0];
 }
 return _firebaseApp;
 }

 function getAuthInstance() {
 if (_authInstance) return _authInstance;
 const app = ensureFirebase();
 if (!app) return null;
 _authInstance = getAuth(app);
 return _authInstance;
 }

 function getFirestoreDb() {
 if (_firestore) return _firestore;
 const app = ensureFirebase();
 if (!app) return null;
 _firestore = getFirestore(app);
 return _firestore;
 }

 window.state = createStore({
 user: null,
 items: [], 
 logs: [], 
 notes: [],
 seasons: [],
 backlog: [],
 dailyLogs: [],
 habitLogs: [],
 selectedItemId: null,
 selectedNoteId: null,
 selectedSeasonId: null,
 currentCalendarDate: new Date(),
 dailyEnergyMode: 'production',
 backlogOpen: false,
 breakNotificationsEnabled: true,
 breakThresholdMinutes: 50,
 storageMode: 'cloud'
 });

 // Pre-register critical globals so inline event handlers (onclick, oninput)
 // always find a function, even if the module fails partway through.
 window.switchTab = window.switchTab || switchTab;
 window.showTab = window.showTab || showTab;

 window.addEventListener('error', (e) => {
 console.error('[GLOBAL-ERROR]', e.message, 'at', e.filename, ':', e.lineno);
 });

 window.addEventListener('unhandledrejection', (e) => {
 console.error('[UNHANDLED-REJECTION]', e.reason);
 });

 window.checkForUpdates = async function() {
 if (!isTauriEnv() || !window.__TAURI__?.updater?.checkUpdate) {
 window.showToast('Update check is only available in the desktop app.', 'warning');
 return;
 }
 try {
 const { checkUpdate } = window.__TAURI__.updater;
 const update = await checkUpdate();
 if (update) {
 window.showToast(`Update available: ${update.version}. Restart to install.`, 'info');
 } else {
 window.showToast('You are on the latest version.', 'info');
 }
 } catch (e) {
 console.error('Update check failed:', e);
 window.showToast('Failed to check for updates.', 'warning');
 }
 };

 window.storageAdapter = null;
 let unsubscribers = [];
 let bootInProgress = false;

 const soundFiles = {
 'nav tap': 'sounds/nav-tap.mp3',
 'timer start': 'sounds/timer-start.wav'
 };

 window.playSound = function(name) {
 const src = soundFiles[name];
 if (!src) return;
 const audio = new Audio(src);
 audio.volume = 0.5;
 audio.play().catch(() => {});
 }

 window.showToast = showToast;

 let coreGlobalLoop = null;

 // Immediately force recalculation on visibility change & window focus to eliminate timer drift
 window.addEventListener('visibilitychange', () => {
 if (document.visibilityState === 'visible') {
 processingEngineCycle();
 }
 });
 window.addEventListener('focus', () => {
 processingEngineCycle();
 });

 async function bootWorkspaceForUser(user, animate = false) {
 try {
 window.state.user = user;
 const userDisplay = document.getElementById('userDisplay');

  userDisplay.innerHTML = `<span class="truncate max-w-[120px]">${escapeHtml(user.displayName || user.email)}</span> <button onclick="logout()" class="shrink-0 text-red-500 dark:text-red-400 hover:text-red-300 text-xs underline font-bold">Exit</button>`;
 // Initialize StorageAdapter
 try {
 window.storageAdapter = await createStorageAdapter(
 'cloud',
 getFirestoreDb(),
 () => window.state.user?.uid
 );
 } catch (adapterErr) {
 console.error('[BOOT] createStorageAdapter FAILED:', adapterErr);
 throw adapterErr;
 }
 // Clean previous listeners
 unsubscribers.forEach(u => typeof u === 'function' && u());
 unsubscribers = [];

 // Throttle expensive renders so multiple subscription callbacks don't
 // hammer the DOM during the initial boot sync.
 const renderTimers = {};
 function scheduleRender(key, fn, delay = 80) {
 if (renderTimers[key]) {
 cancelAnimationFrame(renderTimers[key]);
 }
 renderTimers[key] = requestAnimationFrame(() => {
 renderTimers[key] = setTimeout(() => {
 renderTimers[key] = null;
 fn();
 }, delay);
 });
 }

 // 1. Subscribe to Items
 const unsubItems = window.storageAdapter.subscribe('items', (data) => {
 const userItems = data.filter(item => item.userId === user.uid);
 window.state.items = userItems.map(item => ({
 ...item,
 isRunning: item.isRunning || false,
 accumulatedSeconds: item.accumulatedSeconds || 0
 }));
 
 checkStaleTimersOnLoad().catch(e => console.error('Stale timer check failed:', e));

 scheduleRender('dashboard', renderDashboard);
 scheduleRender('analytics', renderAnalyticsViews);
 scheduleRender('calendar', renderCalendarViews);
 });
 unsubscribers.push(unsubItems);
 // 2. Subscribe to Logs
 const unsubLogs = window.storageAdapter.subscribe('logs', (data) => {
 window.state.logs = data.filter(log => log.userId === user.uid);
 scheduleRender('dashboard', renderDashboard);
 scheduleRender('analytics', renderAnalyticsViews);
 scheduleRender('calendar', renderCalendarViews);
 });
 unsubscribers.push(unsubLogs);
 // 3. Subscribe to Notes
 const unsubNotes = window.storageAdapter.subscribe('notes', (data) => {
 window.state.notes = data.filter(n => n.userId === user.uid);
 scheduleRender('notes', renderNotesList);
 refreshQuickNotesSidebar();
 });
 unsubscribers.push(unsubNotes);

 // 4. Subscribe to Seasons
 const unsubSeasons = window.storageAdapter.subscribe('seasons', (data) => {
 window.state.seasons = data.filter(s => s.userId === user.uid);
 scheduleRender('seasons', renderSeasonsView);
 });
 unsubscribers.push(unsubSeasons);
 // 5. Subscribe to Backlog
 const unsubBacklog = window.storageAdapter.subscribe('backlog', (data) => {
 window.state.backlog = data.filter(b => b.userId === user.uid);
 scheduleRender('seasons', renderSeasonsView);
 });
 unsubscribers.push(unsubBacklog);
 // 6. Subscribe to Daily Logs
 const unsubDaily = window.storageAdapter.subscribe('dailyLogs', (data) => {
 window.state.dailyLogs = data.filter(d => d.userId === user.uid);
 scheduleRender('seasons', renderSeasonsView);
 });
 unsubscribers.push(unsubDaily);
 // 7. Subscribe to Habit Logs
 const unsubHabit = window.storageAdapter.subscribe('habitLogs', (data) => {
 window.state.habitLogs = data.filter(h => h.userId === user.uid);
 scheduleRender('seasons', renderSeasonsView);
 });
 unsubscribers.push(unsubHabit);
 // 8. Subscribe to Meta ActiveTimer (Multi-Device Single Active Timer Invariant)
 const unsubActiveTimer = window.storageAdapter.subscribe('meta/activeTimer', (activeTimerDoc) => {
 if (!activeTimerDoc) return;
 const runningItem = window.state.items.find(i => i.isRunning);
 if (runningItem && activeTimerDoc.itemId && activeTimerDoc.itemId !== runningItem.id) {
 runningItem.isRunning = false;
 renderDashboard();
 window.showToast("Timer moved to another device.", "warning");
 }
 });
 unsubscribers.push(unsubActiveTimer);
 if (coreGlobalLoop) clearInterval(coreGlobalLoop);
 coreGlobalLoop = setInterval(processingEngineCycle, 1000);
 // Show main app immediately - don't block on animation.
 // Kick off a quick non-blocking cross-fade so the transition feels smooth
 // without delaying data binding or subscriptions.
 if (animate) {
 loginScreen.classList.add('screen-exit');
 mainApp.classList.remove('hidden');
 mainApp.classList.add('screen-enter');
 loginScreen.addEventListener('animationend', function handler() {
 loginScreen.removeEventListener('animationend', handler);
 loginScreen.classList.add('hidden');
 });
 mainApp.addEventListener('animationend', function handler() {
 mainApp.removeEventListener('animationend', handler);
 mainApp.classList.remove('screen-enter');
 });
 } else {
 loginScreen.classList.add('hidden');
 mainApp.classList.remove('hidden');
 }
 // Silent startup update check for desktop app
 if (isTauriEnv() && window.__TAURI__?.updater?.checkUpdate) {
 window.__TAURI__.updater.checkUpdate().then(update => {
 if (update) {
 window.showToast(`Update available: ${update.version}. Restart to install.`, 'info');
 }
 }).catch(() => {});
 }

 // Check onboarding tour flag
 const hasSeen = localStorage.getItem(`onboarding_seen_${user.uid}`);
 if (!hasSeen) {
 try {
 startOnboardingTour(() => {
 localStorage.setItem(`onboarding_seen_${user.uid}`, 'true');
 });
 } catch (tourErr) {
 console.error('[BOOT] onboarding tour FAILED:', tourErr);
 }
 } else {
 }
 } catch (err) {
 console.error('Workspace boot failed:', err);
 showToast('Failed to load workspace. Please try again.', 'error');
 bootInProgress = false;
 window._pendingLoginAnimation = false;
 setAuthLoading(false);
 const loginScreen = document.getElementById('loginScreen');
 const mainApp = document.getElementById('mainApp');
 if (loginScreen) {
 loginScreen.classList.remove('hidden', 'screen-exit');
 loginScreen.style.opacity = '';
 }
 if (mainApp) {
 mainApp.classList.add('hidden', 'screen-enter');
 mainApp.style.transition = '';
 mainApp.style.opacity = '';
 }
 }
 }

 async function checkStaleTimersOnLoad() {
 const now = Date.now();
 const staleItems = window.state.items.filter(item => item.isRunning && item.startedAt && (now - item.startedAt) > 24 * 60 * 60 * 1000);
 
 for (const item of staleItems) {
 const confirmReset = await showConfirm(`Timer for "${item.name || 'Item'}" was left running for > 24 hours. Do you want to reset this session?`);
 if (confirmReset && window.storageAdapter) {
 await window.storageAdapter.stopItemTimer(item.id, item.accumulatedSeconds || 0);
 }
 }
 }

 window.addEventListener('DOMContentLoaded', () => {
 createIcons({icons});
 applySavedTheme();
 showTab('loginTab');
 saveButtonOriginals();

 if (getAuthInstance()) {
 onAuthStateChanged(getAuthInstance(), async (user) => {
 if (user) {
 if (bootInProgress) {
 return;
 }
 bootInProgress = true;
 const animate = !!window._pendingLoginAnimation;
 window._pendingLoginAnimation = false;
 setAuthLoading(false);
 try {
 await bootWorkspaceForUser(user, animate);
 } catch (err) {
 console.error('[AUTH] bootWorkspaceForUser threw:', err);
 }
 bootInProgress = false;
 } else {
 document.getElementById('loginScreen').classList.remove('hidden');
 document.getElementById('mainApp').classList.add('hidden');
 }
 });
 }
 });

 window.register = async function() {
 const name = document.getElementById('registerName').value;
 const email = document.getElementById('registerEmail').value;
 const password = document.getElementById('registerPassword').value;
 
 try {
 setAuthLoading(true);
 window._pendingLoginAnimation = true;
 const cred = await authWithTimeout(createUserWithEmailAndPassword(getAuthInstance(), email, password));
 await authWithTimeout(updateProfile(cred.user, { displayName: name }));
 await authWithTimeout(setDoc(doc(getFirestoreDb(), 'users', cred.user.uid), { name: name, email: email }));
 document.getElementById('registerName').value = '';
 document.getElementById('registerEmail').value = '';
 document.getElementById('registerPassword').value = '';
 document.getElementById('registerError').innerText = '';
 setAuthLoading(false);
 } catch (e) {
 document.getElementById('registerError').innerText = e.message;
 window._pendingLoginAnimation = false;
 setAuthLoading(false);
 }
 };

 function setAuthLoading(loading) {
 const map = [
 ['btn-login', 'login-spinner', 'login-text', 'Signing in...'],
 ['btn-register', 'register-spinner', 'register-text', 'Creating account...'],
 ['btn-google', 'google-spinner', 'google-text', 'Connecting...']
 ];
 map.forEach(([btnId, spinnerId, textId, loadingText]) => {
 const btn = document.getElementById(btnId);
 const spinner = document.getElementById(spinnerId);
 const text = document.getElementById(textId);
 if (!btn || !spinner || !text) return;
 btn.disabled = loading;
 spinner.classList.toggle('hidden', !loading);
 text.textContent = loading ? loadingText : text.dataset.original || text.textContent;
 });
 }

 function saveButtonOriginals() {
 const map = [
 ['login-text', 'Sign In'],
 ['register-text', 'Create Account'],
 ['google-text', 'Continue with Google']
 ];
 map.forEach(([id, original]) => {
 const el = document.getElementById(id);
 if (el) el.dataset.original = original;
 });
 }

 function authWithTimeout(promise, timeoutMs = 10000) {
 return Promise.race([
 promise,
 new Promise((_, reject) =>
 setTimeout(() => reject(new Error('Login timed out. Please check your internet connection and try again.')), timeoutMs)
 )
 ]);
 }

 window.login = async function() {
 const email = document.getElementById('loginEmail').value;
 const password = document.getElementById('loginPassword').value;
 
 try {
 setAuthLoading(true);
 window._pendingLoginAnimation = true;
 await authWithTimeout(signInWithEmailAndPassword(getAuthInstance(), email, password));
 document.getElementById('loginEmail').value = '';
 document.getElementById('loginPassword').value = '';
 document.getElementById('loginError').innerText = '';
 setAuthLoading(false);
 } catch (e) {
 console.error('[LOGIN] signInWithEmailAndPassword failed:', e);
 document.getElementById('loginError').innerText = e.message;
 window._pendingLoginAnimation = false;
 setAuthLoading(false);
 }
 };

 window.logout = async function() {
 if (coreGlobalLoop) {
 clearInterval(coreGlobalLoop);
 coreGlobalLoop = null;
 }
 unsubscribers.forEach(u => typeof u === 'function' && u());
 unsubscribers = [];
 Object.assign(window.state, {
 user: null,
 items: [],
 logs: [],
 notes: [],
 seasons: [],
 backlog: [],
 dailyLogs: [],
 habitLogs: [],
 selectedItemId: null,
 selectedNoteId: null,
 selectedSeasonId: null,
 currentCalendarDate: new Date(),
 dailyEnergyMode: 'production',
 backlogOpen: false,
 breakNotificationsEnabled: true,
 breakThresholdMinutes: 50,
 storageMode: 'cloud'
 });
 const authInst = getAuthInstance();
 if (authInst) await signOut(authInst);
 document.getElementById('loginEmail').value = '';
 document.getElementById('loginPassword').value = '';
 document.getElementById('registerName').value = '';
 document.getElementById('registerEmail').value = '';
 document.getElementById('registerPassword').value = '';
 showTab('loginTab');
 };

 window.googleLogin = async function() {
 const provider = new GoogleAuthProvider();
 provider.setCustomParameters({ prompt: 'select_account' });
 try {
 setAuthLoading(true);
 window._pendingLoginAnimation = true;
 // Google OAuth popup/redirect flows can take >10s (account picker, consent
 // screen), so do NOT wrap them in authWithTimeout like email/password.
 if (GOOGLE_USE_REDIRECT) {
 await signInWithRedirect(getAuthInstance(), provider);
 } else {
 await signInWithPopup(getAuthInstance(), provider);
 }
 setAuthLoading(false);
 } catch (e) {
 console.error('[GOOGLE LOGIN] Failed:', e.code, e.message);
 const friendly = friendlyAuthError(e);
 document.getElementById('loginError').innerText = friendly;
 window._pendingLoginAnimation = false;
 setAuthLoading(false);
 }
 };

 function friendlyAuthError(e) {
 const code = e.code || '';
 if (code === 'auth/operation-not-allowed' || code === 'auth/admin-restricted-operation') {
 return 'Google sign-in is not enabled for this Firebase project. Enable it in Firebase Console → Authentication → Sign-in method.';
 }
 if (code === 'auth/unauthorized-domain') {
 return 'This domain is not authorized for Google sign-in. Add it in Firebase Console → Authentication → Settings → Authorized domains.';
 }
 if (code === 'auth/popup-blocked') {
 return 'Google sign-in popup was blocked by your browser. Allow popups for this site and try again.';
 }
 if (code === 'auth/popup-closed-by-user') {
 return 'Google sign-in was cancelled. Please try again.';
 }
 if (code === 'auth/cancelled-popup-request') {
 return 'Another Google sign-in is already in progress. Wait a moment and try again.';
 }
 if (code === 'auth/network-request-failed') {
 return 'Network error while signing in. Check your connection and try again.';
 }
 return e.message || 'Google sign-in failed. Please try again.';
 }

 if (GOOGLE_USE_REDIRECT) {
 const redirectAuth = getAuthInstance();
 if (redirectAuth) getRedirectResult(redirectAuth).catch((e) => {
 console.error("Google redirect sign-in failed:", e);
 });
 }

 function syncCollection(collectionName, orderField, callback) {
 const userId = window.state.user.uid;
 const fdb = getFirestoreDb();
 if (!fdb) return;
 const q = query(collection(fdb, 'users', userId, collectionName), orderBy(orderField, "asc"));
 onSnapshot(q, (snapshot) => {
 const dataArray = [];
 snapshot.forEach((doc) => {
 dataArray.push({ id: doc.id, ...doc.data() });
 });
 callback(dataArray);
 }, (error) => {
 console.error(`Error reading database stream for ${collectionName}:`, error);
 });
 }

 window.addItem = async function() {
 const nameInput = document.getElementById('newItemName');
 const typeInput = document.getElementById('newItemType');
 const name = nameInput.value.trim();
 if (!name || !window.storageAdapter) return;

 const newItem = {
 name: name,
 type: typeInput.value,
 createdAt: new Date().toISOString(),
 isRunning: false,
 accumulatedSeconds: 0,
 startedAt: null,
 userId: window.state.user.uid
 };

 try {
 await window.storageAdapter.createItem(newItem);
 nameInput.value = '';
 } catch(e) {
 console.error("Storage error creating item", e);
 }
 };

 window.deleteItem = async function(id, event) {
 if (event) event.stopPropagation();
 if (window.state.selectedItemId === id) {
 window.state.selectedItemId = null;
 syncActiveMonitorPanel();
 }
 try {
 await window.storageAdapter.deleteItem(id);
 } catch(e) {
 console.error("Storage error deleting item", e);
 }
 };

 function announceTimer(msg) {
 const el = document.getElementById('timerA11y');
 if (el) el.textContent = msg;
 }

 window.toggleTimer = async function() {
 const activeItem = window.state.items.find(i => i.id === window.state.selectedItemId);
 if (!activeItem || !window.storageAdapter) return;

 const now = Date.now();

 if (activeItem.isRunning) {
 const elapsed = Math.floor((now - activeItem.startedAt) / 1000);
 const newAccumulated = (activeItem.accumulatedSeconds || 0) + elapsed;
 await window.storageAdapter.stopItemTimer(activeItem.id, newAccumulated);
 resetTimerNotificationState(activeItem.id);
 announceTimer(`Timer paused for ${activeItem.name}`);
 } else {
 playSound('timer start');
 await window.storageAdapter.startItemTimer(activeItem.id, now);
 announceTimer(`Timer started for ${activeItem.name}`);
 }
 };

 window.logTimer = async function() {
 const activeItem = window.state.items.find(i => i.id === window.state.selectedItemId);
 if (!activeItem || !window.storageAdapter) return;

 let totalLogged = activeItem.accumulatedSeconds || 0;
 if (activeItem.isRunning && activeItem.startedAt) {
 totalLogged += Math.floor((Date.now() - activeItem.startedAt) / 1000);
 }

 if (totalLogged <= 0) return;

 playSound('nav tap');

 try {
 await window.storageAdapter.createLog({
 itemId: activeItem.id,
 timestamp: new Date().toISOString(),
 seconds: totalLogged,
 userId: window.state.user.uid
 });

 await window.storageAdapter.stopItemTimer(activeItem.id, 0);
 resetTimerNotificationState(activeItem.id);
 announceTimer(`${formatTimeHMS(totalLogged)} logged for ${activeItem.name}`);
 } catch(e) {
 console.error("Error logging timer session", e);
 }
 };

 window.createNewNote = async function() {
 if (!window.storageAdapter) return;
 const defaultNote = {
 title: 'Untitled Concept',
 body: '',
 updatedAt: new Date().toISOString(),
 userId: window.state.user.uid
 };
 try {
 const created = await window.storageAdapter.upsertNote(defaultNote);
 window.state.selectedNoteId = created.id;
 renderNotesList();
 openNoteEditor(created.id);
 } catch(e) {
 console.error("Failed creating new note", e);
 }
 };

 window.saveCurrentNote = async function() {
 if (!window.state.selectedNoteId || !window.storageAdapter) return;
 const titleInput = document.getElementById('noteTitleInput').value;
 const bodyInput = document.getElementById('noteBodyInput').innerHTML;

 try {
 await window.storageAdapter.upsertNote({
 id: window.state.selectedNoteId,
 title: titleInput,
 body: bodyInput,
 updatedAt: new Date().toISOString(),
 userId: window.state.user.uid
 });
 } catch(e) {
 console.error("Error saving note", e);
 }
 };

 window.deleteNote = async function(id, event) {
 if (event) event.stopPropagation();
 if (window.state.selectedNoteId === id) {
 window.state.selectedNoteId = null;
 document.getElementById('noteEditor').classList.add('hidden');
 document.getElementById('noNotePlaceholder').classList.remove('hidden');
 }
 try {
 await window.storageAdapter.deleteNote(id);
 } catch(e) {
 console.error("Error deleting note", e);
 }
 };

 function processingEngineCycle() {
 const now = Date.now();
 window.state.items.forEach(item => {
 if (item.isRunning && item.startedAt) {
 const elapsed = Math.floor((now - item.startedAt) / 1000);
 const localLiveSec = (item.accumulatedSeconds || 0) + elapsed;
 
 const counterNode = document.getElementById(`live-timer-${item.id}`);
 if (counterNode) counterNode.innerText = formatTimeHMS(localLiveSec);
 
 if (window.state.selectedItemId === item.id) {
 const mainTimer = document.getElementById('timerDisplay');
 if (mainTimer) mainTimer.innerText = formatTimeHMS(localLiveSec);
 }

 // Session break reminder check
 checkBreakReminder(
 item,
 localLiveSec,
 window.state.breakThresholdMinutes,
 window.state.breakNotificationsEnabled
 );
 }
 });
 }

 function getActiveSeason() {
 return window.state.seasons.find(s => s.isActive && !s.isCompleted) || null;
 }

 window.openNewSeasonModal = function() {
 const existing = document.getElementById('newSeasonModalOverlay');
 if (existing) existing.remove();

 const modal = document.createElement('div');
 modal.id = 'newSeasonModalOverlay';
 modal.className = 'fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 tab-enter';
 modal.innerHTML = `
 <div class="bg-white dark:bg-[#262626] border-2 border-black dark:border-white shadow-brutal-lg max-w-lg w-full p-6 space-y-5 relative max-h-[90vh] overflow-y-auto">
 <div class="flex justify-between items-center border-b-2 border-black dark:border-white pb-3">
 <h3 class="text-lg font-extrabold uppercase tracking-wider text-black dark:text-white flex items-center gap-2">
 <span class="w-8 h-8 bg-mint dark:bg-mint border-2 border-black dark:border-white flex items-center justify-center"><i data-lucide="sprout" class="w-4 h-4 text-black"></i></span>
 New Season
 </h3>
 <button onclick="closeNewSeasonModal()" class="p-1 text-zinc-400 hover:text-black dark:hover:text-white border-2 border-transparent hover:border-black dark:hover:border-white">
 <i data-lucide="x" class="w-5 h-5"></i>
 </button>
 </div>

 <div class="space-y-4 text-sm">
 <div class="space-y-1.5">
 <label class="font-extrabold text-black dark:text-white uppercase tracking-widest text-xs">Season Title</label>
 <input type="text" id="newSeasonTitle" placeholder='e.g., "Foundations Q3"' class="w-full px-3 py-2 bg-zinc-100 dark:bg-[#1a1a1a] border-2 border-black dark:border-white text-black dark:text-white text-sm focus:outline-none focus:shadow-brutal font-medium">
 </div>

 <div class="space-y-1.5">
 <label class="font-extrabold text-black dark:text-white uppercase tracking-widest text-xs">Duration (weeks)</label>
 <select id="newSeasonWeeks" class="w-full px-3 py-2 bg-zinc-100 dark:bg-[#1a1a1a] border-2 border-black dark:border-white text-black dark:text-white text-sm focus:outline-none focus:shadow-brutal font-bold">
 <option value="4">4 weeks</option>
 <option value="5" selected>5 weeks</option>
 <option value="6">6 weeks</option>
 </select>
 </div>

 <div class="space-y-1.5">
 <label class="font-extrabold text-black dark:text-white uppercase tracking-widest text-xs">Professional / Developer Goal</label>
 <input type="text" id="newSeasonDevGoal" placeholder="What do you want to build or learn?" class="w-full px-3 py-2 bg-zinc-100 dark:bg-[#1a1a1a] border-2 border-black dark:border-white text-black dark:text-white text-sm focus:outline-none focus:shadow-brutal font-medium">
 </div>

 <div class="space-y-1.5">
 <label class="font-extrabold text-black dark:text-white uppercase tracking-widest text-xs">Personal / Spiritual / Hobby Goal</label>
 <input type="text" id="newSeasonPersonalGoal" placeholder="What personal growth area matters?" class="w-full px-3 py-2 bg-zinc-100 dark:bg-[#1a1a1a] border-2 border-black dark:border-white text-black dark:text-white text-sm focus:outline-none focus:shadow-brutal font-medium">
 </div>

 <div class="space-y-1.5">
 <label class="font-extrabold text-black dark:text-white uppercase tracking-widest text-xs">Dev / Professional Micro-Habit (daily minimum)</label>
 <input type="text" id="newSeasonDevMicro" placeholder='e.g., "30 min coding practice"' class="w-full px-3 py-2 bg-zinc-100 dark:bg-[#1a1a1a] border-2 border-black dark:border-white text-black dark:text-white text-sm focus:outline-none focus:shadow-brutal font-medium">
 </div>

 <div class="space-y-1.5">
 <label class="font-extrabold text-black dark:text-white uppercase tracking-widest text-xs">Personal Micro-Habit (daily minimum)</label>
 <input type="text" id="newSeasonPersonalMicro" placeholder='e.g., "10 min meditation"' class="w-full px-3 py-2 bg-zinc-100 dark:bg-[#1a1a1a] border-2 border-black dark:border-white text-black dark:text-white text-sm focus:outline-none focus:shadow-brutal font-medium">
 </div>
 </div>

 <div class="flex justify-end gap-2 pt-3 border-t-2 border-black dark:border-white">
 <button onclick="closeNewSeasonModal()" class="px-4 py-2 bg-zinc-100 dark:bg-[#1a1a1a] border-2 border-black dark:border-white text-black dark:text-white font-extrabold uppercase text-xs tracking-wider shadow-brutal-sm hover:shadow-brutal transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-none">
 Cancel
 </button>
 <button onclick="submitNewSeason()" class="px-4 py-2 bg-canary dark:bg-canary border-2 border-black dark:border-white text-black dark:text-black font-extrabold uppercase text-xs tracking-wider shadow-brutal-sm hover:shadow-brutal transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-none">
 Create Season
 </button>
 </div>
 </div>
 `;
 document.body.appendChild(modal);
 createIcons({icons});

 setTimeout(() => document.getElementById('newSeasonTitle')?.focus(), 100);
 };

 window.closeNewSeasonModal = function() {
 const modal = document.getElementById('newSeasonModalOverlay');
 if (modal) modal.remove();
 };

 window.submitNewSeason = async function() {
 const title = document.getElementById('newSeasonTitle')?.value.trim();
 if (!title) {
 window.showToast('Please enter a season title.', 'warning');
 return;
 }

 const weeks = Math.min(6, Math.max(4, parseInt(document.getElementById('newSeasonWeeks')?.value || '5') || 5));
 const devGoal = document.getElementById('newSeasonDevGoal')?.value.trim() || '';
 const personalGoal = document.getElementById('newSeasonPersonalGoal')?.value.trim() || '';
 const devMicro = document.getElementById('newSeasonDevMicro')?.value.trim() || '';
 const personalMicro = document.getElementById('newSeasonPersonalMicro')?.value.trim() || '';

 const startDate = new Date();
 const endDate = new Date(startDate.getTime() + weeks * 7 * 24 * 60 * 60 * 1000);

 const newSeason = {
 title,
 startDate: startDate.toISOString(),
 endDate: endDate.toISOString(),
 durationWeeks: weeks,
 devGoal,
 personalGoal,
 devMicroHabit: devMicro,
 personalMicroHabit: personalMicro,
 isActive: true,
 isCompleted: false,
 userId: window.state.user.uid,
 createdAt: new Date().toISOString()
 };

 try {
 if (getActiveSeason()) {
 await window.storageAdapter.updateSeason(getActiveSeason().id, { isActive: false });
 }
 await window.storageAdapter.createSeason(newSeason);
 window.closeNewSeasonModal();
 window.showToast('Season created successfully!');
 } catch(e) {
 console.error("Season initialization failed:", e);
 window.showToast('Failed to create season.', 'warning');
 }
 };

 window.createNewSeason = async function() {
 window.openNewSeasonModal();
 };

 window.selectSeason = function(id) {
 window.state.selectedSeasonId = id;
 renderSeasonsView();
 };

 window.closeSeasonDetail = function() {
 window.state.selectedSeasonId = null;
 renderSeasonsView();
 };

 window.completeCurrentSeason = async function() {
 const active = getActiveSeason();
 if (!active || !window.storageAdapter) return;

 const modal = document.createElement('div');
 modal.id = 'confirmModalOverlay';
 modal.className = 'fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 tab-enter';
 modal.innerHTML = `
 <div class="bg-white dark:bg-[#262626] border-2 border-black dark:border-white shadow-brutal-lg max-w-sm w-full p-6 space-y-4">
 <h3 class="text-base font-extrabold uppercase tracking-wider text-black dark:text-white">Complete Season?</h3>
 <p class="text-xs text-zinc-500 dark:text-zinc-400 font-medium">This will finalize your current focus block and mark the season as complete.</p>
 <div class="flex justify-end gap-2 pt-2">
 <button onclick="closeConfirmModal()" class="px-4 py-2 bg-zinc-100 dark:bg-[#1a1a1a] border-2 border-black dark:border-white text-black dark:text-white font-extrabold uppercase text-xs tracking-wider shadow-brutal-sm hover:shadow-brutal transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-none">Cancel</button>
 <button onclick="confirmCompleteSeason()" class="px-4 py-2 bg-mint dark:bg-mint border-2 border-black dark:border-white text-black dark:text-black font-extrabold uppercase text-xs tracking-wider shadow-brutal-sm hover:shadow-brutal transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-none">Complete</button>
 </div>
 </div>
 `;
 document.body.appendChild(modal);
 };

 window.closeConfirmModal = function() {
 const modal = document.getElementById('confirmModalOverlay');
 if (modal) modal.remove();
 };

 window.confirmCompleteSeason = async function() {
 window.closeConfirmModal();
 const active = getActiveSeason();
 if (!active || !window.storageAdapter) return;

 try {
 await window.storageAdapter.updateSeason(active.id, {
 isActive: false,
 isCompleted: true,
 completedAt: new Date().toISOString()
 });
 window.state.selectedSeasonId = null;
 renderSeasonsView();
 window.showToast('Season completed!');
 } catch(e) {
 console.error("Season completion failed:", e);
 window.showToast('Failed to complete season.', 'warning');
 }
 };

 window.toggleBacklogDrawer = function() {
 window.state.backlogOpen = !window.state.backlogOpen;
 renderSeasonsView();
 };

 window.addBacklogItem = async function() {
 const input = document.getElementById('backlogInput');
 const title = input.value.trim();
 if (!title || !window.storageAdapter) return;

 try {
 await window.storageAdapter.createBacklogEntry({
 title,
 userId: window.state.user.uid,
 createdAt: new Date().toISOString(),
 promoted: false
 });
 input.value = '';
 } catch(e) {
 console.error("Backlog submission failed:", e);
 }
 };

 window.deleteBacklogItem = async function(id, event) {
 if (event) event.stopPropagation();
 if (!window.storageAdapter) return;
 try {
 await window.storageAdapter.deleteBacklogEntry(id);
 } catch(e) {
 console.error("Backlog deletion failed:", e);
 }
 };

 window.promoteBacklogToSeason = async function(backlogId, goalType) {
 const item = window.state.backlog.find(b => b.id === backlogId);
 if (!item || !window.storageAdapter) return;

 const active = getActiveSeason();
 if (!active) {
 window.showToast('No active season. Create a season first to promote items.', 'warning');
 return;
 }

 const field = goalType === 'dev' ? 'devGoal' : 'personalGoal';

 try {
 await window.storageAdapter.updateSeason(active.id, { [field]: item.title });
 await window.storageAdapter.deleteBacklogEntry(backlogId);
 } catch(e) {
 console.error("Promotion failed:", e);
 }
 };

 // --- Retrospective Modal Handler ---
 window.openSeasonRetrospective = function(seasonId) {
 const season = window.state.seasons.find(s => s.id === seasonId) || getActiveSeason();
 if (!season) {
 window.showToast("No season available to summarize.", "warning");
 return;
 }
 const retroData = calculateSeasonRetrospective(
 season,
 window.state.logs,
 window.state.dailyLogs,
 window.state.habitLogs
 );
 const html = renderRetrospectiveModal(retroData);
 const existing = document.getElementById('retroModalOverlay');
 if (existing) existing.remove();
 
 const div = document.createElement('div');
 div.innerHTML = html;
 document.body.appendChild(div.firstElementChild);
 createIcons({icons});
 };

 window.closeRetroModal = function() {
 const overlay = document.getElementById('retroModalOverlay');
 if (overlay) overlay.remove();
 };

 window.openAppSettingsModal = function() {
 const existing = document.getElementById('appSettingsModalOverlay');
 if (existing) existing.remove();

 const modal = document.createElement('div');
 modal.id = 'appSettingsModalOverlay';
 modal.className = 'fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 tab-enter';
 modal.innerHTML = `
 <div class="bg-white dark:bg-[#262626] border-2 border-black dark:border-white shadow-brutal-lg max-w-md w-full p-6 space-y-6 relative">
 <div class="flex justify-between items-center border-b-2 border-black dark:border-white pb-3">
 <h3 class="text-lg font-extrabold uppercase tracking-wider text-black dark:text-white flex items-center gap-2">
 <span class="w-8 h-8 bg-skybadge dark:bg-skybadge border-2 border-black dark:border-white flex items-center justify-center"><i data-lucide="settings" class="w-4 h-4 text-black"></i></span>
 Workspace Settings
 </h3>
 <button onclick="closeAppSettingsModal()" class="p-1 text-zinc-400 hover:text-black dark:hover:text-white border-2 border-transparent hover:border-black dark:hover:border-white">
 <i data-lucide="x" class="w-5 h-5"></i>
 </button>
 </div>

 <div class="space-y-4 text-xs">
 <div class="space-y-1.5 border-t-2 border-black dark:border-white pt-3">
 <label class="font-extrabold text-black dark:text-white uppercase tracking-widest">Break Reminder Notifications</label>
 <div class="flex items-center justify-between bg-zinc-100 dark:bg-[#1a1a1a] border-2 border-black dark:border-white p-3">
 <div>
 <span class="font-extrabold uppercase tracking-wider text-black dark:text-white">Session Threshold</span>
 <p class="text-zinc-400 text-[11px] font-mono mt-0.5">Remind to stretch after <span class="font-bold">${window.state.breakThresholdMinutes}</span> min</p>
 </div>
 <input type="checkbox" ${window.state.breakNotificationsEnabled ? 'checked' : ''} onchange="window.state.breakNotificationsEnabled = this.checked" class="w-4 h-4 accent-black dark:accent-white">
 </div>
 </div>

 <div class="space-y-1.5 border-t-2 border-black dark:border-white pt-3">
 <label class="font-extrabold text-black dark:text-white uppercase tracking-widest">App Guidance</label>
 <button onclick="closeAppSettingsModal(); replayTutorialTour();" class="w-full py-2.5 bg-zinc-100 dark:bg-[#1a1a1a] border-2 border-black dark:border-white shadow-brutal-sm hover:shadow-brutal font-extrabold uppercase tracking-wider text-xs text-black dark:text-white transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-none flex items-center justify-center gap-2">
 <i data-lucide="compass" class="w-4 h-4"></i> Replay Onboarding Tutorial
 </button>
 </div>

 <div class="space-y-1.5 border-t-2 border-black dark:border-white pt-3">
 <label class="font-extrabold text-black dark:text-white uppercase tracking-widest">Updates</label>
 <button onclick="checkForUpdates()" class="w-full py-2.5 bg-zinc-100 dark:bg-[#1a1a1a] border-2 border-black dark:border-white shadow-brutal-sm hover:shadow-brutal font-extrabold uppercase tracking-wider text-xs text-black dark:text-white transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-none flex items-center justify-center gap-2">
 <i data-lucide="refresh-cw" class="w-4 h-4"></i> Check for Updates
 </button>
 </div>
 </div>

 <div class="flex justify-end pt-2 border-t-2 border-black dark:border-white">
 <button onclick="closeAppSettingsModal()" class="px-4 py-2 bg-canary dark:bg-canary border-2 border-black dark:border-white text-black dark:text-black font-extrabold uppercase text-xs tracking-wider shadow-brutal-sm hover:shadow-brutal transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-none">
 Done
 </button>
 </div>
 </div>
 `;
 document.body.appendChild(modal);
 createIcons({icons});
 };

 window.closeAppSettingsModal = function() {
 const modal = document.getElementById('appSettingsModalOverlay');
 if (modal) modal.remove();
 };

 window.replayTutorialTour = function() {
 startOnboardingTour();
 };

 window.setEnergyMode = function(mode) {
 window.state.dailyEnergyMode = mode;
 renderSeasonsView();
 };

 window.addDailyLog = async function() {
 const input = document.getElementById('dailyLogInput');
 const task = input.value.trim();
 if (!task || !window.storageAdapter) return;

 playSound('nav tap');

 const active = getActiveSeason();

 try {
 await window.storageAdapter.upsertDailyLog({
 task,
 energyType: window.state.dailyEnergyMode,
 seasonId: active ? active.id : 'general',
 userId: window.state.user.uid,
 timestamp: new Date().toISOString(),
 date: getLocalDateStr(new Date())
 });
 input.value = '';
 } catch(e) {
 console.error("Daily log failed:", e);
 }
 };

 window.deleteDailyLog = async function(id, event) {
 if (event) event.stopPropagation();
 if (!window.storageAdapter) return;
 try {
 await window.storageAdapter.upsertDailyLog({ id, deleted: true });
 } catch(e) {
 console.error("Daily log deletion failed:", e);
 }
 };

 window.toggleMicroHabit = async function(type) {
 if (!window.storageAdapter) return;
 playSound('nav tap');
 const active = getActiveSeason();
 if (!active) return;

 const today = getLocalDateStr(new Date());
 const existingLog = window.state.habitLogs.find(h => h.date === today && h.seasonId === active.id);

 if (existingLog) {
 const field = type === 'dev' ? 'devCompleted' : 'personalCompleted';
 try {
 await window.storageAdapter.upsertHabitLog({
 ...existingLog,
 [field]: !existingLog[field]
 });
 } catch(e) {
 console.error("Habit update failed:", e);
 }
 } else {
 try {
 await window.storageAdapter.upsertHabitLog({
 date: today,
 seasonId: active.id,
 devCompleted: type === 'dev',
 personalCompleted: type === 'personal',
 userId: window.state.user.uid
 });
 } catch(e) {
 console.error("Habit creation failed:", e);
 }
 }
 renderSeasonsView();
 };

 window.deleteSeason = async function(id, event) {
 if (event) event.stopPropagation();
 if (!window.storageAdapter) return;

 const season = window.state.seasons.find(s => s.id === id);
 if (!season) return;

 const modal = document.createElement('div');
 modal.id = 'deleteConfirmModalOverlay';
 modal.className = 'fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 tab-enter';
 modal.innerHTML = `
 <div class="bg-white dark:bg-[#262626] border-2 border-black dark:border-white shadow-brutal-lg max-w-sm w-full p-6 space-y-4">
 <h3 class="text-base font-extrabold uppercase tracking-wider text-black dark:text-white">Delete Season?</h3>
 <p class="text-xs text-zinc-500 dark:text-zinc-400 font-medium">This will delete "${season.title}" and all associated data. This action cannot be undone.</p>
 <div class="flex justify-end gap-2 pt-2">
 <button onclick="closeDeleteConfirmModal()" class="px-4 py-2 bg-zinc-100 dark:bg-[#1a1a1a] border-2 border-black dark:border-white text-black dark:text-white font-extrabold uppercase text-xs tracking-wider shadow-brutal-sm hover:shadow-brutal transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-none">Cancel</button>
 <button onclick="confirmDeleteSeason('${id}')" class="px-4 py-2 bg-coral dark:bg-coral border-2 border-black dark:border-white text-black font-extrabold uppercase text-xs tracking-wider shadow-brutal-sm hover:shadow-brutal transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-none">Delete</button>
 </div>
 </div>
 `;
 document.body.appendChild(modal);
 };

 window.closeDeleteConfirmModal = function() {
 const modal = document.getElementById('deleteConfirmModalOverlay');
 if (modal) modal.remove();
 };

 window.confirmDeleteSeason = async function(id) {
 window.closeDeleteConfirmModal();
 try {
 await window.storageAdapter.deleteSeason(id);
 if (window.state.selectedSeasonId === id) window.state.selectedSeasonId = null;
 renderSeasonsView();
 window.showToast('Season deleted.');
 } catch(e) {
 console.error("Season deletion failed:", e);
 window.showToast('Failed to delete season.', 'warning');
 }
 };

 function getSeasonProgress(season) {
 if (!season) return 0;
 const now = new Date();
 const start = new Date(season.startDate);
 const end = new Date(season.endDate);
 const total = end.getTime() - start.getTime();
 const elapsed = now.getTime() - start.getTime();
 if (total <= 0) return 0;
 return Math.max(0, Math.min(100, Math.round((elapsed / total) * 100)));
 }

 function getHabitStatus(type) {
 const active = getActiveSeason();
 if (!active) return { completed: false, done: false };
 const today = getLocalDateStr(new Date());
 const log = window.state.habitLogs.find(h => h.date === today && h.seasonId === active.id && h.userId === window.state.user.uid);
 return { completed: !!log, done: type === 'dev' ? (log ? log.devCompleted : false) : (log ? log.personalCompleted : false) };
 }

 function renderSeasonsView() {
 const listContainer = document.getElementById('seasonsListContainer');
 const detailContainer = document.getElementById('seasonDetailContainer');

 if (!listContainer || !detailContainer) return;

 document.getElementById('backlogBadge').innerText = window.state.backlog.filter(b => !b.promoted).length;

 if (window.state.selectedSeasonId) {
 listContainer.innerHTML = '';
 detailContainer.classList.remove('hidden');
 renderSeasonDetail();
 } else {
 detailContainer.classList.add('hidden');
 const energyLogSection = document.getElementById('dailyEnergyLogSection');
 if (energyLogSection) energyLogSection.classList.add('hidden');
 renderSeasonsList();
 }
 }

 function renderSeasonsList() {
 const listContainer = document.getElementById('seasonsListContainer');
 if (!listContainer) return;

 if (window.state.seasons.length === 0) {
 listContainer.innerHTML = '<div class="p-8 text-center text-xs text-zinc-400 dark:text-zinc-500 font-extrabold uppercase tracking-wider bg-white dark:bg-[#262626] border-2 border-black dark:border-white shadow-brutal-sm">No seasons yet. Create one above.</div>';
 return;
 }

 listContainer.innerHTML = window.state.seasons.map(season => {
 const progress = getSeasonProgress(season);
 const statusBadge = season.isCompleted
 ? '<span class="inline-flex items-center px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider border-2 border-black dark:border-white bg-zinc-300 dark:bg-zinc-600 text-black dark:text-white">Completed</span>'
 : season.isActive
 ? '<span class="inline-flex items-center px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider border-2 border-black dark:border-white bg-canary dark:bg-canary text-black">Active</span>'
 : '<span class="inline-flex items-center px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider border-2 border-black dark:border-white bg-zinc-100 dark:bg-[#1a1a1a] text-zinc-500 dark:text-zinc-400">Upcoming</span>';

 return `
 <div onclick="selectSeason('${season.id}')" class="bg-white dark:bg-[#262626] border-2 border-black dark:border-white shadow-brutal-sm hover:shadow-brutal p-5 flex justify-between items-center cursor-pointer transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-none">
 <div class="flex items-center gap-4">
 <div class="w-12 h-12 bg-lavender dark:bg-lavender flex items-center justify-center border-2 border-black dark:border-white shadow-brutal-sm">
 <i data-lucide="sprout" class="w-5 h-5 text-black"></i>
 </div>
 <div>
 <div class="flex items-center gap-2">
 <h4 class="text-base font-extrabold uppercase tracking-wider text-black dark:text-white">${escapeHtml(season.title)}</h4>
 ${statusBadge}
 </div>
 <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-mono font-medium">${formatDateRange(season.startDate, season.endDate)} &bull; ${season.durationWeeks} weeks</p>
 <div class="w-full bg-zinc-100 dark:bg-[#1a1a1a] h-2.5 border border-black dark:border-white mt-2 overflow-hidden">
 <div class="bg-black dark:bg-white h-full" style="width: ${progress}%"></div>
 </div>
 </div>
 </div>
 <div class="flex items-center gap-2">
 <span class="text-xs font-mono font-bold text-zinc-500 dark:text-zinc-400">${progress}%</span>
 <button onclick="event.stopPropagation(); openSeasonRetrospective('${season.id}')" class="p-2 hover:bg-zinc-100 dark:hover:bg-[#333] border-2 border-transparent hover:border-black dark:hover:border-white text-zinc-400 dark:text-zinc-500 hover:text-black dark:hover:text-white transition" title="Preview Retrospective">
 <i data-lucide="bar-chart-2" class="w-4 h-4"></i>
 </button>
 <button onclick="event.stopPropagation(); deleteSeason('${season.id}')" class="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 border-2 border-transparent hover:border-red-500 text-zinc-400 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-400 transition" title="Delete Season">
 <i data-lucide="trash-2" class="w-4 h-4"></i>
 </button>
 </div>
 </div>
 `;
 }).join('');
 createIcons({icons});
 }

 function renderSeasonDetail() {
 const season = window.state.seasons.find(s => s.id === window.state.selectedSeasonId);
 if (!season) return;

 const progress = getSeasonProgress(season);
 document.getElementById('detailSeasonTitle').innerText = season.title;
 document.getElementById('detailSeasonDates').innerText = `${formatDateRange(season.startDate, season.endDate)} - ${season.durationWeeks} weeks`;
 document.getElementById('detailSeasonProgress').innerText = `${progress}%`;
 document.getElementById('detailSeasonProgressBar').style.width = `${progress}%`;
 document.getElementById('detailSeasonStart').innerText = new Date(season.startDate).toLocaleDateString();
 document.getElementById('detailSeasonEnd').innerText = new Date(season.endDate).toLocaleDateString();

 document.getElementById('detailDevGoal').innerText = season.devGoal || 'No goal set';
 document.getElementById('detailPersonalGoal').innerText = season.personalGoal || 'No goal set';
 document.getElementById('detailDevMicro').innerText = season.devMicroHabit || 'No micro-habit set';
 document.getElementById('detailPersonalMicro').innerText = season.personalMicroHabit || 'No micro-habit set';

 const devHabit = getHabitStatus('dev');
 const personalHabit = getHabitStatus('personal');

 const btnDev = document.getElementById('btnMicroDev');
 btnDev.innerText = devHabit.done ? '? Completed Today' : 'Mark Complete Today';
 btnDev.className = devHabit.done ? 'mt-3 w-full bg-mint dark:bg-mint border-2 border-black dark:border-white text-black dark:text-black text-xs font-extrabold uppercase tracking-wider py-2 opacity-60' : 'mt-3 w-full bg-canary dark:bg-canary border-2 border-black dark:border-white shadow-brutal-sm hover:shadow-brutal text-black dark:text-black text-xs font-extrabold uppercase tracking-wider py-2 transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-none';

 const btnPersonal = document.getElementById('btnMicroPersonal');
 btnPersonal.innerText = personalHabit.done ? '? Completed Today' : 'Mark Complete Today';
 btnPersonal.className = personalHabit.done ? 'mt-3 w-full bg-mint dark:bg-mint border-2 border-black dark:border-white text-black dark:text-black text-xs font-extrabold uppercase tracking-wider py-2 opacity-60' : 'mt-3 w-full bg-canary dark:bg-canary border-2 border-black dark:border-white shadow-brutal-sm hover:shadow-brutal text-black dark:text-black text-xs font-extrabold uppercase tracking-wider py-2 transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-none';

 renderBacklog();
 renderDailyLogs();

 const energyLogSection = document.getElementById('dailyEnergyLogSection');
 const activeSeason = getActiveSeason();
 if (energyLogSection) {
 energyLogSection.classList.toggle('hidden', !activeSeason);
 }

 createIcons({icons});
 }

 function renderBacklog() {
 const container = document.getElementById('backlogList');
 const drawer = document.getElementById('backlogDrawer');
 if (!container || !drawer) return;

 const unpromoted = window.state.backlog.filter(b => !b.promoted);

 if (window.state.backlogOpen) {
 drawer.classList.remove('hidden');
 } else {
 drawer.classList.add('hidden');
 }

 if (unpromoted.length === 0) {
 container.innerHTML = '<div class="text-xs text-zinc-400 dark:text-zinc-500 font-extrabold uppercase tracking-wider text-center py-6">Nothing parked here.</div>';
 } else {
 container.innerHTML = unpromoted.map(item => {
 return `
 <div class="flex items-center justify-between bg-zinc-100 dark:bg-[#1a1a1a] border-2 border-black dark:border-white shadow-brutal-sm p-3">
 <span class="text-sm text-black dark:text-white font-bold flex-1">${escapeHtml(item.title)}</span>
 <div class="flex items-center gap-1 ml-2">
 <button onclick="promoteBacklogToSeason('${item.id}', 'dev')" class="px-2 py-1 bg-lavender dark:bg-lavender border border-black dark:border-white text-black text-[10px] font-extrabold uppercase hover:shadow-brutal-sm active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all">Dev</button>
 <button onclick="promoteBacklogToSeason('${item.id}', 'personal')" class="px-2 py-1 bg-skybadge dark:bg-skybadge border border-black dark:border-white text-black text-[10px] font-extrabold uppercase hover:shadow-brutal-sm active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all">Personal</button>
 <button onclick="deleteBacklogItem('${item.id}', event)" class="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 border border-transparent hover:border-red-500 text-zinc-400 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-400 transition">
 <i data-lucide="x" class="w-3.5 h-3.5"></i>
 </button>
 </div>
 </div>
 `;
 }).join('');
 }

 const active = getActiveSeason();
 if (active) {
 const devSelect = document.getElementById('devBacklogSelect');
 const personalSelect = document.getElementById('personalBacklogSelect');
 if (devSelect) {
 devSelect.innerHTML = '<option value="">Load from backlog</option>' + unpromoted.map(b => `<option value="${escapeHtml(b.id)}">${escapeHtml(b.title)}</option>`).join('');
 devSelect.onchange = (e) => { if (e.target.value) promoteBacklogToSeason(e.target.value, 'dev'); };
 }
 if (personalSelect) {
 personalSelect.innerHTML = '<option value="">Load from backlog</option>' + unpromoted.map(b => `<option value="${escapeHtml(b.id)}">${escapeHtml(b.title)}</option>`).join('');
 personalSelect.onchange = (e) => { if (e.target.value) promoteBacklogToSeason(e.target.value, 'personal'); };
 }
 }
 createIcons({icons});
 }

 function renderDailyLogs() {
 const container = document.getElementById('dailyLogList');
 if (!container) return;

 const active = getActiveSeason();
 const logs = window.state.dailyLogs.filter(l => l.userId === window.state.user.uid && (!active || l.seasonId === active.id));

 logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

 if (logs.length === 0) {
 container.innerHTML = '<div class="text-xs text-zinc-400 dark:text-zinc-500 font-extrabold uppercase tracking-wider text-center py-4">No entries logged yet.</div>';
 } else {
 container.innerHTML = logs.map(log => {
 const isProduction = log.energyType === 'production';
 return `
 <div class="flex items-center justify-between ${isProduction ? 'bg-zinc-100 dark:bg-[#1a1a1a]' : 'bg-lavender dark:bg-lavender'} border-2 border-black dark:border-white shadow-brutal-sm p-3">
 <div class="flex items-center gap-3">
 <span class="text-xs font-mono font-bold text-zinc-500 dark:text-zinc-400">${new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
 <span class="text-[10px] font-extrabold uppercase tracking-wider ${isProduction ? 'bg-canary dark:bg-canary text-black' : 'bg-white dark:bg-white text-black'} px-2 py-0.5 border border-black dark:border-white">${isProduction ? 'Production' : 'Consumption'}</span>
 <span class="text-sm text-black dark:text-white font-bold">${escapeHtml(log.task)}</span>
 </div>
 <button onclick="deleteDailyLog('${log.id}', event)" class="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 border border-transparent hover:border-red-500 text-zinc-400 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-400 transition">
 <i data-lucide="x" class="w-3.5 h-3.5"></i>
 </button>
 </div>
 `;
 }).join('');
 }
 createIcons({icons});
 }

 window.renderSeasonsView = renderSeasonsView;
 window.formatTimeHMS = formatTimeHMS;
 window.formatHoursAndMins = formatHoursAndMins;
 window.formatDateRange = formatDateRange;
 window.toggleTheme = toggleTheme;
 window.applyTheme = applyTheme;
 window.updateThemeIcon = updateThemeIcon;
 window.applySavedTheme = applySavedTheme;

 function switchTab(tabId) {
 playSound('nav tap');
 document.querySelectorAll('.tab-content').forEach(el => {
 el.classList.add('hidden');
 el.classList.remove('tab-enter');
 });
 const target = document.getElementById(`tab-${tabId}`);
 target.classList.remove('hidden');
 void target.offsetWidth;
 target.classList.add('tab-enter');
 
 document.querySelectorAll('.nav-btn').forEach(btn => {
 btn.classList.remove('bg-white/10', 'text-canary', 'border-canary');
 btn.classList.add('text-gray-500', 'hover:bg-white/5', 'hover:text-gray-300', 'border-transparent');
 btn.setAttribute('aria-selected', 'false');
 });
 const activeBtn = document.getElementById(`btn-${tabId}`);
 if(activeBtn) {
 activeBtn.classList.add('bg-white/10', 'text-canary', 'border-canary');
 activeBtn.classList.remove('text-gray-500', 'hover:bg-white/5', 'hover:text-gray-300', 'border-transparent');
 activeBtn.setAttribute('aria-selected', 'true');
 }
 if(tabId === 'calendar') {
 renderCalendarViews();
 }
 if(tabId === 'seasons') {
 renderSeasonsView();
 }
 }
 window.switchTab = switchTab;

 window.showTab = showTab;
 function showTab(tabId) {
 document.getElementById('loginTab').classList.toggle('hidden', tabId !== 'loginTab');
 document.getElementById('registerTab').classList.toggle('hidden', tabId !== 'registerTab');
 
 document.getElementById('btn-login-tab').className = `flex-1 py-2.5 ${tabId === 'loginTab' ? 'bg-canary dark:bg-canary text-black' : 'bg-zinc-100 dark:bg-[#1a1a1a] text-zinc-500 dark:text-zinc-400'} font-extrabold uppercase text-xs tracking-wider`;
 document.getElementById('btn-register-tab').className = `flex-1 py-2.5 ${tabId === 'registerTab' ? 'bg-canary dark:bg-canary text-black' : 'bg-zinc-100 dark:bg-[#1a1a1a] text-zinc-500 dark:text-zinc-400'} font-extrabold uppercase text-xs tracking-wider`;
 
 document.getElementById('loginError').innerText = '';
 document.getElementById('registerError').innerText = '';
 }

 function selectItemForTimer(id) {
 window.state.selectedItemId = id;
 renderDashboard(); 
 }

 function syncActiveMonitorPanel() {
 const activeItem = window.state.items.find(i => i.id === window.state.selectedItemId);
 const toggleBtn = document.getElementById('timerToggleBtn');
 const logBtn = document.getElementById('timerLogBtn');
 const titleDisplay = document.getElementById('activeItemTitle');
 const displayTime = document.getElementById('timerDisplay');

 if (!activeItem) {
 titleDisplay.innerText = "No Item Selected";
 displayTime.innerText = "00:00:00";
 toggleBtn.disabled = true;
 logBtn.disabled = true;
 toggleBtn.className = "flex-1 bg-zinc-800 dark:bg-zinc-700 border-2 border-zinc-600 dark:border-zinc-500 text-zinc-400 dark:text-zinc-500 font-extrabold uppercase text-xs tracking-wider py-3 flex items-center justify-center gap-2 cursor-not-allowed";
 logBtn.className = "bg-zinc-800 dark:bg-zinc-700 border-2 border-zinc-600 dark:border-zinc-500 text-white/40 dark:text-zinc-500 font-extrabold uppercase text-xs px-5 py-3 flex items-center justify-center cursor-not-allowed";
 return;
 }

 titleDisplay.innerText = activeItem.name;
 toggleBtn.disabled = false;
 
 let currentDisplaySeconds = activeItem.accumulatedSeconds;
 if (activeItem.isRunning && activeItem.startedAt) {
 currentDisplaySeconds += Math.floor((Date.now() - activeItem.startedAt) / 1000);
 }
 displayTime.innerText = formatTimeHMS(currentDisplaySeconds);

 if (activeItem.isRunning) {
 toggleBtn.innerHTML = `<i data-lucide="pause" class="w-4 h-4"></i> Pause Monitor`;
 toggleBtn.className = "flex-1 bg-canary dark:bg-canary border-2 border-black dark:border-white shadow-brutal-sm hover:shadow-brutal text-black dark:text-black font-extrabold uppercase text-xs tracking-wider py-3 flex items-center justify-center gap-2 transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-none";
 logBtn.disabled = false;
 logBtn.className = "bg-canary dark:bg-canary border-2 border-black dark:border-white shadow-brutal-sm hover:shadow-brutal text-black dark:text-black font-extrabold uppercase text-xs px-5 py-3 flex items-center justify-center transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-none";
 } else {
 toggleBtn.innerHTML = `<i data-lucide="play" class="w-4 h-4"></i> Start Session`;
 toggleBtn.className = "flex-1 bg-white dark:bg-[#262626] border-2 border-black dark:border-white shadow-brutal-sm hover:shadow-brutal text-black dark:text-white font-extrabold uppercase text-xs tracking-wider py-3 flex items-center justify-center gap-2 transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-none";
 
 if (activeItem.accumulatedSeconds > 0) {
 logBtn.disabled = false;
 logBtn.className = "bg-canary dark:bg-canary border-2 border-black dark:border-white shadow-brutal-sm hover:shadow-brutal text-black dark:text-black font-extrabold uppercase text-xs px-5 py-3 flex items-center justify-center transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-none";
 } else {
 logBtn.disabled = true;
 logBtn.className = "bg-zinc-800 dark:bg-zinc-700 border-2 border-zinc-600 dark:border-zinc-500 text-white/40 dark:text-zinc-500 font-extrabold uppercase text-xs px-5 py-3 flex items-center justify-center cursor-not-allowed";
 }
 }
 createIcons({icons});
 }

 window.togglePin = async function(id) {
 const item = window.state.items.find(i => i.id === id);
 if (!item || !window.storageAdapter) return;
 item.pinned = !item.pinned;
 await window.storageAdapter.updateItem(id, { pinned: item.pinned });
 renderDashboard();
 };

 function renderDashboard() {
 const container = document.getElementById('unifiedItemsList');
 if(!container) return;
 container.innerHTML = '';

 let totalTopicSec = 0;
 let totalHabitSec = 0;

 const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

 window.state.items.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

 window.state.items.forEach(item => {
 const historicalSeconds = window.state.logs
 .filter(l => l.itemId === item.id && new Date(l.timestamp) >= monthStart)
 .reduce((acc, curr) => acc + curr.seconds, 0);
 if (item.type === 'topic') totalTopicSec += historicalSeconds;
 if (item.type === 'habit') totalHabitSec += historicalSeconds;
 });

 const metricsGrid = document.getElementById('highlightsGrid');
 if(metricsGrid) {
 metricsGrid.innerHTML = `
 <div class="bg-white dark:bg-[#262626] border-2 border-black dark:border-white shadow-brutal-sm p-4 flex flex-col justify-between">
 <div>
 <span class="text-[10px] uppercase tracking-widest font-extrabold text-zinc-500 dark:text-zinc-400">Topics This Month</span>
 <h5 class="text-xl font-mono font-bold text-black dark:text-white mt-1 tabular-nums">${formatHoursAndMins(totalTopicSec)}</h5>
 </div>
 <div class="w-7 h-7 bg-lavender dark:bg-lavender border-2 border-black dark:border-white text-black flex items-center justify-center mt-3"><i data-lucide="code-2" class="w-4 h-4"></i></div>
 </div>
 <div class="bg-white dark:bg-[#262626] border-2 border-black dark:border-white shadow-brutal-sm p-4 flex flex-col justify-between">
 <div>
 <span class="text-[10px] uppercase tracking-widest font-extrabold text-zinc-500 dark:text-zinc-400">Habits This Month</span>
 <h5 class="text-xl font-mono font-bold text-black dark:text-white mt-1 tabular-nums">${formatHoursAndMins(totalHabitSec)}</h5>
 </div>
 <div class="w-7 h-7 bg-mint dark:bg-mint border-2 border-black dark:border-white text-black flex items-center justify-center mt-3"><i data-lucide="activity" class="w-4 h-4"></i></div>
 </div>
 <div class="bg-white dark:bg-[#262626] border-2 border-black dark:border-white shadow-brutal-sm p-4 flex flex-col justify-between">
 <div>
 <span class="text-[10px] uppercase tracking-widest font-extrabold text-zinc-500 dark:text-zinc-400">This Month Total</span>
 <h5 class="text-xl font-mono font-bold text-black dark:text-white mt-1 tabular-nums">${formatHoursAndMins(totalTopicSec + totalHabitSec)}</h5>
 </div>
 <div class="w-7 h-7 bg-skybadge dark:bg-skybadge border-2 border-black dark:border-white text-black flex items-center justify-center mt-3"><i data-lucide="globe" class="w-4 h-4"></i></div>
 </div>
 `;
 }

 if (window.state.items.length === 0) {
 container.innerHTML = '<div class="p-8 text-center text-xs text-zinc-400 dark:text-zinc-500 font-extrabold uppercase tracking-wider">No items yet. Add one above.</div>';
 document.getElementById('statsSubHeader').innerText = "No items tracked.";
 syncActiveMonitorPanel();
 createIcons({icons});
 return;
 }

 document.getElementById('statsSubHeader').innerText = `${window.state.items.length} item${window.state.items.length !== 1 ? 's' : ''} tracked.`;

 window.state.items.forEach(item => {
 const historicalSeconds = window.state.logs.filter(l => l.itemId === item.id).reduce((acc, curr) => acc + curr.seconds, 0);
 const isSelected = window.state.selectedItemId === item.id;
 
 const elementRow = document.createElement('div');
 elementRow.className = `grid grid-cols-12 items-center py-3 px-2 text-xs font-bold cursor-pointer transition ${isSelected ? 'bg-canary dark:bg-canary border-2 border-black dark:border-white shadow-brutal-sm' : 'hover:bg-zinc-100 dark:hover:bg-[#333] border-2 border-transparent'}`;
 elementRow.onclick = () => selectItemForTimer(item.id);

 elementRow.innerHTML = `
 <div class="col-span-5 flex items-center gap-2">
 <button onclick="event.stopPropagation(); togglePin('${item.id}')" class="p-1 text-zinc-300 dark:text-zinc-600 hover:text-amber-500 dark:hover:text-amber-400 transition ${item.pinned ? 'text-amber-500 dark:text-amber-400' : ''}">
 <i data-lucide="pin" class="w-3 h-3 ${item.pinned ? 'fill-current' : ''}"></i>
 </button>
 <div class="w-2.5 h-2.5 border-2 border-black dark:border-white ${item.type === 'topic' ? 'bg-lavender dark:bg-lavender' : 'bg-mint dark:bg-mint'}"></div>
 <div>
 <div class="text-sm font-extrabold uppercase tracking-wider text-black dark:text-white">${escapeHtml(item.name)}</div>
 <div class="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase font-bold">${item.type}</div>
 </div>
 </div>
 <div class="col-span-4 text-center font-mono font-bold text-zinc-600 dark:text-zinc-300 tabular-nums">
 <span id="live-timer-${item.id}">${formatTimeHMS(item.accumulatedSeconds)}</span>
 ${item.isRunning ? '<span class="ml-1.5 px-1.5 py-0.5 bg-canary dark:bg-canary text-black text-[9px] font-extrabold uppercase border border-black dark:border-white">LIVE</span>' : ''}
 </div>
 <div class="col-span-2 text-right font-mono font-bold text-black dark:text-white tabular-nums">${formatHoursAndMins(historicalSeconds)}</div>
 <div class="col-span-1 text-right">
 <button onclick="deleteItem('${item.id}', event)" class="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-zinc-400 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-400 transition">
 <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
 </button>
 </div>
 `;
 container.appendChild(elementRow);
 });

 syncActiveMonitorPanel();
 refreshQuickNotesSidebar();
 createIcons({icons});
 }

 function refreshQuickNotesSidebar() {
 const sidebar = document.getElementById('quickNotesSidebar');
 if (!sidebar) return;
 const preview = document.getElementById('quickNotesPreview');
 const subtext = document.getElementById('quickNotesSubtext');
 if (!preview || !subtext) return;

 const recent = window.state.notes.slice(-3).reverse();
 if (recent.length === 0) {
 preview.classList.add('hidden');
 subtext.innerText = 'Capture ideas as they come.';
 } else {
 preview.classList.remove('hidden');
 subtext.innerText = `${window.state.notes.length} note${window.state.notes.length !== 1 ? 's' : ''} saved.`;
 preview.innerHTML = recent.map(n =>
 `<p class="text-sm font-bold text-white dark:text-white truncate uppercase tracking-wider border-b-2 border-dashed border-white/10 dark:border-zinc-700 pb-2">${escapeHtml(n.title || 'Untitled')}</p>`
 ).join('');
 }
 }

 function renderAnalyticsViews() {
 const weeklyContainer = document.getElementById('weeklyAnalyticsContainer');
 const monthlyContainer = document.getElementById('monthlyAnalyticsContainer');
 if(!weeklyContainer || !monthlyContainer) return;

 weeklyContainer.innerHTML = '';
 monthlyContainer.innerHTML = '';

 const computeBarRange = (dayWindow) => {
 const map = {};
 const now = new Date();
 const cutoff = new Date(now.getTime() - dayWindow * 24 * 60 * 60 * 1000);

 window.state.items.forEach(i => { map[i.name] = 0; });

 window.state.logs.forEach(log => {
 const logDate = new Date(log.timestamp);
 if(logDate >= cutoff) {
 const match = window.state.items.find(i => i.id === log.itemId);
 if(match) {
 map[match.name] = (map[match.name] || 0) + log.seconds;
 }
 }
 });
 return map;
 };

 const generateHTMLBars = (dataMap) => {
 const total = Object.values(dataMap).reduce((a, b) => a + b, 0);
 if(total === 0) return `<div class="text-xs text-gray-400 dark:text-zinc-500 font-extrabold uppercase tracking-wider py-4 text-center">No structural log records in range.</div>`;

 return Object.entries(dataMap).map(([name, sec]) => {
 const pct = total > 0 ? Math.min(100, Math.round((sec / total) * 100)) : 0;
 return `
 <div>
 <div class="flex justify-between text-xs font-bold mb-1 uppercase tracking-wider">
 <span class="text-black dark:text-white">${name}</span>
 <span class="text-zinc-500 dark:text-zinc-400 font-mono">${formatHoursAndMins(sec)} (${pct}%)</span>
 </div>
 <div class="w-full bg-zinc-100 dark:bg-[#1a1a1a] h-3.5 border-2 border-black dark:border-white overflow-hidden">
 <div class="bg-canary dark:bg-canary h-full" style="width: ${pct}%"></div>
 </div>
 </div>
 `;
 }).join('');
 };

 weeklyContainer.innerHTML = generateHTMLBars(computeBarRange(7));
 monthlyContainer.innerHTML = generateHTMLBars(computeBarRange(30));
 }

 /* DYNAMIC CALENDAR & GITHUB CONTRIBUTION GRID OPERATIONS */
 window.changeMonth = changeMonth;
 function changeMonth(dir) {
 window.state.currentCalendarDate.setMonth(window.state.currentCalendarDate.getMonth() + dir);
 renderCalendarViews();
 }

 function renderCalendarViews() {
 renderMonthlyGrid();
 renderGitHubHeatmap();
 }

 function renderMonthlyGrid() {
 const grid = document.getElementById('calendarGrid');
 const label = document.getElementById('calendarMonthYear');
 if(!grid || !label) return;

 grid.innerHTML = '';
 const d = window.state.currentCalendarDate;
 const year = d.getFullYear();
 const month = d.getMonth();

 const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
 label.innerText = `${monthNames[month]} ${year}`;

 const firstDayIndex = new Date(year, month, 1).getDay();
 const totalDays = new Date(year, month + 1, 0).getDate();

 // Padding blocks for off-grid initial offsets
 for(let i=0; i<firstDayIndex; i++) {
 const pad = document.createElement('div');
 pad.className = "bg-zinc-50/40 dark:bg-[#1a1a1a]/40 min-h-[76px] border-2 border-dashed border-zinc-200 dark:border-zinc-700";
 grid.appendChild(pad);
 }

 for(let day=1; day<=totalDays; day++) {
 const currentLoopDateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
 
 let habitSecToday = 0;
 let topicSecToday = 0;
 const habitBreakdown = {};
 const topicBreakdown = {};
 
 window.state.logs.forEach(log => {
 if (getLocalDateStr(log.timestamp) === currentLoopDateStr) {
 const match = window.state.items.find(i => i.id === log.itemId);
 if (match) {
 if (match.type === 'habit') {
 habitSecToday += log.seconds;
 habitBreakdown[match.name] = (habitBreakdown[match.name] || 0) + log.seconds;
 } else {
 topicSecToday += log.seconds;
 topicBreakdown[match.name] = (topicBreakdown[match.name] || 0) + log.seconds;
 }
 }
 }
 });
 
 const totalSecToday = habitSecToday + topicSecToday;

 const dayCard = document.createElement('div');
 dayCard.className = `min-h-[76px] p-2 border-2 flex flex-col justify-between text-xs transition relative calendar-cell ${totalSecToday > 0 ? 'bg-white dark:bg-[#262626] border-black dark:border-white shadow-brutal-sm' : 'bg-zinc-50/50 dark:bg-[#1a1a1a]/50 border-zinc-200 dark:border-zinc-700 hover:border-black dark:hover:border-white'}`;
 
 let tooltipContent = '';
 if (totalSecToday > 0) {
 const habitDetails = Object.entries(habitBreakdown).map(([name, sec]) => `${name}: ${formatHoursAndMins(sec)}`).join('\n');
 const topicDetails = Object.entries(topicBreakdown).map(([name, sec]) => `${name}: ${formatHoursAndMins(sec)}`).join('\n');
 tooltipContent = `Habits: ${formatHoursAndMins(habitSecToday)}\n${habitDetails}\n\nTopics: ${formatHoursAndMins(topicSecToday)}\n${topicDetails}\n\nTotal: ${formatHoursAndMins(totalSecToday)}`;
 }
 
 dayCard.innerHTML = `
 <span class="font-extrabold text-zinc-400 dark:text-zinc-500">${day}</span>
 ${totalSecToday > 0 ? `
 <div class="flex flex-col gap-1">
 <div class="flex items-center gap-1">
 <span class="bg-mint dark:bg-mint text-black font-mono font-bold text-[9px] px-1.5 py-0.5 border border-black dark:border-white w-fit">${formatHoursAndMins(habitSecToday)}</span>
 <span class="text-[8px] text-zinc-500 dark:text-zinc-400 font-extrabold uppercase tracking-wider">habits</span>
 </div>
 <div class="flex items-center gap-1">
 <span class="bg-lavender dark:bg-lavender text-black font-mono font-bold text-[9px] px-1.5 py-0.5 border border-black dark:border-white w-fit">${formatHoursAndMins(topicSecToday)}</span>
 <span class="text-[8px] text-zinc-500 dark:text-zinc-400 font-extrabold uppercase tracking-wider">topics</span>
 </div>
 </div>
 ` : '<span class="text-[9px] text-zinc-300 dark:text-zinc-600 italic font-bold">No entry</span>'}
 `;
 dayCard.setAttribute('data-tooltip', tooltipContent);
 grid.appendChild(dayCard);
 }
 }

 function renderGitHubHeatmap() {
 const grid = document.getElementById('heatmapGrid');
 const header = document.getElementById('heatmapMonthsHeader');
 if (!grid || !header) return;

 grid.innerHTML = '';
 header.innerHTML = '';

 const now = new Date();
 const currentYear = now.getFullYear();
 
 // Build absolute bounds: 53 weeks back from end of current week
 const endDate = new Date(now);
 // Move to end of current week (Saturday)
 endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
 
 const startDate = new Date(endDate);
 startDate.setDate(startDate.getDate() - (53 * 7) + 1); // 53 weeks back

 const totalDaysToRender = 53 * 7; 
 const monthPositions = {};

 // Accumulate operational analytics mapped directly into timestamp references
 const habitAggregator = {};
 const topicAggregator = {};
 window.state.logs.forEach(log => {
 const dateKey = getLocalDateStr(log.timestamp);
 const match = window.state.items.find(i => i.id === log.itemId);
 if (match) {
 if (match.type === 'habit') {
 habitAggregator[dateKey] = (habitAggregator[dateKey] || 0) + log.seconds;
 } else {
 topicAggregator[dateKey] = (topicAggregator[dateKey] || 0) + log.seconds;
 }
 }
 });

 for (let i = 0; i < totalDaysToRender; i++) {
 const workingDate = new Date(startDate.getTime());
 workingDate.setDate(startDate.getDate() + i);

 const dateKey = workingDate.getFullYear() + '-' + 
 String(workingDate.getMonth() + 1).padStart(2, '0') + '-' + 
 String(workingDate.getDate()).padStart(2, '0');

 const habitSec = habitAggregator[dateKey] || 0;
 const topicSec = topicAggregator[dateKey] || 0;
 const totalSec = habitSec + topicSec;
 const hoursLogged = totalSec / 3600;

 // Allocate positioning column indexes based on 7-day row layouts
 const columnIdx = Math.floor(i / 7);
 const monthName = workingDate.toLocaleString('en-US', { month: 'short' });

 if (workingDate.getDate() <= 7 && workingDate.getDay() === 0) {
 monthPositions[columnIdx] = monthName;
 }

 const cell = document.createElement('div');
 cell.className = 'w-3 h-3 border transition heatmap-cell ';
 
 // Set native styling based on hours logged
 if (hoursLogged === 0) {
 cell.className += 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200/50 dark:border-zinc-700/50';
 } else if (hoursLogged < 1) {
 cell.className += 'bg-lavender dark:bg-lavender border-black dark:border-white';
 } else if (hoursLogged < 3) {
 cell.className += 'bg-skybadge dark:bg-skybadge border-black dark:border-white';
 } else if (hoursLogged < 5) {
 cell.className += 'bg-mint dark:bg-mint border-black dark:border-white';
 } else {
 cell.className += 'bg-canary dark:bg-canary border-black dark:border-white';
 }

 const readableDate = workingDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
 let tooltipText = '';
 if (totalSec > 0) {
 const habitDayLogs = window.state.logs.filter(log => getLocalDateStr(log.timestamp) === dateKey && window.state.items.find(i => i.id === log.itemId)?.type === 'habit');
 const topicDayLogs = window.state.logs.filter(log => getLocalDateStr(log.timestamp) === dateKey && window.state.items.find(i => i.id === log.itemId)?.type === 'topic');
 
 const habitDetails = {};
 habitDayLogs.forEach(log => {
 const item = window.state.items.find(i => i.id === log.itemId);
 if (item) habitDetails[item.name] = (habitDetails[item.name] || 0) + log.seconds;
 });
 const topicDetails = {};
 topicDayLogs.forEach(log => {
 const item = window.state.items.find(i => i.id === log.itemId);
 if (item) topicDetails[item.name] = (topicDetails[item.name] || 0) + log.seconds;
 });
 
 const habitLines = Object.entries(habitDetails).map(([name, sec]) => `${name}: ${formatHoursAndMins(sec)}`).join('\n');
 const topicLines = Object.entries(topicDetails).map(([name, sec]) => `${name}: ${formatHoursAndMins(sec)}`).join('\n');
 
 tooltipText = `Habits: ${formatHoursAndMins(habitSec)}\n${habitLines}\n\nTopics: ${formatHoursAndMins(topicSec)}\n${topicLines}\n\nTotal: ${formatHoursAndMins(totalSec)} on ${readableDate}`;
 } else {
 tooltipText = `No time logged on ${readableDate}`;
 }
 cell.setAttribute('data-tooltip', tooltipText);
 
 grid.appendChild(cell);
 }

 // Build structural heading labels representing monthly grid column groupings
 Object.entries(monthPositions).forEach(([colIdx, name]) => {
 const span = document.createElement('span');
 span.className = 'absolute font-semibold';
 span.style.left = `${colIdx * 16}px`; 
 span.innerText = name;
 header.appendChild(span);
 });
 }

 /* NOTES LIST SELECTION ARCHITECTURE */
 window.renderNotesList = renderNotesList;
 function renderNotesList() {
 const container = document.getElementById('notesList');
 if(!container) return;
 container.innerHTML = '';

 const query = (document.getElementById('notesSearchInput')?.value || '').toLowerCase().trim();
 const filteredNotes = query
 ? window.state.notes.filter(n => (n.title || '').toLowerCase().includes(query) || (n.body || '').toLowerCase().includes(query))
 : window.state.notes;

 if(filteredNotes.length === 0) {
 const msg = query ? `No notes matching "${query}".` : 'No notes yet.';
 container.innerHTML = `<div class="text-xs text-zinc-400 dark:text-zinc-500 font-extrabold uppercase tracking-wider text-center py-8">${msg}</div>`;
 return;
 }

 filteredNotes.forEach(note => {
 const isSelected = window.state.selectedNoteId === note.id;
 const card = document.createElement('div');
 card.className = `p-4 border-2 text-left cursor-pointer transition relative ${isSelected ? 'bg-canary dark:bg-canary border-black dark:border-white shadow-brutal-sm' : 'bg-zinc-50/50 dark:bg-[#1a1a1a]/50 border-zinc-200 dark:border-white hover:border-black dark:hover:border-zinc-300'}`;
 card.onclick = () => openNoteEditor(note.id);

 card.innerHTML = `
 <div class="pr-6">
 <h4 class="text-sm font-extrabold uppercase tracking-wider text-black dark:text-white truncate">${escapeHtml(note.title) || 'Untitled Concept'}</h4>
 <p class="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-1 font-medium">${note.body ? escapeHtml(note.body.replace(/<[^>]*>/g, '')) : 'Empty note content...'}</p>
 </div>
 <button onclick="deleteNote('${note.id}', event)" class="absolute top-4 right-4 p-1 hover:bg-red-100 dark:hover:bg-red-900/30 border border-transparent hover:border-red-500 text-zinc-300 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-400 rounded transition">
 <i data-lucide="x" class="w-3.5 h-3.5"></i>
 </button>
 `;
 container.appendChild(card);
 });
 createIcons({icons});
 }

 function openNoteEditor(id) {
 window.state.selectedNoteId = id;
 const targetNote = window.state.notes.find(n => n.id === id);
 if(!targetNote) return;

 document.getElementById('noNotePlaceholder').classList.add('hidden');
 const editor = document.getElementById('noteEditor');
 editor.classList.remove('hidden');

 document.getElementById('noteTitleInput').value = targetNote.title || '';
 document.getElementById('noteBodyInput').innerHTML = targetNote.body || '';

 renderNotesList();
 createIcons({icons});
 }

 window.formatNoteText = function(command) {
 const editor = document.getElementById('noteBodyInput');
 editor.focus();

 const selection = window.getSelection();
 if (!selection.rangeCount) return;
 const range = selection.getRangeAt(0);

 if (command === 'bold' || command === 'italic') {
 if (range.collapsed) return;
 const tag = command === 'bold' ? 'strong' : 'em';
 const parent = range.commonAncestorContainer;
 const parentTag = parent.nodeType === 1 ? parent : parent.parentElement;
 const alreadyWrapped = parentTag && parentTag.tagName === tag.toUpperCase();
 if (alreadyWrapped) {
 const child = parentTag.firstChild;
 if (child) {
 parentTag.replaceWith(child);
 selection.removeAllRanges();
 const newRange = document.createRange();
 newRange.selectNodeContents(child);
 selection.addRange(newRange);
 }
 } else {
 try {
 range.surroundContents(document.createElement(tag));
 } catch {
 document.execCommand(command, false, null);
 }
 }
 } else if (command === 'ul' || command === 'ol') {
 const tag = command === 'ul' ? 'ul' : 'ol';
 const parent = range.commonAncestorContainer;
 const parentEl = parent.nodeType === 1 ? parent : parent.parentElement;
 const inList = parentEl && parentEl.closest('ul,ol');
 if (inList) {
 const wrapper = document.createElement('p');
 wrapper.textContent = selection.toString();
 inList.parentElement?.replaceChild(wrapper, inList);
 } else {
 const list = document.createElement(tag);
 const li = document.createElement('li');
 li.textContent = selection.toString() || 'List item';
 list.appendChild(li);
 try {
 range.deleteContents();
 range.insertNode(list);
 } catch {
 document.execCommand(command === 'ul' ? 'insertUnorderedList' : 'insertOrderedList', false, null);
 }
 }
 }
 editor.focus();
 }

 window.addEventListener('DOMContentLoaded', () => {
 const loginIcons = document.querySelectorAll('#loginScreen [data-lucide]');
 loginIcons.forEach(icon => createIcons({icons, node: icon}));
 });

 if (typeof window.login !== 'function') {
 console.error('Focus Synergy: Module script failed to load. Ensure you are serving via HTTP (npm run static-server) and that env.js exists.');
 }
 
