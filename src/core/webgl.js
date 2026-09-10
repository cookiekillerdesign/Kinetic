/**
 * Kinetic — webgl.js
 * Boilerplate every shader-based effect needs: compiling programs, a
 * full-screen quad, and a resize-safe canvas sizing helper. Kept deliberately
 * tiny — this is not a 3D engine, just the plumbing for 2D fragment-shader
 * effects (ripples, gradients, distortion, noise).
 */

export function compileShader(gl, type, src) {
  const sh = gl.createShader(type);
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(sh);
    gl.deleteShader(sh);
    throw new Error(`Kinetic/webgl: shader compile failed\n${log}`);
  }
  return sh;
}

export function createProgram(gl, vertSrc, fragSrc) {
  const vs = compileShader(gl, gl.VERTEX_SHADER, vertSrc);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, fragSrc);
  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(prog);
    gl.deleteProgram(prog);
    throw new Error(`Kinetic/webgl: program link failed\n${log}`);
  }
  // Flag the shaders for deletion now — once linked, the program keeps its
  // own copy, so this doesn't affect rendering but avoids leaking the shader
  // objects for the program's lifetime (callers only ever delete `program`).
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  return { program: prog, vs, fs };
}

/** The universal vertex shader for full-screen fragment effects. */
export const FULLSCREEN_VERT = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

/** Binds a clip-space quad to `a_pos` on the given program. */
export function bindFullscreenQuad(gl, program) {
  const quad = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(program, 'a_pos');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  return buf;
}

export function getGL(canvas, opts = {}) {
  const merged = { alpha: true, premultipliedAlpha: false, antialias: true, ...opts };
  return canvas.getContext('webgl', merged) || canvas.getContext('experimental-webgl', merged);
}

/** Resizes the canvas' backing store to match its CSS box at the current
 *  DPR (capped at 2 — sharper is wasted GPU cost on most shader effects).
 *  Returns true if a resize actually happened, so callers can skip re-work. */
export function resizeCanvasToDisplaySize(canvas, gl) {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
  const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
  if (canvas.width === w && canvas.height === h) return false;
  canvas.width = w; canvas.height = h;
  if (gl) gl.viewport(0, 0, w, h);
  return true;
}
