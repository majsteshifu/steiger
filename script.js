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

/* ============================================
   COOKIE CONSENT (GDPR / ePrivacy)
   - nevyhnutné cookies vždy; YouTube (marketing) len po súhlase
   ============================================ */
(function () {
  'use strict';
  var KEY = 'steiger_consent';

  function getConsent() {
    try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; }
  }
  function setConsent(media) {
    try { localStorage.setItem(KEY, JSON.stringify({ essential: true, media: !!media, ts: Date.now() })); } catch (e) {}
  }

  // Load consent-gated YouTube embeds
  function loadVideos() {
    document.querySelectorAll('.video-embed[data-yt]').forEach(function (el) {
      if (el.querySelector('iframe')) return;
      var id = el.getAttribute('data-yt');
      var list = el.getAttribute('data-yt-list');
      var title = el.getAttribute('data-yt-title') || 'Video';
      var src = 'https://www.youtube-nocookie.com/embed/' + id + (list ? ('?list=' + list) : '');
      var f = document.createElement('iframe');
      f.src = src; f.title = title; f.loading = 'lazy';
      f.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
      f.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
      f.setAttribute('allowfullscreen', '');
      el.innerHTML = '';
      el.appendChild(f);
    });
  }

  // Placeholder shown until media consent is given
  function showPlaceholders() {
    document.querySelectorAll('.video-embed[data-yt]').forEach(function (el) {
      if (el.querySelector('iframe') || el.querySelector('.video-embed__ph')) return;
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'video-embed__ph';
      btn.innerHTML = '<span>Prehrať video</span><small>Kliknutím súhlasíš s načítaním obsahu z YouTube (Google), ktorý môže používať cookies.</small>';
      btn.addEventListener('click', function () {
        setConsent(true);
        loadVideos();
        hideBanner();
      });
      el.appendChild(btn);
    });
  }

  // Banner
  var banner;
  function buildBanner() {
    banner = document.createElement('div');
    banner.className = 'cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Súhlas s cookies');
    banner.innerHTML =
      '<div class="cookie-banner__inner">' +
        '<div class="cookie-banner__text">' +
          '<strong>Rešpektujeme tvoje súkromie</strong>' +
          'Nevyhnutné cookies používame na fungovanie stránky. So súhlasom načítame aj vložený obsah z YouTube (Google). ' +
          'Viac v <a href="cookies.html">zásadách používania cookies</a>.' +
        '</div>' +
        '<div class="cookie-banner__actions">' +
          '<button type="button" class="btn btn--outline" data-cc="reject">Odmietnuť</button>' +
          '<button type="button" class="btn btn--red" data-cc="accept">Prijať všetko</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(banner);
    banner.querySelector('[data-cc="accept"]').addEventListener('click', function () {
      setConsent(true); loadVideos(); hideBanner();
    });
    banner.querySelector('[data-cc="reject"]').addEventListener('click', function () {
      setConsent(false); hideBanner();
    });
  }
  function showBanner() { if (!banner) buildBanner(); banner.classList.add('is-open'); }
  function hideBanner() { if (banner) banner.classList.remove('is-open'); }

  // Footer link to reopen settings
  function addFooterLink() {
    document.querySelectorAll('.footer__bottom').forEach(function (fb) {
      if (fb.querySelector('.footer__cookies')) return;
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'footer__cookies'; b.textContent = 'Nastavenia cookies';
      b.addEventListener('click', showBanner);
      fb.appendChild(b);
    });
  }

  // Expose for in-page "Nastavenia cookies" triggers (e.g. cookies.html)
  window.__ccOpen = showBanner;

  // Init
  var c = getConsent();
  if (c && c.media) { loadVideos(); } else { showPlaceholders(); }
  if (!c) { showBanner(); }
  addFooterLink();
})();

/* ============================================
   HERO VIDEO — načíta sa len na desktope
   (na mobile ostáva poster; šetrí dáta)
   ============================================ */
(function () {
  'use strict';
  var v = document.querySelector('[data-hero-video]');
  if (!v) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return; // ostane poster

  var desktop = window.matchMedia('(min-width: 901px)');

  function load() {
    if (v.src) return;                       // už načítané
    v.src = v.getAttribute('data-hero-video');
    v.preload = 'auto';
    v.play().catch(function () { /* autoplay zablokovaný -> ostane poster */ });
  }

  if (desktop.matches) load();
  // ak sa okno neskôr rozšíri na desktop, video doplníme (na mobile sa nikdy nestiahne)
  if (desktop.addEventListener) desktop.addEventListener('change', function (e) { if (e.matches) load(); });
  else if (desktop.addListener) desktop.addListener(function (e) { if (e.matches) load(); });
})();

/* ============================================
   TÍM — klik na člena zobrazí opis pod radom
   ============================================ */
(function () {
  'use strict';
  var team = document.getElementById('team');
  var panel = document.getElementById('team-bio');
  if (!team || !panel) return;

  var nameEl = panel.querySelector('.team-bio__name');
  var roleEl = panel.querySelector('.team-bio__role');
  var textEl = panel.querySelector('.team-bio__text');
  var closeBtn = panel.querySelector('.team-bio__close');
  var current = null;

  function close() {
    panel.hidden = true;
    if (current) current.setAttribute('aria-expanded', 'false');
    current = null;
  }

  function open(btn) {
    var bio = document.getElementById(btn.getAttribute('data-bio'));
    if (!bio) return;
    team.querySelectorAll('.member').forEach(function (m) { m.setAttribute('aria-expanded', 'false'); });
    btn.setAttribute('aria-expanded', 'true');
    nameEl.textContent = bio.getAttribute('data-name') || '';
    roleEl.textContent = bio.getAttribute('data-role') || '';
    textEl.textContent = bio.textContent.trim();
    panel.hidden = false;
    current = btn;
  }

  team.querySelectorAll('.member').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (current === btn) { close(); return; }   // druhý klik zavrie
      open(btn);
    });
  });

  closeBtn.addEventListener('click', close);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) close(); });
})();

/* Stripe placeholder — kým nie je brána, tlačidlo neposiela nikam */
(function () {
  var b = document.querySelector('[data-stripe-placeholder]');
  if (b) b.addEventListener('click', function (e) { e.preventDefault(); });
})();
