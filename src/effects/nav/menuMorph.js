/**
 * Kinetic — menuMorph
 * A hamburger icon that morphs into an X, driving a fullscreen menu overlay
 * that clips/scales open from the trigger's position. State is a single
 * class toggle; all the actual shape/clip animation lives in CSS so it
 * compositer-animates instead of running JS every frame.
 *
 * Markup:
 *   <button class="kx-menu-trigger" aria-expanded="false" aria-label="Menu">
 *     <span></span><span></span><span></span>
 *   </button>
 *   <div class="kx-menu-overlay" aria-hidden="true">...</div>
 *
 * Usage:
 *   import { initMenuMorph } from 'kinetic/effects/nav/menuMorph.js';
 *   const destroy = initMenuMorph({ triggerSelector: '.kx-menu-trigger', overlaySelector: '.kx-menu-overlay' });
 */
const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function initMenuMorph({
  triggerSelector = '.kx-menu-trigger',
  overlaySelector = '.kx-menu-overlay',
  closeOnLinkClick = true,
  onOpen = () => {},
  onClose = () => {}
} = {}) {
  const trigger = document.querySelector(triggerSelector);
  const overlay = document.querySelector(overlaySelector);
  if (!trigger || !overlay) return () => {};

  let open = false;
  let lastFocused = null;

  function focusableChildren() {
    return [...overlay.querySelectorAll(FOCUSABLE_SELECTOR)].filter(el => el.offsetParent !== null);
  }

  function setOpen(next) {
    if (next === open) return;
    open = next;
    trigger.classList.toggle('is-open', open);
    overlay.classList.toggle('is-open', open);
    trigger.setAttribute('aria-expanded', String(open));
    overlay.setAttribute('aria-hidden', String(!open));
    document.body.style.overflow = open ? 'hidden' : '';

    // A fullscreen overlay is a modal surface: opening it without moving
    // focus into it — and without trapping Tab there — leaves keyboard
    // users able to tab straight through to content visually buried behind
    // it, and leaves focus stranded on a now-hidden trigger on close.
    if (open) {
      lastFocused = document.activeElement;
      const target = focusableChildren()[0] || overlay;
      if (target === overlay && overlay.tabIndex === undefined) overlay.tabIndex = -1;
      target.focus?.();
    } else if (lastFocused && typeof lastFocused.focus === 'function') {
      lastFocused.focus();
      lastFocused = null;
    }

    (open ? onOpen : onClose)();
  }
  const onClick = () => setOpen(!open);
  trigger.addEventListener('click', onClick);

  let onLinkClick;
  if (closeOnLinkClick) {
    onLinkClick = e => { if (e.target.closest('a')) setOpen(false); };
    overlay.addEventListener('click', onLinkClick);
  }
  const onKey = e => {
    if (!open) return;
    if (e.key === 'Escape') { setOpen(false); return; }
    if (e.key !== 'Tab') return;
    // Basic focus trap: while the overlay is open, wrap Tab/Shift+Tab
    // around its own focusable elements instead of letting it escape to
    // whatever's behind the (visually fullscreen) overlay.
    const focusable = focusableChildren();
    if (!focusable.length) { e.preventDefault(); return; }
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };
  document.addEventListener('keydown', onKey);

  return function destroy() {
    trigger.removeEventListener('click', onClick);
    if (onLinkClick) overlay.removeEventListener('click', onLinkClick);
    document.removeEventListener('keydown', onKey);
    document.body.style.overflow = '';
  };
}
