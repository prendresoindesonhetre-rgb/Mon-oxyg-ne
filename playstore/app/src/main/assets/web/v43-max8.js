(function () {
  if (typeof state === 'undefined' || typeof renderSettings !== 'function' || typeof startSession !== 'function') return;

  var previousRenderSettings = renderSettings;
  var previousStartSession = startSession;

  function clampBreathingTimes() {
    if (state.config) {
      state.config.inhaleSec = Math.max(2, Math.min(8, Number(state.config.inhaleSec) || 5));
      state.config.exhaleSec = Math.max(2, Math.min(8, Number(state.config.exhaleSec) || 5));
    }

    if (Array.isArray(state.customStages)) {
      for (var i = 0; i < state.customStages.length; i++) {
        state.customStages[i].inhaleSec = Math.max(2, Math.min(8, Number(state.customStages[i].inhaleSec) || 5));
        state.customStages[i].exhaleSec = Math.max(2, Math.min(8, Number(state.customStages[i].exhaleSec) || 5));
      }
    }
  }

  function currentValueForButton(button) {
    if (button.hasAttribute('data-step')) {
      var key = button.getAttribute('data-step');
      if (key === 'inhaleSec' || key === 'exhaleSec') return Number(state.config[key]);
    }

    if (button.hasAttribute('data-custom-step')) {
      var customKey = button.getAttribute('data-custom-step');
      if (customKey !== 'inhaleSec' && customKey !== 'exhaleSec') return null;
      var stageIndex = Number(button.getAttribute('data-stage'));
      if (!state.customStages || !state.customStages[stageIndex]) return null;
      return Number(state.customStages[stageIndex][customKey]);
    }

    return null;
  }

  function refreshMaxButtons() {
    var buttons = document.querySelectorAll(
      '[data-step="inhaleSec"][data-delta="1"], ' +
      '[data-step="exhaleSec"][data-delta="1"], ' +
      '[data-custom-step="inhaleSec"][data-delta="1"], ' +
      '[data-custom-step="exhaleSec"][data-delta="1"]'
    );

    for (var i = 0; i < buttons.length; i++) {
      var atMax = currentValueForButton(buttons[i]) >= 8;
      buttons[i].disabled = atMax;
      buttons[i].setAttribute('aria-disabled', atMax ? 'true' : 'false');
      buttons[i].style.opacity = atMax ? '0.35' : '';
    }
  }

  document.addEventListener('click', function (event) {
    var button = event.target && event.target.closest ? event.target.closest('button') : null;
    if (!button || button.getAttribute('data-delta') !== '1') return;

    var value = currentValueForButton(button);
    if (value !== null && value >= 8) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);

  renderSettings = function () {
    clampBreathingTimes();
    previousRenderSettings();
    refreshMaxButtons();
  };

  startSession = function () {
    clampBreathingTimes();
    previousStartSession();
  };

  clampBreathingTimes();
  if (state.screen === 'settings') renderSettings();
})();