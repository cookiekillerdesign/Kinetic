/**
 * Kinetic — observer.js
 * One shared IntersectionObserver per unique (threshold, rootMargin, root)
 * config, instead of every reveal/parallax/counter component creating its
 * own. Dozens of observed elements collapse onto a handful of observer
 * instances.
 */

// Pools are scoped first by root element identity (a WeakMap so a pool for
// a removed root can be garbage-collected), then by threshold/rootMargin
// within that root. `null` root (the default — the viewport) uses a single
// shared top-level map since there's only ever one viewport.
const viewportPools = new Map();
const rootPools = new WeakMap();

function poolsFor(root) {
  if (!root) return viewportPools;
  let m = rootPools.get(root);
  if (!m) { m = new Map(); rootPools.set(root, m); }
  return m;
}

function keyOf(opts) {
  return `${opts.threshold ?? 0}|${opts.rootMargin ?? '0px'}`;
}

/** Observe `el`, calling cb(entry) on every intersection change.
 *  Returns an unobserve function.
 *
 *  Multiple independent calls for the SAME element under the same
 *  (threshold, rootMargin, root) config are supported — each gets its own
 *  callback and its own unobserve, rather than the second silently
 *  clobbering the first's callback (or the first's unobserve tearing down
 *  the second's subscription too). This matters in practice: e.g.
 *  scrollReveal and scrollTimelineReveal's fallback both default to the
 *  same threshold/rootMargin, so a consumer using both on one element
 *  needs both callbacks to keep firing.
 *
 *  Pools are also correctly scoped per DISTINCT `root` element — not just
 *  "has a custom root or not". Two different custom-root observers (e.g.
 *  two separate `.kx-snap-container` instances on the same page, each
 *  passing its own container as `root`) previously collapsed into the same
 *  pool whenever their threshold/rootMargin matched, silently reusing the
 *  FIRST container's IntersectionObserver for the SECOND container's
 *  elements — producing meaningless intersection data for every consumer
 *  after the first. */
export function observe(el, cb, opts = {}) {
  const pools = poolsFor(opts.root);
  const key = keyOf(opts);
  let pool = pools.get(key);
  if (!pool) {
    const cbs = new WeakMap();
    const io = new IntersectionObserver(entries => {
      for (const entry of entries) {
        const set = cbs.get(entry.target);
        if (set) for (const fn of set) fn(entry);
      }
    }, opts);
    pool = { io, cbs };
    pools.set(key, pool);
  }
  let set = pool.cbs.get(el);
  if (!set) { set = new Set(); pool.cbs.set(el, set); }
  set.add(cb);
  pool.io.observe(el);
  return () => {
    set.delete(cb);
    // Only actually unobserve once every caller watching this element under
    // this config has unsubscribed — otherwise we'd cut off a sibling
    // consumer still relying on the same element+config.
    if (set.size === 0) pool.io.unobserve(el);
  };
}

/** Convenience: observe once, auto-unobserve after the first intersection. */
export function observeOnce(el, cb, opts = {}) {
  // `off` is declared before the call (not `const off = observe(...)`) so
  // that IF the callback ever fired synchronously — real IntersectionObserver
  // callbacks never do, but a naive test mock or a future engine change
  // could — it wouldn't hit a temporal-dead-zone ReferenceError trying to
  // read `off` before its own initializer has finished running.
  let off;
  off = observe(el, entry => {
    if (entry.isIntersecting) { off?.(); cb(entry); }
  }, opts);
  return off;
}
