/**
 * Kinetic — useKineticEffect
 * The one generic hook every other hook in this folder is built from: runs
 * an `init(ref.current, opts) -> destroy` engine against a ref, re-running
 * whenever `deps` change, and always cleaning up on unmount. Exists so
 * every wrapper hook below is a two-line function instead of repeating the
 * same useEffect/useRef boilerplate fifty times.
 *
 * Usage (writing your OWN wrapper for an effect not yet covered below):
 *   import { useRef } from 'react';
 *   import { useKineticEffect } from 'kinetic/react/hooks/useKineticEffect.js';
 *   import { initDotGrid } from 'kinetic/effects/backgrounds/dotGrid.js';
 *
 *   function useDotGrid(opts) {
 *     const ref = useRef(null);
 *     useKineticEffect(ref, initDotGrid, opts);
 *     return ref;
 *   }
 */
import { useEffect, useRef } from 'react';

export function useKineticEffect(ref, initFn, opts = {}, deps = []) {
  const optsRef = useRef(opts);
  optsRef.current = opts;

  useEffect(() => {
    if (!ref.current) return undefined;
    // initFn can legitimately throw (e.g. a WebGL shader failing to compile
    // on an unusual GPU/driver) — these are decorative effects, so a single
    // one failing should degrade gracefully, not take down the whole React
    // tree via an uncaught error in a passive effect.
    let destroy;
    try {
      destroy = initFn(ref.current, optsRef.current);
    } catch (err) {
      if (typeof console !== 'undefined') console.error('[kinetic] effect init failed:', err);
      return undefined;
    }
    return () => {
      if (typeof destroy !== 'function') return;
      try { destroy(); } catch (err) {
        if (typeof console !== 'undefined') console.error('[kinetic] effect cleanup failed:', err);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
