#!/usr/bin/env python3
"""
Kinetic — build-showcase.py
Splices index.html (the real Vite entry, source of truth for markup/CSS) +
the esbuild IIFE bundle of src/index.js + showcase/registry.js + showcase/main.js
into showcase/showcase.final.html — a single self-contained file with no
build step, suitable for the Artifact tool (no doctype/html/head/body tags;
just <title>, <style>, body content, then inline <script> tags).

Usage:
  npx esbuild@0.24.0 src/index.js --bundle --format=iife --global-name=Kinetic --outfile=/tmp/kinetic-bundle.js
  npx esbuild@0.24.0 /tmp/kinetic-bundle.js --minify --outfile=/tmp/kinetic-bundle.min.js
  python3 scripts/build-showcase.py
"""
import re
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
index_html = (ROOT / 'index.html').read_text()
registry_js = (ROOT / 'showcase' / 'registry.js').read_text()
main_js = (ROOT / 'showcase' / 'main.js').read_text()
bundle_js = pathlib.Path('/tmp/kinetic-bundle.min.js').read_text()

title = re.search(r'<title>(.*?)</title>', index_html, re.S).group(1)
style = re.search(r'<style>(.*?)</style>', index_html, re.S).group(1)
body = re.search(r'<body>(.*?)</body>', index_html, re.S).group(1)
# drop the Vite module-script tag; the single-file build inlines everything instead
body = re.sub(r'<script type="module" src="/showcase/main\.js"></script>\s*', '', body)

# registry.js: strip `export` keywords so it becomes plain top-level
# declarations, sharing lexical scope with the sibling <script> tags below
# (classic, non-module scripts on one page share one top-level scope).
registry_plain = registry_js.replace('export function genRotationFrames', 'function genRotationFrames')
registry_plain = registry_plain.replace('export const EFFECTS', 'const EFFECTS')

# main.js: strip the two import lines (their targets are already in scope —
# `Kinetic` as a global from the IIFE bundle, `EFFECTS`/`genRotationFrames`
# as plain top-level declarations from the transformed registry script
# above), alias K to the global, and wrap in an IIFE to keep its helper
# names off the page's global scope.
main_plain = main_js
main_plain = main_plain.replace("import * as K from '../src/index.js';\n", '')
main_plain = main_plain.replace("import { EFFECTS, genRotationFrames } from './registry.js';\n", '')
main_plain = "(function(){\n'use strict';\nvar K = Kinetic;\n" + main_plain + "\n})();\n"

out = []
out.append(f'<title>{title}</title>')
out.append(f'<style>{style}</style>')
out.append(body.strip())
out.append(f'<script>{bundle_js}</script>')
out.append(f'<script>{registry_plain}</script>')
out.append(f'<script>{main_plain}</script>')

final = '\n'.join(out) + '\n'
out_path = ROOT / 'showcase' / 'showcase.final.html'
out_path.write_text(final)
print(f'wrote {out_path} ({len(final)} bytes)')
