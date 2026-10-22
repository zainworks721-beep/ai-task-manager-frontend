/**
 * Single source of truth for task statuses and board column metadata.
 * Class strings are written in full so Tailwind's JIT can see them.
 *
 * Palette intent: a calm, premium trio — neutral slate, brand indigo, and
 * emerald success. Warm hues are reserved for warnings/overdue only, so the
 * board never turns into a rainbow.
 */

export const TASK_STATUSES = ['pending', 'in-progress', 'completed'];

export const STATUS_CONFIG = {
  pending: {
    id: 'pending',
    label: 'To Do',
    shortLabel: 'To Do',
    description: 'Scoped and ready to be picked up',
    badge: 'bg-slate-500/15 text-slate-300 ring-1 ring-inset ring-slate-500/25',
    dot: 'bg-slate-400',
    iconTile: 'bg-slate-500/15 text-slate-300 ring-1 ring-inset ring-slate-500/25',
    bar: 'bg-slate-400',
    soft: 'bg-slate-500/10',
    text: 'text-slate-300',
    ring: 'ring-slate-500/20',
    hover: 'hover:border-slate-500/40',
    hairline: 'from-slate-300/0 via-slate-400/50 to-slate-300/0',
  },
  'in-progress': {
    id: 'in-progress',
    label: 'In Progress',
    shortLabel: 'Active',
    description: 'Actively being worked on right now',
    badge: 'bg-brand-500/10 text-brand-300 ring-1 ring-inset ring-brand-500/25',
    dot: 'bg-brand-500',
    iconTile: 'bg-brand-500/10 text-brand-300 ring-1 ring-inset ring-brand-500/20',
    bar: 'bg-brand-500',
    soft: 'bg-brand-500/10',
    text: 'text-brand-300',
    ring: 'ring-brand-500/20',
    hover: 'hover:border-brand-500/40',
    hairline: 'from-brand-400/0 via-brand-500/50 to-brand-400/0',
  },
  completed: {
    id: 'completed',
    label: 'Completed',
    shortLabel: 'Done',
    description: 'Shipped and verified',
    badge: 'bg-emerald-500/10 text-emerald-300 ring-1 ring-inset ring-emerald-500/25',
    dot: 'bg-emerald-500',
    iconTile: 'bg-emerald-500/10 text-emerald-300 ring-1 ring-inset ring-emerald-500/20',
    bar: 'bg-emerald-500',
    soft: 'bg-emerald-500/10',
    text: 'text-emerald-300',
    ring: 'ring-emerald-500/20',
    hover: 'hover:border-emerald-500/40',
    hairline: 'from-emerald-400/0 via-emerald-500/50 to-emerald-400/0',
  },
};

export const COLUMNS = TASK_STATUSES.map((id) => ({
  id,
  title: STATUS_CONFIG[id].label,
  description: STATUS_CONFIG[id].description,
  meta: STATUS_CONFIG[id],
}));

export const STATUS_OPTIONS = TASK_STATUSES.map((id) => ({
  value: id,
  label: STATUS_CONFIG[id].label,
}));

export const APP = {
  name: 'TaskFlow',
  suffix: 'AI',
  version: '2.0',
  tagline: 'Precision task management',
};

export const PRIORITY_CONFIG = {
  high: {
    label: 'High',
    badge: 'bg-rose-500/10 text-rose-300 ring-1 ring-inset ring-rose-500/25',
    dot: 'bg-rose-500',
  },
  medium: {
    label: 'Medium',
    badge: 'bg-amber-500/10 text-amber-300 ring-1 ring-inset ring-amber-500/25',
    dot: 'bg-amber-500',
  },
  low: {
    label: 'Low',
    badge: 'bg-slate-500/15 text-slate-300 ring-1 ring-inset ring-slate-500/25',
    dot: 'bg-slate-400',
  },
};
