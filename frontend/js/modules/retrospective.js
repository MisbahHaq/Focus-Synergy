/**
 * Season Retrospective View Module.
 * Computes analytics and renders summary modal for finished/previewed seasons.
 */

import { escapeHtml } from '../utils/sanitize.js';
import { getLocalDateStr } from '../utils/format.js';

export function calculateSeasonRetrospective(season, logs = [], dailyLogs = [], habitLogs = []) {
 if (!season) return null;

 const start = new Date(season.startDate).getTime();
 const end = new Date(season.endDate).getTime();

 // 1. Total Focused Hours
 const seasonLogs = logs.filter(l => {
 const t = new Date(l.timestamp).getTime();
 return t >= start && t <= end;
 });
 const totalSeconds = seasonLogs.reduce((acc, l) => acc + (l.seconds || 0), 0);
 const totalHours = (totalSeconds / 3600).toFixed(1);

 // 2. Micro-habit completion rate (% of days in season)
 const seasonHabitLogs = habitLogs.filter(h => {
 if (h.seasonId && h.seasonId !== season.id) return false;
 const d = new Date(h.date).getTime();
 return d >= start && d <= end && h.completed;
 });

 const totalDays = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
 const completedDaysCount = new Set(seasonHabitLogs.map(h => h.date)).size;
 const habitCompletionRate = Math.min(100, Math.round((completedDaysCount / totalDays) * 100));

 // 3. High-energy vs low-energy day split
 const seasonDailyLogs = dailyLogs.filter(d => {
 const t = new Date(d.date || d.timestamp).getTime();
 return t >= start && t <= end;
 });

 let highEnergyDays = 0;
 let lowEnergyDays = 0;
 let normalEnergyDays = 0;

 seasonDailyLogs.forEach(log => {
 const mode = (log.energyMode || '').toLowerCase();
 if (mode === 'production' || mode === 'high' || mode === 'sprint') {
 highEnergyDays++;
 } else if (mode === 'recovery' || mode === 'low' || mode === 'rest') {
 lowEnergyDays++;
 } else {
 normalEnergyDays++;
 }
 });

 // 4. Day-by-day strip visualization data
 const dayStrip = [];
 const dayMs = 24 * 60 * 60 * 1000;
 for (let i = 0; i < totalDays; i++) {
 const currentMs = start + i * dayMs;
 const dateStr = getLocalDateStr(currentMs);
 
 const hasHabit = seasonHabitLogs.some(h => h.date === dateStr);
 const dayLog = seasonDailyLogs.find(d => getLocalDateStr(d.date) === dateStr);
 const dayFocusSec = seasonLogs
 .filter(l => getLocalDateStr(l.timestamp) === dateStr)
 .reduce((sum, l) => sum + (l.seconds || 0), 0);

 dayStrip.push({
 date: dateStr,
 hasHabit,
 energyMode: dayLog ? dayLog.energyMode : 'none',
 focusHours: (dayFocusSec / 3600).toFixed(1)
 });
 }

 return {
 season,
 totalHours,
 habitCompletionRate,
 completedDaysCount,
 totalDays,
 highEnergyDays,
 lowEnergyDays,
 normalEnergyDays,
 dayStrip
 };
}

export function renderRetrospectiveModal(retroData) {
 if (!retroData) return '';

 const { season, totalHours, habitCompletionRate, completedDaysCount, totalDays, highEnergyDays, lowEnergyDays, dayStrip } = retroData;

 return `
 <div id="retroModalOverlay" class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
 <div class="bg-white dark:bg-[#262626] border-2 border-black dark:border-white shadow-brutal-lg max-w-2xl w-full p-6 space-y-6 tab-enter">
 <div class="flex justify-between items-start border-b-2 border-black dark:border-white pb-4">
 <div>
 <span class="text-xs font-extrabold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Season Retrospective</span>
 <h2 class="text-2xl font-extrabold uppercase tracking-wider text-black dark:text-white">${escapeHtml(season.title) || 'Season Overview'}</h2>
 <p class="text-xs text-zinc-500 mt-1 font-mono font-bold">${new Date(season.startDate).toLocaleDateString()} — ${new Date(season.endDate).toLocaleDateString()}</p>
 </div>
 <button onclick="closeRetroModal()" class="p-2 text-zinc-400 hover:text-black dark:hover:text-white border-2 border-transparent hover:border-black dark:hover:border-white transition">
 <i data-lucide="x" class="w-5 h-5"></i>
 </button>
 </div>

 <!-- Stats Grid -->
 <div class="grid grid-cols-3 gap-4">
 <div class="bg-zinc-100 dark:bg-[#1a1a1a] p-4 border-2 border-black dark:border-white shadow-brutal-sm">
 <div class="text-2xl font-mono font-bold text-black dark:text-white tabular-nums">${totalHours}h</div>
 <div class="text-xs text-zinc-500 font-extrabold uppercase tracking-wider mt-1">Total Focused Time</div>
 </div>
 <div class="bg-zinc-100 dark:bg-[#1a1a1a] p-4 border-2 border-black dark:border-white shadow-brutal-sm">
 <div class="text-2xl font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">${habitCompletionRate}%</div>
 <div class="text-xs text-zinc-500 font-extrabold uppercase tracking-wider mt-1">Habit Rate (${completedDaysCount}/${totalDays} days)</div>
 </div>
 <div class="bg-zinc-100 dark:bg-[#1a1a1a] p-4 border-2 border-black dark:border-white shadow-brutal-sm">
 <div class="text-2xl font-mono font-bold text-amber-600 dark:text-amber-400 tabular-nums">${highEnergyDays}:${lowEnergyDays}</div>
 <div class="text-xs text-zinc-500 font-extrabold uppercase tracking-wider mt-1">High vs Low Energy Days</div>
 </div>
 </div>

 <!-- Day-by-Day Strip Visualization -->
 <div>
 <h4 class="text-xs font-extrabold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-3">Daily Progress Strip</h4>
 <div class="flex gap-1 overflow-x-auto pb-2 no-scrollbar">
 ${dayStrip.map(day => {
 let bgClass = 'bg-zinc-200 dark:bg-zinc-700';
 if (day.hasHabit && day.focusHours > 0) bgClass = 'bg-mint dark:bg-mint';
 else if (day.hasHabit) bgClass = 'bg-canary dark:bg-canary';
 else if (day.focusHours > 0) bgClass = 'bg-lavender dark:bg-lavender';

 return `
 <div class="w-7 h-10 ${bgClass} border border-black dark:border-white flex-shrink-0 flex flex-col items-center justify-between py-1 text-[9px] font-bold text-black dark:text-black cursor-pointer relative group" title="${day.date}: ${day.focusHours}h focus | Habit: ${day.hasHabit ? 'Done' : 'Missed'}">
 <span class="font-mono">${new Date(day.date).getDate()}</span>
 <span>${day.hasHabit ? '✓' : ''}</span>
 </div>
 `;
 }).join('')}
 </div>
 </div>

 <div class="flex justify-end pt-2">
 <button onclick="closeRetroModal()" class="px-5 py-2 bg-canary dark:bg-canary border-2 border-black dark:border-white shadow-brutal-sm hover:shadow-brutal text-black dark:text-black font-extrabold uppercase text-xs tracking-wider transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-none">
 Close Overview
 </button>
 </div>
 </div>
 </div>
 `;
}