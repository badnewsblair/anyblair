# Tredegar Token Sync

Here's how the tokens move around. The JSON files in this folder are the source
of truth — everything else gets generated from them, so don't hand-edit any of
the generated outputs or you'll just lose your changes the next time the build
runs.

The two files that matter:

- `primitives.json` — raw values (colors, spacing, radius, layout, type).
  Theme-agnostic.
- `semantic.json` — named roles that point at the primitives
  (`color.background.default → {white}`).

```
tokens/primitives.json  ──┐
tokens/semantic.json    ──┴─►  npm run tokens  ──►  src/tokens.css            (the website)
                                                └─►  tokens/tredegar.figma.tokens.json  (Figma import)
```

---

## Forward: code → everywhere

This is the normal path. Edit the JSON, run one command.

```bash
npm run tokens        # builds src/tokens.css AND the Figma import file
# or individually:
npm run tokens:css    # Style Dictionary → src/tokens.css
npm run tokens:figma  # merges sources → tokens/tredegar.figma.tokens.json
```

`npm run build` and `npm run serve` both run `npm run tokens` first, so the site
can't accidentally ship stale tokens.

### Pushing to Figma

`npm run tokens` regenerates `tredegar.figma.tokens.json`. To get it into the
Figma file:

1. Open the Tredegar Figma file.
2. Run a DTCG-compatible plugin — I use **Tokens Studio** or the free
   **Variables Import/Export**.
3. Import `tokens/tredegar.figma.tokens.json`. Primitive colors come in as COLOR
   variables, dimensions land as FLOAT (the `px` gets stripped on import), and
   semantic tokens import as aliases because they use `{reference}` syntax.

---

## Reverse: Figma → code

There's **no automatic pull** on a Pro plan — the programmatic Figma → repo sync
needs the Enterprise Variables REST API. So when something changes in Figma, I
fold those edits back into the JSON by hand. The repo stays
canonical; Figma changes get reconciled *into* it, not the other way around.

1. In Figma, run the **export** side of Tokens Studio / Variables Import-Export
   to dump the variables to DTCG JSON.
2. Lift the changed **values** out of that export and apply them to
   `primitives.json` / `semantic.json`. Heads-up: the export won't match these
   files byte-for-byte — it loses the two-file split, the `$description` notes,
   the composite `border-default`, and the cubic-bezier easing — so copy values
   rather than blind-overwriting.
3. Run `npm run tokens` to regenerate everything.

---

## Rule of thumb

Bidirectional doesn't mean editing both sides freely and hoping they converge.
Pick one surface as the primary editor and treat the other as the mirror:

- **Code-first** (what I do): edit the JSON, get git history + review, push to
  Figma.
- **Figma-first**: edit variables, reconcile back to JSON before each release.
- **Fully managed**: adopt **Tokens Studio Git sync** (paid) — it pushes and
  pulls token JSON straight to the repo, and treats Figma as a generated view.

---

## Dark mode

Light is the default — that's the `:root` block in `tokens.css`. Dark sits on
top as an **override layer**: only the semantic roles that actually change get
redefined, and both themes draw from the same primitives.

- **Source:** `tokens/semantic.dark.json` (just the dark role mappings).
- **Generated:** `src/tokens.dark.css`, which `npm run tokens` emits with the
  overrides under two selectors:
  - `[data-theme="dark"]` — the explicit choice (the nav toggle).
  - `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { … } }`
    — the OS default, which an explicit `data-theme="light"` can still override.

So the resolution order is **explicit toggle → OS preference → light**.

**Activation.** An inline script in `<head>` applies the saved choice before
paint, so there's no flash on the way in. The nav toggle writes
`localStorage["tredegar-theme"]` (`"light"` | `"dark"`); with nothing stored,
the page follows the OS and tracks live changes to it.

**Figma.** The `semantic` collection has **Light** and **Dark** modes that
mirror this exactly — switch any frame's mode to preview either side. Primitives
are shared (single mode); the five dark-only primitives
(`gray-400/800/900`, `accent-300/900`) live alongside the rest.

**To change the dark theme:** edit `tokens/semantic.dark.json` and run
`npm run tokens`. Don't hand-edit `tokens.dark.css`.

## File map

| File | Role | Edited by |
|------|------|-----------|
| `tokens/primitives.json` | Canonical raw values | Me (hand) |
| `tokens/semantic.json` | Canonical role mappings (light) | Me (hand) |
| `tokens/semantic.dark.json` | Dark-theme role overrides | Me (hand) |
| `tokens/tredegar.figma.tokens.json` | Figma import payload | Generated |
| `src/tokens.css` | Website custom properties (light `:root`) | Generated |
| `src/tokens.dark.css` | Dark-theme overrides | Generated |
| `sd.config.mjs` | Style Dictionary build | Rarely |
| `scripts/build-figma-tokens.js` | Figma export merge | Rarely |
