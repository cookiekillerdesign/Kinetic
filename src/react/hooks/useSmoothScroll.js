import { useEffect } from 'react';
import { bindSmoothAnchors } from '../../effects/scroll/smoothScroll.js';

export { smoothScrollTo, scrollToHash, initVirtualSmoothScroll } from '../../effects/scroll/smoothScroll.js';

/** Binds eased smooth-scroll to every same-page `<a href="#...">` under the app root. */
export function useSmoothAnchors(deps = []) {
  useEffect(() => {
    let destroy;
    try {
      destroy = bindSmoothAnchors(document);
    } catch (err) {
      console.error('[kinetic] useSmoothAnchors init failed:', err);
      return undefined;
    }
    return () => { try { destroy(); } catch (err) { console.error('[kinetic] useSmoothAnchors cleanup failed:', err); } };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
