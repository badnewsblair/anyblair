# Accessibility — anyblair.com

**Standard:** WCAG 2.1 Level AA
**Method:** Static code review of `src/index.html`, `src/style.css`, `src/script.js`,
plus programmatic contrast calculation. No automated tooling (axe/Lighthouse) or
live screen-reader/keyboard testing was run — see [Still to verify](#still-to-verify).
**Last reviewed:** 2026-05-23

## Summary

| # | Finding | WCAG | Severity | Status |
|---|---------|------|----------|--------|
| 1 | No visible keyboard focus indicator | 2.4.7 (AA) | High | Fixed |
| 2 | Low-contrast text on dark surfaces | 1.4.3 (AA) | High | Fixed |
| 3 | No `<main>` landmark; nav not a landmark | 1.3.1 (A) | Medium | Fixed |
| 4 | No "skip to content" link | 2.4.1 (A) | Medium | Fixed |
| 5 | Motion not reduced for `prefers-reduced-motion` | 2.3.3 / best practice | Medium | Fixed |
| 6 | Mobile menu: no focus move/trap/return | 2.4.3, 2.1.2, 4.1.2 | Medium | Fixed |
| 7 | Decorative SVG icons exposed to assistive tech | 1.1.1 (A) | Low | Fixed |
| 8 | Decorative case numerals announced + faint | 1.1.1 / 1.4.3 | Low | Fixed |
| 9 | Card sub-titles marked up as `<div>`, not headings | 1.3.1 (A) | Medium | Fixed |
| 10 | On-dark colors are `rgba()` literals, not tokens | maintainability | Low | Fixed |

---

## Fixed

**1. Visible focus indicators (2.4.7).** There were no focus styles anywhere, so
keyboard users had no reliable indication of position. Added a global
`:focus-visible` ring (2px `--color-interactive`, 2px offset) that themes with
light/dark, plus `:focus:not(:focus-visible)` to keep it off for mouse clicks.

**2. Contrast on dark surfaces (1.4.3).** Three text colors in the always-dark
Contact/footer band failed AA. Fixed by raising their white alpha:

| Element | Before | After |
|---------|--------|-------|
| `.footer-copy` | 1.90:1 ❌ | 5.25:1 ✓ |
| `.footer-name` | 2.72:1 ❌ | 6.91:1 ✓ |
| `#contact .section-label` | 3.83:1 ❌ | 5.25:1 ✓ |

All token-driven pairs (light and dark themes) were already verified AA — see
`tokens/SYNC.md` and the dark-mode contrast run (text-primary 16:1, body ~9:1,
secondary 6.1:1, accent 6.4:1).

**3. Landmarks (1.3.1, 2.4.1).** Wrapped the page content in `<main id="main-content">`
and changed the header's `.nav-inner` wrapper from a `<div>` to
`<nav aria-label="Primary">`.

**4. Skip link (2.4.1).** Added a visually-hidden-until-focused "Skip to content"
link as the first focusable element, targeting `#main-content`.

**5. Reduced motion (2.3.3).** Added a `prefers-reduced-motion: reduce` block that
shows `.reveal` content immediately (no fade/translate), disables smooth scroll,
and neutralises transitions/animations. This also removes the small risk of
reveal content being stuck invisible.

**6. Mobile menu focus (2.4.3 / 2.1.2 / 4.1.2).** The full-screen menu now moves
focus to its close button on open, traps Tab within the panel, and returns focus
to the toggle on close (Escape already closed it). The toggle exposes
`aria-expanded` + `aria-controls`, and the panel is `role="dialog"`
`aria-modal="true"` with a label.

**7. Decorative icons (1.1.1).** All 12 inline SVGs are presentational; added
`aria-hidden="true" focusable="false"` so they aren't announced or tabbed to.
The icon-only buttons (theme toggle, menu toggle) carry text `aria-label`s.

**8. Case numerals (1.1.1 / 1.4.3).** The faint "01 / 02" ordinals are decorative
(order is already conveyed by DOM order and the card titles). Marked
`aria-hidden="true"`, which both stops them being announced and exempts them from
the contrast requirement as pure decoration.

**9. Heading semantics (1.3.1).** Converted the visually-styled sub-titles from
`<div>` to real headings: `.exp-title`, `.p-title`, and `.tl-role` are now `<h3>`
(they sit under each section's `<h2>`), giving screen-reader users a proper
heading outline (h1 → h2 → h3, no skipped levels). Testimonial quotes became
`<blockquote>` — semantically correct for quoted content, and avoiding the
backwards "name-as-heading" that would precede nothing. Class-based styling is
unchanged.

**10. Tokenize on-dark colors.** Replaced all 19 `rgba(255,255,255,a)`
literals in the Contact/footer/profile-header/primary-card with a documented,
theme-agnostic `--color-on-dark-*` token set (text-strong/text/muted/faint/
decorative, plus surface/line/border roles). Ad-hoc alphas were snapped to a
consistent scale; every text role still meets AA on ink (text-muted 5.25:1 floor).
The three always-dark backgrounds remain `var(--ink)` by design.

---

## Recommended (not yet done)

Minor: the active-nav link is indicated by color alone (1.4.1) — consider adding
weight/underline; and the Cloudflare-obfuscated email link needs JS to resolve,
so a plain `mailto:` fallback would be more robust.

---

## Verified OK

- `lang="en"` set (3.1.1); descriptive page `<title>` (2.4.2).
- One `<h1>` per page; section titles are `<h2>`, case titles `<h3>` (2.4.6).
- Testimonial avatars have meaningful `alt` text (1.1.1).
- Interactive controls are native `<button>`/`<a>` (2.1.1); Escape closes the menu.
- Touch targets ≥ 36px, clearing the 24px AA minimum (2.5.8).

## Still to verify

This was a code review. Before relying on it, run a live pass once a browser is
connected: **axe DevTools** or **Lighthouse** for automated coverage, plus a
manual keyboard-only walkthrough and a screen-reader spot check (VoiceOver / NVDA),
especially the mobile menu dialog and the theme toggle announcements.
