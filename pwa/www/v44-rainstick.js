(function () {
  'use strict';
  if (typeof state === 'undefined' || typeof renderSettings !== 'function' || typeof tickSession !== 'function') return;

  var STORE_ENABLED = 'mon-oxygene-rainstick-enabled';
  var STORE_VOLUME = 'mon-oxygene-rainstick-volume';
  var audioCache = {};
  var activeAudio = null;
  var activeKey = null;
  var pendingToken = 0;
  // v51 : fichiers personnels bruts, fondu croisé continu sans creux.
  // Le passage inspiration/expiration se fait maintenant en chevauchement,
  // afin qu'il n'y ait ni coupure ni "swap" audible.
  var CROSSFADE_MS = 1500;
  var audioFadeTimers = new WeakMap();

  function cancelFade(audio) {
    if (!audio) return;
    var timer = audioFadeTimers.get(audio);
    if (timer) {
      clearInterval(timer);
      audioFadeTimers.delete(audio);
    }
  }

  function fadeVolume(audio, from, to, durationMs, done) {
    if (!audio) return;
    cancelFade(audio);
    var started = Date.now();
    audio.volume = clamp(from, 0, 1);
    var timer = setInterval(function () {
      var t = Math.min(1, (Date.now() - started) / Math.max(1, durationMs));
      var eased = t * t * (3 - 2 * t);
      audio.volume = clamp(from + (to - from) * eased, 0, 1);
      if (t >= 1) {
        cancelFade(audio);
        if (done) done();
      }
    }, 20);
    audioFadeTimers.set(audio, timer);
  }

  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
  function loadBool() {
    try { return localStorage.getItem(STORE_ENABLED) !== '0'; } catch (_) { return true; }
  }
  function loadVolume() {
    try {
      var v = Number(localStorage.getItem(STORE_VOLUME));
      return Number.isFinite(v) && v >= 0 ? clamp(v, 0, 1) : 0.55;
    } catch (_) { return 0.55; }
  }

  state.rainstickEnabled = typeof state.rainstickEnabled === 'boolean' ? state.rainstickEnabled : loadBool();
  state.rainstickVolume = typeof state.rainstickVolume === 'number' ? clamp(state.rainstickVolume, 0, 1) : loadVolume();

  function saveAudioPrefs() {
    try {
      localStorage.setItem(STORE_ENABLED, state.rainstickEnabled ? '1' : '0');
      localStorage.setItem(STORE_VOLUME, String(state.rainstickVolume));
    } catch (_) {}
  }

  function clampBreathingTimes() {
    if (state.config) {
      state.config.inhaleSec = clamp(Number(state.config.inhaleSec) || 5, 2, 8);
      state.config.exhaleSec = clamp(Number(state.config.exhaleSec) || 5, 2, 8);
    }
    if (Array.isArray(state.customStages)) {
      for (var i = 0; i < state.customStages.length; i++) {
        state.customStages[i].inhaleSec = clamp(Number(state.customStages[i].inhaleSec) || 5, 2, 8);
        state.customStages[i].exhaleSec = clamp(Number(state.customStages[i].exhaleSec) || 5, 2, 8);
      }
    }
  }

  function getStepValue(button) {
    if (!button) return null;
    if (button.hasAttribute('data-step')) {
      var key = button.getAttribute('data-step');
      if (key === 'inhaleSec' || key === 'exhaleSec') return Number(state.config[key]);
    }
    if (button.hasAttribute('data-custom-step')) {
      var customKey = button.getAttribute('data-custom-step');
      if (customKey !== 'inhaleSec' && customKey !== 'exhaleSec') return null;
      var idx = Number(button.getAttribute('data-stage'));
      if (!state.customStages || !state.customStages[idx]) return null;
      return Number(state.customStages[idx][customKey]);
    }
    return null;
  }

  document.addEventListener('click', function (event) {
    var button = event.target && event.target.closest ? event.target.closest('button') : null;
    if (!button || button.getAttribute('data-delta') !== '1') return;
    var value = getStepValue(button);
    if (value !== null && value >= 8) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);

  function disableMaxButtons() {
    var buttons = document.querySelectorAll(
      '[data-step="inhaleSec"][data-delta="1"], [data-step="exhaleSec"][data-delta="1"], ' +
      '[data-custom-step="inhaleSec"][data-delta="1"], [data-custom-step="exhaleSec"][data-delta="1"]'
    );
    for (var i = 0; i < buttons.length; i++) {
      var atMax = getStepValue(buttons[i]) >= 8;
      buttons[i].disabled = atMax;
      buttons[i].setAttribute('aria-disabled', atMax ? 'true' : 'false');
      buttons[i].style.opacity = atMax ? '0.35' : '';
    }
  }

  // v56 : même beau bâton de pluie, plus chaud et avec une transition moins nette.
  // Inspiration et expiration restent bien distinctes, mais se raccordent doucement.
  var RAINSTICK_FILE = './assets/rainstick/ambient-rainstick.mp3';
  var TRANSITION_MS = 420;
  var PLAYBACK_RATE = 0.92;
  var UP_BASE_OFFSET = 0.65;
  var DOWN_BASE_OFFSET = 6.00;
  var phaseEndTimer = null;

  function ensureAudio(kind) {
    if (!audioCache[kind]) {
      var audio = new Audio(RAINSTICK_FILE);
      audio.preload = 'auto';
      audio.volume = 0;
      try {
        audio.playbackRate = PLAYBACK_RATE;
        audio.preservesPitch = false;
        audio.mozPreservesPitch = false;
        audio.webkitPreservesPitch = false;
      } catch (_) {}
      audioCache[kind] = audio;
      try { audio.load(); } catch (_) {}
    }
    return audioCache[kind];
  }

  function preloadUsefulAudio() {
    if (!state.rainstickEnabled) return;
    ensureAudio('up');
    ensureAudio('down');
  }

  function clearPhaseEndTimer() {
    if (phaseEndTimer) {
      clearTimeout(phaseEndTimer);
      phaseEndTimer = null;
    }
  }

  function stopCurrent(clearKey) {
    pendingToken++;
    clearPhaseEndTimer();
    if (activeAudio) {
      cancelFade(activeAudio);
      try { activeAudio.pause(); } catch (_) {}
      activeAudio = null;
    }
    if (clearKey !== false) activeKey = null;
  }

  function playPhase(kind, seconds, offset, key) {
    var previousAudio = activeAudio;

    clearPhaseEndTimer();
    activeKey = key;
    var token = ++pendingToken;
    var audio = ensureAudio(kind);
    activeAudio = audio;

    cancelFade(audio);
    try { audio.pause(); } catch (_) {}

    function begin() {
      if (token !== pendingToken || activeKey !== key || !state.rainstickEnabled) return;

      var baseOffset = kind === 'up' ? UP_BASE_OFFSET : DOWN_BASE_OFFSET;
      var phaseOffset = clamp(Number(offset) || 0, 0, seconds);
      try { audio.currentTime = baseOffset + phaseOffset * PLAYBACK_RATE; } catch (_) {}

      var targetVolume = clamp(state.rainstickVolume, 0, 0.52);
      var lowVolume = targetVolume * 0.14;
      var remainingMs = Math.max(0, (seconds - phaseOffset) * 1000);

      // Le nouveau mouvement démarre exactement au changement de respiration.
      audio.volume = kind === 'up' ? lowVolume : targetVolume;

      var p;
      try { p = audio.play(); } catch (_) { return; }
      if (p && typeof p.catch === 'function') p.catch(function () {});

      // L'ancien mouvement ne s'arrête plus net : il disparaît sur 420 ms
      // pendant que le nouveau commence.
      if (previousAudio && previousAudio !== audio) {
        var previousVolume = clamp(previousAudio.volume, 0, 1);
        fadeVolume(previousAudio, previousVolume, 0, TRANSITION_MS, function () {
          try { previousAudio.pause(); } catch (_) {}
        });
      }

      // Le son continue de "respirer" sur toute la durée réellement choisie.
      var envelopeMs = Math.max(120, remainingMs);
      if (kind === 'up') {
        fadeVolume(audio, lowVolume, targetVolume, envelopeMs);
      } else {
        fadeVolume(audio, targetVolume, lowVolume, envelopeMs);
      }
    }

    if (audio.readyState >= 1) begin();
    else {
      audio.addEventListener('loadedmetadata', begin, { once: true });
      try { audio.load(); } catch (_) {}
    }
  }

  function phaseAt(now) {
    var s = state.session;
    if (!s || state.screen !== 'session') return null;

    var elapsed = typeof elapsedSeconds === 'function'
      ? elapsedSeconds(now)
      : Math.max(0, (now - s.startedAt - (s.pausedTotal || 0)) / 1000);

    var plan = Array.isArray(s.plan) && s.plan.length ? s.plan : [{
      inhaleSec: state.config.inhaleSec,
      exhaleSec: state.config.exhaleSec,
      startSec: 0,
      endSec: Number(state.config.durationMin || 5) * 60
    }];

    var item = plan[plan.length - 1];
    var planIndex = plan.length - 1;
    for (var i = 0; i < plan.length; i++) {
      if (elapsed < plan[i].endSec) {
        item = plan[i];
        planIndex = i;
        break;
      }
    }
    if (elapsed >= item.endSec && planIndex === plan.length - 1) return null;

    var inhale = clamp(Math.round(Number(item.inhaleSec) || 5), 2, 8);
    var exhale = clamp(Math.round(Number(item.exhaleSec) || 5), 2, 8);
    var local = Math.max(0, elapsed - Number(item.startSec || 0));
    var cycle = inhale + exhale;
    var cycleNo = Math.floor(local / cycle);
    var m = local - cycleNo * cycle;
    var firstInhale = !!state.config.startWithInhale;
    var isInhale, phaseElapsed, duration, half;

    if (firstInhale) {
      isInhale = m < inhale;
      if (isInhale) {
        phaseElapsed = m;
        duration = inhale;
        half = 0;
      } else {
        phaseElapsed = m - inhale;
        duration = exhale;
        half = 1;
      }
    } else {
      isInhale = !(m < exhale);
      if (!isInhale) {
        phaseElapsed = m;
        duration = exhale;
        half = 0;
      } else {
        phaseElapsed = m - exhale;
        duration = inhale;
        half = 1;
      }
    }

    return {
      key: planIndex + ':' + cycleNo + ':' + half + ':' + (isInhale ? 'up' : 'down'),
      kind: isInhale ? 'up' : 'down',
      duration: duration,
      offset: phaseElapsed
    };
  }

  function syncRainstick(now) {
    if (!state.rainstickEnabled || !state.session || state.screen !== 'session') {
      stopCurrent();
      return;
    }
    if (state.session.paused) {
      stopCurrent(false);
      return;
    }
    var phase = phaseAt(now);
    if (!phase) {
      stopCurrent();
      return;
    }
    if (phase.key !== activeKey) {
      playPhase(phase.kind, phase.duration, phase.offset, phase.key);
    }
  }

  function ensureStyles() {
    if (document.getElementById('rainstickStyles')) return;
    var style = document.createElement('style');
    style.id = 'rainstickStyles';
    style.textContent =
      '.rainstick-row{border-top:1px solid rgba(65,151,175,.10)}' +
      '.rainstick-controls{display:flex;align-items:center;gap:9px;min-width:210px;justify-content:flex-end}' +
      '.rainstick-toggle{border:1px solid rgba(65,151,175,.22);background:rgba(255,255,255,.74);color:#35566a;border-radius:999px;padding:7px 12px;font-size:11px;font-weight:700;white-space:nowrap}' +
      '.rainstick-toggle.active{color:#fff;border-color:transparent;background:linear-gradient(90deg,#65bfd0,#9080dc)}' +
      '.rainstick-volume{width:90px;accent-color:#65aebf}' +
      '.rainstick-volume-label{min-width:34px;text-align:right;font-size:10px;font-weight:700;color:#476577}' +
      '.rainstick-controls.off .rainstick-volume,.rainstick-controls.off .rainstick-volume-label{opacity:.34}' +
      '.ui-compact .rainstick-controls,.ui-tiny .rainstick-controls{min-width:180px;gap:6px}' +
      '.ui-compact .rainstick-volume,.ui-tiny .rainstick-volume{width:70px}' +
      '.ui-tiny .rainstick-volume-label{display:none}';
    document.head.appendChild(style);
  }

  function injectControls() {
    var panel = document.querySelector('.settings-panel');
    if (!panel || panel.querySelector('.rainstick-row')) return;
    ensureStyles();

    var row = document.createElement('div');
    row.className = 'setting-row rainstick-row';
    row.innerHTML =
      '<div class="setting-label"><strong>Bâton de pluie</strong><span>Le son monte avec l’inspiration et redescend avec l’expiration.</span></div>' +
      '<div class="rainstick-controls ' + (state.rainstickEnabled ? '' : 'off') + '">' +
        '<button type="button" class="rainstick-toggle ' + (state.rainstickEnabled ? 'active' : '') + '" id="rainstickToggle">' + (state.rainstickEnabled ? 'Activé' : 'Sans son') + '</button>' +
        '<input class="rainstick-volume" id="rainstickVolume" type="range" min="0" max="100" step="1" value="' + Math.round(state.rainstickVolume * 100) + '" aria-label="Volume du bâton de pluie">' +
        '<span class="rainstick-volume-label" id="rainstickVolumeLabel">' + Math.round(state.rainstickVolume * 100) + '%</span>' +
      '</div>';

    var rows = panel.querySelectorAll('.setting-row');
    var anchor = null;
    for (var i = 0; i < rows.length; i++) {
      var title = rows[i].querySelector('.setting-label strong');
      if (title && (title.textContent || '').toLowerCase().indexOf('commencer') !== -1) { anchor = rows[i]; break; }
    }
    if (anchor && anchor.nextSibling) anchor.parentNode.insertBefore(row, anchor.nextSibling);
    else if (anchor) anchor.parentNode.appendChild(row);
    else {
      var presetTitle = panel.querySelector('.preset-title');
      if (presetTitle) panel.insertBefore(row, presetTitle);
      else panel.appendChild(row);
    }

    var toggle = row.querySelector('#rainstickToggle');
    var volume = row.querySelector('#rainstickVolume');
    var label = row.querySelector('#rainstickVolumeLabel');
    var controls = row.querySelector('.rainstick-controls');

    toggle.addEventListener('click', function () {
      state.rainstickEnabled = !state.rainstickEnabled;
      saveAudioPrefs();
      toggle.classList.toggle('active', state.rainstickEnabled);
      toggle.textContent = state.rainstickEnabled ? 'Activé' : 'Sans son';
      controls.classList.toggle('off', !state.rainstickEnabled);
      if (state.rainstickEnabled) {
        preloadUsefulAudio();
        if (state.session && state.screen === 'session' && !state.session.paused) {
          activeKey = null;
          syncRainstick(performance.now());
        }
      } else {
        stopCurrent();
      }
    });

    volume.addEventListener('input', function () {
      state.rainstickVolume = clamp(Number(volume.value) / 100, 0, 1);
      label.textContent = Math.round(state.rainstickVolume * 100) + '%';
      saveAudioPrefs();
      if (activeAudio && !activeAudio.paused) {
        fadeVolume(activeAudio, clamp(activeAudio.volume, 0, 1), clamp(state.rainstickVolume, 0, 0.52), 180);
      }
    });
  }

  var previousRenderSettings = renderSettings;
  renderSettings = function () {
    clampBreathingTimes();
    previousRenderSettings();
    disableMaxButtons();
    injectControls();
    preloadUsefulAudio();
  };

  var previousStartSession = startSession;
  startSession = function () {
    clampBreathingTimes();
    preloadUsefulAudio();
    previousStartSession();
  };

  var previousTickSession = tickSession;
  tickSession = function (now) {
    syncRainstick(now);
    previousTickSession(now);
  };

  if (typeof togglePause === 'function') {
    var previousTogglePause = togglePause;
    togglePause = function () {
      previousTogglePause();
      if (!state.session || state.session.paused) stopCurrent();
      else syncRainstick(performance.now());
    };
  }

  if (typeof stopSession === 'function') {
    var previousStopSession = stopSession;
    stopSession = function () {
      stopCurrent();
      previousStopSession();
    };
  }

  window.addEventListener('pagehide', function () { stopCurrent(); });
  clampBreathingTimes();
  if (state.screen === 'settings') renderSettings();
})();