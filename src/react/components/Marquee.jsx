import { useRef } from 'react';
import { useKineticEffect } from '../hooks/useKineticEffect.js';
import { initMarquee } from '../../effects/text/marquee.js';

/** Usage: <Marquee speed={40}>Award-winning · Handmade · </Marquee> */
export default function Marquee({ children, speed = 40, hoverSlow = true, direction = -1, className = '' }) {
  const ref = useRef(null);
  useKineticEffect(ref, el => initMarquee([el], { speed, hoverSlow, direction }), { speed, hoverSlow, direction }, [speed, hoverSlow, direction]);

  return (
    <div className={`kx-marquee ${className}`} ref={ref}>
      <div className="kx-marquee-track">{children}</div>
    </div>
  );
}
