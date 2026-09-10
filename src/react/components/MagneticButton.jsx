import { useRef } from 'react';
import { useKineticEffect } from '../hooks/useKineticEffect.js';
import { initMagneticButton } from '../../effects/buttons/magneticButton.js';
import { initRippleClick } from '../../effects/buttons/rippleClick.js';

/** Usage: <MagneticButton onClick={...}>Get in touch</MagneticButton> */
export default function MagneticButton({ children, className = '', ripple = true, ...props }) {
  const ref = useRef(null);
  useKineticEffect(ref, el => {
    const offMag = initMagneticButton([el]);
    const offRipple = ripple ? initRippleClick([el]) : () => {};
    return () => { offMag(); offRipple(); };
  }, { ripple }, [ripple]);

  return (
    <button ref={ref} className={`kx-magnetic-btn ${className}`} {...props}>
      <span className="kx-magnetic-btn-inner">{children}</span>
    </button>
  );
}
