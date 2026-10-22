import { useId } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/cn';

const SIZES = {
  sm: 'p-0.5 text-[11.5px]',
  md: 'p-1 text-[12.5px]',
};

const ITEM_SIZES = {
  sm: 'h-6 px-2.5 gap-1 rounded-[7px]',
  md: 'h-7 px-3 gap-1.5 rounded-[9px]',
};

/**
 * Sliding-indicator segmented control (Linear / Vercel pattern).
 */
export function SegmentedControl({
  options = [],
  value,
  onChange,
  name,
  size = 'md',
  fullWidth = false,
  className,
  ariaLabel,
}) {
  const layoutId = useId();

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel || name || 'Options'}
      className={cn(
        'inline-flex items-center rounded-xl border border-line bg-surface-muted',
        SIZES[size] || SIZES.md,
        fullWidth && 'flex w-full',
        className
      )}
    >
      {options.map((option) => {
        const Icon = option.icon;
        const checked = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={checked}
            onClick={() => onChange?.(option.value)}
            className={cn(
              'relative flex items-center justify-center whitespace-nowrap font-semibold',
              'transition-colors duration-200 ease-out-expo',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 focus-visible:ring-offset-1 focus-visible:ring-offset-surface',
              ITEM_SIZES[size] || ITEM_SIZES.md,
              fullWidth && 'flex-1',
              checked ? 'text-ink-strong' : 'text-ink-subtle hover:text-ink-muted'
            )}
          >
            {checked && (
              <motion.span
                layoutId={layoutId}
                transition={{ type: 'spring', bounce: 0.15, duration: 0.35 }}
                className="absolute inset-0 rounded-[9px] bg-surface shadow-sm ring-1 ring-inset ring-line"
                aria-hidden="true"
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              {Icon && <Icon className="size-3.5" aria-hidden="true" />}
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default SegmentedControl;
