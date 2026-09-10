import { useRef } from 'react';
import { useKineticEffect } from './useKineticEffect.js';
import { initImageSequenceScrub } from '../../effects/webgl/imageSequenceScrub.js';

/** Attach to the <canvas>. Pass `frames` (array of image URLs) and `scrollRoot` (the tall pinned ancestor). */
export function useImageSequenceScrub({ frames = [], scrollRoot = null, fit = 'cover' } = {}) {
  const ref = useRef(null);
  // Dep on frame *content*, not just frames.length — two equal-length but
  // different frame sets (e.g. swapping product-color variants that both
  // have 90 frames) would otherwise not re-trigger the effect at all and
  // the canvas would keep scrubbing the stale image set.
  useKineticEffect(ref, el => initImageSequenceScrub(el, { frames, scrollRoot, fit }), { frames, scrollRoot, fit }, [frames.join('|'), scrollRoot, fit]);
  return ref;
}
