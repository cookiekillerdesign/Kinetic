import { useRef } from 'react';
import { useKineticEffect } from './useKineticEffect.js';
import { initFloatingLabel } from '../../effects/forms/floatingLabel.js';

export function useFloatingLabel() {
  const ref = useRef(null);
  useKineticEffect(ref, el => initFloatingLabel([el]), {}, []);
  return ref;
}
