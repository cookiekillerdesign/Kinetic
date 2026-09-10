import { useState, useEffect, useRef } from 'react';
import { initMenuMorph } from '../../effects/nav/menuMorph.js';

/**
 * Returns { triggerRef, overlayRef, open } — attach the refs to your
 * `.kx-menu-trigger` button and `.kx-menu-overlay` panel; `open` mirrors
 * the current state for conditional rendering/aria if you need it in JSX.
 */
export function useMenuMorph({ closeOnLinkClick = true } = {}) {
  const triggerRef = useRef(null);
  const overlayRef = useRef(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!triggerRef.current || !overlayRef.current) return undefined;
    // initMenuMorph queries by selector internally; give the elements stable
    // classes so it can find them without us duplicating its query logic here.
    triggerRef.current.classList.add('kx-menu-trigger');
    overlayRef.current.classList.add('kx-menu-overlay');
    let destroy;
    try {
      destroy = initMenuMorph({
        closeOnLinkClick,
        onOpen: () => setOpen(true),
        onClose: () => setOpen(false)
      });
    } catch (err) {
      console.error('[kinetic] useMenuMorph init failed:', err);
      return undefined;
    }
    return () => { try { destroy(); } catch (err) { console.error('[kinetic] useMenuMorph cleanup failed:', err); } };
  }, [closeOnLinkClick]);

  return { triggerRef, overlayRef, open };
}
