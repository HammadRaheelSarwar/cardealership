"use strict";
// Shared types used by both client and server
Object.defineProperty(exports, "__esModule", { value: true });
exports.RECOMMENDED_STAGE_TASKS = exports.DEFAULT_PIPELINE_STAGES = void 0;
exports.getTaskDisplayStatus = getTaskDisplayStatus;
// ─── Default Stages Definition ────────────────────────────────────────────────
exports.DEFAULT_PIPELINE_STAGES = [
    { name: 'New Lead', slug: 'new-lead', sortOrder: 0, type: 'standard', color: '#3B82F6' },
    { name: 'Contacted', slug: 'contacted', sortOrder: 1, type: 'standard', color: '#8B5CF6' },
    { name: 'Appointment Set', slug: 'appointment-set', sortOrder: 2, type: 'standard', color: '#06B6D4' },
    { name: 'Show / Test Drive', slug: 'show-test-drive', sortOrder: 3, type: 'standard', color: '#D4AF37' },
    { name: 'Working Deal', slug: 'working-deal', sortOrder: 4, type: 'standard', color: '#F97316' },
    { name: 'Sold', slug: 'sold', sortOrder: 5, type: 'won', color: '#22C55E' },
    { name: 'Lost', slug: 'lost', sortOrder: 6, type: 'lost', color: '#EF4444' },
];
exports.RECOMMENDED_STAGE_TASKS = {
    'new-lead': ['call', 'text', 'email'],
    'contacted': ['follow_up', 'call', 'confirm_appointment'],
    'appointment-set': ['confirm_appointment', 'text'],
    'show-test-drive': ['follow_up', 'send_numbers'],
    'working-deal': ['follow_up', 'send_numbers', 'call'],
    'sold': [],
    'lost': [],
};
// ─── Derived Task Display Status ──────────────────────────────────────────────
// dueAt-based computation — status is NEVER stored as 'today'/'overdue' in DB
function getTaskDisplayStatus(status, dueAt) {
    if (status === 'completed')
        return 'completed';
    if (status === 'cancelled')
        return 'cancelled';
    const due = new Date(dueAt);
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
    if (due < todayStart)
        return 'overdue';
    if (due >= todayStart && due < todayEnd)
        return 'today';
    return 'upcoming';
}
//# sourceMappingURL=index.js.map