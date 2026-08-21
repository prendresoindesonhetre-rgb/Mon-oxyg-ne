(function () {
  'use strict';

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function setResponsiveMetrics() {
    var iw = window.innerWidth || document.documentElement.clientWidth || 800;
    var ih = window.innerHeight || document.documentElement.clientHeight || 450;
    var longSide = Math.max(iw, ih);
    var shortSide = Math.min(iw, ih);
    var aspect = longSide / Math.max(1, shortSide);

    // Le panneau s'élargit progressivement lorsque l'écran devient plus carré.
    // Aucune catégorie téléphone/tablette : le calcul est continu.
    var squareBlend = clamp((1.82 - aspect) / 0.49, 0, 1);
    var panelFraction = 0.49 + (0.64 - 0.49) * squareBlend;
    var settingsFraction = 0.48 + (0.62 - 0.48) * squareBlend;

    var panelWidth = clamp(longSide * panelFraction, 300, 820);
    var settingsWidth = clamp(longSide * settingsFraction, 310, 820);
    var u = shortSide / 100;
    var lu = longSide / 100;
    var root = document.documentElement;

    root.style.setProperty('--ui-short', shortSide + 'px');
    root.style.setProperty('--ui-long', longSide + 'px');
    root.style.setProperty('--ui-u', u + 'px');
    root.style.setProperty('--ui-lu', lu + 'px');
    root.style.setProperty('--ui-panel-width', panelWidth + 'px');
    root.style.setProperty('--ui-settings-width', settingsWidth + 'px');
    root.style.setProperty('--ui-aspect', aspect.toFixed(4));

    var compact = shortSide < 390;
    var roomy = shortSide > 700;
    var classes = root.className.replace(/\bui-compact\b|\bui-roomy\b/g, '').replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, '');
    if (compact) classes += (classes ? ' ' : '') + 'ui-compact';
    if (roomy) classes += (classes ? ' ' : '') + 'ui-roomy';
    root.className = classes;
  }

  setResponsiveMetrics();
  window.addEventListener('resize', setResponsiveMetrics);
  window.addEventListener('orientationchange', function () {
    setTimeout(setResponsiveMetrics, 60);
    setTimeout(setResponsiveMetrics, 260);
  });
  window.addEventListener('pageshow', setResponsiveMetrics);
})();
