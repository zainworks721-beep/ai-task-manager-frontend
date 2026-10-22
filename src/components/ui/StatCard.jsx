import { motion } from 'framer-motion';
import { cn } from '../../lib/cn';

/**
 * KPI tones — deliberately limited to a harmonious set:
 * neutral slate, brand indigo, emerald success and one ink accent.
 */
const TONES = {
  slate: {
    tile: 'bg-slate-500/15 text-slate-300 ring-slate-500/25',
    bar: 'bg-slate-400',
  },
  brand: {
    tile: 'bg-brand-500/10 text-brand-300 ring-brand-500/20',
    bar: 'bg-brand-500',
  },
  emerald: {
    tile: 'bg-emerald-500/10 text-emerald-300 ring-emerald-500/20',
    bar: 'bg-emerald-500',
  },
  ink: {
    tile: 'bg-ink-strong text-surface-muted ring-white/20',
    bar: 'bg-ink-strong',
  },
  /* Kept for API compatibility — not used on the board. */
  amber: {
    tile: 'bg-amber-500/10 text-amber-300 ring-amber-500/20',
    bar: 'bg-amber-400',
  },
  sky: {
    tile: 'bg-sky-500/10 text-sky-300 ring-sky-500/20',
    bar: 'bg-sky-400',
  },
};

/**
 * KPI tile used in the workspace header. Optionally interactive (filter).
 */
export function StatCard({
  label,
  value,
  total,
  percent,
  icon,
  tone = 'brand',
  active = false,
  onClick,
  hint,
  className,
  delay = 0,
}) {
  const config = TONES[tone] || TONES.brand;
  const Comp = onClick ? motion.button : motion.div;
  const fill = percent != null ? percent : total ? (Number(value) / total) * 100 : null;

  return (
    <Comp
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      aria-pressed={onClick ? active : undefined}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={onClick ? { y: -2 } : undefined}
      whileTap={onClick ? { scale: 0.985 } : undefined}
      className={cn(
        'group relative flex flex-col justify-between gap-3 rounded-2xl border bg-surface p-4 text-left shadow-xs',
        'transition-[border-color,box-shadow] duration-200 ease-out-expo',
        onClick && 'cursor-pointer',
        active
          ? 'border-brand-500/40 ring-2 ring-brand-500/10'
          : 'border-line hover:border-line-strong hover:shadow-sm',
        className
      )}
    >
      <div className="flex items-start justify-between gap-2.5">
        <div className="min-w-0">
          <span className="block truncate text-[11px] font-semibold uppercase tracking-[0.07em] text-ink-subtle">
            {label}
          </span>
          <div className="mt-1.5 flex items-baseline gap-1">
            <span className="tabular text-[27px] font-semibold leading-none tracking-tightest text-ink-strong">
              {value}
            </span>
            {total != null && (
              <span className="tabular text-[12px] font-medium leading-none text-ink-subtle">
                / {total}
              </span>
            )}
          </div>
        </div>

        {icon && (
          <span
            className={cn(
              'flex size-9 shrink-0 items-center justify-center rounded-[11px] ring-1 ring-inset [&_svg]:size-[17px]',
              'transition-transform duration-300 ease-spring group-hover:scale-105',
              config.tile
            )}
            aria-hidden="true"
          >
            {icon}
          </span>
        )}
      </div>

      <div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-surface-sunken">
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: fill != null ? Math.min(1, Math.max(0, fill / 100)) : 0 }}
            transition={{ duration: 0.8, delay: delay + 0.1, ease: [0.16, 1, 0.3, 1] }}
            className={cn('h-full origin-left rounded-full', config.bar)}
          />
        </div>
        {hint && (
          <p className="mt-2 truncate text-[11.5px] font-medium leading-none text-ink-subtle">
            {hint}
          </p>
        )}
      </div>
    </Comp>
  );
}

export default StatCard;
