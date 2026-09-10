import { defineConfig } from 'vite';

// Minimal Vite config for the Kinetic showcase demo-app. The library itself
// (src/) has no build step — this config exists only to serve/build the
// showcase in index.html as a deployable static site (e.g. on Vercel).
export default defineConfig({
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});
