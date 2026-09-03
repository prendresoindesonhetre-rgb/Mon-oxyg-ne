(function () {
  if (typeof state === 'undefined' || typeof renderSettings !== 'function') return;

  var baseRenderSettings = renderSettings;
  var baseStartSession = startSession;

  state.sequenceMode = state.sequenceMode || 'simple';
  state.customStages = state.customStages || [
    { durationMin: 2.5, inhaleSec: 4, exhaleSec: 6 },
    { durationMin: 2.5, inhaleSec: 5, exhaleSec: 5 }
  ];

  function formatMinutes(value) {
    return String(Math.round(value * 10) / 10).replace('.', ',');
  }

  function customTotalMinutes() {
    var total = 0;
    for (var i = 0; i < state.customStages.length; i++) total += state.customStages[i].durationMin;
    return total;
  }

  function currentModeLabel() {
    if (state.sequenceMode === 'calm') return 'Retrouver le calme · 4/6 → 5/5';
    if (state.sequenceMode === 'energy') return 'Retrouver de l’élan · 6/4 → 5/5';
    if (state.sequenceMode === 'progressive') return 'Ralentir progressivement · 3/5 → 4/6 → 5/5';
    if (state.sequenceMode === 'custom') return 'Mon enchaînement personnalisé';
    return '';
  }

  function sequenceButton(mode, title, rhythm) {
    var active = state.sequenceMode === mode ? ' active' : '';
    return '<button class="preset sequence-choice' + active + '" data-sequence-mode="' + mode + '">' +
      '<strong>' + title + '</strong><span>' + rhythm + '</span></button>';
  }

  function stageEditor(stage, index) {
    return '<div class="sequence-stage">' +
      '<div class="sequence-stage-head"><strong>Étape ' + (index + 1) + '</strong>' +
      (state.customStages.length > 2 ? '<button class="sequence-remove" data-remove-stage="' + index + '" aria-label="Supprimer cette étape">×</button>' : '') +
      '</div>' +
      '<div class="sequence-stage-controls">' +
        '<div class="sequence-mini"><span>Durée</span><div><button data-custom-step="durationMin" data-stage="' + index + '" data-delta="-0.5">−</button><b>' + formatMinutes(stage.durationMin) + ' min</b><button data-custom-step="durationMin" data-stage="' + index + '" data-delta="0.5">+</button></div></div>' +
        '<div class="sequence-mini"><span>Inspire</span><div><button data-custom-step="inhaleSec" data-stage="' + index + '" data-delta="-1">−</button><b>' + stage.inhaleSec + ' s</b><button data-custom-step="inhaleSec" data-stage="' + index + '" data-delta="1">+</button></div></div>' +
        '<div class="sequence-mini"><span>Expire</span><div><button data-custom-step="exhaleSec" data-stage="' + index + '" data-delta="-1">−</button><b>' + stage.exhaleSec + ' s</b><button data-custom-step="exhaleSec" data-stage="' + index + '" data-delta="1">+</button></div></div>' +
      '</div>' +
    '</div>';
  }

  function ensureSequenceStyles() {
    if (document.getElementById('sequenceStyles')) return;
    var style = document.createElement('style');
    style.id = 'sequenceStyles';
    style.textContent =
      '.sequence-section{margin-top:12px;padding-top:12px;border-top:1px solid rgba(65,151,175,.15)}' +
      '.sequence-heading{display:flex;align-items:flex-end;justify-content:space-between;gap:14px;margin-bottom:8px}' +
      '.sequence-heading strong{font-size:clamp(12px,1.15vw,16px)}' +
      '.sequence-heading span{font-size:11px;opacity:.68;text-align:right}' +
      '.sequence-grid{margin-top:0}' +
      '.sequence-choice.active{box-shadow:inset 0 0 0 2px rgba(58,139,164,.48);background:rgba(255,255,255,.88)}' +
      '.sequence-note{margin:8px 2px 0;font-size:11px;line-height:1.35;opacity:.72}' +
      '.sequence-custom{margin-top:9px;padding:10px;border-radius:16px;background:rgba(255,255,255,.48);border:1px solid rgba(65,151,175,.14)}' +
      '.sequence-custom-title{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:8px;font-size:12px}' +
      '.sequence-stage{padding:8px 0;border-top:1px solid rgba(49,88,110,.10)}' +
      '.sequence-stage:first-of-type{border-top:0}' +
      '.sequence-stage-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;font-size:12px}' +
      '.sequence-remove{border:0;background:transparent;font-size:20px;line-height:1;opacity:.55}' +
      '.sequence-stage-controls{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}' +
      '.sequence-mini{background:rgba(255,255,255,.62);border-radius:11px;padding:6px;text-align:center}' +
      '.sequence-mini>span{display:block;font-size:10px;opacity:.63;margin-bottom:4px}' +
      '.sequence-mini>div{display:flex;align-items:center;justify-content:center;gap:5px}' +
      '.sequence-mini button{width:25px;height:25px;border-radius:50%;border:1px solid rgba(62,132,154,.20);background:white}' +
      '.sequence-mini b{min-width:42px;font-size:11px}' +
      '.sequence-add{margin-top:7px;border:1px solid rgba(65,151,175,.20);background:rgba(255,255,255,.72);border-radius:999px;padding:7px 12px;font-size:11px;font-weight:700}' +
      '@media(max-height:620px){.sequence-section{margin-top:8px;padding-top:8px}.sequence-custom{padding:7px}.sequence-stage{padding:5px 0}.sequence-mini{padding:4px}}';
    document.head.appendChild(style);
  }

  function injectSequenceControls() {
    ensureSequenceStyles();
    var grid = document.querySelector('.preset-grid');
    if (!grid || document.querySelector('.sequence-section')) return;

    var section = document.createElement('div');
    section.className = 'sequence-section';
    var customHtml = '';
    if (state.sequenceMode === 'custom') {
      var stages = '';
      for (var i = 0; i < state.customStages.length; i++) stages += stageEditor(state.customStages[i], i);
      customHtml = '<div class="sequence-custom">' +
        '<div class="sequence-custom-title"><strong>Mon enchaînement</strong><span>Durée totale : ' + formatMinutes(customTotalMinutes()) + ' min</span></div>' +
        stages +
        '<button class="sequence-add" id="addSequenceStage">+ Ajouter une étape</button>' +
      '</div>';
    }

    section.innerHTML =
      '<div class="sequence-heading"><strong>Enchaîner plusieurs rythmes</strong><span>Le changement se fait automatiquement pendant la séance.</span></div>' +
      '<div class="preset-grid sequence-grid">' +
        sequenceButton('calm', 'Retrouver le calme', '4 / 6 → 5 / 5') +
        sequenceButton('energy', 'Retrouver de l’élan', '6 / 4 → 5 / 5') +
        sequenceButton('progressive', 'Ralentir progressivement', '3 / 5 → 4 / 6 → 5 / 5') +
        sequenceButton('custom', 'Personnaliser', 'Mes propres étapes') +
      '</div>' +
      (state.sequenceMode !== 'simple' ? '<p class="sequence-note"><strong>' + currentModeLabel() + '</strong></p>' : '') +
      customHtml;

    grid.parentNode.insertBefore(section, grid.nextSibling);

    var simplePresets = document.querySelectorAll('[data-preset]');
    for (var p = 0; p < simplePresets.length; p++) {
      simplePresets[p].addEventListener('click', function () { state.sequenceMode = 'simple'; }, true);
    }

    var modeButtons = section.querySelectorAll('[data-sequence-mode]');
    for (var m = 0; m < modeButtons.length; m++) {
      modeButtons[m].addEventListener('click', function () {
        state.sequenceMode = this.getAttribute('data-sequence-mode');
        renderSettings();
      });
    }

    var customSteps = section.querySelectorAll('[data-custom-step]');
    for (var s = 0; s < customSteps.length; s++) {
      customSteps[s].addEventListener('click', function () {
        var index = Number(this.getAttribute('data-stage'));
        var key = this.getAttribute('data-custom-step');
        var delta = Number(this.getAttribute('data-delta'));
        var stage = state.customStages[index];
        if (!stage) return;
        if (key === 'durationMin') stage[key] = Math.max(0.5, Math.min(20, Math.round((stage[key] + delta) * 2) / 2));
        else stage[key] = Math.max(2, Math.min(10, stage[key] + delta));
        state.config.durationMin = customTotalMinutes();
        renderSettings();
      });
    }

    var removeButtons = section.querySelectorAll('[data-remove-stage]');
    for (var r = 0; r < removeButtons.length; r++) {
      removeButtons[r].addEventListener('click', function () {
        var index = Number(this.getAttribute('data-remove-stage'));
        if (state.customStages.length > 2) state.customStages.splice(index, 1);
        state.config.durationMin = customTotalMinutes();
        renderSettings();
      });
    }

    var addButton = document.getElementById('addSequenceStage');
    if (addButton) addButton.addEventListener('click', function () {
      state.customStages.push({ durationMin: 1, inhaleSec: 5, exhaleSec: 5 });
      state.config.durationMin = customTotalMinutes();
      renderSettings();
    });
  }

  renderSettings = function () {
    baseRenderSettings();
    injectSequenceControls();
  };

  function splitPlan(defs, totalSeconds) {
    var plan = [];
    var start = 0;
    for (var i = 0; i < defs.length; i++) {
      var duration = i === defs.length - 1 ? totalSeconds - start : totalSeconds / defs.length;
      if (duration < 0) duration = 0;
      plan.push({
        inhaleSec: defs[i][0],
        exhaleSec: defs[i][1],
        durationSec: duration,
        startSec: start,
        endSec: start + duration
      });
      start += duration;
    }
    return plan;
  }

  function buildSessionPlan() {
    var totalSeconds = Math.max(30, Number(state.config.durationMin) * 60);
    if (state.sequenceMode === 'calm') return splitPlan([[4, 6], [5, 5]], totalSeconds);
    if (state.sequenceMode === 'energy') return splitPlan([[6, 4], [5, 5]], totalSeconds);
    if (state.sequenceMode === 'progressive') return splitPlan([[3, 5], [4, 6], [5, 5]], totalSeconds);
    if (state.sequenceMode === 'custom') {
      var plan = [];
      var start = 0;
      for (var i = 0; i < state.customStages.length; i++) {
        var stage = state.customStages[i];
        var duration = Math.max(30, Number(stage.durationMin) * 60);
        plan.push({
          inhaleSec: stage.inhaleSec,
          exhaleSec: stage.exhaleSec,
          durationSec: duration,
          startSec: start,
          endSec: start + duration
        });
        start += duration;
      }
      return plan;
    }
    return [{
      inhaleSec: state.config.inhaleSec,
      exhaleSec: state.config.exhaleSec,
      durationSec: totalSeconds,
      startSec: 0,
      endSec: totalSeconds
    }];
  }

  startSession = function () {
    state.session = {
      startedAt: performance.now(),
      pausedTotal: 0,
      pausedAt: 0,
      paused: false,
      frame: 0,
      plan: buildSessionPlan(),
      sequenceMode: state.sequenceMode
    };
    state.screen = 'session';
    requestWakeLock();
    renderSession();
  };

  function activeRhythmAt(t) {
    var plan = state.session && state.session.plan;
    if (!plan || !plan.length) {
      return {
        inhaleSec: state.config.inhaleSec,
        exhaleSec: state.config.exhaleSec,
        startSec: 0,
        endSec: Number(state.config.durationMin) * 60,
        localT: t,
        index: 0,
        count: 1
      };
    }
    if (t < 0) {
      return {
        inhaleSec: plan[0].inhaleSec,
        exhaleSec: plan[0].exhaleSec,
        startSec: plan[0].startSec,
        endSec: plan[0].endSec,
        localT: t,
        index: 0,
        count: plan.length
      };
    }
    var item = plan[plan.length - 1];
    var index = plan.length - 1;
    for (var i = 0; i < plan.length; i++) {
      if (t < plan[i].endSec) { item = plan[i]; index = i; break; }
    }
    return {
      inhaleSec: item.inhaleSec,
      exhaleSec: item.exhaleSec,
      startSec: item.startSec,
      endSec: item.endSec,
      localT: t - item.startSec,
      index: index,
      count: plan.length
    };
  }

  function sessionTotalSeconds() {
    var plan = state.session && state.session.plan;
    if (plan && plan.length) return plan[plan.length - 1].endSec;
    return Number(state.config.durationMin) * 60;
  }

  cyclePosition = function (t) {
    var r = activeRhythmAt(t);
    var cycle = r.inhaleSec + r.exhaleSec;
    return ((r.localT % cycle) + cycle) % cycle;
  };

  isInhaleAt = function (t) {
    var r = activeRhythmAt(t);
    var m = cyclePosition(t);
    if (state.config.startWithInhale) return m < r.inhaleSec;
    return !(m < r.exhaleSec);
  };

  phaseRemaining = function (t) {
    var r = activeRhythmAt(t);
    var cycle = r.inhaleSec + r.exhaleSec;
    var m = cyclePosition(t);
    if (state.config.startWithInhale) return m < r.inhaleSec ? r.inhaleSec - m : cycle - m;
    return m < r.exhaleSec ? r.exhaleSec - m : cycle - m;
  };

  waveAt = function (t) {
    var r = activeRhythmAt(t);
    var m = cyclePosition(t);
    if (state.config.startWithInhale) {
      if (m < r.inhaleSec) return -Math.cos(Math.PI * (m / r.inhaleSec));
      return Math.cos(Math.PI * ((m - r.inhaleSec) / r.exhaleSec));
    }
    if (m < r.exhaleSec) return Math.cos(Math.PI * (m / r.exhaleSec));
    return -Math.cos(Math.PI * ((m - r.exhaleSec) / r.inhaleSec));
  };

  breathEase = function (t) {
    var r = activeRhythmAt(t);
    var m = cyclePosition(t);
    var q;
    if (state.config.startWithInhale) {
      q = m < r.inhaleSec ? m / r.inhaleSec : 1 - (m - r.inhaleSec) / r.exhaleSec;
    } else {
      q = m < r.exhaleSec ? 1 - m / r.exhaleSec : (m - r.exhaleSec) / r.inhaleSec;
    }
    q = Math.max(0, Math.min(1, q));
    return 0.5 - 0.5 * Math.cos(Math.PI * q);
  };

  guidanceAt = function (t, inhale) {
    var r = activeRhythmAt(t);
    var cycle = r.inhaleSec + r.exhaleSec;
    var cycleIndex = Math.floor(Math.max(0, r.localT) / cycle);
    if (cycleIndex >= 4) return '';
    var visual = cycleIndex % 2 === 1;
    if (visual) return inhale
      ? 'Imagine une lumière douce qui entre avec ton souffle'
      : 'Et à présent, imagine que tu souffles un nuage sombre';
    return inhale
      ? 'Par le nez  •  ton ventre se gonfle'
      : 'Par la bouche  •  ton ventre se dégonfle';
  };

  buildWavePath = function (elapsed) {
    var r = activeRhythmAt(elapsed);
    var cycle = r.inhaleSec + r.exhaleSec;
    var visibleSpan = cycle * 4.35;
    var mid = 250;
    var amp = 190.5;
    var points = 280;
    var d = '';
    for (var i = 0; i <= points; i++) {
      var x = i / points * 1000;
      var t = elapsed + (i / points - 0.5) * visibleSpan;
      var y = mid - amp * waveAt(t);
      d += (i === 0 ? 'M' : 'L') + x.toFixed(1) + ',' + y.toFixed(1) + ' ';
    }
    return d;
  };

  tickSession = function (now) {
    var s = state.session;
    if (!s || state.screen !== 'session') return;

    var elapsed = elapsedSeconds(now);
    var total = sessionTotalSeconds();
    var remain = Math.max(0, total - elapsed);

    if (remain <= 0) {
      stopSession();
      showToast('Séance terminée.');
      return;
    }

    var r = activeRhythmAt(elapsed);
    var inhale = isInhaleAt(elapsed);
    var phaseTitle = document.getElementById('phaseTitle');
    var phaseGuide = document.getElementById('phaseGuide');
    var phaseCount = document.getElementById('phaseCount');
    if (phaseTitle) phaseTitle.textContent = inhale ? 'Inspire' : 'Expire';
    if (phaseGuide) phaseGuide.textContent = guidanceAt(elapsed, inhale);
    if (phaseCount) phaseCount.textContent = phaseRemaining(elapsed).toFixed(1) + ' s';

    var rhythmLabel = document.querySelector('.rhythm-label');
    if (rhythmLabel) rhythmLabel.textContent = 'Inspire ' + r.inhaleSec + ' s   ·   Expire ' + r.exhaleSec + ' s';

    var path = buildWavePath(elapsed);
    var waveLine = document.getElementById('waveLine');
    var waveGlow = document.getElementById('waveGlow');
    if (waveLine) waveLine.setAttribute('d', path);
    if (waveGlow) waveGlow.setAttribute('d', path);

    var flower = document.getElementById('flower');
    if (flower) {
      var y = 250 - 190.5 * waveAt(elapsed);
      var scale = 0.655 + 0.28 * breathEase(elapsed);
      flower.style.left = '50%';
      flower.style.top = (y / 5) + '%';
      flower.style.transform = 'translate(-50%,-50%) scale(' + scale.toFixed(4) + ')';
    }

    var progress = Math.max(0, Math.min(1, elapsed / total));
    var pct = (progress * 100).toFixed(3) + '%';
    var progressFill = document.getElementById('progressFill');
    var progressShadow = document.getElementById('progressShadow');
    var progressMarker = document.getElementById('progressMarker');
    if (progressFill) progressFill.style.width = pct;
    if (progressShadow) progressShadow.style.width = pct;
    if (progressMarker) progressMarker.style.left = pct;

    var sec = Math.ceil(remain);
    var minutes = Math.floor(sec / 60);
    var seconds = String(sec % 60).padStart(2, '0');
    var timePill = document.getElementById('timePill');
    if (timePill) timePill.textContent = minutes + ':' + seconds;

    updatePauseIcon();
    s.frame = requestAnimationFrame(tickSession);
  };

  if (state.screen === 'settings') renderSettings();
})();
