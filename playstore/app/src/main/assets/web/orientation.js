(function () {
  'use strict';

  function viewportSize() {
    var vv = window.visualViewport;
    var w = vv && vv.width ? vv.width : (window.innerWidth || document.documentElement.clientWidth || 800);
    var h = vv && vv.height ? vv.height : (window.innerHeight || document.documentElement.clientHeight || 450);
    return { w: Math.max(1, Math.round(w)), h: Math.max(1, Math.round(h)) };
  }

  function applyLandscapeFit() {
    var app = document.getElementById('app');
    if (!app) return;

    var size = viewportSize();
    var portrait = size.h > size.w;
    var landscapeW = Math.max(size.w, size.h);
    var landscapeH = Math.min(size.w, size.h);
    var root = document.documentElement;

    root.style.setProperty('--visible-width', size.w + 'px');
    root.style.setProperty('--visible-height', size.h + 'px');
    root.style.setProperty('--landscape-width', landscapeW + 'px');
    root.style.setProperty('--landscape-height', landscapeH + 'px');

    if (portrait) {
      root.classList.add('physical-portrait');
      app.style.position = 'fixed';
      app.style.left = '50%';
      app.style.top = '50%';
      app.style.width = landscapeW + 'px';
      app.style.height = landscapeH + 'px';
      app.style.transform = 'translate(-50%, -50%) rotate(90deg)';
      app.style.transformOrigin = 'center center';
    } else {
      root.classList.remove('physical-portrait');
      app.style.position = 'relative';
      app.style.left = '0';
      app.style.top = '0';
      app.style.width = '100%';
      app.style.height = '100%';
      app.style.transform = 'none';
      app.style.transformOrigin = 'center center';
    }
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
    window.visualViewport.addEventListener('scroll', refresh);
  }
  document.addEventListener('pointerdown', tryNativeLandscapeLock, { once: true, passive: true });
})();
