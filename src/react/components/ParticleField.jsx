import { useRef } from 'react';
import { useKineticEffect } from '../hooks/useKineticEffect.js';
import { initParticleField } from '../../effects/webgl/particleField.js';

export default function ParticleField({ count = 60, linkDistance = 120, color = '79,124,255', className = '' }) {
  const ref = useRef(null);
  useKineticEffect(ref, el => initParticleField(el, { count, linkDistance, color }), { count, linkDistance, color }, [count, linkDistance, color]);

  return <canvas ref={ref} className={`kx-particles ${className}`} aria-hidden="true" style={{ display: 'block', width: '100%', height: '100%' }} />;
}
