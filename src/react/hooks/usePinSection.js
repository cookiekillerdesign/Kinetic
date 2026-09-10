import { useRef } from 'react';
import { useKineticEffect } from './useKineticEffect.js';
import { initPinSection } from '../../effects/scroll/pinSection.js';

export function usePinSection(onProgress) {
  const ref = useRef(null);
  // `onProgress` is almost always a fresh inline closure every render (e.g.
  // referencing current component state). The underlying engine is only
  // initialized once (deps=[]) — without this ref indirection it would
  // permanently call whatever `onProgress` closure existed at MOUNT time,
  // silently going stale the moment the callback needs anything from a
  // later render.
  const onProgressRef = useRef(onProgress);
  onProgressRef.current = onProgress;
  const stableOnProgress = useRef((p, el) => onProgressRef.current?.(p, el)).current;

  useKineticEffect(ref, el => initPinSection([el], { onProgress: stableOnProgress }), {}, []);
  return ref;
}
