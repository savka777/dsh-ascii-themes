# Agent notes — ASCII Themes plugin

A DeepSeek Harness **client plugin** that paints an animated ASCII wallpaper behind
the Web UI and adds a floating theme picker (bottom-right palette button).
This folder is the canonical source for that plugin; `dist/` is the installable
package and is committed so the repo can be cloned and installed without a build.

## Where it runs

The Harness desktop profile (`~/.dsh/profiles/desktop/package.json`) links to
`dist/` here:

```json
"dependencies": { "@local/dsh-ascii-themes": "link:/Users/<you>/Desktop/dsh-ascii-themes/dist" },
"dsh": { "profile": { "bundles": [..., "@local/dsh-ascii-themes"] } }
```

The app is an Electron desktop app; a client plugin is loaded by the page, not
started separately. After changing code: **rebuild and reload the browser page**.

## Commands

```sh
node scripts/build.mjs       # regenerate dist/ and preview.html; syntax-checks the bundle
node scripts/install.mjs     # link dist/ into the desktop profile and select the bundle
node scripts/install.mjs --remove
node scripts/verify-web-ui.mjs --selector "[data-dsh-ascii-themes]" --screenshot /tmp/themes.png
```

`build.mjs` needs no dependencies. `install.mjs` writes outside the repo
(profile manifest + symlink); if a sandbox blocks it, run with the wider
permission the environment offers. `verify-web-ui.mjs` derives an authenticated
browser cookie from `$DSH_HOME/.credentials.yaml` and drives headless Chromium.

## Adding or editing scenes

- Art and metadata live in `src/scenes.js` (`THEMES` array). Each scene is
  `draw(ctx, env)` with `env = { t, w, h, cell, dark }`.
- Paint glyphs with `setFont(ctx, px, align)` and `paintGlyphs(ctx, list, rgb,
  alpha)`; scale from `Math.min(w, h)` so the scene works both full-window and
  as a 96 px thumbnail.
- Dark/light tints: use the `dark` flag (or `ink(dark)` for light-mode dimming).
- Keep alphas low enough that UI text stays readable; the canvas is faded over
  the sidebar by a CSS mask in `src/client.template.js`.
- Add `{ id, title, accent, draw }` to `THEMES`, then `node scripts/build.mjs`,
  reload the page, and the card appears in the picker.
- Style (from the `ascii-art` skill): one fixed lattice of tall cells, two tones
  plus a rare accent that appears only on moving things, and every periodic term
  a whole number of cycles per scene loop so motion has no seam.
- Helpers: `noise2` (smooth value noise), `paintGlyphs` (batch one colour of
  glyphs), and `pixelBuffer` + `pack` for pixel-art scenes like `orrery`, which
  draw into a small `ImageData` buffer and scale it up without smoothing.

## Renderer contract (do not break)

`src/renderer.js` owns canvas sizing, `devicePixelRatio` caps, supersampling
(`scale`, `dpr` options for thumbnails), 10 fps pacing, theme lookup, dark-mode
observation, and `prefers-reduced-motion` static frames. Scenes must not manage
timers or listeners. `src/client.template.js` owns the overlay booking:
`shell.overlay` slot, `pointer-events: none` on the canvas, `auto` only on the
trigger/panel, `localStorage` key `dsh.ascii-themes.active`, Escape/outside-click
close, and the gallery thumbnails.

## Constraints

- One `shell.overlay` occupant only; keep it non-interactive except controls.
- No DOM reads of other plugins; styling uses `--dsw-*` tokens with fallbacks.
- `dist/` is generated — rebuild it when `src/` or `assets/` changes.
