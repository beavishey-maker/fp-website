/* ========================================
   渡辺加奈子 FP事務所 - Main JavaScript
   ======================================== */

'use strict';

/* --- Navigation --- */
const nav = document.querySelector('.nav');
const hamburger = document.querySelector('.nav__hamburger');
const mobileMenu = document.querySelector('.nav__mobile');

// Scroll: add .scrolled class
window.addEventListener('scroll', () => {
  if (window.scrollY > 40) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
}, { passive: true });

// Hamburger toggle
if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close menu on link click
  mobileMenu.querySelectorAll('.nav__mobile-link, .btn').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

// Initialize nav: always scrolled on inner pages, transparent on top page
(function initNav() {
  const isTopPage = document.body.dataset.page === 'top';
  if (!isTopPage) {
    nav.classList.add('scrolled');
  } else {
    if (window.scrollY > 40) nav.classList.add('scrolled');
  }
})();


/* --- Scroll Animation (IntersectionObserver) --- */
const animatedElements = document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right');

if (animatedElements.length > 0) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  animatedElements.forEach(el => observer.observe(el));
}


/* --- FAQ Accordion --- */
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
  const question = item.querySelector('.faq-item__question');
  if (!question) return;

  question.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');

    // Close all open items
    faqItems.forEach(other => {
      if (other !== item) {
        other.classList.remove('open');
      }
    });

    // Toggle current
    item.classList.toggle('open', !isOpen);
  });
});


/* --- Smooth scroll for anchor links --- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const href = anchor.getAttribute('href');
    if (href === '#') return;

    const target = document.querySelector(href);
    if (!target) return;

    e.preventDefault();
    const navHeight = nav ? nav.offsetHeight : 0;
    const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 16;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});


/* --- Contact Form --- */
const contactForm = document.querySelector('.contact-form form');

if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Visual feedback (送信機能は後から実装)
    const btn = contactForm.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.textContent = '送信しました（デモ）';
    btn.disabled = true;
    btn.style.background = '#6c8c6c';

    setTimeout(() => {
      btn.textContent = originalText;
      btn.disabled = false;
      btn.style.background = '';
    }, 3000);
  });
}


/* --- Add active class to current nav link --- */
(function setActiveNavLink() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__link, .footer__nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href && href === currentPath) {
      link.style.color = 'var(--color-accent)';
    }
  });
})();
