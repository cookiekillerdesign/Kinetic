/**
 * Kinetic — easing.js
 * A curated set of easing functions used across the whole library.
 * Every function takes t in [0,1] and returns a value roughly in [0,1]
 * (some, like back/elastic, legitimately overshoot — that's the point).
 */

export const linear = t => t;

export const easeInQuad = t => t * t;
export const easeOutQuad = t => 1 - (1 - t) * (1 - t);
export const easeInOutQuad = t => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

export const easeInCubic = t => t * t * t;
export const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
export const easeInOutCubic = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export const easeInQuart = t => t * t * t * t;
export const easeOutQuart = t => 1 - Math.pow(1 - t, 4);
export const easeInOutQuart = t => (t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2);

export const easeInExpo = t => (t === 0 ? 0 : Math.pow(2, 10 * t - 10));
export const easeOutExpo = t => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
export const easeInOutExpo = t => {
  if (t === 0) return 0;
  if (t === 1) return 1;
  return t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2;
};

export const easeOutBack = (t, s = 1.70158) => 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2);
export const easeInBack = (t, s = 1.70158) => (s + 1) * t * t * t - s * t * t;
export const easeInOutBack = (t, s = 1.70158) => {
  const s2 = s * 1.525;
  return t < 0.5
    ? (Math.pow(2 * t, 2) * ((s2 + 1) * 2 * t - s2)) / 2
    : (Math.pow(2 * t - 2, 2) * ((s2 + 1) * (t * 2 - 2) + s2) + 2) / 2;
};

export const easeOutElastic = t => {
  const c4 = (2 * Math.PI) / 3;
  return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
};

export const easeOutBounce = t => {
  const n1 = 7.5625, d1 = 2.75;
  if (t < 1 / d1) return n1 * t * t;
  if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
  if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
  return n1 * (t -= 2.625 / d1) * t + 0.984375;
};

/** CSS-string twins so JS and CSS stay in sync visually. Drop into --ease custom props. */
export const cssEasing = {
  out: 'cubic-bezier(.19,1,.22,1)',
  inOut: 'cubic-bezier(.65,0,.35,1)',
  outBack: 'cubic-bezier(.34,1.56,.64,1)',
  outQuart: 'cubic-bezier(.25,1,.5,1)',
  inOutExpo: 'cubic-bezier(.87,0,.13,1)'
};
