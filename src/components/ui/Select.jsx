import { forwardRef, useId } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/cn';
import { Field } from './Field';

const SIZES = {
  sm: 'h-9 text-[13px] rounded-[10px]',
  md: 'h-10 text-[13.5px] rounded-xl',
  lg: 'h-11 text-sm rounded-xl',
};

/**
 * Native select styled to match the rest of the form system.
 * Native is intentional — it keeps mobile pickers and a11y perfect.
 */
const Select = forwardRef(function Select(
  {
    label,
    hint,
    error,
    options = [],
    placeholder,
    size = 'md',
    className,
    containerClassName,
    id,
    required,
    disabled,
    children,
    labelAction,
    ...props
  },
  ref
) {
  const autoId = useId();
  const selectId = id || `select-${autoId}`;
  const hintId = `${selectId}-hint`;

  return (
    <Field
      label={label}
      htmlFor={selectId}
      hint={hint}
      error={error}
      hintId={hintId}
      required={required}
      labelAction={labelAction}
      className={containerClassName}
    >
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          disabled={disabled}
          required={required}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error || hint ? hintId : undefined}
          className={cn(
            'peer w-full appearance-none border bg-surface-muted pl-3.5 pr-9 font-medium text-ink shadow-xs outline-none',
            'transition-colors duration-200 ease-out-expo',
            'hover:border-line-strong',
            'focus:outline-none focus-visible:outline-none',
            'disabled:cursor-not-allowed disabled:bg-surface-subtle disabled:text-ink-subtle',
            error ? 'border-rose-500/40' : 'border-line',
            SIZES[size] || SIZES.md,
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
          {children}
        </select>

        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ink-subtle transition-transform duration-200 peer-focus:rotate-180"
          aria-hidden="true"
        />
      </div>
    </Field>
  );
});

export { Select };
export default Select;
