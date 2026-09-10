import { useRef } from 'react';
import { useKineticEffect } from '../hooks/useKineticEffect.js';
import { initDotGrid } from '../../effects/backgrounds/dotGrid.js';

export default function DotGrid({ gap = 34, radius = 1.4, influence = 140, className = '' }) {
  const ref = useRef(null);
  useKineticEffect(ref, el => initDotGrid(el, { gap, radius, influence }), { gap, radius, influence }, [gap, radius, influence]);

  return <canvas ref={ref} className={`kx-dot-grid ${className}`} aria-hidden="true" style={{ display: 'block', width: '100%', height: '100%' }} />;
}
