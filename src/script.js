// Scroll reveal
const revealEls = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -32px 0px' });

  revealEls.forEach(el => io.observe(el));

  // Fallback: if nothing has revealed after 500ms, force all visible
  setTimeout(() => {
    revealEls.forEach(el => {
      if (!el.classList.contains('in')) {
        el.classList.add('in');
      }
    });
  }, 500);
} else {
  revealEls.forEach(el => el.classList.add('in'));
}

// Active nav
const sections = document.querySelectorAll('section[id]');
const links    = document.querySelectorAll('.nav-links a[href^="#"]');

const nio = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      links.forEach(l => l.style.color = '');
      const active = document.querySelector(`.nav-links a[href="#${e.target.id}"]`);
      if (active && !active.classList.contains('nav-cta')) {
        active.style.color = 'var(--color-text-primary)';
      }
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => nio.observe(s));

// Mobile nav
const navToggle  = document.getElementById('navToggle');
const mobileMenu = document.getElementById('mobileMenu');
const menuOverlay = document.getElementById('menuOverlay');
const menuClose = document.getElementById('menuClose');
const mobileLinks = document.querySelectorAll('.mobile-link');

let lastFocused = null;

function panelFocusables() {
  const panel = mobileMenu.querySelector('.mobile-menu-panel');
  return Array.from(
    panel.querySelectorAll('a[href], button:not([disabled])')
  ).filter(el => el.offsetParent !== null);
}

// Keep Tab focus inside the open menu (WCAG 2.4.3 / 2.1.2)
function trapTab(e) {
  if (e.key !== 'Tab') return;
  const f = panelFocusables();
  if (!f.length) return;
  const first = f[0];
  const last = f[f.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}

function openMenu() {
  lastFocused = document.activeElement;
  navToggle.classList.add('open');
  mobileMenu.classList.add('open');
  document.body.style.overflow = 'hidden';
  navToggle.setAttribute('aria-expanded', 'true');
  navToggle.setAttribute('aria-label', 'Close menu');
  document.addEventListener('keydown', trapTab);
  // Move focus into the menu so keyboard users land inside it
  const target = menuClose || panelFocusables()[0];
  if (target) target.focus();
}

function closeMenu() {
  navToggle.classList.remove('open');
  mobileMenu.classList.remove('open');
  document.body.style.overflow = '';
  navToggle.setAttribute('aria-expanded', 'false');
  navToggle.setAttribute('aria-label', 'Open menu');
  document.removeEventListener('keydown', trapTab);
  // Return focus to the control that opened the menu
  if (lastFocused) {
    lastFocused.focus();
    lastFocused = null;
  }
}

navToggle.addEventListener('click', () => {
  mobileMenu.classList.contains('open') ? closeMenu() : openMenu();
});

menuOverlay.addEventListener('click', closeMenu);
menuClose.addEventListener('click', closeMenu);

mobileLinks.forEach(link => {
  link.addEventListener('click', closeMenu);
});

// Close on escape key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeMenu();
});

// Theme toggle (light / dark) — remembers an explicit choice, otherwise follows the OS
const THEME_KEY = 'tredegar-theme';
const themeToggle = document.getElementById('themeToggle');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

function storedTheme() {
  try {
    const t = localStorage.getItem(THEME_KEY);
    return t === 'light' || t === 'dark' ? t : null;
  } catch (e) {
    return null;
  }
}

function effectiveTheme() {
  return storedTheme() || (prefersDark.matches ? 'dark' : 'light');
}

function syncToggleLabel() {
  if (!themeToggle) return;
  const isDark = effectiveTheme() === 'dark';
  themeToggle.setAttribute(
    'aria-label',
    isDark ? 'Switch to light theme' : 'Switch to dark theme'
  );
  themeToggle.setAttribute('aria-pressed', String(isDark));
}

if (themeToggle) {
  syncToggleLabel();

  themeToggle.addEventListener('click', () => {
    const next = effectiveTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch (e) {}
    syncToggleLabel();
  });

  // If the visitor hasn't made an explicit choice, follow live OS changes.
  prefersDark.addEventListener('change', () => {
    if (!storedTheme()) {
      document.documentElement.removeAttribute('data-theme');
      syncToggleLabel();
    }
  });
}
