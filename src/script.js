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

function openMenu() {
  navToggle.classList.add('open');
  mobileMenu.classList.add('open');
  document.body.style.overflow = 'hidden';
  navToggle.setAttribute('aria-label', 'Close menu');
}

function closeMenu() {
  navToggle.classList.remove('open');
  mobileMenu.classList.remove('open');
  document.body.style.overflow = '';
  navToggle.setAttribute('aria-label', 'Open menu');
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
