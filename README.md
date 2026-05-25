# anyblair.com

This is my portfolio site. It's built with [Eleventy](https://www.11ty.dev/) and
runs on **Tredegar**, a little design system I put together for myself. The tokens
in Tredegar are the one place I keep colors, spacing, and type — everything else
(the site's CSS and the Figma library) is generated from them, so nothing drifts.

## Getting it running

```bash
npm install
npm run serve     # builds the tokens, then starts Eleventy with live reload
```

Everything lives under `src/` as plain HTML, CSS, and JS. No framework, nothing
clever — just Eleventy passing files through with a token build step in front of it.

## Tokens

The design tokens live in `tokens/` as [W3C DTCG](https://tr.designtokens.org/)
JSON, and that's the source of truth. [Style Dictionary](https://styledictionary.com/)
turns them into CSS custom properties for me.

```bash
npm run tokens        # builds src/tokens.css + tokens.dark.css + the Figma import file
npm run tokens:css    # just the CSS
npm run tokens:figma  # just the Figma import file
```

Here's what's where:

- `tokens/primitives.json` — the raw values (color, spacing, radius, type).
- `tokens/semantic.json` — named roles that point at the primitives (light theme).
- `tokens/semantic.dark.json` — the dark-theme overrides.

One rule I keep for myself: don't hand-edit `src/tokens*.css`. Those are generated.
Edit the JSON and rebuild instead.

If you want the whole picture — how the build works, how I keep Figma in sync in
both directions, and how dark mode is layered on top — it's all in
**[`tokens/SYNC.md`](tokens/SYNC.md)**.

## Themes

Light is the default. Dark mode follows whatever the OS is set to, and you can also
flip it yourself in the nav — it remembers your choice. The whole thing runs off
tokens; the details are in the dark-mode section of `tokens/SYNC.md`.

## How it's laid out

```
tokens/        The canonical design tokens (DTCG JSON) + workflow docs
scripts/       Build helpers (the Figma token export)
sd.config.mjs  Style Dictionary config
src/           Eleventy input — HTML, JS, images, and the generated tokens*.css
_site/         Build output (gitignored)
```

## Building it

```bash
npm run build     # tokens + Eleventy → _site/
```
