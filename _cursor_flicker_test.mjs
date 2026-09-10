import { JSDOM } from 'jsdom';
const dom = new JSDOM(`<!doctype html><html><body>
  <div class="kx-cursor"><span class="kx-cursor-ring"></span></div>
  <div class="kx-cursor-label"></div>
  <a href="#" class="kx-magnetic-btn"><span class="kx-magnetic-btn-inner">Get in touch</span></a>
</body></html>`, { pretendToBeVisual: true });
global.window = dom.window;
global.document = dom.window.document;
global.innerWidth = dom.window.innerWidth;
global.innerHeight = dom.window.innerHeight;
global.addEventListener = dom.window.addEventListener.bind(dom.window);
global.removeEventListener = dom.window.removeEventListener.bind(dom.window);
global.matchMedia = q => ({ matches: q.includes('pointer:fine') });
global.requestAnimationFrame = () => 1;
global.cancelAnimationFrame = () => {};

const { initCustomCursor } = await import('./src/effects/cursor/customCursor.js');
const cursorEl = document.querySelector('.kx-cursor');
const link = document.querySelector('.kx-magnetic-btn');
const inner = document.querySelector('.kx-magnetic-btn-inner');

const destroy = initCustomCursor({});

let toggleLog = [];
const observer = new dom.window.MutationObserver(() => {
  toggleLog.push(cursorEl.classList.contains('on-link'));
});
observer.observe(cursorEl, { attributes: true, attributeFilter: ['class'] });

function fire(type, target, related) {
  const ev = new dom.window.MouseEvent(type, { bubbles: true, cancelable: true, relatedTarget: related });
  target.dispatchEvent(ev);
}

// 1. Enter the link from outside — should turn cursor "on-link".
fire('mouseover', link, document.body);
// 2. Move from the <a> onto its own child <span> — a REAL mouse move within
//    the same link fires mouseout(a, related=span) then mouseover(span, related=a).
//    This must NOT toggle the class off and back on.
fire('mouseout', link, inner);
fire('mouseover', inner, link);
// 3. Finally leave the link entirely.
fire('mouseout', inner, document.body);

destroy();

console.log('on-link toggle sequence during hover (true=added, false=removed):', toggleLog);
const flickered = toggleLog.length > 2; // ideal: exactly [true, false] — enter once, leave once
console.log(flickered
  ? `FOUND BUG: customCursor.js — 'on-link' flickers off/on when moving between a link's own children (${toggleLog.length} toggles instead of 2)`
  : 'customCursor.js — no flicker, clean enter/leave');
