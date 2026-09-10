/**
 * Kinetic — customCheckbox
 * Wires up morphing custom checkbox/radio visuals (checkmark path draws in,
 * radio dot scales in) over a real, accessible, visually-hidden native
 * input — the native input stays the actual form control and source of
 * truth (keyboard, screen readers, form submission all just work); this
 * only toggles a class in sync with its `checked` state.
 *
 * Markup:
 *   <label class="kx-checkbox">
 *     <input type="checkbox" class="kx-checkbox-input" />
 *     <span class="kx-checkbox-box"><svg class="kx-checkbox-check" viewBox="0 0 16 16">
 *       <path d="M3 8l3.5 3.5L13 4.5"/></svg></span>
 *     <span>Subscribe to updates</span>
 *   </label>
 *
 * Usage:
 *   import { initCustomCheckbox } from 'kinetic/effects/forms/customCheckbox.js';
 *   const destroy = initCustomCheckbox('.kx-checkbox');
 */
export function initCustomCheckbox(selectorOrEls = '.kx-checkbox', { inputSelector = '.kx-checkbox-input' } = {}) {
  const wraps = typeof selectorOrEls === 'string' ? [...document.querySelectorAll(selectorOrEls)] : [...selectorOrEls];

  const cleanups = wraps.map(wrap => {
    const input = wrap.querySelector(inputSelector);
    if (!input) return () => {};
    const sync = () => wrap.classList.toggle('is-checked', input.checked);
    sync();
    input.addEventListener('change', sync);
    return () => input.removeEventListener('change', sync);
  });

  return () => cleanups.forEach(fn => fn());
}
