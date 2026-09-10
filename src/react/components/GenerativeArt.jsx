import { useRef } from 'react';
import { useKineticEffect } from '../hooks/useKineticEffect.js';
import { initGenerativeArt } from '../../effects/webgl/generativeArt.js';

/** Usage: <GenerativeArt seed={project.slug} hue={project.color} /> */
export default function GenerativeArt({ seed, hue = '#4f7cff', className = '', cols = 7, rows = 6, density = 0.62 }) {
  const ref = useRef(null);
  useKineticEffect(ref, el => {
    el.dataset.seed = String(seed);
    el.dataset.hue = hue;
    return initGenerativeArt([el], { cols, rows, density });
  }, { seed, hue, cols, rows, density }, [seed, hue, cols, rows, density]);

  return <canvas ref={ref} className={`kx-gen-art ${className}`} aria-hidden="true" />;
}
