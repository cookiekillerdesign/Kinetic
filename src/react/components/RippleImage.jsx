import { useRef } from 'react';
import { useKineticEffect } from '../hooks/useKineticEffect.js';
import { initRippleDistort } from '../../effects/webgl/rippleDistort.js';

/**
 * The flagship effect as a drop-in component: an image with a live
 * water-ripple distortion that follows the cursor. Usage:
 *   <RippleImage src="/covers/project-14.jpg" alt="Project 14" />
 */
export default function RippleImage({ src, alt = '', className = '', style }) {
  const ref = useRef(null);
  useKineticEffect(ref, el => initRippleDistort([el]), {}, []);

  return (
    <div ref={ref} className={`kx-ripple-wrap ${className}`} style={{ position: 'relative', ...style }}>
      <img className="kx-ripple-source" src={src} alt={alt} style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }} />
      <canvas className="kx-ripple-canvas" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} aria-hidden="true" />
    </div>
  );
}
