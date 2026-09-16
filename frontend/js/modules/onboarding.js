/**
 * First-launch onboarding tour (Coachmark spotlight pattern).
 */

const TOUR_STEPS = [
    {
        title: "Welcome to Focus Synergy",
        content: "A minimal, low-friction workspace designed to log deep work sessions, build consistency streaks, and track quarterly seasons.",
        targetId: null
    },
    {
        title: "Topics, Habits & Smart Timers",
        content: "Create focus topics or habits in the sidebar. Click any item to view its counter, then hit Start Timer to track focused work in real-time.",
        targetId: "newItemName"
    },
    {
        title: "Activity Heatmap & Analytics",
        content: "Track your long-term focus intensity and weekly performance trends in the Analytics tab.",
        targetId: "btn-analytics"
    },
    {
        title: "Seasons & Energy Mode Logs",
        content: "Plan 4-6 week focus seasons, track daily micro-habits, and audit your daily energy levels (Production vs Recovery mode).",
        targetId: "btn-seasons"
    },
    {
        title: "Notes & Flexible Backlog",
        content: "Keep rich distraction-free session notes and manage your 'Not-Right-Now' backlog without overwhelming your active focus.",
        targetId: "btn-notes"
    }
];

let currentStepIndex = 0;
let isTourActive = false;

export function startOnboardingTour(onComplete) {
    currentStepIndex = 0;
    isTourActive = true;
    renderTourStep(onComplete);
    bindKeyListeners(onComplete);
}

function renderTourStep(onComplete) {
    const existing = document.getElementById('tourCoachmarkOverlay');
    if (existing) existing.remove();

    if (currentStepIndex < 0 || currentStepIndex >= TOUR_STEPS.length) {
        finishTour(onComplete);
        return;
    }

    const step = TOUR_STEPS[currentStepIndex];
    const isFirst = currentStepIndex === 0;
    const isLast = currentStepIndex === TOUR_STEPS.length - 1;

    const overlay = document.createElement('div');
    overlay.id = 'tourCoachmarkOverlay';
    overlay.className = 'fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 tab-enter';

    overlay.innerHTML = `
        <div class="bg-white dark:bg-[#262626] midnight:bg-[#1e293b] border-2 border-black dark:border-white midnight:border-[#475569] shadow-brutal-lg max-w-md w-full p-6 relative space-y-4">
            <div class="flex items-center justify-between text-xs font-extrabold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 midnight:text-[#94a3b8]">
                <span>Step ${currentStepIndex + 1} of ${TOUR_STEPS.length}</span>
                <button onclick="window.skipOnboardingTour()" class="hover:text-black dark:hover:text-white midnight:hover:text-[#e2e8f0] transition font-extrabold uppercase tracking-wider">Skip</button>
            </div>

            <h3 class="text-xl font-extrabold uppercase tracking-wider text-black dark:text-white midnight:text-[#e2e8f0]">${step.title}</h3>
            <p class="text-sm text-zinc-600 dark:text-zinc-300 midnight:text-[#94a3b8] leading-relaxed font-medium">${step.content}</p>

            <div class="flex justify-between items-center pt-4 border-t-2 border-black dark:border-white midnight:border-[#475569]">
                <button onclick="window.prevOnboardingStep()" ${isFirst ? 'disabled class="opacity-40 text-sm font-extrabold uppercase tracking-wider text-zinc-400 cursor-not-allowed"' : 'class="text-sm font-extrabold uppercase tracking-wider text-zinc-600 dark:text-zinc-300 midnight:text-[#94a3b8] hover:text-black dark:hover:text-white midnight:hover:text-[#e2e8f0]"'}>
                    &larr; Back
                </button>
                <div class="flex gap-2">
                    <button onclick="window.nextOnboardingStep()" class="px-5 py-2.5 bg-canary dark:bg-canary midnight:bg-[#fbbf24] border-2 border-black dark:border-white midnight:border-[#475569] shadow-brutal-sm hover:shadow-brutal text-black dark:text-black midnight:text-[#0f172a] font-extrabold uppercase text-xs tracking-wider transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-none">
                        ${isLast ? 'Get Started' : 'Next &rarr;'}
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    window.nextOnboardingStep = () => {
        currentStepIndex++;
        renderTourStep(onComplete);
    };

    window.prevOnboardingStep = () => {
        if (currentStepIndex > 0) {
            currentStepIndex--;
            renderTourStep(onComplete);
        }
    };

    window.skipOnboardingTour = () => {
        finishTour(onComplete);
    };
}

function bindKeyListeners(onComplete) {
    const handleKeydown = (e) => {
        if (!isTourActive) {
            window.removeEventListener('keydown', handleKeydown);
            return;
        }
        if (e.key === 'Escape') {
            finishTour(onComplete);
        } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
            currentStepIndex++;
            renderTourStep(onComplete);
        } else if (e.key === 'ArrowLeft' && currentStepIndex > 0) {
            currentStepIndex--;
            renderTourStep(onComplete);
        }
    };
    window.addEventListener('keydown', handleKeydown);
}

function finishTour(onComplete) {
    isTourActive = false;
    const existing = document.getElementById('tourCoachmarkOverlay');
    if (existing) existing.remove();
    if (onComplete) onComplete();
}
