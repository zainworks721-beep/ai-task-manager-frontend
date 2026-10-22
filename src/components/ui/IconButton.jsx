import { forwardRef } from 'react';
import { cn } from '../../lib/cn';
import { Tooltip } from './Tooltip';

const VARIANTS = {
  ghost: 'text-ink-subtle hover:bg-surface-subtle hover:text-ink active:bg-surface-sunken',
  subtle: 'bg-surface-subtle text-ink-muted hover:bg-surface-sunken hover:text-ink',
  outlined:
    'border border-line bg-surface text-ink-muted shadow-xs hover:border-line-strong hover:text-ink hover:shadow-sm',
  brand: 'bg-brand-500/10 text-brand-300 hover:bg-brand-500/15 hover:text-brand-300',
  danger: 'text-ink-subtle hover:bg-rose-500/10 hover:text-rose-300 active:bg-rose-500/15',
};

const SIZES = {
  sm: 'size-7 rounded-lg [&_svg]:size-3.5',
  md: 'size-9 rounded-[10px] [&_svg]:size-4',
  lg: 'size-10 rounded-xl [&_svg]:size-[18px]',
};

/**
 * Accessible icon-only button with a portal tooltip. Always requires `label`.
 */
const IconButton = forwardRef(function IconButton(
  {
    label,
    icon,
    variant = 'ghost',
    size = 'md',
    tooltipSide = 'top',
    showTooltip = true,
    className,
    disabled,
    type = 'button',
    ...props
  },
  ref
) {
  const button = (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      disabled={disabled}
      className={cn(
        'inline-flex shrink-0 items-center justify-center',
        'transition-all duration-200 ease-out-expo',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
        'disabled:pointer-events-none disabled:opacity-40',
        !disabled && 'active:scale-90',
        VARIANTS[variant] || VARIANTS.ghost,
        SIZES[size] || SIZES.md,
        className
      )}
      {...props}
    >
      {icon}
    </button>
  );

  if (!showTooltip) return button;

  return (
    <Tooltip content={label} side={tooltipSide} disabled={disabled}>
      {button}
    </Tooltip>
  );
});

export { IconButton };
export default IconButton;
