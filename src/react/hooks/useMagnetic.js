import { useEffect } from 'react';
import { initMagnetic } from '../../effects/cursor/magnetic.js';

/** Wires magnetic-hover pull onto every `.kx-magnetic` element currently in the DOM. */
export function useMagnetic(opts = {}, deps = []) {
  useEffect(() => {
    let destroy;
    try {
      destroy = initMagnetic('.kx-magnetic', opts);
    } catch (err) {
      console.error('[kinetic] useMagnetic init failed:', err);
      return undefined;
    }
    return () => { try { destroy(); } catch (err) { console.error('[kinetic] useMagnetic cleanup failed:', err); } };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
