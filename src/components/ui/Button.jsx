import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/cn';

const VARIANTS = {
  primary:
    'bg-brand-600 text-white shadow-sm shadow-brand-600/25 hover:bg-brand-700 hover:shadow-md hover:shadow-brand-600/30 active:bg-brand-800 active:shadow-xs',
  secondary:
    'border border-line bg-surface text-ink shadow-xs hover:border-line-strong hover:bg-surface-muted hover:shadow-sm active:bg-surface-subtle',
  ghost:
    'text-ink-muted hover:bg-surface-subtle hover:text-ink active:bg-surface-sunken',
  subtle:
    'bg-brand-500/10 text-brand-300 hover:bg-brand-500/15 active:bg-brand-500/20',
  outline:
    'border border-brand-500/30 bg-surface text-brand-300 shadow-xs hover:border-brand-500/40 hover:bg-brand-500/10 active:bg-brand-500/15',
  danger:
    'bg-rose-600 text-white shadow-sm shadow-rose-600/25 hover:bg-rose-700 hover:shadow-md hover:shadow-rose-600/30 active:bg-rose-800',
  'danger-ghost':
    'text-rose-300 hover:bg-rose-500/10 active:bg-rose-500/15',
  inverse:
    'bg-ink-strong text-surface-muted shadow-sm hover:bg-ink hover:shadow-md active:bg-slate-300',
};

const SIZES = {
  xs: 'h-7 gap-1.5 rounded-lg px-2 text-[11.5px] font-semibold [&_svg]:size-3.5',
  sm: 'h-9 gap-1.5 rounded-[10px] px-3 text-[13px] font-semibold [&_svg]:size-4',
  md: 'h-10 gap-2 rounded-xl px-3.5 text-[13.5px] font-semibold [&_svg]:size-4',
  lg: 'h-11 gap-2 rounded-xl px-5 text-sm font-semibold [&_svg]:size-4',
  xl: 'h-12 gap-2.5 rounded-xl px-6 text-[15px] font-semibold [&_svg]:size-[18px]',
  icon: 'size-9 rounded-[10px] p-0 [&_svg]:size-4',
  'icon-sm': 'size-8 rounded-lg p-0 [&_svg]:size-3.5',
  'icon-lg': 'size-11 rounded-xl p-0 [&_svg]:size-5',
};

/**
 * The primary action primitive. Polymorphic via `as`, e.g. `<Button as="a" href="...">`.
 */
const Button = forwardRef(function Button(
  {
    as: Comp = 'button',
    variant = 'primary',
    size = 'md',
    leftIcon = null,
    rightIcon = null,
    loading = false,
    fullWidth = false,
    className,
    children,
    disabled,
    type,
    ...props
  },
  ref
) {
  const isNativeButton = Comp === 'button';
  const isIconOnly = size.startsWith('icon');

  return (
    <Comp
      ref={ref}
      type={isNativeButton ? type || 'button' : type}
      disabled={isNativeButton ? disabled || loading : undefined}
      aria-busy={loading || undefined}
      data-loading={loading || undefined}
      className={cn(
        'group/btn relative inline-flex select-none items-center justify-center whitespace-nowrap',
        'transition-all duration-200 ease-out-expo',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
        'disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none',
        !disabled && !loading && 'active:scale-[0.985]',
        VARIANTS[variant] || VARIANTS.primary,
        SIZES[size] || SIZES.md,
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {/* Soft top-light sheen for filled variants */}
      {(variant === 'primary' || variant === 'danger' || variant === 'inverse') && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-b from-white/20 via-surface/[0.04] to-transparent opacity-80"
        />
      )}

      {loading ? (
        <Loader2 className="shrink-0 animate-spin" aria-hidden="true" />
      ) : (
        leftIcon && <span className="shrink-0" aria-hidden="true">{leftIcon}</span>
      )}

      {!isIconOnly && children != null && (
        <span className="relative truncate">{children}</span>
      )}
      {isIconOnly && children != null && <span className="sr-only">{children}</span>}

      {!loading && rightIcon && (
        <span
          className="shrink-0 transition-transform duration-200 ease-out-expo group-hover/btn:translate-x-0.5"
          aria-hidden="true"
        >
          {rightIcon}
        </span>
      )}
    </Comp>
  );
});

export { Button };
export default Button;
