/**
 * Kinetic — rippleDistort
 * Real-time water-ripple distortion driven by the pointer's actual path
 * across an element — every stop the cursor makes drops a wave that
 * expands, refracts the image beneath it and catches a specular highlight,
 * then decays. Renders on top of a source <canvas> or <img> and re-samples
 * it as a live texture each frame.
 *
 * This is the flagship effect of the whole library — the same technique
 * behind the cookiekiller.online project-card hover.
 *
 * Usage:
 *   <div class="kx-ripple-wrap" style="position:relative;">
 *     <img class="kx-ripple-source" src="cover.jpg">
 *     <canvas class="kx-ripple-canvas" style="position:absolute;inset:0;"></canvas>
 *   </div>
 *   import { initRippleDistort } from 'kinetic/effects/webgl/rippleDistort.js';
 *   const destroy = initRippleDistort('.kx-ripple-wrap');
 */
import { createProgram, FULLSCREEN_VERT, bindFullscreenQuad, getGL, resizeCanvasToDisplaySize } from '../../core/webgl.js';
import { prefersReducedMotion } from '../../core/reducedMotion.js';

const MAX_POINTS = 40;
const MAX_AGE = 2.2;

const FRAG = `
precision highp float;
varying vec2 v_uv;
uniform sampler2D u_tex;
uniform float u_time;
uniform float u_aspect;
uniform int u_count;
uniform vec3 u_points[${MAX_POINTS}];

float ripple(vec2 uv, float dirSign, float ampMul, float rotAngle, float phaseShift) {
  float total = 0.0;
  float s = sin(rotAngle), c = cos(rotAngle);
  mat2 R = mat2(c, -s, s, c);
  for (int i = 0; i < ${MAX_POINTS}; i++) {
    if (i >= u_count) break;
    vec3 p = u_points[i];
    float age = u_time - p.z;
    if (age < 0.0 || age > ${MAX_AGE.toFixed(2)}) continue;
    vec2 d = uv - p.xy;
    d.x *= u_aspect;
    d = R * d;
    float dist = length(d);
    float freq = 6.5, speed = 1.9, decay = 2.1;
    float attack = smoothstep(0.0, 0.1, age);
    float release = exp(-age * 1.7);
    float envelope = attack * release;
    float wave = sin(dist * freq * dirSign - age * speed + phaseShift);
    total += wave * exp(-dist * decay) * envelope * ampMul;
  }
  return total;
}

float rippleField(vec2 uv) {
  float h1 = ripple(uv, 1.0, 0.62, 0.0, 0.0);
  float h2 = ripple(uv, -1.0, 0.14, 0.35, 3.14159);
  return clamp(h1 + h2, -1.1, 1.1);
}

void main() {
  vec2 uv = v_uv;
  float eps = 0.0055;
  float h  = rippleField(uv);
  float hx = rippleField(uv + vec2(eps, 0.0));
  float hy = rippleField(uv + vec2(0.0, eps));
  vec2 grad = vec2(h - hx, h - hy) / eps;
  grad = clamp(grad, vec2(-10.0), vec2(10.0));

  vec2 duv = clamp(uv + grad * 0.0021, 0.001, 0.999);
  vec4 color = texture2D(u_tex, duv);

  vec3 normal = normalize(vec3(grad * 0.85, 1.0));
  vec3 lightDir = normalize(vec3(0.35, 0.55, 0.78));
  float spec = pow(max(dot(normal, lightDir), 0.0), 4.0);
  color.rgb += spec * 0.26;
  color.rgb += max(h, 0.0) * 0.045;
  color.rgb *= 1.0 - clamp(-h * 0.22, 0.0, 0.13);

  gl_FragColor = vec4(color.rgb, color.a);
}
`;

/**
 * @param root      element (or selector) containing `.kx-ripple-source` and `.kx-ripple-canvas`
 * @param opts.sourceSelector default '.kx-ripple-source'
 * @param opts.canvasSelector default '.kx-ripple-canvas'
 */
export function initRippleDistort(rootOrSelector, { sourceSelector = '.kx-ripple-source', canvasSelector = '.kx-ripple-canvas' } = {}) {
  if (prefersReducedMotion()) return () => {};
  const roots = typeof rootOrSelector === 'string'
    ? [...document.querySelectorAll(rootOrSelector)]
    : (rootOrSelector && typeof rootOrSelector[Symbol.iterator] === 'function' ? [...rootOrSelector] : [rootOrSelector]);
  const cleanups = roots.map(root => initOne(root, sourceSelector, canvasSelector)).filter(Boolean);
  return () => cleanups.forEach(fn => fn());
}

function initOne(root, sourceSelector, canvasSelector) {
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

  const uTime = gl.getUniformLocation(program, 'u_time');
  const uCount = gl.getUniformLocation(program, 'u_count');
  const uPoints = gl.getUniformLocation(program, 'u_points');
  const uAspect = gl.getUniformLocation(program, 'u_aspect');

  const startTime = performance.now();
  let points = [];
  let lastPush = { x: 0.5, y: 0.5, t: 0 };
  let raf = 0, running = false;
  const flat = new Float32Array(MAX_POINTS * 3);

  function render() {
    if (!source.offsetWidth && !(source.videoWidth || source.naturalWidth)) { raf = requestAnimationFrame(render); return; }
    resizeCanvasToDisplaySize(canvas, gl);
    const now = (performance.now() - startTime) / 1000;
    points = points.filter(p => now - p.t < MAX_AGE);

    gl.bindTexture(gl.TEXTURE_2D, tex);
    try { gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source); } catch { /* source not decoded yet */ }

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(uTime, now);
    gl.uniform1f(uAspect, canvas.clientWidth / Math.max(1, canvas.clientHeight));
    for (let i = 0; i < MAX_POINTS; i++) {
      const p = points[i];
      flat[i * 3] = p ? p.x : 0; flat[i * 3 + 1] = p ? p.y : 0; flat[i * 3 + 2] = p ? p.t : -999;
    }
    gl.uniform3fv(uPoints, flat);
    gl.uniform1i(uCount, points.length);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    if (running && points.length > 0) raf = requestAnimationFrame(render);
    else running = false;
  }
  function start() { if (!running) { running = true; raf = requestAnimationFrame(render); } }

  function push(x, y) {
    const now = (performance.now() - startTime) / 1000;
    const dx = x - lastPush.x, dy = y - lastPush.y;
    const moved = Math.sqrt(dx * dx + dy * dy);
    const dt = now - lastPush.t;
    if (moved < 0.012 && dt < 0.018) return;
    const steps = Math.min(6, Math.max(1, Math.floor(moved / 0.02)));
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      points.push({ x: lastPush.x + dx * t, y: lastPush.y + dy * t, t: lastPush.t + dt * t });
    }
    while (points.length > MAX_POINTS) points.shift();
    lastPush = { x, y, t: now };
    start();
  }

  const onMove = e => {
    const box = root.getBoundingClientRect();
    push((e.clientX - box.left) / box.width, (e.clientY - box.top) / box.height);
  };
  root.addEventListener('pointermove', onMove);
  start(); // idle-render once so the source shows even before hover — routed
           // through start() (not a raw requestAnimationFrame call) so it
           // shares the same `running` guard as push()'s own start() call;
           // otherwise a pointermove firing before the first paint could
           // schedule a second rAF and strand the first one's id, making it
           // uncancellable from destroy().

  return function destroy() {
    root.removeEventListener('pointermove', onMove);
    cancelAnimationFrame(raf);
    gl.deleteProgram(program);
    gl.deleteTexture(tex);
    gl.deleteBuffer(quadBuffer);
  };
}
