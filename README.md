# Kinetic

cookiekiller®'s personal motion & effects library — **58 hand-built, dependency-free
animation primitives** (vanilla JS core + React 18 wrapper layer) for building
Awwwards-grade sites faster. Extracted and generalized from the techniques used in
the cookiekiller.online portfolio (React + Vite, no animation library — everything
below is hand-rolled the same way), plus a set of current (2025+) techniques —
native View Transitions, scroll-driven CSS animations, image-sequence scrubbing —
layered on top.

**Live showcase (all 58 effects, running, with copy-paste code):** the artifact
published alongside this repo.

**Demo app (deployable):** `index.html` + `vite.config.js` at the repo root turn the
same showcase into an ordinary Vite static site — `npm run build` produces `dist/`,
deployable anywhere that serves static files (Vercel, Netlify, GitHub Pages, ...).

```
npm install     # installs Vite (dev-only) — the library itself has 0 runtime deps
npm run dev     # showcase at localhost, real Vite dev server + HMR
npm run build   # -> dist/ — a static site, ready to deploy
npm run preview # serve the dist/ build locally to sanity-check it
```

### Deploying to Vercel

This is a plain static Vite project, so Vercel's zero-config detection handles it:

1. Push this repo to GitHub (or any git host Vercel can read).
2. In Vercel, **Add New → Project**, import the repo.
3. Framework preset: **Vite** (auto-detected from `vite.config.js` + the `build`
   script in `package.json`). Build command `vite build`, output directory `dist` —
   Vercel fills these in automatically; no changes needed.
4. Deploy. No environment variables, no serverless functions, no database — it's a
   static bundle.

(This is also why a plain zip of `src/` on its own never deployed anywhere: a
*library* has no entry point or build step by design — `index.html` + `vite.config.js`
are what turn it into a deployable *site*.)

## Why this exists

Every effect follows the same shape, so once you know one you know them all:

```js
import { initX } from '@cookiekiller/kinetic';
const destroy = initX(selectorOrElementsOrNodeList, { ...options });
// later, e.g. on route change / unmount:
destroy();
```

- **Framework-agnostic core.** Works in a plain `<script type="module">`, in Vite,
  in Next, anywhere. No dependency on React.
- **Thin React layer on top.** `@cookiekiller/kinetic/react` exposes the same
  effects as hooks (`useX(ref, opts)`) and a handful as drop-in components
  (`<SplitText>`, `<MagneticButton>`, `<BlobCursor>`, ...), all built on one generic
  `useKineticEffect` hook.
- **Shared infrastructure, not 58 independent listeners.** One `requestAnimationFrame`
  ticker (`core/raf.js`), one pooled `IntersectionObserver` keyed by
  threshold/rootMargin (`core/observer.js`), one shared pointer tracker
  (`core/pointer.js`) — every effect that needs a frame loop, a viewport check, or
  the cursor position taps into the same shared instance instead of adding its own.
- **`prefers-reduced-motion` respected everywhere.** Every effect checks it before
  attaching listeners or starting a loop; most simply no-op (content stays visible,
  just static) when the user has asked for reduced motion.
- **Deterministic generative visuals.** The seeded-art and noise effects use a
  `mulberry32` PRNG + string hashing, so the same seed always renders the same
  visual — no image assets, no external calls.
- **Current where it matters.** Page and block transitions go through the native
  View Transitions API first, with an automatic FLIP fallback where it's
  unsupported — not another hand-rolled overlay animation.
- **Zero runtime dependencies.** Everything — including the WebGL shader helpers and
  the simplex-noise implementation — is written from scratch in this repo.

## Install / import

```js
// vanilla — anywhere
import { initMagneticButton, initSplitText, initRippleDistort } from '@cookiekiller/kinetic';

// React — hooks
import { useMagnetic, useSplitText } from '@cookiekiller/kinetic/react';

// React — components
import { SplitText, MagneticButton, BlobCursor } from '@cookiekiller/kinetic/react';

// design tokens + keyframes + the CSS every effect module expects
import '@cookiekiller/kinetic/css/tokens.css';
import '@cookiekiller/kinetic/css/keyframes.css';
import '@cookiekiller/kinetic/css/utilities.css';
```

Each effect file's top comment documents the exact markup it expects and a runnable
usage snippet — read the file, or copy the snippet straight from the live showcase
(every card has a "copy code" button).

## What's in the box — 58 effects across 12 chapters

**Cursor & pointer (6)** — `customCursor`, `magnetic`, `magneticText`, `cursorTrail`, `spotlightHover`, `blobCursor` (gooey metaball trail)

**Text (8)** — `splitText`, `glitchText`, `scrambleText`, `marquee`, `counter`, `typewriter`, `textMaskScrollFill`, `kineticScrollType` (continuous scroll-scrubbed typography)

**Scroll (8)** — `scrollReveal`, `parallax`, `scrollProgress`, `smoothScroll`, `pinSection`, `horizontalScroll`, `scrollSnapSections`, `scrollTimelineReveal` (native `animation-timeline: view()`, with IO fallback)

**WebGL / Canvas flagships (7)** — `rippleDistort` (the flagship — real-time water-ripple image distortion following the pointer's path, with specular highlight), `gradientMesh`, `grainOverlay`, `imageDistortHover` (lightweight lens distortion), `generativeArt` (seeded, deterministic), `particleField`, `imageSequenceScrub` (Apple-style scroll-scrubbed frame sequence)

**Transitions (6)** — `pageTransition`, `imageRevealMask`, `curtainReveal`, `morphTransition` (FLIP-based), `viewTransitionPage` (native View Transitions for route changes), `viewTransitionBlock` (native View Transitions for local DOM updates, FLIP fallback)

**Loaders (3)** — `preloader`, `skeletonShimmer`, `scrollProgressBar`

**Cards / 3D (5)** — `tilt3d`, `hoverGlow`, `flipCard`, `magneticCard`, `stackedScrollCards` (sticky card-stack pile-up)

**Grid / layout (3)** — `staggerIn`, `gridMorph` (FLIP), `infiniteMarqueeGrid`

**Navigation (4)** — `magneticNav`, `menuMorph`, `stickyHeaderHide`, `gooeyIndicator` (liquid metaball nav indicator)

**Buttons / CTA (3)** — `magneticButton`, `rippleClick`, `borderDraw` (SVG stroke-dashoffset trace)

**Backgrounds (3)** — `auroraGradient`, `dotGrid`, `noiseBackground`

**Forms (2)** — `floatingLabel`, `customCheckbox`

## Project layout

```
kinetic/
├── package.json
├── vite.config.js               # minimal config — just builds index.html to dist/
├── index.html                   # the showcase page AND the Vite entry point (source of truth)
├── README.md
├── src/
│   ├── index.js                 # vanilla core barrel export
│   ├── core/                    # shared engine: raf, observer, pointer, math,
│   │                             #   easing, reducedMotion, webgl helpers, noise
│   ├── effects/<category>/*.js  # the 58 effects, one file each
│   ├── css/                     # tokens.css, keyframes.css, utilities.css
│   └── react/
│       ├── index.js             # React layer barrel export
│       ├── hooks/                # useX(ref, opts) wrappers
│       └── components/           # <X /> drop-in components
└── showcase/
    ├── main.js                  # showcase wiring (ES module, imported by index.html)
    ├── registry.js              # the 58-entry catalogue driving the showcase UI
    ├── showcase.final.html      # index.html + bundled core + registry, spliced into one
    │                             #   self-contained file — this is what's published as
    │                             #   the live artifact (no build step needed to view it)
    └── (scripts/build-showcase.py, at the repo root's scripts/, regenerates this)
```

## Building the single-file showcase yourself

`index.html` (real Vite entry, real ES module imports) is the source of truth for
the showcase's markup and CSS. `showcase/showcase.final.html` is a *generated*,
build-free, single-file copy of it — spliced together with a bundled build of the
library — used only for embedding/publishing the showcase somewhere a Vite build
step isn't available (e.g. as a Claude Artifact). To regenerate it after editing
`index.html`, `src/`, or `showcase/registry.js` / `showcase/main.js`:

```bash
npx esbuild@0.24.0 src/index.js --bundle --format=iife --global-name=Kinetic \
  --outfile=/tmp/kinetic-bundle.js
npx esbuild@0.24.0 /tmp/kinetic-bundle.js --minify --outfile=/tmp/kinetic-bundle.min.js
python3 scripts/build-showcase.py
```

## Notes

- No build step is required to *use* the library in a Vite project — import directly
  from `src/`, or point your bundler at it as a workspace package. A build step
  (`npm run build`) is only needed to deploy the *showcase/demo app* itself.
- WebGL effects (`rippleDistort`, `gradientMesh`, `imageDistortHover`,
  `particleField`, parts of `generativeArt`) fail soft: if `getContext('webgl')`
  returns `null`, `initX()` returns a no-op destroy function instead of throwing.
- `viewTransitionPage`/`viewTransitionBlock` feature-detect `document.startViewTransition`
  and fall back to an instant update (page) or FLIP (block) where it's unsupported —
  safe to call unconditionally.
- All effect modules and both barrel files pass `node --check` and bundle cleanly
  under esbuild (vanilla core as ESM, React layer with `--jsx=automatic`); the demo
  app builds cleanly with `vite build`.

---

v0.2.0 — built for cookiekiller® by Claude.
