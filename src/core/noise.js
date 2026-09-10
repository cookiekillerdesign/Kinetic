/**
 * Kinetic — noise.js
 * A compact 2D simplex noise implementation (public-domain algorithm,
 * re-derived here dependency-free) used by generative backgrounds and
 * shader effects that want organic motion instead of pure sine waves.
 */

const F2 = 0.5 * (Math.sqrt(3) - 1);
const G2 = (3 - Math.sqrt(3)) / 6;
const GRAD = [[1,1],[-1,1],[1,-1],[-1,-1],[1,0],[-1,0],[1,0],[-1,0],[0,1],[0,-1],[0,1],[0,-1]];

export function makeNoise2D(seed = 1) {
  const perm = new Uint8Array(512);
  const p = new Uint8Array(256);
  let s = seed >>> 0 || 1;
  const rand = () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 65536) / 65536; };
  for (let i = 0; i < 256; i++) p[i] = i;
  for (let i = 255; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];

  return function noise2D(xin, yin) {
    let n0 = 0, n1 = 0, n2 = 0;
    const s = (xin + yin) * F2;
    const i = Math.floor(xin + s), j = Math.floor(yin + s);
    const t = (i + j) * G2;
    const X0 = i - t, Y0 = j - t;
    const x0 = xin - X0, y0 = yin - Y0;
    const i1 = x0 > y0 ? 1 : 0, j1 = x0 > y0 ? 0 : 1;
    const x1 = x0 - i1 + G2, y1 = y0 - j1 + G2;
    const x2 = x0 - 1 + 2 * G2, y2 = y0 - 1 + 2 * G2;
    const ii = i & 255, jj = j & 255;
    const g0 = GRAD[perm[ii + perm[jj]] % 12];
    const g1 = GRAD[perm[ii + i1 + perm[jj + j1]] % 12];
    const g2 = GRAD[perm[ii + 1 + perm[jj + 1]] % 12];
    let t0 = 0.5 - x0 * x0 - y0 * y0;
    if (t0 >= 0) { t0 *= t0; n0 = t0 * t0 * (g0[0] * x0 + g0[1] * y0); }
    let t1 = 0.5 - x1 * x1 - y1 * y1;
    if (t1 >= 0) { t1 *= t1; n1 = t1 * t1 * (g1[0] * x1 + g1[1] * y1); }
    let t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t2 >= 0) { t2 *= t2; n2 = t2 * t2 * (g2[0] * x2 + g2[1] * y2); }
    return 70 * (n0 + n1 + n2); // roughly [-1, 1]
  };
}

/** Cheap value-noise fallback for non-shader (2D canvas / CPU) use — fine
 *  grain, generative-art backgrounds where simplex's isotropy isn't needed. */
export function makeValueNoise1D(seed = 1) {
  const rand = makeNoise2D(seed);
  return t => (rand(t, 0) + 1) / 2;
}
