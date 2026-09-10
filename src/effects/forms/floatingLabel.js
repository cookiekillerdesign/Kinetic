/**
 * Kinetic — floatingLabel
 * The label-shrinks-and-floats-above-the-input pattern, driven by a single
 * class toggle so the actual motion is a CSS transition (cheap, and works
 * even if JS hasn't hydrated yet via :placeholder-shown as a CSS-only
 * fallback — this module just adds `.has-value` for browsers/cases where
 * you want a JS-driven source of truth instead, e.g. controlled React inputs).
 *
 * Markup:
 *   <div class="kx-field">
 *     <input class="kx-field-input" placeholder=" " />
 *     <label class="kx-field-label">Email</label>
 *   </div>
 *
 * Usage:
 *   import { initFloatingLabel } from 'kinetic/effects/forms/floatingLabel.js';
 *   const destroy = initFloatingLabel('.kx-field');
 */
export function initFloatingLabel(selectorOrEls = '.kx-field', { inputSelector = '.kx-field-input' } = {}) {
  const fields = typeof selectorOrEls === 'string' ? [...document.querySelectorAll(selectorOrEls)] : [...selectorOrEls];

  const cleanups = fields.map(field => {
    const input = field.querySelector(inputSelector) || field;
    const sync = () => field.classList.toggle('has-value', !!input.value);
    const onFocus = () => field.classList.add('is-focused');
    const onBlur = () => field.classList.remove('is-focused');
    sync();
    input.addEventListener('input', sync);
    input.addEventListener('blur', sync);
    input.addEventListener('focus', onFocus);
    input.addEventListener('blur', onBlur);
    return () => {
      input.removeEventListener('input', sync);
      input.removeEventListener('blur', sync);
      input.removeEventListener('focus', onFocus);
      input.removeEventListener('blur', onBlur);
    };
  });

  return () => cleanups.forEach(fn => fn());
}
