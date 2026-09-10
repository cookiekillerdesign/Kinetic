/**
 * Kinetic — imageDistortHover
 * A lighter-weight sibling to rippleDistort: a single, continuous "lens"
 * distortion that follows the cursor over an image (magnifying-glass /
 * liquid-lens feel) rather than a persistent trail of decaying waves.
 * Cheaper to run (one point instead of up to 40), good for grids of many
 * thumbnails at once.
 *
 * Usage:
 *   <div class="kx-lens-wrap" style="position:relative;">
 *     <img class="kx-lens-source" src="cover.jpg">
 *     <canvas class="kx-lens-canvas" style="position:absolute;inset:0;"></canvas>
 *   </div>
 *   import { initImageDistortHover } from 'kinetic/effects/webgl/imageDistortHover.js';
 *   const destroy = initImageDistortHover('.kx-lens-wrap', { strength: 0.06, radius: 0.22 });
 */
import { createProgram, FULLSCREEN_VERT, bindFullscreenQuad, getGL, resizeCanvasToDisplaySize } from '../../core/webgl.js';
import { prefersReducedMotion } from '../../core/reducedMotion.js';
import { damp } from '../../core/math.js';

const FRAG = `
precision highp float;
varying vec2 v_uv;
uniform sampler2D u_tex;
uniform vec2 u_mouse;
uniform float u_aspect;
uniform float u_strength;
uniform float u_radius;
uniform float u_active;

void main() {
  vec2 uv = v_uv;
  vec2 m = uv - u_mouse;
  m.x *= u_aspect;
  float d = length(m);
  float falloff = smoothstep(u_radius, 0.0, d) * u_active;
  vec2 dir = d > 0.0001 ? m / d : vec2(0.0);
  vec2 duv = uv - dir * falloff * u_strength * (1.0 - d / max(u_radius,0.0001));
  gl_FragColor = texture2D(u_tex, clamp(duv, 0.001, 0.999));
}
`;

export function initImageDistortHover(rootOrSelector, {
  sourceSelector = '.kx-lens-source',
  canvasSelector = '.kx-lens-canvas',
  strength = 0.06,
  radius = 0.22
} = {}) {
  if (prefersReducedMotion()) return () => {};
  const roots = typeof rootOrSelector === 'string'
    ? [...document.querySelectorAll(rootOrSelector)]
    : (rootOrSelector && typeof rootOrSelector[Symbol.iterator] === 'function' ? [...rootOrSelector] : [rootOrSelector]);
  const cleanups = roots.map(root => initOne(root, sourceSelector, canvasSelector, strength, radius)).filter(Boolean);
  return () => cleanups.forEach(fn => fn());
}

function initOne(root, sourceSelector, canvasSelector, strength, radius) {
  const source = root.querySelector(sourceSelector);
  const canvas = root.querySelector(canvasSelector);
  if (!source || !canvas) return null;
  const gl = getGL(canvas);
  if (!gl) return null;

  const { program } = createProgram(gl, FULLSCREEN_VERT, FRAG);
  gl.useProgram(program);
  const quadBuffer = bindFullscreenQuad(gl, program);

  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  const uMouse = gl.getUniformLocation(program, 'u_mouse');
  const uAspect = gl.getUniformLocation(program, 'u_aspect');
  const uStrength = gl.getUniformLocation(program, 'u_strength');
  const uRadius = gl.getUniformLocation(program, 'u_radius');
  const uActive = gl.getUniformLocation(program, 'u_active');

  let mouse = { x: 0.5, y: 0.5 }, targetActive = 0, active = 0, raf;

  function render() {
    resizeCanvasToDisplaySize(canvas, gl);
    active = damp(active, targetActive, 12, 1 / 60);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    try { gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source); } catch { /* not decoded yet */ }
    gl.uniform2f(uMouse, mouse.x, mouse.y);
    gl.uniform1f(uAspect, canvas.clientWidth / Math.max(1, canvas.clientHeight));
    gl.uniform1f(uStrength, strength);
    gl.uniform1f(uRadius, radius);
    gl.uniform1f(uActive, active);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    raf = requestAnimationFrame(render);
  }
  raf = requestAnimationFrame(render);

  const onMove = e => {
    const box = root.getBoundingClientRect();
    mouse = { x: (e.clientX - box.left) / box.width, y: 1 - (e.clientY - box.top) / box.height };
  };
  const onEnter = () => { targetActive = 1; };
  const onLeave = () => { targetActive = 0; };
  root.addEventListener('pointermove', onMove);
  root.addEventListener('pointerenter', onEnter);
  root.addEventListener('pointerleave', onLeave);

  return function destroy() {
    root.removeEventListener('pointermove', onMove);
    root.removeEventListener('pointerenter', onEnter);
    root.removeEventListener('pointerleave', onLeave);
    cancelAnimationFrame(raf);
    gl.deleteProgram(program);
    gl.deleteTexture(tex);
    gl.deleteBuffer(quadBuffer);
  };
}
