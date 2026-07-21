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
    overlay.className = 'fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 tab-enter';

    overlay.innerHTML = `
        <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <div class="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-400">
                <span>Step ${currentStepIndex + 1} of ${TOUR_STEPS.length}</span>
                <button onclick="window.skipOnboardingTour()" class="hover:text-zinc-900 dark:hover:text-zinc-100 transition">Skip</button>
            </div>
            
            <h3 class="text-xl font-bold text-zinc-900 dark:text-zinc-100">${step.title}</h3>
            <p class="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">${step.content}</p>

            <div class="flex justify-between items-center pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <button onclick="window.prevOnboardingStep()" ${isFirst ? 'disabled class="opacity-40 text-sm font-semibold text-zinc-400 cursor-not-allowed"' : 'class="text-sm font-semibold text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100"'}>
                    &larr; Back
                </button>
                <div class="flex gap-2">
                    <button onclick="window.nextOnboardingStep()" class="px-5 py-2.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl font-semibold text-sm hover:opacity-90 transition">
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
