# anyblair.com

Blair Christopher's portfolio site, built with [Eleventy](https://www.11ty.dev/)
and powered by **Tredegar** — a small, living design system whose tokens are the single
source of truth for both the site's CSS and the Figma library.

## Develop

```bash
npm install
npm run serve     # build tokens, then run Eleventy with live reload
```

The site is plain HTML/CSS/JS under `src/`. There's no framework — just Eleventy
passing files through and a token build step.

## Tokens

Design tokens live in `tokens/` as [W3C DTCG](https://tr.designtokens.org/) JSON
and are the canonical source. [Style Dictionary](https://styledictionary.com/)
compiles them into CSS custom properties.

```bash
npm run tokens        # build src/tokens.css + tokens.dark.css + the Figma import file
npm run tokens:css    # just the CSS
npm run tokens:figma  # just the Figma import file
```

- `tokens/primitives.json` — raw values (color, spacing, radius, type).
- `tokens/semantic.json` — named roles that reference primitives (light theme).
- `tokens/semantic.dark.json` — dark-theme overrides.

Never hand-edit `src/tokens*.css` — they're generated. Edit the JSON and rebuild.

See **[`tokens/SYNC.md`](tokens/SYNC.md)** for the full workflow: how the build
works, how to keep Figma in sync (both directions), and how dark mode is layered.

## Themes

Light is the default. Dark mode follows the OS by default and can be toggled in
the nav (the choice is remembered). It's driven entirely by tokens — see the
dark-mode section of `tokens/SYNC.md`.

## Structure

```
tokens/        Canonical design tokens (DTCG JSON) + workflow docs
scripts/       Build helpers (Figma token export)
sd.config.mjs  Style Dictionary config
src/           Eleventy input — HTML, JS, images, and generated tokens*.css
_site/         Build output (gitignored)
```

## Build

```bash
npm run build     # tokens + Eleventy → _site/
```
