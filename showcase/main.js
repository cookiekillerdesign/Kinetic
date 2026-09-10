/**
 * Kinetic showcase — wiring entry point (ES module).
 * Registry-driven demo rendering: imports the vanilla core directly from
 * ../src (dogfooding the library exactly as a consumer would in a Vite
 * project), plus the 58-entry EFFECTS registry, and builds every chapter
 * and card from that data instead of hand-writing 58 card blocks.
 */
import * as K from '../src/index.js';
import { EFFECTS, genRotationFrames } from './registry.js';

const $ = (sel, root) => (root || document).querySelector(sel);
const $$ = (sel, root) => [...(root || document).querySelectorAll(sel)];

function esc(s) {
  return s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
}

/* ---------------- global site-wide effects ---------------- */
K.initCustomCursor({ cursorEl: $('#cursor'), labelEl: $('#cursorLabel'), speed: .2 });
K.initScrollProgress('#readProgress');
K.initStickyHeaderHide('#siteHeader', { revealAtTop: 24 });
K.initMarquee('#heroMarquee', { speed: 34 });
K.initCounters('.stat-num', { duration: 1200 });
K.initSplitText('#heroTitle', { step: .028 });
requestAnimationFrame(() => requestAnimationFrame(() => $('#heroTitle').classList.add('in')));

// Hero background: a quiet gradient mesh behind the headline.
K.initGradientMesh('#heroMesh', { colors: ['#4f6bff', '#ff5f7e', '#2be3b0', '#0b0b10'], speed: .05 });

// Pinned progress demo
K.initPinSection('#pinOuter', { onProgress: p => { $('#pinProgressNum').textContent = String(Math.round(p * 100)).padStart(2, '0'); } });
// Horizontal scroll demo
K.initHorizontalScroll('#hscrollOuter', { trackSelector: '#hscrollTrack' });
// Stacked scroll cards demo
K.initStackedScrollCards('#stackDemo', { offset: 28, scaleStep: 0.035 });
// Image sequence scrub demo — frames generated on the fly, no photo assets needed
K.initImageSequenceScrub('#seqCanvas', {
  frames: genRotationFrames(48, '#4f6bff', '#ff5f7e'),
  scrollRoot: $('#seqOuter'),
  fit: 'contain'
});

/* ---------------- chapters ---------------- */
const CHAPTERS = [
  { id: 'cursor', num: '01', title: 'Cursor &amp; Pointer', desc: 'The cursor itself, and elements that react to it.' },
  { id: 'text', num: '02', title: 'Text', desc: 'Type that reveals, decodes, ticks, counts and scrubs.' },
  { id: 'scroll', num: '03', title: 'Scroll', desc: 'What happens as the page moves under the user.' },
  { id: 'webgl', num: '04', title: 'WebGL &amp; Canvas', desc: 'Shader and canvas work — the flagship pieces.' },
  { id: 'transitions', num: '05', title: 'Transitions', desc: 'Getting from one state or view to the next — including native View Transitions.' },
  { id: 'loaders', num: '06', title: 'Loaders', desc: 'Waiting states that feel considered, not stalled.' },
  { id: 'cards', num: '07', title: 'Cards &amp; 3D', desc: 'Hover-responsive surfaces with real depth.' },
  { id: 'grid', num: '08', title: 'Grid &amp; Layout', desc: 'Collections of things entering and reordering.' },
  { id: 'nav', num: '09', title: 'Navigation', desc: 'Headers, menus, and the chrome around the content.' },
  { id: 'buttons', num: '10', title: 'Buttons &amp; CTA', desc: 'The elements people actually click.' },
  { id: 'backgrounds', num: '11', title: 'Backgrounds', desc: 'Ambient motion that never competes with content.' },
  { id: 'forms', num: '12', title: 'Forms', desc: 'Inputs that acknowledge the person filling them.' }
];

const chaptersRoot = $('#chapters');
CHAPTERS.forEach(ch => {
  const items = EFFECTS.filter(e => e.cat === ch.id);
  const section = document.createElement('section');
  section.className = 'chapter wrap kx-reveal';
  section.id = ch.id;
  section.innerHTML =
    `<div class="chapter-head">
      <div><div class="chapter-num">${ch.num} — ${ch.title.toUpperCase().replace(/&AMP;/g, '&')}</div>
      <h2>${ch.title}</h2>
      <p class="chapter-desc" style="margin-top:10px;">${ch.desc}</p></div>
      <div class="chapter-count">${items.length} effect${items.length === 1 ? '' : 's'}</div>
    </div>
    <div class="effects-grid"></div>`;
  chaptersRoot.appendChild(section);
  const grid = section.querySelector('.effects-grid');

  items.forEach(effect => {
    const card = document.createElement('article');
    card.className = 'effect-card kx-reveal';
    card.innerHTML =
      `<div class="effect-card-stage">${effect.stageHTML || ''}</div>
      <div class="effect-card-body">
        <p class="effect-file">${effect.file}</p>
        <h3>${effect.title}</h3>
        <p class="effect-desc">${effect.desc}</p>
        ${effect.note ? `<p class="demo-note">${effect.note}</p>` : ''}
        <div class="code-block"><button class="copy-btn" type="button">Copy</button><pre><code>${esc(effect.code)}</code></pre></div>
      </div>`;
    grid.appendChild(card);
    const stage = card.querySelector('.effect-card-stage');
    const copyBtn = card.querySelector('.copy-btn');
    copyBtn.addEventListener('click', () => {
      const text = effect.code;
      const done = () => { copyBtn.textContent = 'Copied'; copyBtn.classList.add('copied'); setTimeout(() => { copyBtn.textContent = 'Copy'; copyBtn.classList.remove('copied'); }, 1100); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(() => { fallbackCopy(text); done(); });
      } else { fallbackCopy(text); done(); }
    });
    function fallbackCopy(text) {
      const ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch { /* ignore */ }
      ta.remove();
    }
    if (typeof effect.init === 'function') {
      try { effect.init(stage, K); } catch (err) { console.error('Kinetic showcase demo failed:', effect.id, err); }
    }
  });
});

/* reveal everything (chapters, cards) */
K.initScrollReveal();

console.log('%cKinetic', 'font-weight:700;color:#4f6bff;font-size:14px;', `— ${EFFECTS.length} effects loaded. Inspect the K namespace via the module, or window.Kinetic in the single-file build.`);
