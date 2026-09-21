(function () {
  'use strict';

  function updateViewportVars() {
    var vv = window.visualViewport;
    var w = vv && vv.width ? vv.width : (window.innerWidth || document.documentElement.clientWidth || 800);
    var h = vv && vv.height ? vv.height : (window.innerHeight || document.documentElement.clientHeight || 450);
    var root = document.documentElement;
    root.style.setProperty('--visible-width', Math.round(w) + 'px');
    root.style.setProperty('--visible-height', Math.round(h) + 'px');
    root.classList.toggle('physical-portrait', h > w);

    var app = document.getElementById('app');
    if (app) {
      app.style.position = 'relative';
      app.style.left = '0';
      app.style.top = '0';
      app.style.width = '100%';
      app.style.height = '100%';
      app.style.transform = 'none';
      app.style.transformOrigin = 'center center';
    }
  }

  updateViewportVars();
  window.addEventListener('load', updateViewportVars);
  window.addEventListener('resize', updateViewportVars);
  window.addEventListener('pageshow', updateViewportVars);
  window.addEventListener('orientationchange', function () {
    setTimeout(updateViewportVars, 40);
    setTimeout(updateViewportVars, 180);
    setTimeout(updateViewportVars, 420);
  });
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', updateViewportVars);
  }
})();