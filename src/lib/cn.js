import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge conditional class names while resolving Tailwind conflicts.
 * e.g. cn('px-2', isLarge && 'px-6') -> 'px-6'
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
