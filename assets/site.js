// kgmstudio site motion and small interactions. Everything is visible without JS; this only adds life.
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Header: transparent at the top, frosted once you scroll
  var nav = document.getElementById('nav');
  function onScroll() { if (nav) nav.classList.toggle('scrolled', window.scrollY > 12); }
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile menu: a full-screen panel that opens as a circle from the button, links rising in turn
  var btn = document.getElementById('menuBtn'), menu = document.getElementById('mobileMenu'), docEl = document.documentElement;
  if (btn && menu) {
    menu.hidden = false; menu.setAttribute('aria-hidden', 'true'); menu.inert = true;
    var setMenu = function (open) {
      docEl.classList.toggle('menu-open', open);
      btn.setAttribute('aria-expanded', String(open));
      btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      menu.setAttribute('aria-hidden', String(!open)); menu.inert = !open;
      if (open) { nav.classList.add('scrolled'); var first = menu.querySelector('a'); if (first) setTimeout(function () { first.focus({ preventScroll: true }); }, 350); }
      else onScroll();
    };
    btn.addEventListener('click', function () { setMenu(!docEl.classList.contains('menu-open')); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && docEl.classList.contains('menu-open')) { setMenu(false); btn.focus(); } });
    window.addEventListener('resize', function () { if (innerWidth > 860 && docEl.classList.contains('menu-open')) setMenu(false); });
  }

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

  // Quiet starfield behind every page (fixed, so it stays put while content scrolls)
  var sky = document.querySelector('.sky');
  if (sky) {
    var n = Math.round(Math.min(140, (innerWidth * innerHeight) / 11000));
    for (var j = 0; j < n; j++) {
      var st = document.createElement('i');
      st.style.left = (Math.random() * 100) + '%';
      st.style.top = (Math.random() * 100) + '%';
      if (Math.random() > 0.9) st.className = 'b';
      if (reduce) { st.style.animation = 'none'; st.style.opacity = '0.3'; }
      else { st.style.animationDelay = (Math.random() * 5).toFixed(2) + 's'; st.style.animationDuration = (3.5 + Math.random() * 5).toFixed(2) + 's'; }
      sky.appendChild(st);
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

  // Shooting star that follows the cursor (mouse and trackpad only)
  if (!reduce && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var cv = document.createElement('canvas'), cx = cv.getContext('2d'), dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.className = 'comet'; cv.setAttribute('aria-hidden', 'true'); document.body.appendChild(cv);
    var W = 0, H = 0, pts = [], sparks = [], mx = -100, my = -100, hx = -100, hy = -100, live = false, running = false;
    function size() { W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    size(); addEventListener('resize', size);
    addEventListener('pointermove', function (e) {
      if (e.pointerType && e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
      mx = e.clientX; my = e.clientY;
      if (!live) { hx = mx; hy = my; live = true; }
      if (!running) { running = true; requestAnimationFrame(frame); }
    }, { passive: true });
    document.addEventListener('mouseleave', function () { live = false; });
    var TAIL = 260; // ms of trail kept behind the head, same on any refresh rate
    // Colours: KGM ember by default; Ascea teal on the Ascea page. tail(t) = trail colour at freshness t (0..1).
    var teal = !!document.querySelector('main .ascea');
    var tail = teal
      ? function (t) { return 'rgba(' + Math.round(47 + 120 * t) + ',' + Math.round(214 + 34 * t) + ',' + Math.round(163 + 70 * t) + ','; }
      : function (t) { return 'rgba(255,' + Math.round(90 + 110 * t) + ',' + Math.round(31 + 100 * t) + ','; };
    var spark = teal ? 'rgba(140,245,214,' : 'rgba(255,154,92,';
    var head = teal ? ['rgba(236,255,250,0.95)', 'rgba(140,245,214,0.55)', 'rgba(47,214,163,0)'] : ['rgba(255,244,232,0.95)', 'rgba(255,154,92,0.55)', 'rgba(255,90,31,0)'];
    function frame(now) {
      // The head eases toward the cursor (time-corrected), leaving a tail of fading points
      var dt = Math.min(64, now - (frame.last || now)); frame.last = now;
      var k0 = 1 - Math.pow(0.65, dt / 16.7);
      hx += (mx - hx) * k0; hy += (my - hy) * k0;
      var sp = Math.hypot(mx - hx, my - hy);
      if (live && (!pts.length || Math.hypot(hx - pts[0].x, hy - pts[0].y) > 0.5)) {
        pts.unshift({ x: hx, y: hy, t: now });
        if (sp > 2 && Math.random() < 0.35) sparks.push({ x: hx, y: hy, vx: (Math.random() - .5) * .8, vy: (Math.random() - .5) * .8 + .3, life: 1 });
      }
      while (pts.length && now - pts[pts.length - 1].t > TAIL) pts.pop(); // old points fade out, so a resting cursor clears
      cx.clearRect(0, 0, W, H);
      cx.globalCompositeOperation = 'lighter';
      for (var i = pts.length - 1; i > 0; i--) {
        var t = Math.max(0, 1 - (now - pts[i].t) / TAIL);
        cx.strokeStyle = tail(t) + (t * 0.95).toFixed(3) + ')';
        cx.lineWidth = 0.8 + t * 4; cx.lineCap = 'round';
        cx.beginPath(); cx.moveTo(pts[i].x, pts[i].y); cx.lineTo(pts[i - 1].x, pts[i - 1].y); cx.stroke();
      }
      for (var k = sparks.length - 1; k >= 0; k--) {
        var s = sparks[k]; s.x += s.vx * dt / 16.7; s.y += s.vy * dt / 16.7; s.life -= 0.035 * dt / 16.7;
        if (s.life <= 0) { sparks.splice(k, 1); continue; }
        cx.fillStyle = spark + (s.life * 0.9).toFixed(3) + ')';
        cx.beginPath(); cx.arc(s.x, s.y, 1.1 * s.life + 0.3, 0, 6.283); cx.fill();
      }
      if (pts.length && now - pts[0].t < TAIL) {
        var g = cx.createRadialGradient(pts[0].x, pts[0].y, 0, pts[0].x, pts[0].y, 14);
        g.addColorStop(0, head[0]); g.addColorStop(0.25, head[1]); g.addColorStop(1, head[2]);
        cx.fillStyle = g; cx.beginPath(); cx.arc(pts[0].x, pts[0].y, 14, 0, 6.283); cx.fill();
      }
      cx.globalCompositeOperation = 'source-over';
      if (pts.length || sparks.length || Math.hypot(mx - hx, my - hy) > 0.5) requestAnimationFrame(frame); else { running = false; frame.last = 0; }
    }
  }

  // Contact form: sent through FormSubmit to hello@kgmstudio.ca, without leaving the page
  var form = document.getElementById('inquiry');
  if (form) form.addEventListener('submit', function (e) {
    e.preventDefault();
    var st = document.getElementById('inqStatus'), btn = form.querySelector('button[type=submit]'), bad = null;
    ['name', 'email', 'message'].forEach(function (n) {
      var el = form.elements[n], ok = el.value.trim() && (n !== 'email' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim()));
      el.setAttribute('aria-invalid', ok ? 'false' : 'true'); if (!ok && !bad) bad = el;
    });
    if (bad) { st.className = 'status err'; st.textContent = 'Please add your name, a valid email and a message.'; bad.focus(); return; }
    if (form.elements._honey.value) return; // bots fill the hidden field
    var data = {}; new FormData(form).forEach(function (v, k) { data[k] = v; });
    data._replyto = data.email;
    btn.disabled = true; st.className = 'status'; st.textContent = 'Sending…';
    fetch('https://formsubmit.co/ajax/hello@kgmstudio.ca', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(data) })
      .then(function (r) { return r.json().then(function (j) { if (!r.ok || String(j.success) !== 'true') throw j; }); })
      .then(function () { form.reset(); st.className = 'status ok'; st.textContent = 'Thanks, your message is on its way. We’ll reply by email soon.'; })
      .catch(function () { st.className = 'status err'; st.textContent = 'That didn’t send. Please email us at hello@kgmstudio.ca instead.'; })
      .then(function () { btn.disabled = false; });
  });

  // Tap a screenshot to see it large (on phones it can be scrolled sideways)
  var shots = document.querySelectorAll('.chapter .visual.real img, .hero-shot .browser img');
  if (shots.length) {
    var zb = document.createElement('div'); zb.className = 'zoom'; zb.hidden = true;
    zb.setAttribute('role', 'dialog'); zb.setAttribute('aria-modal', 'true'); zb.setAttribute('aria-label', 'Screenshot');
    zb.innerHTML = '<button class="close" type="button" aria-label="Close">×</button><img alt=""><p class="hint">Swipe sideways to see the whole screen</p>';
    document.body.appendChild(zb);
    var zi = zb.querySelector('img'), lastFocus = null;
    function closeZoom() { zb.hidden = true; document.body.style.overflow = ''; if (lastFocus) lastFocus.focus(); }
    shots.forEach(function (im) {
      im.setAttribute('tabindex', '0'); im.setAttribute('role', 'button');
      function open() { lastFocus = im; zi.src = im.currentSrc || im.src; zi.alt = im.alt; zb.hidden = false; document.body.style.overflow = 'hidden'; zb.scrollTop = 0; requestAnimationFrame(function () { zb.scrollLeft = (zb.scrollWidth - zb.clientWidth) / 2; }); if (!zi.complete) zi.onload = function () { zb.scrollLeft = (zb.scrollWidth - zb.clientWidth) / 2; }; zb.querySelector('.close').focus(); }
      im.addEventListener('click', open);
      im.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
    });
    zb.addEventListener('click', function (e) { if (e.target === zb || e.target.classList.contains('close') || e.target === zi && innerWidth > 860) closeZoom(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !zb.hidden) closeZoom(); });
  }

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
