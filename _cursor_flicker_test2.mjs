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

// Spy directly on classList.add/remove (synchronous, no MutationObserver lag).
const toggleLog = [];
const origAdd = cursorEl.classList.add.bind(cursorEl.classList);
const origRemove = cursorEl.classList.remove.bind(cursorEl.classList);
cursorEl.classList.add = (...args) => { if (args.includes('on-link')) toggleLog.push('add'); return origAdd(...args); };
cursorEl.classList.remove = (...args) => { if (args.includes('on-link')) toggleLog.push('remove'); return origRemove(...args); };

function fire(type, target, related) {
  const ev = new dom.window.MouseEvent(type, { bubbles: true, cancelable: true, relatedTarget: related });
  target.dispatchEvent(ev);
}

console.log('document has mouseover listener:', true);
fire('mouseover', link, document.body);
fire('mouseout', link, inner);
fire('mouseover', inner, link);
fire('mouseout', inner, document.body);

destroy();

console.log('on-link toggle sequence:', toggleLog);
console.log(toggleLog.length > 2
  ? `FOUND BUG: 'on-link' flickers when moving between a link's own children (${toggleLog.length} toggles instead of 2: ['add','remove'])`
  : `clean: ${JSON.stringify(toggleLog)}`);
