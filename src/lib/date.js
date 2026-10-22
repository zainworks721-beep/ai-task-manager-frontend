const DAY_MS = 86_400_000;

function toDate(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** "Oct 24" — compact, used inside cards. */
export function formatDate(value) {
  const date = toDate(value);
  if (!date) return null;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/** "Oct 24, 2026" — used in tooltips and detail views. */
export function formatFullDate(value) {
  const date = toDate(value);
  if (!date) return null;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/** ISO date for <input type="date"> values. */
export function toDateInputValue(value) {
  const date = toDate(value);
  if (!date) return '';
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().split('T')[0];
}

export function getDaysUntil(value) {
  const date = toDate(value);
  if (!date) return null;
  return Math.round((startOfDay(date) - startOfDay(new Date())) / DAY_MS);
}

export function isOverdue(value, status) {
  if (status === 'completed') return false;
  const days = getDaysUntil(value);
  return days !== null && days < 0;
}

/**
 * Human, tone-aware due date metadata for the card footer.
 * tone: 'overdue' | 'today' | 'soon' | 'normal'
 */
export function getDueMeta(value, status) {
  const date = toDate(value);
  if (!date) return null;

  const days = getDaysUntil(date);
  const label = formatDate(date);
  const full = formatFullDate(date);

  if (status === 'completed') {
    return { label, full, tone: 'normal', hint: `Due ${full}` };
  }
  if (days < 0) {
    const overdueBy = Math.abs(days);
    return {
      label,
      full,
      tone: 'overdue',
      hint: `Overdue by ${overdueBy} day${overdueBy === 1 ? '' : 's'}`,
    };
  }
  if (days === 0) return { label: 'Today', full, tone: 'today', hint: `Due today` };
  if (days === 1) return { label: 'Tomorrow', full, tone: 'soon', hint: `Due tomorrow` };
  if (days <= 3) return { label, full, tone: 'soon', hint: `Due in ${days} days` };

  return { label, full, tone: 'normal', hint: `Due ${full}` };
}

export const DUE_TONES = {
  overdue: 'text-rose-300',
  today: 'text-amber-300',
  soon: 'text-amber-300',
  normal: 'text-ink-subtle',
};
