/**
 * Kinetic — scrollProgressBar
 * A thin fixed bar across the top of the viewport that fills with total
 * page-scroll progress — a convenience wrapper over scrollProgress.js
 * pre-wired to the common "reading progress" use case (blog posts, case
 * studies, long-form pages).
 *
 * Markup:
 *   <div class="kx-read-progress" style="position:fixed;top:0;left:0;height:3px;
 *     width:100%;transform-origin:left;transform:scaleX(var(--kx-progress,0));"></div>
 *
 * Usage:
 *   import { initScrollProgressBar } from 'kinetic/effects/loaders/scrollProgressBar.js';
 *   const destroy = initScrollProgressBar('.kx-read-progress', { target: articleEl });
 */
import { initScrollProgress } from '../scroll/scrollProgress.js';

export function initScrollProgressBar(selector = '.kx-read-progress', { target = null } = {}) {
  return initScrollProgress(selector, { target });
}
