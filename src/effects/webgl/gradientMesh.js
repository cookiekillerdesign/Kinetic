/**
 * Kinetic — gradientMesh
 * An animated, organic gradient-mesh background — several soft colour blobs
 * drifting via simplex noise and blended together in a fragment shader.
 * The "aurora"/"mesh gradient" backdrop seen on countless Awwwards heroes.
 *
 * Usage:
 *   <canvas class="kx-gradient-mesh"></canvas>
 *   import { initGradientMesh } from 'kinetic/effects/webgl/gradientMesh.js';
 *   const destroy = initGradientMesh('.kx-gradient-mesh', {
 *     colors: ['#4f7cff', '#ff5f7e', '#2be3b0', '#0f0f13']
 *   });
 */
import { createProgram, FULLSCREEN_VERT, bindFullscreenQuad, getGL, resizeCanvasToDisplaySize } from '../../core/webgl.js';
import { prefersReducedMotion } from '../../core/reducedMotion.js';

const FRAG = `
precision highp float;
varying vec2 v_uv;
uniform float u_time;
uniform vec2 u_res;
uniform vec3 u_c0; uniform vec3 u_c1; uniform vec3 u_c2; uniform vec3 u_c3;
uniform float u_speed;

// cheap 2D value noise (no texture lookups needed for a soft background)
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  float a = hash(i), b = hash(i + vec2(1.0,0.0)), c = hash(i + vec2(0.0,1.0)), d = hash(i + vec2(1.0,1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

void main() {
  vec2 uv = v_uv;
  uv.x *= u_res.x / u_res.y;
  float t = u_time * u_speed;

  vec2 p0 = vec2(0.3 + sin(t * 0.5) * 0.18, 0.35 + cos(t * 0.4) * 0.18);
  vec2 p1 = vec2(0.75 + cos(t * 0.35) * 0.16, 0.3 + sin(t * 0.6) * 0.16);
  vec2 p2 = vec2(0.25 + sin(t * 0.45 + 2.0) * 0.2, 0.75 + cos(t * 0.3 + 1.0) * 0.16);
  vec2 p3 = vec2(0.7 + cos(t * 0.25 + 3.0) * 0.14, 0.7 + sin(t * 0.5 + 2.0) * 0.18);
  p0.x *= u_res.x / u_res.y; p1.x *= u_res.x / u_res.y; p2.x *= u_res.x / u_res.y; p3.x *= u_res.x / u_res.y;

  float d0 = distance(uv, p0), d1 = distance(uv, p1), d2 = distance(uv, p2), d3 = distance(uv, p3);
  float w0 = 1.0 / (d0 * d0 * 10.0 + 0.05);
  float w1 = 1.0 / (d1 * d1 * 10.0 + 0.05);
  float w2 = 1.0 / (d2 * d2 * 10.0 + 0.05);
  float w3 = 1.0 / (d3 * d3 * 10.0 + 0.05);
  float wSum = w0 + w1 + w2 + w3;

  vec3 color = (u_c0 * w0 + u_c1 * w1 + u_c2 * w2 + u_c3 * w3) / wSum;

  // subtle grain-like noise to break gradient banding
  float grain = (noise(uv * u_res * 0.15 + t) - 0.5) * 0.02;
  color += grain;

  gl_FragColor = vec4(color, 1.0);
}
`;

function hexToRgb(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

export function initGradientMesh(selectorOrCanvas = '.kx-gradient-mesh', {
  colors = ['#4f7cff', '#ff5f7e', '#2be3b0', '#0f0f13'],
  speed = 0.12
} = {}) {
  const canvas = typeof selectorOrCanvas === 'string' ? document.querySelector(selectorOrCanvas) : selectorOrCanvas;
  if (!canvas) return () => {};
  const reduce = prefersReducedMotion();

  const gl = getGL(canvas, { antialias: false });
  if (!gl) return () => {};
  const { program } = createProgram(gl, FULLSCREEN_VERT, FRAG);
  gl.useProgram(program);
  const quadBuffer = bindFullscreenQuad(gl, program);

  const uTime = gl.getUniformLocation(program, 'u_time');
  const uRes = gl.getUniformLocation(program, 'u_res');
  const uSpeed = gl.getUniformLocation(program, 'u_speed');
  const cLocs = ['u_c0', 'u_c1', 'u_c2', 'u_c3'].map(n => gl.getUniformLocation(program, n));
  colors.slice(0, 4).forEach((hex, i) => gl.uniform3fv(cLocs[i], hexToRgb(hex)));

  const startTime = performance.now();
  let raf;
  function render() {
    resizeCanvasToDisplaySize(canvas, gl);
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uTime, (performance.now() - startTime) / 1000);
    gl.uniform1f(uSpeed, reduce ? 0 : speed);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    if (!reduce) raf = requestAnimationFrame(render);
  }
  render(); // always draw at least one frame, even reduced-motion

  const ro = new ResizeObserver(() => { if (reduce) render(); });
  ro.observe(canvas);

  return function destroy() {
    cancelAnimationFrame(raf);
    ro.disconnect();
    gl.deleteProgram(program);
    gl.deleteBuffer(quadBuffer);
  };
}
