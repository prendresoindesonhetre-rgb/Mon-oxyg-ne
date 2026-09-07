(function () {
  'use strict';

  if (typeof renderSettings !== 'function' || typeof state === 'undefined') return;

  function isPhoneLayout() {
    var root = document.documentElement;
    return root.classList.contains('ui-compact') || root.classList.contains('ui-tiny') || Math.min(window.innerWidth || 9999, window.innerHeight || 9999) < 410;
  }

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

  function addPhoneTabs(panel) {
    if (panel.querySelector('.phone-mode-tabs')) return;

    var tabs = document.createElement('div');
    tabs.className = 'phone-mode-tabs';
    tabs.innerHTML =
      '<button class="phone-mode-tab" type="button" data-phone-mode="simple">Rythme simple</button>' +
      '<button class="phone-mode-tab" type="button" data-phone-mode="sequence">Enchaînements</button>';

    var sub = panel.querySelector('.settings-sub');
    if (sub && sub.nextSibling) sub.parentNode.insertBefore(tabs, sub.nextSibling);
    else if (sub) sub.parentNode.appendChild(tabs);
    else panel.insertBefore(tabs, panel.firstChild);

    var buttons = tabs.querySelectorAll('[data-phone-mode]');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener('click', function () {
        var mode = this.getAttribute('data-phone-mode');
        if (mode === 'simple') {
          state.sequenceMode = 'simple';
        } else if (!state.sequenceMode || state.sequenceMode === 'simple') {
          state.sequenceMode = 'calm';
        }
        renderSettings();
      });
    }
  }

  function updatePhoneTabs(panel) {
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

  function applyPhoneSettingsLayout() {
    var panel = document.querySelector('.settings-panel');
    if (!panel) return;

    if (!isPhoneLayout()) {
      panel.classList.remove('phone-settings', 'phone-simple', 'phone-sequence');
      var oldTabs = panel.querySelector('.phone-mode-tabs');
      if (oldTabs) oldTabs.parentNode.removeChild(oldTabs);
      return;
    }

    panel.classList.add('phone-settings');
    tagSettingRows(panel);
    addPhoneTabs(panel);
    updatePhoneTabs(panel);

    /* Remonte toujours en haut après un changement de vue. Cela évite de
       réafficher un menu au milieu de son ancienne position de défilement. */
    panel.scrollTop = 0;
  }

  var baseRenderSettings = renderSettings;
  renderSettings = function () {
    baseRenderSettings();
    applyPhoneSettingsLayout();
  };

  var resizeTimer = 0;
  function refreshIfSettings() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      if (state.screen === 'settings') renderSettings();
    }, 90);
  }

  window.addEventListener('resize', refreshIfSettings);
  window.addEventListener('orientationchange', function () {
    setTimeout(refreshIfSettings, 120);
    setTimeout(refreshIfSettings, 320);
  });

  if (state.screen === 'settings') renderSettings();
})();
