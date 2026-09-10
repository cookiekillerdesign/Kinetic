import { useRef } from 'react';
import { useKineticEffect } from '../hooks/useKineticEffect.js';
import { initGradientMesh } from '../../effects/webgl/gradientMesh.js';

/** Usage: <GradientMesh colors={['#4f7cff','#ff5f7e','#2be3b0','#0f0f13']} className="hero-bg" /> */
export default function GradientMesh({ colors = ['#4f7cff', '#ff5f7e', '#2be3b0', '#0f0f13'], speed = 0.12, className = '' }) {
  const ref = useRef(null);
  useKineticEffect(ref, el => initGradientMesh(el, { colors, speed }), { colors, speed }, [JSON.stringify(colors), speed]);

  return <canvas ref={ref} className={`kx-gradient-mesh ${className}`} aria-hidden="true" style={{ display: 'block', width: '100%', height: '100%' }} />;
}
