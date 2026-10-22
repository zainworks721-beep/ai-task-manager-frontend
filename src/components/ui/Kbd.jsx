import { cn } from '../../lib/cn';

/** Small keycap, e.g. <Kbd>⌘</Kbd> <Kbd>K</Kbd> */
export function Kbd({ children, className }) {
  return (
    <kbd
      className={cn(
        'inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-[5px] px-1',
        'border border-line bg-surface-muted font-sans text-[10.5px] font-semibold text-ink-subtle',
        'shadow-[inset_0_1px_0_0_rgb(255_255_255_/_0.06),0_1px_1px_0_rgb(0_0_0_/_0.35)]',
        className
      )}
    >
      {children}
    </kbd>
  );
}

export default Kbd;
