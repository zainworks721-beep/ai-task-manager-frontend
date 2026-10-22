import { cn } from '../../lib/cn';
import { STATUS_CONFIG } from '../../lib/constants';

const VARIANTS = {
  neutral: 'bg-surface-subtle text-ink-muted ring-1 ring-inset ring-line-strong/60',
  brand: 'bg-brand-500/10 text-brand-300 ring-1 ring-inset ring-brand-500/25',
  success: 'bg-emerald-500/10 text-emerald-300 ring-1 ring-inset ring-emerald-500/25',
  warning: 'bg-amber-500/10 text-amber-300 ring-1 ring-inset ring-amber-500/25',
  danger: 'bg-rose-500/10 text-rose-300 ring-1 ring-inset ring-rose-500/25',
  info: 'bg-sky-500/10 text-sky-300 ring-1 ring-inset ring-sky-500/25',
  outline: 'border border-line bg-surface text-ink-muted',
};

const SIZES = {
  xs: 'h-5 gap-1 px-2 text-[11px] font-semibold',
  sm: 'h-6 gap-1.5 px-2.5 text-[11.5px] font-semibold',
  md: 'h-7 gap-1.5 px-3 text-[12.5px] font-semibold',
};

const DOTS = {
  neutral: 'bg-ink-subtle',
  brand: 'bg-brand-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-rose-500',
  info: 'bg-sky-500',
  outline: 'bg-ink-subtle',
};

export function Badge({
  children,
  variant = 'neutral',
  size = 'sm',
  dot = false,
  icon = null,
  className,
}) {
  return (
    <span
      className={cn(
        'inline-flex select-none items-center whitespace-nowrap rounded-full leading-none',
        SIZES[size] || SIZES.sm,
        VARIANTS[variant] || VARIANTS.neutral,
        className
      )}
    >
      {dot ? (
        <span
          className={cn('size-1.5 shrink-0 rounded-full', DOTS[variant] || DOTS.neutral)}
          aria-hidden="true"
        />
      ) : (
        icon && <span className="shrink-0 [&_svg]:size-3" aria-hidden="true">{icon}</span>
      )}
      {children}
    </span>
  );
}

/** Task status pill, driven by the shared status config. */
export function StatusBadge({ status, size = 'sm', className }) {
  const meta = STATUS_CONFIG[status] || STATUS_CONFIG.pending;

  return (
    <span
      className={cn(
        'inline-flex select-none items-center gap-1.5 whitespace-nowrap rounded-full leading-none',
        SIZES[size] || SIZES.sm,
        meta.badge,
        className
      )}
    >
      <span className={cn('size-1.5 shrink-0 rounded-full', meta.dot)} aria-hidden="true" />
      {meta.label}
    </span>
  );
}

export default Badge;
