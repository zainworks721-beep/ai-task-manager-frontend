import { useEffect, useRef } from 'react';

/**
 * Registers a global keyboard shortcut.
 *
 * @param {string} combo  e.g. 'mod+k', 'escape', 'mod+shift+n'
 * @param {(event: KeyboardEvent) => void} handler
 * @param {boolean} enabled
 */
export function useHotkey(combo, handler, enabled = true) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return undefined;

    const parts = combo.toLowerCase().split('+').map((p) => p.trim());
    const key = parts[parts.length - 1];
    const needsMod = parts.some((p) => ['mod', 'cmd', 'ctrl', 'meta'].includes(p));
    const needsShift = parts.includes('shift');
    const needsAlt = parts.includes('alt');

    const onKeyDown = (event) => {
      const hasMod = event.metaKey || event.ctrlKey;

      if (event.key.toLowerCase() !== key) return;
      if (needsMod !== hasMod) return;
      if (event.shiftKey !== needsShift) return;
      if (event.altKey !== needsAlt) return;

      event.preventDefault();
      handlerRef.current?.(event);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [combo, enabled]);
}

export default useHotkey;
