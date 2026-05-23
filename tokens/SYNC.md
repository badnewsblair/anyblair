# Tredegar Token Sync

The canonical source of truth is the JSON in this folder:

- `primitives.json` — raw values (colors, spacing, radius, layout, type). Theme-agnostic.
- `semantic.json` — named roles that reference primitives (`color.background.default → {white}`).

Everything else is **generated** from these two files. Never hand-edit generated outputs.

```
tokens/primitives.json  ──┐
tokens/semantic.json    ──┴─►  npm run tokens  ──►  src/tokens.css            (the website)
                                                └─►  tokens/tredegar.figma.tokens.json  (Figma import)
```

---

## Forward: code → everywhere (automated)

This is the normal path. Edit the JSON, run one command.

```bash
npm run tokens        # builds src/tokens.css AND the Figma import file
# or individually:
npm run tokens:css    # Style Dictionary → src/tokens.css
npm run tokens:figma  # merges sources → tokens/tredegar.figma.tokens.json
```

`npm run build` and `npm run serve` run `npm run tokens` first, so the site never
ships stale tokens.

### Pushing to Figma

`npm run tokens` regenerates `tredegar.figma.tokens.json`. To apply it to the Figma file:

1. Open the Tredegar Figma file.
2. Run a DTCG-compatible plugin — **Tokens Studio** or the free **Variables Import/Export**.
3. Import `tokens/tredegar.figma.tokens.json`. Primitive colors land as COLOR
   variables; dimensions as FLOAT (the `px` is stripped on import); semantic tokens
   import as aliases because their values use `{reference}` syntax.

(Or just ask Claude to push it — it can write the variables directly through the
Figma MCP.)

---

## Reverse: Figma → code (reconcile)

There is **no automatic pull** on a Pro plan — the programmatic Figma → repo sync
needs the Enterprise Variables REST API. So Figma edits are folded back into the
canonical JSON by hand (or by Claude). The repo stays canonical; Figma changes are
reconciled *into* it.

1. In Figma, run the **export** side of Tokens Studio / Variables Import-Export to
   dump the variables to DTCG JSON.
2. Lift the changed **values** out of that export and apply them to
   `primitives.json` / `semantic.json`. (The export won't match these files
   byte-for-byte — it loses the two-file split, the `$description` notes, the
   composite `border-default`, and the cubic-bezier easing — so copy values, don't
   blind-overwrite.)
3. `npm run tokens` to regenerate.

### The easy reverse path

Ask Claude: *"I changed X in Figma, sync it back."* Claude can **read** the Figma
variables through the MCP (reading isn't Enterprise-gated), diff them against these
files, write the update, and rebuild.

---

## Rule of thumb

Bidirectional does **not** mean edit both sides freely and hope they converge. Pick
one surface as your primary editor and treat the other as the mirror:

- **Code-first** (recommended): edit JSON, get git history + review, push to Figma.
- **Figma-first**: edit variables, reconcile back to JSON before each release.
- **Fully managed**: adopt **Tokens Studio Git sync** (paid) — it pushes/pulls token
  JSON straight to the repo and treats Figma as a generated view.

---

## Dark mode

Light is the default theme (the `:root` block in `tokens.css`). Dark is an
**override layer** — only the semantic roles that change are redefined; both
themes draw from the same primitives.

- **Source:** `tokens/semantic.dark.json` (the dark role mappings only).
- **Generated:** `src/tokens.dark.css`, which `npm run tokens` emits with the
  overrides under two selectors:
  - `[data-theme="dark"]` — an explicit choice (the nav toggle).
  - `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { … } }`
    — the OS default, which an explicit `data-theme="light"` can still override.

So the resolution order is: **explicit toggle → OS preference → light**.

**Activation.** An inline script in `<head>` applies the saved choice before
paint (no flash). The nav toggle writes `localStorage["tredegar-theme"]`
(`"light"` | `"dark"`); with nothing stored, the page follows the OS and tracks
live changes to it.

**Figma.** The `semantic` collection has **Light** and **Dark** modes mirroring
this exactly — switch any frame's mode to preview. Primitives are shared (single
mode); the five dark-only primitives (`gray-400/800/900`, `accent-300/900`) live
alongside the rest.

**To change the dark theme:** edit `tokens/semantic.dark.json`, run `npm run
tokens`. Never hand-edit `tokens.dark.css`.

## File map

| File | Role | Edited by |
|------|------|-----------|
| `tokens/primitives.json` | Canonical raw values | You (hand) |
| `tokens/semantic.json` | Canonical role mappings (light) | You (hand) |
| `tokens/semantic.dark.json` | Dark-theme role overrides | You (hand) |
| `tokens/tredegar.figma.tokens.json` | Figma import payload | Generated |
| `src/tokens.css` | Website custom properties (light `:root`) | Generated |
| `src/tokens.dark.css` | Dark-theme overrides | Generated |
| `sd.config.mjs` | Style Dictionary build | Rarely |
| `scripts/build-figma-tokens.js` | Figma export merge | Rarely |
