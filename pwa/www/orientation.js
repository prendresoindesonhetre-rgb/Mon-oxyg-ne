(function () {
  'use strict';

  function viewportSize() {
    var vv = window.visualViewport;
    var w = vv && vv.width ? vv.width : (window.innerWidth || document.documentElement.clientWidth || 800);
    var h = vv && vv.height ? vv.height : (window.innerHeight || document.documentElement.clientHeight || 450);
    return { w: Math.max(1, Math.round(w)), h: Math.max(1, Math.round(h)) };
  }

  function ensureRotateHint() {
    var hint = document.getElementById('rotate-phone-hint');
    if (hint) return hint;
    hint = document.createElement('div');
    hint.id = 'rotate-phone-hint';
    hint.setAttribute('aria-live', 'polite');
    hint.innerHTML =
      '<div class="rotate-phone-card">' +
        '<div class="rotate-phone-icon" aria-hidden="true">' +
          '<svg viewBox="0 0 64 64"><rect x="23" y="12" width="18" height="36" rx="4"/><path d="M13 29c2-9 9-16 18-19"/><path d="M13 29l-3-7m3 7 7-2"/></svg>' +
        '</div>' +
        '<strong>Tourne ton téléphone</strong>' +
        '<span>Mon Oxygène s’utilise en mode paysage.</span>' +
      '</div>';
    document.body.appendChild(hint);
    return hint;
  }

  function applyLandscapeFit() {
    var app = document.getElementById('app');
    if (!app) return;

    var size = viewportSize();
    var portrait = size.h > size.w;
    var root = document.documentElement;
    var hint = ensureRotateHint();

    root.style.setProperty('--visible-width', size.w + 'px');
    root.style.setProperty('--visible-height', size.h + 'px');

    /* Important : on ne tourne plus artificiellement toute l'application.
       Dans un navigateur en portrait, on demande simplement de tourner le téléphone.
       En paysage, l'application utilise le viewport réel. */
    app.style.position = 'relative';
    app.style.left = '0';
    app.style.top = '0';
    app.style.width = '100%';
    app.style.height = '100%';
    app.style.transform = 'none';
    app.style.transformOrigin = 'center center';

    root.classList.toggle('physical-portrait', portrait);
    if (hint) hint.classList.toggle('show', portrait);
  }

  function tryNativeLandscapeLock() {
    try {
      var standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
      if (standalone && screen.orientation && typeof screen.orientation.lock === 'function') {
        var result = screen.orientation.lock('landscape');
        if (result && typeof result.catch === 'function') result.catch(function () {});
      }
    } catch (_) {}
  }

  function refresh() {
    applyLandscapeFit();
    tryNativeLandscapeLock();
  }

  refresh();
  window.addEventListener('load', refresh);
  window.addEventListener('resize', refresh);
  window.addEventListener('pageshow', refresh);
  window.addEventListener('orientationchange', function () {
    setTimeout(refresh, 40);
    setTimeout(refresh, 180);
    setTimeout(refresh, 420);
  });
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', refresh);
  }
  document.addEventListener('pointerdown', tryNativeLandscapeLock, { once: true, passive: true });
})();