// kgmstudio site motion and small interactions. Everything is visible without JS; this only adds life.
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Header: transparent at the top, frosted once you scroll
  var nav = document.getElementById('nav');
  function onScroll() { if (nav) nav.classList.toggle('scrolled', window.scrollY > 12); }
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile menu
  var btn = document.getElementById('menuBtn'), menu = document.getElementById('mobileMenu');
  if (btn && menu) btn.addEventListener('click', function () {
    var open = menu.hidden; menu.hidden = !open; btn.setAttribute('aria-expanded', String(open));
    if (open) nav.classList.add('scrolled'); else onScroll();
  });

  // Twinkling stars in the hero
  var stars = document.querySelector('.stars');
  if (stars && !reduce) {
    for (var i = 0; i < 70; i++) {
      var s = document.createElement('i');
      s.style.left = (Math.random() * 100) + '%';
      s.style.top = (Math.random() * 70) + '%';
      s.style.animationDelay = (Math.random() * 4).toFixed(2) + 's';
      s.style.animationDuration = (3 + Math.random() * 4).toFixed(2) + 's';
      if (Math.random() > 0.8) { s.style.width = s.style.height = '3px'; }
      stars.appendChild(s);
    }
  }

  // Reveal on scroll (only for things below the fold, so the first screen is never hidden)
  if (!reduce && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('js');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.remove('pre'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.reveal, .tile, .work, .result, .step, .chapter').forEach(function (el, i) {
      if (el.getBoundingClientRect().top > window.innerHeight) {
        el.classList.add('reveal', 'pre');
        el.style.transitionDelay = ((i % 4) * 0.08) + 's';
        io.observe(el);
      }
    });

    // Count-up numbers
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        cio.unobserve(e.target);
        var el = e.target, raw = el.getAttribute('data-count'), target = parseFloat(raw.replace(/,/g, ''));
        var suffix = el.getAttribute('data-suffix') || '', start = performance.now(), dur = 1400;
        (function tick(now) {
          var t = Math.min(1, (now - start) / dur), v = Math.round(target * (1 - Math.pow(1 - t, 3)));
          el.textContent = v.toLocaleString('en-CA') + suffix;
          if (t < 1) requestAnimationFrame(tick);
        })(start);
      });
    }, { threshold: 0.6 });
    document.querySelectorAll('[data-count]').forEach(function (el) { cio.observe(el); });

    // Process line fills as you scroll past it
    var steps = document.querySelector('.steps');
    if (steps) {
      var fill = function () {
        var r = steps.getBoundingClientRect(), p = (window.innerHeight * 0.85 - r.top) / (r.height + window.innerHeight * 0.3);
        steps.style.setProperty('--progress', Math.max(0, Math.min(1, p)).toFixed(3));
      };
      fill(); window.addEventListener('scroll', fill, { passive: true });
    }
  }

  // Cursor glow on cards
  if (!reduce) document.addEventListener('pointermove', function (e) {
    var card = e.target.closest && e.target.closest('.tile, .result, .glass, .step');
    if (!card) return;
    var r = card.getBoundingClientRect();
    card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    card.style.setProperty('--my', (e.clientY - r.top) + 'px');
  });

  // Copy email
  document.querySelectorAll('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () {
      var text = b.getAttribute('data-copy'), out = document.getElementById(b.getAttribute('data-out'));
      function fallback() {
        var el = document.getElementById(b.getAttribute('data-select'));
        if (el) { var r = document.createRange(); r.selectNodeContents(el); var s = getSelection(); s.removeAllRanges(); s.addRange(r); }
        if (out) out.textContent = 'Selected. Press Ctrl+C (or ⌘C) to copy.';
      }
      try { navigator.clipboard.writeText(text).then(function () { if (out) out.textContent = 'Copied to clipboard.'; }, fallback); }
      catch (e) { fallback(); }
    });
  });
})();
