/* Kinetic showcase — effect registry. 58 entries, one per module. */

/* Generates a rotating-hexagon frame sequence as data-URLs, entirely
   client-side — lets the imageSequenceScrub live demo (below the chapters)
   run with no real photo assets. Exported so the full-height demo block in
   main.js can reuse it too. */
export function genRotationFrames(n, colorA, colorB){
  var size = 480, frames = [];
  var c = document.createElement('canvas'); c.width = size; c.height = size;
  var ctx = c.getContext('2d');
  for (var i = 0; i < n; i++){
    var angle = (i / n) * Math.PI * 2;
    ctx.clearRect(0, 0, size, size);
    ctx.save();
    ctx.translate(size/2, size/2);
    ctx.rotate(angle);
    var grad = ctx.createLinearGradient(-size/2, -size/2, size/2, size/2);
    grad.addColorStop(0, colorA); grad.addColorStop(1, colorB);
    ctx.fillStyle = grad;
    ctx.beginPath();
    var r = size * 0.32;
    for (var p = 0; p < 6; p++){
      var a = (p / 6) * Math.PI * 2;
      var x = Math.cos(a) * r, y = Math.sin(a) * r;
      if (p === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath(); ctx.fill();
    ctx.restore();
    frames.push(c.toDataURL('image/png'));
  }
  return frames;
}

export const EFFECTS = (function(){
  function chips(n, cls){ var s=''; for(var i=1;i<=n;i++) s += '<div class="'+(cls||'chip')+'">'+i+'</div>'; return s; }
  function genArtCells(){
    var seeds = [
      { seed:'alpha', hue:'#4f6bff' }, { seed:'bravo', hue:'#ff5f7e' },
      { seed:'charlie', hue:'#2be3b0' }, { seed:'delta', hue:'#f3f1ea' }
    ];
    return '<div class="gen-art-grid" data-role="genart-grid">' + seeds.map(function(s){
      return '<canvas data-seed="'+s.seed+'" data-hue="'+s.hue+'"></canvas>';
    }).join('') + '</div>';
  }

  return [
    /* ---------------- 01 · Cursor & Pointer ---------------- */
    { id:'customCursor', cat:'cursor', file:'effects/cursor/customCursor.js', title:'Custom Cursor',
      desc:'A ring that lerps toward the pointer, expands over links, and shows a contextual label via data-cursor-label.',
      note:'Already running — move your mouse anywhere on this page.',
      code:"import { initCustomCursor } from 'kinetic/effects/cursor/customCursor';\nconst destroy = initCustomCursor({ speed: 0.2 });",
      stageHTML:'<span class="eyebrow">See the cursor ↑</span>' },

    { id:'magnetic', cat:'cursor', file:'effects/cursor/magnetic.js', title:'Magnetic Elements',
      desc:'Elements gently pull toward the cursor on hover, then spring back with an overshoot ease.',
      code:"import { initMagnetic } from 'kinetic/effects/cursor/magnetic';\nconst destroy = initMagnetic('.magnetic', { pull: 0.3 });",
      stageHTML:'<button class="demo-btn" data-role="magnetic">Hover me</button>',
      init:function(stage,K){ return K.initMagnetic(stage.querySelectorAll('[data-role="magnetic"]'), { pull:.35 }); } },

    { id:'magneticText', cat:'cursor', file:'effects/cursor/magneticText.js', title:'Magnetic Text',
      desc:'Per-character magnetism — each letter nudges away from the cursor individually, proportional to distance.',
      code:"import { initMagneticText } from 'kinetic/effects/cursor/magneticText';\nconst destroy = initMagneticText('.magnetic-text', { radius: 120, strength: 18 });",
      stageHTML:'<span class="magnetic-text-demo" data-role="magtext">KINETIC</span>',
      init:function(stage,K){ return K.initMagneticText(stage.querySelectorAll('[data-role="magtext"]'), { radius:90, strength:14 }); } },

    { id:'cursorTrail', cat:'cursor', file:'effects/cursor/cursorTrail.js', title:'Cursor Trail',
      desc:'A short chain of dots that follow the cursor with staggered lag, reading as one elastic ribbon.',
      code:"import { initCursorTrail } from 'kinetic/effects/cursor/cursorTrail';\nconst destroy = initCursorTrail({ count: 6 });",
      stageHTML:'<button class="demo-btn ghost" data-role="trail-toggle">Enable trail (site-wide)</button>',
      init:function(stage,K){
        var off=null, btn=stage.querySelector('[data-role="trail-toggle"]');
        btn.addEventListener('click', function(){
          if(off){ off(); off=null; btn.textContent='Enable trail (site-wide)'; }
          else { off=K.initCursorTrail({ count:6 }); btn.textContent='Disable trail'; }
        });
      } },

    { id:'spotlightHover', cat:'cursor', file:'effects/cursor/spotlightHover.js', title:'Spotlight Hover',
      desc:'A soft radial-gradient flashlight that follows the cursor inside a container.',
      code:"import { initSpotlightHover } from 'kinetic/effects/cursor/spotlightHover';\nconst destroy = initSpotlightHover('.spotlight-card', { radius: 260 });",
      stageHTML:'<div class="kx-spotlight-demo" data-role="spotlight" style="width:100%;height:100%;"><span class="eyebrow">Move over me</span></div>',
      init:function(stage,K){ return K.initSpotlightHover(stage.querySelectorAll('[data-role="spotlight"]'), { radius:140 }); } },

    { id:'blobCursor', cat:'cursor', file:'effects/cursor/blobCursor.js', title:'Blob Cursor',
      desc:'A gooey, metaball-style cursor — a short trail of circles chases the pointer and melts into one liquid blob via an SVG goo filter.',
      code:"import { initBlobCursor } from 'kinetic/effects/cursor/blobCursor';\nconst destroy = initBlobCursor({ count: 5, size: 22, color: '#4f6bff' });",
      stageHTML:'<button class="demo-btn ghost" data-role="blob-toggle">Enable blob cursor (site-wide)</button>',
      init:function(stage,K){
        var off=null, btn=stage.querySelector('[data-role="blob-toggle"]');
        btn.addEventListener('click', function(){
          if(off){ off(); off=null; btn.textContent='Enable blob cursor (site-wide)'; }
          else { off=K.initBlobCursor({ count:5, size:20, color:'#4f6bff' }); btn.textContent='Disable blob cursor'; }
        });
      } },

    /* ---------------- 02 · Text ---------------- */
    { id:'splitText', cat:'text', file:'effects/text/splitText.js', title:'Split Text Reveal',
      desc:'Splits text into per-character spans that rise into place with a staggered delay.',
      note:'The hero title above uses this exact function.',
      code:"import { initSplitText } from 'kinetic/effects/text/splitText';\nconst destroy = initSplitText('.hero-title', { step: 0.026 });",
      stageHTML:'<span class="kx-split in" style="font-weight:800;font-size:22px;" data-role="split-replay">Awwwards</span>',
      init:function(stage,K){
        var el = stage.querySelector('[data-role="split-replay"]');
        stage.addEventListener('mouseenter', function(){
          el.classList.remove('in');
          K.initSplitText([el], { step:.03 }); // triggerOnScroll (default true) re-adds .in on its own via IntersectionObserver, giving a real frame gap to animate from
        });
      } },

    { id:'glitchText', cat:'text', file:'effects/text/glitchText.js', title:'Glitch Text',
      desc:'Short RGB-split glitch bursts on hover using CSS clip-path slices — no canvas needed.',
      code:"import { initGlitchText } from 'kinetic/effects/text/glitchText';\nconst destroy = initGlitchText('.glitch', { trigger: 'hover' });",
      stageHTML:'<span class="glitch-demo" data-text="GLITCH" data-role="glitch">GLITCH</span>',
      init:function(stage,K){ return K.initGlitchText(stage.querySelectorAll('[data-role="glitch"]'), { trigger:'hover' }); } },

    { id:'scrambleText', cat:'text', file:'effects/text/scrambleText.js', title:'Scramble / Decode Text',
      desc:'Characters cycle through random glyphs before settling — a terminal-style decrypt reveal.',
      code:"import { initScrambleText } from 'kinetic/effects/text/scrambleText';\nconst destroy = initScrambleText('.scramble-on-hover');",
      stageHTML:'<span style="font-family:var(--mono);font-size:17px;" data-role="scramble">DECODE ME</span>',
      init:function(stage,K){ return K.initScrambleText(stage.querySelectorAll('[data-role="scramble"]')); } },

    { id:'marquee', cat:'text', file:'effects/text/marquee.js', title:'Marquee / Ticker',
      desc:'An infinite horizontal ticker built by duplicating the content once — no per-frame cost at rest.',
      code:"import { initMarquee } from 'kinetic/effects/text/marquee';\nconst destroy = initMarquee('.marquee', { speed: 40, hoverSlow: true });",
      stageHTML:'<div class="mini-marquee" data-role="mini-marquee"><div class="mini-marquee-track">Design · Motion · Code · </div></div>',
      init:function(stage,K){ return K.initMarquee(stage.querySelectorAll('[data-role="mini-marquee"]'), { speed:26 }); } },

    { id:'counter', cat:'text', file:'effects/text/counter.js', title:'Animated Counter',
      desc:'Counts up with an eased curve when it scrolls into view — reads as an arrival, not a slot machine.',
      code:"<span class=\"counter\" data-to=\"248\" data-suffix=\"+\">0</span>\nimport { initCounters } from 'kinetic/effects/text/counter';\nconst destroy = initCounters('.counter', { duration: 1400 });",
      stageHTML:'<div class="counter-demo"><span data-role="counter-demo" data-to="248" data-suffix="+">0</span></div>',
      init:function(stage,K){ return K.initCounters(stage.querySelectorAll('[data-role="counter-demo"]')); } },

    { id:'typewriter', cat:'text', file:'effects/text/typewriter.js', title:'Typewriter',
      desc:'Types out rotating strings character by character — the classic rotating-tagline effect.',
      code:"import { initTypewriter } from 'kinetic/effects/text/typewriter';\nconst destroy = initTypewriter('.role', {\n  words: ['Product Designer', 'UX Engineer', 'Frontend Craftsman'],\n  loop: true\n});",
      stageHTML:'<span class="typewriter-demo" data-role="typewriter"></span>',
      init:function(stage,K){ return K.initTypewriter(stage.querySelectorAll('[data-role="typewriter"]'), { words:['Awwwards-worthy','Handmade','Reduced-motion safe'], loop:true }); } },

    { id:'textMaskScrollFill', cat:'text', file:'effects/text/textMaskScrollFill.js', title:'Scroll-Fill Text',
      desc:'Text fills with color as the page scrolls past it — driven by one shared scroll listener.',
      note:'Drag to preview — on a real page this is driven by scroll position.',
      code:"<p class=\"fill-text\" data-kx-fill>\n  <span class=\"base\">Design is how it works.</span>\n  <span class=\"fill\" aria-hidden=\"true\">Design is how it works.</span>\n</p>\nimport { initTextMaskScrollFill } from 'kinetic/effects/text/textMaskScrollFill';\nconst destroy = initTextMaskScrollFill('[data-kx-fill]');",
      stageHTML:'<div style="width:100%;"><p class="fill-text-demo" data-role="filltext"><span class="base">Design is how it works.</span><span class="fill">Design is how it works.</span></p><input type="range" class="fill-range" min="0" max="100" value="40" data-role="fillrange"></div>',
      init:function(stage){
        var el=stage.querySelector('[data-role="filltext"]'), range=stage.querySelector('[data-role="fillrange"]');
        el.style.setProperty('--kx-fill', range.value+'%');
        range.addEventListener('input', function(){ el.style.setProperty('--kx-fill', range.value+'%'); });
      } },

    { id:'kineticScrollType', cat:'text', file:'effects/text/kineticScrollType.js', title:'Kinetic Scroll Type',
      desc:'Splits text into characters and scrubs their opacity/blur live against scroll position — a continuous read, not a one-shot reveal.',
      note:'Scroll this page ↕ — this exact card scrubs as it passes through view.',
      code:"import { initKineticScrollType } from 'kinetic/effects/text/kineticScrollType';\nconst destroy = initKineticScrollType('.scroll-type');",
      stageHTML:'<p class="scroll-type-demo" data-role="scrolltype">Design is how it works, not just how it looks.</p>',
      init:function(stage,K){ return K.initKineticScrollType(stage.querySelectorAll('[data-role="scrolltype"]'), { startVh:1.0, endVh:0.55 }); } },

    /* ---------------- 03 · Scroll ---------------- */
    { id:'scrollReveal', cat:'scroll', file:'effects/scroll/scrollReveal.js', title:'Scroll Reveal',
      desc:'Adds .in to any .kx-reveal element once it crosses into the viewport — one shared observer for the page.',
      note:'You are seeing it — every section and card on this page reveals this way.',
      code:"import { initScrollReveal } from 'kinetic/effects/scroll/scrollReveal';\nconst destroy = initScrollReveal(); // observes every .kx-reveal on the page",
      stageHTML:'<span class="eyebrow">Scroll this page ↕</span>' },

    { id:'parallax', cat:'scroll', file:'effects/scroll/parallax.js', title:'Parallax',
      desc:'Translates elements at a fraction of scroll speed via data-kx-speed, for depth.',
      code:"<img data-kx-parallax data-kx-speed=\"0.4\" src=\"...\">\nimport { initParallax } from 'kinetic/effects/scroll/parallax';\nconst destroy = initParallax('[data-kx-parallax]');",
      stageHTML:'<div class="parallax-demo"><span data-kx-parallax data-kx-speed="0.5" style="width:70px;height:70px;background:var(--cobalt);top:20%;left:20%;"></span><span data-kx-parallax data-kx-speed="0.2" style="width:44px;height:44px;background:var(--coral);top:50%;left:60%;"></span></div>',
      init:function(stage,K){ return K.initParallax(stage.querySelectorAll('[data-kx-parallax]')); } },

    { id:'scrollProgress', cat:'scroll', file:'effects/scroll/scrollProgress.js', title:'Scroll Progress',
      desc:'Drives a --kx-progress CSS variable from scroll position — wire it to a bar, a ring, anything in CSS.',
      note:'The thin bar at the very top of this page is this exact function.',
      code:"import { initScrollProgress } from 'kinetic/effects/scroll/scrollProgress';\nconst destroy = initScrollProgress('.progress-bar');",
      stageHTML:'<span class="eyebrow">Look at the top of the page ↑</span>' },

    { id:'smoothScroll', cat:'scroll', file:'effects/scroll/smoothScroll.js', title:'Eased Smooth Scroll',
      desc:'An easeOutExpo scroll-to, for anchor links and back-to-top — replaces the native scroll curve.',
      code:"import { scrollToHash } from 'kinetic/effects/scroll/smoothScroll';\nlink.addEventListener('click', e => {\n  e.preventDefault();\n  scrollToHash(link.getAttribute('href'));\n});",
      stageHTML:'<button class="demo-btn" data-role="smooth-scroll-btn">Scroll to footer</button>',
      init:function(stage,K){ stage.querySelector('[data-role="smooth-scroll-btn"]').addEventListener('click', function(){ K.smoothScrollTo(document.body.scrollHeight, 1100); }); } },

    { id:'pinSection', cat:'scroll', file:'effects/scroll/pinSection.js', title:'Pin Section',
      desc:'Pins a section via position:sticky for the duration of a taller container, reporting 0-1 progress.',
      note:'Full-size live demo below the chapters ↓',
      code:"import { initPinSection } from 'kinetic/effects/scroll/pinSection';\nconst destroy = initPinSection('.pin-outer', {\n  onProgress: p => { rail.style.transform = 'translateX(' + (-p*100) + '%)'; }\n});",
      stageHTML:'<span class="eyebrow">See the full demo below ↓</span>' },

    { id:'horizontalScroll', cat:'scroll', file:'effects/scroll/horizontalScroll.js', title:'Horizontal Scroll',
      desc:'Converts vertical scroll through a pinned section into horizontal track motion — a sideways gallery.',
      note:'Full-size live demo below the chapters ↓',
      code:"import { initHorizontalScroll } from 'kinetic/effects/scroll/horizontalScroll';\nconst destroy = initHorizontalScroll('.hscroll-outer');",
      stageHTML:'<span class="eyebrow">See the full demo below ↓</span>' },

    { id:'scrollSnapSections', cat:'scroll', file:'effects/scroll/scrollSnapSections.js', title:'Scroll Snap + Dot Nav',
      desc:'A thin layer over native CSS scroll-snap: keyboard navigation plus a synced dot nav.',
      code:"import { initScrollSnapSections } from 'kinetic/effects/scroll/scrollSnapSections';\nconst destroy = initScrollSnapSections('.snap-container', { dotNav: '.snap-dots' });",
      stageHTML:'<div class="snap-demo" data-role="snap-container"><section>One</section><section>Two</section><section>Three</section></div>',
      init:function(stage,K){ return K.initScrollSnapSections(stage.querySelector('[data-role="snap-container"]'), { sectionSelector:'section' }); } },

    { id:'scrollTimelineReveal', cat:'scroll', file:'effects/scroll/scrollTimelineReveal.js', title:'Scroll-Timeline Reveal',
      desc:'A reveal driven by native CSS animation-timeline: view() — scrubbed live by scroll position on the compositor, not played once via IntersectionObserver.',
      note:'Scroll this card through the viewport to see it scrub in both directions.',
      code:"<p class=\"kx-timeline-reveal\">...</p>\nimport { initScrollTimelineReveal } from 'kinetic/effects/scroll/scrollTimelineReveal';\nconst destroy = initScrollTimelineReveal('.kx-timeline-reveal');",
      stageHTML:'<div class="kx-timeline-reveal" data-role="tl-demo" style="font-family:var(--mono);font-size:14px;">Scrubbed, not switched.</div>',
      init:function(stage,K){ return K.initScrollTimelineReveal(stage.querySelectorAll('[data-role="tl-demo"]')); } },

    /* ---------------- 04 · WebGL & Canvas ---------------- */
    { id:'rippleDistort', cat:'webgl', file:'effects/webgl/rippleDistort.js', title:'Ripple Distort — flagship',
      desc:"Real WebGL water-ripple that follows the cursor's path across an image, with specular highlight and decay.",
      code:"<div class=\"ripple-wrap\">\n  <canvas class=\"kx-ripple-source\"></canvas>\n  <canvas class=\"kx-ripple-canvas\"></canvas>\n</div>\nimport { initRippleDistort } from 'kinetic/effects/webgl/rippleDistort';\nconst destroy = initRippleDistort('.ripple-wrap');",
      stageHTML:'<div class="ripple-wrap" data-role="ripple-wrap"><canvas class="kx-ripple-source" data-role="ripple-source"></canvas><canvas class="kx-ripple-canvas"></canvas></div>',
      init:function(stage,K){
        var src = stage.querySelector('[data-role="ripple-source"]');
        src.dataset.seed='kinetic-ripple'; src.dataset.hue='#4f6bff';
        K.initGenerativeArt([src]);
        return K.initRippleDistort(stage.querySelectorAll('[data-role="ripple-wrap"]'));
      } },

    { id:'gradientMesh', cat:'webgl', file:'effects/webgl/gradientMesh.js', title:'Gradient Mesh',
      desc:'An animated, organic mesh-gradient background — soft color blobs drifting via noise, in a shader.',
      note:'The hero background above uses this exact function.',
      code:"<canvas class=\"gradient-mesh\"></canvas>\nimport { initGradientMesh } from 'kinetic/effects/webgl/gradientMesh';\nconst destroy = initGradientMesh('.gradient-mesh', {\n  colors: ['#4f6bff', '#ff5f7e', '#2be3b0', '#0b0b10']\n});",
      stageHTML:'<canvas data-role="mesh-demo" style="width:100%;height:100%;"></canvas>',
      init:function(stage,K){ return K.initGradientMesh(stage.querySelector('[data-role="mesh-demo"]'), { speed:.08 }); } },

    { id:'grainOverlay', cat:'webgl', file:'effects/webgl/grainOverlay.js', title:'Grain Overlay',
      desc:'Film-grain texture — a near-zero-cost CSS version (used on this page) and a true-noise canvas variant.',
      note:'The whole page already has the CSS version layered over it.',
      code:"<div class=\"kx-grain\" aria-hidden=\"true\"></div>\n/* or, for true per-frame noise: */\nimport { initAnimatedGrainCanvas } from 'kinetic/effects/webgl/grainOverlay';\nconst destroy = initAnimatedGrainCanvas('.grain-canvas', { opacity: 0.05 });",
      stageHTML:'<canvas data-role="grain-demo" style="width:100%;height:100%;"></canvas>',
      init:function(stage,K){ return K.initAnimatedGrainCanvas(stage.querySelector('[data-role="grain-demo"]'), { opacity:.5, fps:12 }); } },

    { id:'imageDistortHover', cat:'webgl', file:'effects/webgl/imageDistortHover.js', title:'Lens Distort Hover',
      desc:'A lighter cursor-following lens distortion — one point instead of a trail, cheap for a grid of many.',
      code:"<div class=\"lens-wrap\">\n  <canvas class=\"kx-lens-source\"></canvas>\n  <canvas class=\"kx-lens-canvas\"></canvas>\n</div>\nimport { initImageDistortHover } from 'kinetic/effects/webgl/imageDistortHover';\nconst destroy = initImageDistortHover('.lens-wrap', { strength: 0.06 });",
      stageHTML:'<div class="lens-wrap" data-role="lens-wrap"><canvas class="kx-lens-source" data-role="lens-source"></canvas><canvas class="kx-lens-canvas"></canvas></div>',
      init:function(stage,K){
        var src = stage.querySelector('[data-role="lens-source"]');
        src.dataset.seed='kinetic-lens'; src.dataset.hue='#ff5f7e';
        K.initGenerativeArt([src]);
        return K.initImageDistortHover(stage.querySelectorAll('[data-role="lens-wrap"]'));
      } },

    { id:'generativeArt', cat:'webgl', file:'effects/webgl/generativeArt.js', title:'Generative Art',
      desc:'Deterministic, seeded pixel-block covers — same seed always renders the same artwork, no image asset.',
      code:"<canvas class=\"gen-art\" data-seed=\"project-14\" data-hue=\"#4f6bff\"></canvas>\nimport { initGenerativeArt } from 'kinetic/effects/webgl/generativeArt';\nconst destroy = initGenerativeArt('.gen-art');",
      stageHTML:genArtCells(),
      init:function(stage,K){ return K.initGenerativeArt(stage.querySelectorAll('[data-role="genart-grid"] canvas')); } },

    { id:'particleField', cat:'webgl', file:'effects/webgl/particleField.js', title:'Particle Field',
      desc:'An interactive constellation network on 2D canvas — particles drift, link, and are pushed by the cursor.',
      code:"<canvas class=\"particles\"></canvas>\nimport { initParticleField } from 'kinetic/effects/webgl/particleField';\nconst destroy = initParticleField('.particles', { count: 60, linkDistance: 120 });",
      stageHTML:'<canvas data-role="particles-demo" style="width:100%;height:100%;"></canvas>',
      init:function(stage,K){ return K.initParticleField(stage.querySelector('[data-role="particles-demo"]'), { count:40 }); } },

    { id:'imageSequenceScrub', cat:'webgl', file:'effects/webgl/imageSequenceScrub.js', title:'Image Sequence Scrub',
      desc:'Scrubs a preloaded frame sequence to canvas as you scroll — the "spin the product" technique behind Apple-style product pages.',
      note:'Needs real scroll height to feel right — full-size live demo below the chapters ↓',
      code:"import { initImageSequenceScrub } from 'kinetic/effects/webgl/imageSequenceScrub';\nconst destroy = initImageSequenceScrub('.kx-sequence', {\n  frames: Array.from({length: 90}, (_, i) => `/seq/frame_${i}.jpg`),\n  scrollRoot: document.querySelector('.seq-outer')\n});",
      stageHTML:'<span class="eyebrow">See the full demo below ↓</span>' },

    /* ---------------- 05 · Transitions ---------------- */
    { id:'pageTransition', cat:'transitions', file:'effects/transitions/pageTransition.js', title:'Page Transition',
      desc:'Router-agnostic SPA transition: an overlay covers, you navigate, then it reveals — works with any router.',
      code:"<div class=\"transition-overlay\" aria-hidden=\"true\"></div>\nimport { initPageTransition } from 'kinetic/effects/transitions/pageTransition';\nconst { runTransition } = initPageTransition({ duration: 600 });\nlink.addEventListener('click', e => {\n  e.preventDefault();\n  runTransition(() => navigate(link.href));\n});",
      stageHTML:'<div class="pt-stage" data-role="pt-stage"><button class="demo-btn" data-role="pt-btn">Trigger transition</button><div class="pt-overlay" data-role="pt-overlay" aria-hidden="true"></div></div>',
      init:function(stage){
        var overlay = stage.querySelector('[data-role="pt-overlay"]');
        var btn = stage.querySelector('[data-role="pt-btn"]');
        btn.addEventListener('click', function(){
          overlay.classList.add('is-covering');
          setTimeout(function(){
            overlay.classList.add('is-covered');
            requestAnimationFrame(function(){
              overlay.classList.remove('is-covering'); overlay.classList.remove('is-covered');
              overlay.classList.add('is-revealing');
              setTimeout(function(){ overlay.classList.remove('is-revealing'); }, 550);
            });
          }, 550);
        });
      } },

    { id:'imageRevealMask', cat:'transitions', file:'effects/transitions/imageRevealMask.js', title:'Image Reveal Mask',
      desc:'Reveals an image with an animated clip-path sweep once it scrolls into view — a curtain pulling back.',
      code:"<div class=\"reveal-mask\"><img src=\"...\"></div>\nimport { initImageRevealMask } from 'kinetic/effects/transitions/imageRevealMask';\nconst destroy = initImageRevealMask('.reveal-mask');",
      stageHTML:'<div class="kx-reveal-mask" data-role="reveal-mask" style="width:100%;height:100%;border-radius:10px;background:linear-gradient(135deg,var(--cobalt),var(--mint));"></div>',
      init:function(stage,K){ return K.initImageRevealMask(stage.querySelectorAll('[data-role="reveal-mask"]'), { threshold:.1 }); } },

    { id:'curtainReveal', cat:'transitions', file:'effects/transitions/curtainReveal.js', title:'Curtain Reveal',
      desc:'A full-viewport curtain that slides away on load — the classic preloader-to-hero handoff.',
      code:"<div class=\"curtain\" aria-hidden=\"true\">\n  <div class=\"curtain-panel\"></div>\n  <div class=\"curtain-panel\"></div>\n</div>\nimport { runCurtainReveal } from 'kinetic/effects/transitions/curtainReveal';\nrunCurtainReveal('.curtain', { onDone: () => startHero() });",
      stageHTML:'<div class="curtain-stage" data-role="curtain-stage"><button class="demo-btn" data-role="curtain-btn" style="position:relative;z-index:1;">Replay intro</button></div>',
      init:function(stage){
        var host = stage.querySelector('[data-role="curtain-stage"]');
        var btn = stage.querySelector('[data-role="curtain-btn"]');
        function play(){
          var wrap = document.createElement('div');
          wrap.className = 'curtain-demo';
          wrap.innerHTML = '<div class="panel"></div><div class="panel"></div>';
          host.appendChild(wrap);
          var panels = [].slice.call(wrap.querySelectorAll('.panel'));
          setTimeout(function(){
            panels.forEach(function(p,i){ setTimeout(function(){ p.classList.add('is-open'); }, i*90); });
            setTimeout(function(){ wrap.remove(); }, 90*panels.length + 800);
          }, 150);
        }
        btn.addEventListener('click', play);
        play();
      } },

    { id:'morphTransition', cat:'transitions', file:'effects/transitions/morphTransition.js', title:'FLIP Morph',
      desc:'Animates an element from its old bounding box to its new one on any layout change — a shared-element morph.',
      code:"import { flip } from 'kinetic/effects/transitions/morphTransition';\nconst play = flip(cardEl);       // 1. snapshot BEFORE the change\nmoveCardToNewPosition(cardEl);   // 2. make the DOM/layout change\nplay();                          // 3. animate old box -> new box",
      stageHTML:'<div class="flip-row" data-role="flip-row"><div class="flip-chip" style="background:var(--cobalt);color:#fff;">A</div><div class="flip-chip" style="background:var(--ink-raise);">B</div><div class="flip-chip" style="background:var(--ink-raise);">C</div></div>',
      init:function(stage,K){
        var row = stage.querySelector('[data-role="flip-row"]');
        [].slice.call(row.children).forEach(function(chip){
          chip.addEventListener('click', function(){
            if (row.firstElementChild === chip) return;
            var play = K.flip(chip, { duration:500 });
            row.insertBefore(chip, row.firstElementChild);
            play();
          });
        });
      } },

    { id:'viewTransitionPage', cat:'transitions', file:'effects/transitions/viewTransitionPage.js', title:'View Transition (native)',
      desc:'Wraps the native View Transitions API for SPA route changes — the browser cross-fades/morphs automatically, no overlay choreography needed.',
      note:(typeof document!=='undefined' && document.startViewTransition) ? 'Supported in this browser — click to see it run.' : 'Not supported in this browser — falls back to an instant swap automatically.',
      code:"import { runViewTransition, tagViewTransition } from 'kinetic/effects/transitions/viewTransitionPage';\ntagViewTransition(heroImage, 'hero-image'); // same name on both pages\nlink.addEventListener('click', e => {\n  e.preventDefault();\n  runViewTransition(() => navigate(link.href));\n});",
      stageHTML:'<div class="vt-page-stage" data-role="vt-stage"><div class="vt-page-card" data-role="vt-card" style="background:linear-gradient(135deg,var(--cobalt),var(--ink));"><span data-role="vt-label">Page One</span></div><button class="demo-btn" data-role="vt-btn" style="position:absolute;bottom:14px;right:14px;">Transition</button></div>',
      init:function(stage,K){
        var card = stage.querySelector('[data-role="vt-card"]');
        var label = stage.querySelector('[data-role="vt-label"]');
        var btn = stage.querySelector('[data-role="vt-btn"]');
        var states = [
          { bg:'linear-gradient(135deg,var(--cobalt),var(--ink))', text:'Page One' },
          { bg:'linear-gradient(135deg,var(--coral),var(--ink))', text:'Page Two' }
        ];
        var i = 0;
        card.style.viewTransitionName = 'kx-vt-demo';
        btn.addEventListener('click', function(){
          K.runViewTransition(function(){
            i = 1 - i;
            card.style.background = states[i].bg;
            label.textContent = states[i].text;
          });
        });
      } },

    { id:'viewTransitionBlock', cat:'transitions', file:'effects/transitions/viewTransitionBlock.js', title:'View Transition (block filter)',
      desc:'The same native API applied to a local DOM update — filtering a list — with an automatic FLIP fallback where the API is unsupported.',
      code:"import { transitionBlock } from 'kinetic/effects/transitions/viewTransitionBlock';\nfilterBtn.addEventListener('click', () => {\n  transitionBlock(grid, () => applyFilter(grid), { itemSelector: '.item' });\n});",
      stageHTML:'<div><div class="vt-filter-row" data-role="vt-filters"><button class="demo-chip" data-filter="all">All</button><button class="demo-chip" data-filter="a">Group A</button><button class="demo-chip" data-filter="b">Group B</button></div><div class="vt-filter-grid" data-role="vt-grid"><span class="vt-chip" data-group="a">A1</span><span class="vt-chip" data-group="b">B1</span><span class="vt-chip" data-group="a">A2</span><span class="vt-chip" data-group="b">B2</span><span class="vt-chip" data-group="a">A3</span><span class="vt-chip" data-group="b">B3</span></div></div>',
      init:function(stage,K){
        var grid = stage.querySelector('[data-role="vt-grid"]');
        var items = [].slice.call(grid.querySelectorAll('.vt-chip'));
        stage.querySelector('[data-role="vt-filters"]').addEventListener('click', function(e){
          var btn = e.target.closest('[data-filter]');
          if(!btn) return;
          var f = btn.dataset.filter;
          K.transitionBlock(grid, function(){
            items.forEach(function(chip){ chip.style.display = (f==='all' || chip.dataset.group===f) ? '' : 'none'; });
          }, { itemSelector:'.vt-chip' });
        });
      } },

    /* ---------------- 06 · Loaders ---------------- */
    { id:'preloader', cat:'loaders', file:'effects/loaders/preloader.js', title:'Asset Preloader',
      desc:'A percentage counter that tracks real loading progress (images, fonts, promises), not a fake timer.',
      code:"import { runPreloader } from 'kinetic/effects/loaders/preloader';\nrunPreloader({\n  countEl: document.querySelector('.count'),\n  tasks: [...document.images].map(img => img.decode().catch(() => {})),\n  minDuration: 900,\n  onDone: () => hidePreloader()\n});",
      stageHTML:'<div class="preloader-demo"><div class="pct" data-role="preloader-pct">0</div><button class="demo-btn ghost" data-role="preloader-btn" style="margin-top:10px;">Simulate load</button></div>',
      init:function(stage,K){
        var pct = stage.querySelector('[data-role="preloader-pct"]');
        var btn = stage.querySelector('[data-role="preloader-btn"]');
        btn.addEventListener('click', function(){
          pct.textContent='0';
          var tasks=[80,160,240,320,400].map(function(ms){ return new Promise(function(res){ setTimeout(res,ms); }); });
          K.runPreloader({ tasks:tasks, minDuration:400, onProgress:function(p){ pct.textContent=String(p); } });
        });
      } },

    { id:'skeletonShimmer', cat:'loaders', file:'effects/loaders/skeletonShimmer.js', title:'Skeleton Shimmer',
      desc:'Placeholder blocks with a moving light-sweep, swapped for real content once it resolves.',
      code:"<div class=\"skeleton-wrap\">\n  <div class=\"kx-skeleton\"></div>\n  <div class=\"kx-content\" hidden>Loaded content</div>\n</div>\nimport { resolveSkeleton } from 'kinetic/effects/loaders/skeletonShimmer';\nfetchData().then(() => resolveSkeleton('.skeleton-wrap'));",
      stageHTML:'<div class="skeleton-demo" data-role="skeleton-wrap"><div class="kx-skeleton" data-role="skeleton"></div><div class="kx-content" data-role="skeleton-content" hidden>Loaded: 3 new messages</div><button class="demo-btn ghost" data-role="skeleton-btn" style="margin-top:10px;">Load content</button></div>',
      init:function(stage,K){
        var btn = stage.querySelector('[data-role="skeleton-btn"]');
        btn.addEventListener('click', function(){
          var wrap = stage.querySelector('[data-role="skeleton-wrap"]');
          var sk = stage.querySelector('[data-role="skeleton"]');
          sk.classList.remove('is-done'); sk.style.position=''; sk.hidden=false;
          var content = stage.querySelector('[data-role="skeleton-content"]');
          content.hidden=true; content.classList.remove('in');
          setTimeout(function(){ K.resolveSkeleton([wrap]); }, 700);
        });
      } },

    { id:'scrollProgressBar', cat:'loaders', file:'effects/loaders/scrollProgressBar.js', title:'Reading Progress Bar',
      desc:'A convenience preset of scrollProgress, pre-wired for the reading-progress use case on articles.',
      note:'Same bar as the top of this page — this module is the article-reading preset.',
      code:"<div class=\"read-progress\"></div>\nimport { initScrollProgressBar } from 'kinetic/effects/loaders/scrollProgressBar';\nconst destroy = initScrollProgressBar('.read-progress', { target: articleEl });",
      stageHTML:'<span class="eyebrow">Look at the top of the page ↑</span>' },

    /* ---------------- 07 · Cards & 3D ---------------- */
    { id:'tilt3d', cat:'cards', file:'effects/cards/tilt3d.js', title:'3D Tilt',
      desc:'Cursor-driven rotateX/Y tilt with a subtle lift and glare layer, damped smoothly on release.',
      code:"<div class=\"tilt\"><div class=\"tilt-inner\">...<div class=\"tilt-glare\"></div></div></div>\nimport { initTilt3d } from 'kinetic/effects/cards/tilt3d';\nconst destroy = initTilt3d('.tilt', { max: 12, glare: true });",
      stageHTML:'<div class="kx-tilt" data-role="tilt" style="width:140px;height:100px;"><div class="kx-tilt-inner">Tilt me<div class="kx-tilt-glare"></div></div></div>',
      init:function(stage,K){ return K.initTilt3d(stage.querySelectorAll('[data-role="tilt"]'), { max:14 }); } },

    { id:'hoverGlow', cat:'cards', file:'effects/cards/hoverGlow.js', title:'Hover Glow',
      desc:'A soft colored glow that tracks the cursor around a card border — an emissive edge, not a surface light.',
      code:"import { initHoverGlow } from 'kinetic/effects/cards/hoverGlow';\nconst destroy = initHoverGlow('.glow-card');",
      stageHTML:'<div class="glow-card-demo" data-role="glow" style="width:140px;height:100px;">Hover the edge</div>',
      init:function(stage,K){ return K.initHoverGlow(stage.querySelectorAll('[data-role="glow"]')); } },

    { id:'flipCard', cat:'cards', file:'effects/cards/flipCard.js', title:'Flip Card',
      desc:'A 3D card flip between front/back faces, triggered by click or hover — keyboard accessible too.',
      code:"<div class=\"flip\"><div class=\"flip-inner\">\n  <div class=\"flip-front\">Front</div>\n  <div class=\"flip-back\">Back</div>\n</div></div>\nimport { initFlipCard } from 'kinetic/effects/cards/flipCard';\nconst destroy = initFlipCard('.flip', { trigger: 'click' });",
      stageHTML:'<div class="kx-flip" data-role="flip"><div class="kx-flip-inner"><div class="kx-flip-front">Click</div><div class="kx-flip-back">Flipped</div></div></div>',
      init:function(stage,K){ return K.initFlipCard(stage.querySelectorAll('[data-role="flip"]')); } },

    { id:'magneticCard', cat:'cards', file:'effects/cards/magneticCard.js', title:'Magnetic Card',
      desc:'Combines magnetic pull with tilt for one richer hover, sharing a single pointer sample per frame.',
      code:"import { initMagneticCard } from 'kinetic/effects/cards/magneticCard';\nconst destroy = initMagneticCard('.magnetic-card', { pull: 0.15, tilt: 8 });",
      stageHTML:'<div class="magnetic-card-demo" data-role="magcard" style="width:140px;height:100px;">Hover + move</div>',
      init:function(stage,K){ return K.initMagneticCard(stage.querySelectorAll('[data-role="magcard"]'), { pull:.18, tilt:10 }); } },

    { id:'stackedScrollCards', cat:'cards', file:'effects/cards/stackedScrollCards.js', title:'Stacked Scroll Cards',
      desc:'A sticky card stack — each card pins a little further down than the last, so the next one slides up and covers it, scaling and dimming underneath.',
      note:'Full-size live demo below the chapters ↓',
      code:"<div class=\"kx-stack\">\n  <div class=\"kx-stack-card\">One</div>\n  <div class=\"kx-stack-card\">Two</div>\n  <div class=\"kx-stack-card\">Three</div>\n</div>\nimport { initStackedScrollCards } from 'kinetic/effects/cards/stackedScrollCards';\nconst destroy = initStackedScrollCards('.kx-stack', { offset: 24 });",
      stageHTML:'<span class="eyebrow">See the full demo below ↓</span>' },

    /* ---------------- 08 · Grid & Layout ---------------- */
    { id:'staggerIn', cat:'grid', file:'effects/grid/staggerIn.js', title:'Stagger In',
      desc:"Animates a grid's children in with an incremental per-item delay, triggered once on scroll.",
      code:"<div class=\"stagger\"><div class=\"item\">...</div>...</div>\nimport { initStaggerIn } from 'kinetic/effects/grid/staggerIn';\nconst destroy = initStaggerIn('.stagger', { step: 60 });",
      stageHTML:'<div class="stagger-mini kx-stagger" data-role="stagger">'+chips(6)+'</div>',
      init:function(stage,K){ return K.initStaggerIn(stage.querySelectorAll('[data-role="stagger"]'), { step:70, childSelector:'.chip' }); } },

    { id:'gridMorph', cat:'grid', file:'effects/grid/gridMorph.js', title:'Grid Morph (FLIP)',
      desc:'Animates a layout/filter change so persisting items glide to their new position instead of jump-cutting.',
      code:"import { morphLayout } from 'kinetic/effects/grid/gridMorph';\nconst play = morphLayout(gridEl, '.item');\napplyNewLayoutClasses(gridEl);\nplay();",
      stageHTML:'<div><div class="morph-grid" data-role="morph-grid"><div class="chip">1</div><div class="chip">2</div><div class="chip">3</div></div><button class="demo-btn ghost" data-role="morph-btn" style="margin-top:10px;">Shuffle</button></div>',
      init:function(stage,K){
        var btn = stage.querySelector('[data-role="morph-btn"]');
        var grid = stage.querySelector('[data-role="morph-grid"]');
        btn.addEventListener('click', function(){
          var play = K.morphLayout(grid, '.chip');
          var chipsArr = [].slice.call(grid.children);
          chipsArr.sort(function(){ return Math.random()-.5; }).forEach(function(c){ grid.appendChild(c); });
          play();
        });
      } },

    { id:'infiniteMarqueeGrid', cat:'grid', file:'effects/grid/infiniteMarqueeGrid.js', title:'Infinite Marquee Grid',
      desc:'Multiple ticker rows with alternating directions — a wall-of-content effect, one shared tick for all rows.',
      code:"<div class=\"marquee-grid\">\n  <div class=\"marquee-row\"><div class=\"marquee-track\">...</div></div>\n  <div class=\"marquee-row\"><div class=\"marquee-track\">...</div></div>\n</div>\nimport { initInfiniteMarqueeGrid } from 'kinetic/effects/grid/infiniteMarqueeGrid';\nconst destroy = initInfiniteMarqueeGrid('.marquee-grid');",
      stageHTML:'<div class="marquee-grid-demo" data-role="mgrid"><div class="row"><div class="track">Design · Motion · Code · </div></div><div class="row"><div class="track">Awwwards · FWA · CSSDA · </div></div></div>',
      init:function(stage,K){ return K.initInfiniteMarqueeGrid(stage.querySelector('[data-role="mgrid"]'), { speed:20, rowSelector:'.row' }); } },

    /* ---------------- 09 · Navigation ---------------- */
    { id:'magneticNav', cat:'nav', file:'effects/nav/magneticNav.js', title:'Magnetic Nav Pill',
      desc:'A pill background that slides and resizes under whichever link is hovered, using FLIP to glide.',
      code:"<nav class=\"magnetic-nav\">\n  <span class=\"nav-pill\"></span>\n  <a class=\"nav-link is-active\">Work</a>\n  <a class=\"nav-link\">About</a>\n</nav>\nimport { initMagneticNav } from 'kinetic/effects/nav/magneticNav';\nconst destroy = initMagneticNav('.magnetic-nav');",
      stageHTML:'<nav class="nav-demo" data-role="magnav"><span class="pill" data-role="magnav-pill"></span><a class="is-active" data-role="magnav-link">Work</a><a data-role="magnav-link">About</a><a data-role="magnav-link">Contact</a></nav>',
      init:function(stage,K){ return K.initMagneticNav(stage.querySelector('[data-role="magnav"]'), { linkSelector:'[data-role="magnav-link"]', pillSelector:'[data-role="magnav-pill"]' }); } },

    { id:'menuMorph', cat:'nav', file:'effects/nav/menuMorph.js', title:'Fullscreen Menu Morph',
      desc:'A hamburger that morphs into an X, driving a fullscreen menu that clips open from the trigger.',
      code:"<button class=\"menu-trigger\" aria-expanded=\"false\"><span></span><span></span><span></span></button>\n<div class=\"menu-overlay\" aria-hidden=\"true\">...</div>\nimport { initMenuMorph } from 'kinetic/effects/nav/menuMorph';\nconst destroy = initMenuMorph();",
      stageHTML:'<div class="menu-demo-stage" data-role="menu-stage"><button class="demo-btn" data-role="menu-trigger" style="position:relative;z-index:3;">Open menu</button><div class="menu-demo-overlay" data-role="menu-overlay">Menu content</div></div>',
      init:function(stage){
        var trigger = stage.querySelector('[data-role="menu-trigger"]');
        var overlay = stage.querySelector('[data-role="menu-overlay"]');
        trigger.addEventListener('click', function(){
          var open = overlay.classList.toggle('is-open');
          trigger.textContent = open ? 'Close menu' : 'Open menu';
        });
      } },

    { id:'stickyHeaderHide', cat:'nav', file:'effects/nav/stickyHeaderHide.js', title:'Sticky Header Hide',
      desc:'Hides the header on scroll-down, reveals it on scroll-up — always available, never in the way.',
      note:"This page's own header, above — scroll down then up.",
      code:"import { initStickyHeaderHide } from 'kinetic/effects/nav/stickyHeaderHide';\nconst destroy = initStickyHeaderHide('.site-header', { threshold: 8 });",
      stageHTML:'<span class="eyebrow">Scroll down, then up ↑</span>' },

    { id:'gooeyIndicator', cat:'nav', file:'effects/nav/gooeyIndicator.js', title:'Gooey Nav Indicator',
      desc:'A liquid metaball indicator — a lead pill jumps to the hovered link while a trail pill chases it, merged by an SVG goo filter into one blob.',
      code:"<nav class=\"kx-gooey-nav\">\n  <div class=\"kx-gooey-fx\"><span class=\"kx-gooey-lead\"></span><span class=\"kx-gooey-trail\"></span></div>\n  <a data-gooey class=\"is-active\">Work</a><a data-gooey>About</a><a data-gooey>Contact</a>\n</nav>\nimport { initGooeyIndicator } from 'kinetic/effects/nav/gooeyIndicator';\nconst destroy = initGooeyIndicator('.kx-gooey-nav');",
      stageHTML:'<nav class="gooey-demo kx-gooey-nav" data-role="gooeynav"><div class="gooey-fx kx-gooey-fx"><span class="kx-gooey-lead"></span><span class="kx-gooey-trail"></span></div><a data-gooey class="is-active">Work</a><a data-gooey>About</a><a data-gooey>Contact</a></nav>',
      init:function(stage,K){ return K.initGooeyIndicator(stage.querySelector('[data-role="gooeynav"]')); } },

    /* ---------------- 10 · Buttons & CTA ---------------- */
    { id:'magneticButton', cat:'buttons', file:'effects/buttons/magneticButton.js', title:'Magnetic Button',
      desc:'A tuned preset over the magnetic effect: stronger pull, bouncier release, a lagging inner label.',
      code:"<button class=\"magnetic-btn\"><span class=\"magnetic-btn-inner\">Get in touch</span></button>\nimport { initMagneticButton } from 'kinetic/effects/buttons/magneticButton';\nconst destroy = initMagneticButton('.magnetic-btn');",
      stageHTML:'<button class="demo-btn" data-role="magbtn-outer" style="position:relative;"><span data-role="magbtn-inner">Get in touch</span></button>',
      init:function(stage,K){
        var outer = stage.querySelector('[data-role="magbtn-outer"]');
        var inner = stage.querySelector('[data-role="magbtn-inner"]');
        K.initMagnetic([outer], { pull:.4, releaseEase:K.cssEasing.outBack, releaseDuration:600 });
        K.initMagnetic([inner], { pull:.6, releaseEase:K.cssEasing.outBack, releaseDuration:600 });
      } },

    { id:'rippleClick', cat:'buttons', file:'effects/buttons/rippleClick.js', title:'Ripple Click',
      desc:'Material-style expanding ripple from the exact click point, a short-lived span with scale+fade.',
      code:"import { initRippleClick } from 'kinetic/effects/buttons/rippleClick';\nconst destroy = initRippleClick('.ripple-btn');",
      stageHTML:'<button class="demo-btn ripple-btn" data-role="ripplebtn">Click anywhere</button>',
      init:function(stage,K){ return K.initRippleClick(stage.querySelectorAll('[data-role="ripplebtn"]'), { color:'rgba(11,11,16,.35)' }); } },

    { id:'borderDraw', cat:'buttons', file:'effects/buttons/borderDraw.js', title:'Border Draw',
      desc:'An SVG outline that draws itself on hover via stroke-dashoffset — traced in real time.',
      code:"<button class=\"draw-btn\">\n  <svg class=\"draw-svg\"><rect class=\"draw-rect\" rx=\"8\"/></svg>\n  <span>Explore work</span>\n</button>\nimport { initBorderDraw } from 'kinetic/effects/buttons/borderDraw';\nconst destroy = initBorderDraw('.draw-btn');",
      stageHTML:'<button class="draw-btn" data-role="drawbtn"><svg class="draw-svg" data-role="drawsvg"><rect class="draw-rect" data-role="drawrect" rx="8"></rect></svg><span>Hover me</span></button>',
      init:function(stage,K){ return K.initBorderDraw(stage.querySelectorAll('[data-role="drawbtn"]'), { rectSelector:'[data-role="drawrect"]', svgSelector:'[data-role="drawsvg"]' }); } },

    /* ---------------- 11 · Backgrounds ---------------- */
    { id:'auroraGradient', cat:'backgrounds', file:'effects/backgrounds/auroraGradient.js', title:'Aurora Gradient (CSS)',
      desc:'A CSS-only animated aurora backdrop — blurred radial blobs drifting via keyframes, zero JS per frame.',
      code:"<div class=\"aurora\"><span></span><span></span><span></span></div>\nimport { initAuroraGradient } from 'kinetic/effects/backgrounds/auroraGradient';\nconst destroy = initAuroraGradient('.aurora', { colors: ['#4f6bff','#ff5f7e','#2be3b0'] });",
      stageHTML:'<div class="aurora-demo" data-role="aurora"><span></span><span></span><span></span></div>',
      init:function(stage,K){ return K.initAuroraGradient(stage.querySelector('[data-role="aurora"]')); } },

    { id:'dotGrid', cat:'backgrounds', file:'effects/backgrounds/dotGrid.js', title:'Dot Grid',
      desc:'An evenly-spaced dot field where each dot pulses in scale/opacity by proximity to the cursor.',
      code:"<canvas class=\"dot-grid\"></canvas>\nimport { initDotGrid } from 'kinetic/effects/backgrounds/dotGrid';\nconst destroy = initDotGrid('.dot-grid', { gap: 34, influence: 140 });",
      stageHTML:'<canvas data-role="dotgrid-demo" style="width:100%;height:100%;"></canvas>',
      init:function(stage,K){ return K.initDotGrid(stage.querySelector('[data-role="dotgrid-demo"]'), { gap:22, influence:100 }); } },

    { id:'noiseBackground', cat:'backgrounds', file:'effects/backgrounds/noiseBackground.js', title:'Noise Background',
      desc:'A slow-drifting simplex-noise field rendered as soft monochrome clouds — organic ambient motion.',
      code:"<canvas class=\"noise-bg\"></canvas>\nimport { initNoiseBackground } from 'kinetic/effects/backgrounds/noiseBackground';\nconst destroy = initNoiseBackground('.noise-bg', { scale: 0.006, speed: 0.00015 });",
      stageHTML:'<canvas data-role="noise-demo" style="width:100%;height:100%;"></canvas>',
      init:function(stage,K){ return K.initNoiseBackground(stage.querySelector('[data-role="noise-demo"]')); } },

    /* ---------------- 12 · Forms ---------------- */
    { id:'floatingLabel', cat:'forms', file:'effects/forms/floatingLabel.js', title:'Floating Label',
      desc:'The label-shrinks-above-the-input pattern, with a JS-driven has-value class for controlled inputs.',
      code:"<div class=\"field\">\n  <input class=\"field-input\" placeholder=\" \">\n  <label class=\"field-label\">Email</label>\n</div>\nimport { initFloatingLabel } from 'kinetic/effects/forms/floatingLabel';\nconst destroy = initFloatingLabel('.field');",
      stageHTML:'<div class="field-demo" data-role="field"><input data-role="field-input" placeholder=" "><label>Email</label></div>',
      init:function(stage,K){ return K.initFloatingLabel(stage.querySelectorAll('[data-role="field"]'), { inputSelector:'[data-role="field-input"]' }); } },

    { id:'customCheckbox', cat:'forms', file:'effects/forms/customCheckbox.js', title:'Custom Checkbox',
      desc:'A morphing checkmark over a real, accessible native input — the input stays the source of truth.',
      code:"<label class=\"checkbox\">\n  <input type=\"checkbox\" class=\"checkbox-input\">\n  <span class=\"checkbox-box\">...</span> Subscribe\n</label>\nimport { initCustomCheckbox } from 'kinetic/effects/forms/customCheckbox';\nconst destroy = initCustomCheckbox('.checkbox');",
      stageHTML:'<label class="checkbox-demo" data-role="cb"><input type="checkbox" data-role="cb-input"><span class="checkbox-box"><svg class="checkbox-check" viewBox="0 0 16 16"><path d="M3 8l3.5 3.5L13 4.5"></path></svg></span>Subscribe</label>',
      init:function(stage,K){ return K.initCustomCheckbox(stage.querySelectorAll('[data-role="cb"]'), { inputSelector:'[data-role="cb-input"]' }); } }
  ];
})();
