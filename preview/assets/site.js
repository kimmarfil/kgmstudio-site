// kgmstudio site: gentle reveal on scroll (content is visible without JS) and the copy-email button.
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduce && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('js');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.remove('pre'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.reveal').forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top > window.innerHeight) { el.classList.add('pre'); io.observe(el); }
    });
  }

  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy');
      var out = document.getElementById(btn.getAttribute('data-out'));
      function fallback() {
        var el = document.getElementById(btn.getAttribute('data-select'));
        if (el) { var r = document.createRange(); r.selectNodeContents(el); var s = getSelection(); s.removeAllRanges(); s.addRange(r); }
        if (out) out.textContent = 'Selected. Press Ctrl+C (or ⌘C) to copy.';
      }
      try { navigator.clipboard.writeText(text).then(function () { if (out) out.textContent = 'Copied to clipboard.'; }, fallback); }
      catch (e) { fallback(); }
    });
  });
})();
