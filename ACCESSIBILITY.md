# Accessibility log — anyblair.com

A running record of the accessibility work on this site, newest first. The bar is
WCAG 2.1 AA. Everything below has shipped to the source unless it's filed under
[Still open](#still-open).

Where things stand today: all ten findings from the first audit are fixed, and most
are now confirmed in a real browser. Two are verified by reading the code rather than
by clicking around — they're called out at the bottom, honestly, rather than waved
through.

---

## 2026-05-24 — A real pass in the browser

Connected Brave (scoped to `localhost:8080` only — no reason to give it more) and
actually drove the page instead of just reading the source. Good news: the things
that are easy to get wrong are right.

Tabbing from the very top, the **skip link** does its quiet trick — invisible until
you focus it, then it pops into the top-left corner with a clear ring, ready to jump
you past the nav. Every link and button shows a visible **focus ring** as you move
through them, and the order is exactly what you'd expect: skip link, brand, nav
links, theme toggle, then the hero buttons.

The **theme toggle** behaves. It flips light↔dark both ways, shows only the right
icon for the current theme (moon in light, sun in dark — the old double-icon bug is
genuinely gone), and your choice sticks across a reload with no flash of the wrong
theme on the way in.

The **accessibility tree** came back clean: `banner`, a named `navigation`, `main`,
and the menu `dialog` are all there, and the heading outline runs h1 → h2 → h3 with
nothing skipped — which means the earlier `<div>`-to-`<h3>` surgery actually took.
All four testimonial photos announce the person's name, and the decorative icons are
nowhere to be found in the tree, which is exactly where you want decoration to be.

While I was in there I also **named the landmarks**. The seven `<section>`s had been
showing up as anonymous "region, region, region…" — technically present, practically
useless in a screen-reader's landmark menu. Each now carries a short `aria-label`
(Introduction, Work, About, Expertise, Career, Testimonials, Contact) that matches
the nav, so the landmark list reads like a table of contents.

---

## 2026-05-24 — The case of the vanishing "Email Me" button

Caught a regression from the dark-mode work: the primary "Email Me" button in the
Contact band was invisible at rest and only appeared on hover. The culprit was a
token mismatch — I'd given it `--color-background-inverse`, which resolves to ink in
light mode, sitting under ink-colored text. Ink on ink. Oops.

The fix was to stop treating it like a theme-flipping element. The Contact band is
dark in *both* themes, so its button should just always be a light surface with dark
text — `var(--white)` background, `var(--ink)` text, hover to accent. It now reads at
17:1 at rest and 7:1 on hover, in both themes. Exactly the kind of thing a static
review can't catch and a real render can, which is what nudged me toward the live
pass above.

---

## 2026-05-23 — Going deeper: real headings, real tokens

Two things I'd flagged as "worth doing" rather than "broken," now done.

**Headings that are actually headings.** The expertise titles, principle titles, and
timeline roles all *looked* like headings but were coded as `<div>`s — so a
screen-reader user navigating by heading would sail right past them. Promoted them to
`<h3>` under their section's `<h2>`. Testimonial quotes became `<blockquote>`, which
is what they are; I deliberately left the attributions as plain text rather than
forcing a name to act as a heading that precedes nothing.

**No more magic numbers in the dark.** The Contact, footer, profile header, and
featured card were littered with 19 one-off `rgba(255,255,255,…)` values. Folded them
all into a documented `--color-on-dark-*` token set — text strong/default/muted/faint,
plus surface, line, and border roles — and snapped the ad-hoc alphas onto a consistent
scale. Every text role still clears AA on ink (the muted step is the 5.25:1 floor).
The genuinely always-dark backgrounds stay `var(--ink)` on purpose.

---

## 2026-05-23 — The first audit and the heavy lifting

The opening pass: a careful read of `index.html`, `style.css`, and `script.js`
against WCAG 2.1 AA, with the contrast math done by hand. Eight things needed fixing,
and they got fixed in the same sitting.

The big ones first. There were **no focus styles at all** — a keyboard user was flying
blind — so I added a themed `:focus-visible` ring everywhere (2.4.7). And three pieces
of text on the dark band were failing contrast outright (1.4.3); bumping their white
alpha brought them home:

| Element | Before | After |
|---------|--------|-------|
| `.footer-copy` | 1.90:1 ❌ | 5.25:1 ✓ |
| `.footer-name` | 2.72:1 ❌ | 6.91:1 ✓ |
| `#contact .section-label` | 3.83:1 ❌ | 5.25:1 ✓ |

The rest were about structure and intent. Wrapped the page in a `<main>` and made the
header a real `<nav>` (1.3.1), then added a **skip link** in front of it all (2.4.1).
Taught the site to respect **`prefers-reduced-motion`** — the scroll-reveal content
now appears instantly for anyone who'd rather not watch things slide in, which also
quietly removes any risk of content getting stuck invisible (2.3.3). Gave the
**mobile menu** real dialog manners: focus moves in on open, is trapped while it's
up, and returns to the toggle on close, with `aria-expanded`/`aria-controls` and a
labeled `role="dialog"` (2.4.3 / 2.1.2 / 4.1.2). Hid all 12 **decorative SVG icons**
from assistive tech (1.1.1), and marked the faint "01 / 02" **case numerals** as
decorative so they're neither announced nor held to a contrast they were never meant
to meet.

For reference, the findings and where they landed:

| # | Finding | WCAG | Severity | Status |
|---|---------|------|----------|--------|
| 1 | No visible keyboard focus indicator | 2.4.7 (AA) | High | Fixed |
| 2 | Low-contrast text on dark surfaces | 1.4.3 (AA) | High | Fixed |
| 3 | No `<main>` landmark; nav not a landmark | 1.3.1 (A) | Medium | Fixed |
| 4 | No "skip to content" link | 2.4.1 (A) | Medium | Fixed |
| 5 | Motion not reduced for `prefers-reduced-motion` | 2.3.3 | Medium | Fixed |
| 6 | Mobile menu: no focus move/trap/return | 2.4.3, 2.1.2, 4.1.2 | Medium | Fixed |
| 7 | Decorative SVG icons exposed to assistive tech | 1.1.1 (A) | Low | Fixed |
| 8 | Decorative case numerals announced + faint | 1.1.1 / 1.4.3 | Low | Fixed |
| 9 | Card sub-titles marked up as `<div>`, not headings | 1.3.1 (A) | Medium | Fixed |
| 10 | On-dark colors are `rgba()` literals, not tokens | maintainability | Low | Fixed |

---

## Still open

Nothing blocking, but worth doing:

- **An automated axe / Lighthouse scan.** Couldn't run it during the live pass —
  script injection is blocked under the locked-down extension permission. The
  hand-review of the accessibility tree covers the same structural ground, but a real
  axe run in DevTools is still worth five minutes.
- **The mobile menu focus trap, exercised live.** The markup and ARIA are confirmed
  in the served page, but the test environment refused to shrink the viewport below
  the 576px breakpoint, so the hamburger never appeared and I couldn't actually open
  the menu. The behavior is verified by reading the code — give it a real spin by
  narrowing your browser window.
- **A screen-reader spot check** (VoiceOver / NVDA), especially the menu dialog and
  the theme-toggle label as it changes.
- **Two small things** I'd file under polish: the active nav link is signalled by
  color alone (1.4.1) — a little weight or an underline would belt-and-suspenders it —
  and the Cloudflare-obfuscated email link needs JavaScript to resolve, so a plain
  `mailto:` fallback would be more robust.

## Already solid (no change needed)

- `lang="en"` is set, and the page has a descriptive `<title>` (3.1.1, 2.4.2).
- One `<h1>`, sensible heading levels under it (2.4.6).
- Testimonial photos have meaningful `alt` text (1.1.1).
- Controls are native `<button>`/`<a>`, and Escape closes the menu (2.1.1).
- Touch targets are ≥ 36px, comfortably past the 24px AA minimum (2.5.8).
