/* ============================================
   STEIGER SLOVENSKO — interactions & animations
   ============================================ */

(function () {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Scroll reveal (fade + slide up) ---- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !prefersReduced) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---- Animated stat counters ---- */
  const counters = document.querySelectorAll('.stat__num[data-count]');
  function animateCounter(el) {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    const duration = 1800;
    const start = performance.now();
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      el.textContent = Math.round(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  if ('IntersectionObserver' in window && !prefersReduced) {
    const statObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          statObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach((c) => statObserver.observe(c));
  } else {
    counters.forEach((c) => { c.textContent = c.dataset.count + (c.dataset.suffix || ''); });
  }

  /* ---- Hero parallax ---- */
  const heroBg = document.querySelector('[data-parallax]');
  if (heroBg && !prefersReduced) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const y = window.scrollY;
          if (y < window.innerHeight) {
            heroBg.style.transform = 'translateY(' + (y * 0.35) + 'px)';
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  /* ---- Nav: hide on scroll down, show on scroll up ---- */
  const nav = document.getElementById('nav');
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const current = window.scrollY;
    if (current > lastScroll && current > 200) {
      nav.classList.add('nav--hidden');
    } else {
      nav.classList.remove('nav--hidden');
    }
    lastScroll = current;
  }, { passive: true });

  /* ---- Mobile burger menu ---- */
  const burger = document.querySelector('.nav__burger');
  const links = document.querySelector('.nav__links');
  if (burger && links) {
    function closeMenu() {
      links.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
    }
    burger.addEventListener('click', () => {
      const open = links.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', String(open));
    });
    // Close when a link is tapped
    links.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMenu));
    // Close on resize back to desktop
    window.addEventListener('resize', () => { if (window.innerWidth > 900) closeMenu(); });
  }
})();
