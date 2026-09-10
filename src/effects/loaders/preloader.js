/**
 * Kinetic — preloader
 * A percentage-counter preloader that tracks real asset-loading progress
 * (images, fonts, or an arbitrary list of promises) rather than faking a
 * timer — the number actually means something. Calls onDone once
 * everything is settled, with a minimum display time so a fast cache-hit
 * load doesn't just flash the number and vanish.
 *
 * Usage:
 *   import { runPreloader } from 'kinetic/effects/loaders/preloader.js';
 *   runPreloader({
 *     countEl: document.querySelector('.kx-preloader-count'),
 *     tasks: [...document.images].map(img => img.decode().catch(() => {})),
 *     minDuration: 900,
 *     onDone: () => document.querySelector('.kx-preloader').classList.add('is-done')
 *   });
 */
export function runPreloader({ countEl = null, tasks = [], minDuration = 800, onProgress = () => {}, onDone = () => {} } = {}) {
  const total = tasks.length || 1;
  let done = 0;
  const t0 = performance.now();

  function bump() {
    done++;
    const pct = Math.min(100, Math.round((done / total) * 100));
    if (countEl) countEl.textContent = String(pct);
    onProgress(pct);
  }

  const settled = tasks.length
    ? Promise.all(tasks.map(p => Promise.resolve(p).then(bump, bump)))
    : (() => { bump(); return Promise.resolve(); })();

  settled.then(() => {
    const elapsed = performance.now() - t0;
    const wait = Math.max(0, minDuration - elapsed);
    setTimeout(onDone, wait);
  });
}
