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
        active.style.color = 'var(--ink)';
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
