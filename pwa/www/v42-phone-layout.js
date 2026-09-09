(function () {
  'use strict';

  function phoneLandscape() {
    var w = window.innerWidth || document.documentElement.clientWidth || 0;
    var h = window.innerHeight || document.documentElement.clientHeight || 0;
    var longSide = Math.max(w, h);
    var shortSide = Math.min(w, h);
    var ratio = longSide / Math.max(1, shortSide);

    /* Les téléphones récents en paysage ont souvent 430–650 px sur le petit côté.
       L'ancien seuil <410 ne les reconnaissait donc pas. */
    return shortSide <= 650 && longSide <= 1400 && ratio >= 1.55;
  }

  function applyDeviceClass() {
    document.documentElement.classList.toggle('ui-phone-landscape', phoneLandscape());
  }

  applyDeviceClass();
  window.addEventListener('resize', applyDeviceClass);
  window.addEventListener('orientationchange', function () {
    setTimeout(applyDeviceClass, 60);
    setTimeout(applyDeviceClass, 260);
  });
  window.addEventListener('pageshow', applyDeviceClass);

  if (typeof renderSettings !== 'function' || typeof state === 'undefined') return;

  function tagSettingRows(panel) {
    var rows = panel.querySelectorAll('.setting-row');
    for (var i = 0; i < rows.length; i++) {
      var title = rows[i].querySelector('.setting-label strong');
      if (!title) continue;
      var text = (title.textContent || '').toLowerCase();
      if (text.indexOf('durée') !== -1) rows[i].classList.add('phone-duration');
      else if (text.indexOf('inspiration') !== -1) rows[i].classList.add('phone-inhale');
      else if (text.indexOf('expiration') !== -1) rows[i].classList.add('phone-exhale');
      else if (text.indexOf('commencer') !== -1) rows[i].classList.add('phone-start');
    }
  }

  function addTabs(panel) {
    if (panel.querySelector('.phone-mode-tabs')) return;
    var tabs = document.createElement('div');
    tabs.className = 'phone-mode-tabs';
    tabs.innerHTML =
      '<button class="phone-mode-tab" type="button" data-phone-mode="simple">Rythme simple</button>' +
      '<button class="phone-mode-tab" type="button" data-phone-mode="sequence">Enchaînements</button>';

    var sub = panel.querySelector('.settings-sub');
    if (sub && sub.nextSibling) sub.parentNode.insertBefore(tabs, sub.nextSibling);
    else panel.insertBefore(tabs, panel.firstChild);

    var buttons = tabs.querySelectorAll('[data-phone-mode]');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener('click', function () {
        var mode = this.getAttribute('data-phone-mode');
        if (mode === 'simple') state.sequenceMode = 'simple';
        else if (!state.sequenceMode || state.sequenceMode === 'simple') state.sequenceMode = 'calm';
        renderSettings();
      });
    }
  }

  function updateTabs(panel) {
    var simple = !state.sequenceMode || state.sequenceMode === 'simple';
    panel.classList.toggle('phone-simple', simple);
    panel.classList.toggle('phone-sequence', !simple);
    var tabs = panel.querySelectorAll('[data-phone-mode]');
    for (var i = 0; i < tabs.length; i++) {
      var active = (tabs[i].getAttribute('data-phone-mode') === 'simple') === simple;
      tabs[i].classList.toggle('active', active);
      tabs[i].setAttribute('aria-pressed', active ? 'true' : 'false');
    }
  }

  function applyPhoneSettings() {
    applyDeviceClass();
    var panel = document.querySelector('.settings-panel');
    if (!panel) return;

    if (!phoneLandscape()) {
      panel.classList.remove('phone-settings', 'phone-simple', 'phone-sequence');
      var tabs = panel.querySelector('.phone-mode-tabs');
      if (tabs) tabs.remove();
      return;
    }

    panel.classList.add('phone-settings');
    tagSettingRows(panel);
    addTabs(panel);
    updateTabs(panel);
    panel.scrollTop = 0;
  }

  var previousRenderSettings = renderSettings;
  renderSettings = function () {
    previousRenderSettings();
    applyPhoneSettings();
  };

  var timer = 0;
  function refresh() {
    clearTimeout(timer);
    timer = setTimeout(function () {
      applyDeviceClass();
      if (state.screen === 'settings') renderSettings();
    }, 100);
  }

  window.addEventListener('resize', refresh);
  window.addEventListener('orientationchange', refresh);

  if (state.screen === 'settings') renderSettings();
})();
