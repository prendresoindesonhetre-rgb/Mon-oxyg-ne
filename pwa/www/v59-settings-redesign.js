(function () {
  'use strict';
  if (typeof renderSettings !== 'function' || typeof state === 'undefined') return;

  function textOf(el) { return (el && el.textContent || '').trim().toLowerCase(); }

  function findSimple(grid, preset) {
    return grid ? grid.querySelector('[data-preset="' + preset + '"]') : null;
  }

  function findSequence(section, mode) {
    return section ? section.querySelector('[data-sequence-mode="' + mode + '"]') : null;
  }

  function presetIcon(kind) {
    var icons = {
      slow:
        '<svg viewBox="0 0 64 64" aria-hidden="true">' +
          '<path class="h-fill" d="M39 10c-10 1-19 6-24 14-4 6-4 13-2 18 7 1 14-1 20-6 7-6 10-16 9-25-1 0-2-1-3-1Z"/>' +
          '<path class="h-vein" d="M39 14c-7 7-13 15-17 23M32 22l-9-1m13 8-9 2"/>' +
          '<path class="h-violet" d="M46 21c3 8 0 17-7 24-6 6-14 9-22 9"/>' +
          '<path class="h-violet h-dash" d="M49 24c2 5 2 9 0 13"/>' +
          '<path class="h-violet-fill" d="M14 52l7-2-4 6Z"/>' +
        '</svg>',
      calm:
        '<svg viewBox="0 0 64 64" aria-hidden="true">' +
          '<ellipse class="h-ring" cx="32" cy="49" rx="22" ry="7"/>' +
          '<ellipse class="h-ring2" cx="32" cy="49" rx="15" ry="4.5"/>' +
          '<path class="h-fill" d="M38 13c-9 1-16 6-20 13-3 5-3 11-1 15 6 1 12-1 17-5 6-5 8-13 8-22-1 0-3-1-4-1Z"/>' +
          '<path class="h-vein" d="M38 17c-6 6-11 12-14 20M32 24l-7-1m10 7-7 2"/>' +
        '</svg>',
      balance:
        '<svg viewBox="0 0 64 64" aria-hidden="true">' +
          '<path class="h-arc" d="M13 25c5-10 14-16 19-16s14 6 19 16"/>' +
          '<path class="h-fill" d="M16 25c8 1 14 5 17 11-5 5-13 6-19 3-4-2-7-6-8-11 3-2 6-3 10-3Z"/>' +
          '<path class="h-fill" d="M48 25c-8 1-14 5-17 11 5 5 13 6 19 3 4-2 7-6 8-11-3-2-6-3-10-3Z"/>' +
          '<path class="h-vein" d="M14 29c6 3 11 7 16 13m20-13c-6 3-11 7-16 13"/>' +
          '<circle class="h-violet-fill" cx="32" cy="36" r="3.5"/>' +
          '<path class="h-violet" d="M32 40v10"/>' +
        '</svg>',
      energy:
        '<svg viewBox="0 0 64 64" aria-hidden="true">' +
          '<path class="h-stem" d="M24 49c7-11 12-22 18-34"/>' +
          '<path class="h-fill small" d="M42 13c8 0 14 4 17 10-5 5-12 7-18 4-4-2-7-6-7-11 2-2 5-3 8-3Z"/>' +
          '<path class="h-fill small" d="M25 29c-7 0-13 4-15 10 5 5 11 6 17 3 4-2 6-6 6-10-2-2-5-3-8-3Z"/>' +
          '<path class="h-violet" d="M15 53c12-2 22-8 29-19"/>' +
          '<path class="h-violet-fill" d="M45 29l2-8 5 6Z"/>' +
          '<path class="h-spark" d="M49 10v-5m0 5 4-3m-4 3-4-3"/>' +
        '</svg>',
      dynamic:
        '<svg viewBox="0 0 64 64" aria-hidden="true">' +
          '<path class="h-fill" d="M38 15c-9 1-16 6-20 13-3 5-3 11-1 15 6 1 12-1 17-5 6-5 8-13 8-22-1 0-3-1-4-1Z"/>' +
          '<path class="h-vein" d="M38 19c-6 6-11 12-14 20M32 26l-7-1m10 7-7 2"/>' +
          '<path class="h-rays" d="M32 4v7M32 49v7M9 30h7m32 0h7M15 13l5 5m24 24 5 5M49 13l-5 5M20 42l-5 5"/>' +
          '<path class="h-rays-short" d="M20 7l3 6m18-6-3 6M8 19l6 3m36-3-6 3"/>' +
        '</svg>'
    };
    return '<span class="v60-preset-icon v64-icon v64-icon-' + kind + '">' + icons[kind] + '</span>';
  }

  function preparePreset(button, title, rhythm, iconKind) {
    if (!button) return null;
    button.classList.add('v59-preset', 'v60-preset');
    button.innerHTML =
      presetIcon(iconKind) +
      '<strong class="v60-preset-label">' + title + '</strong>' +
      '<span class="v60-preset-rhythm">' + rhythm + '</span>';
    return button;
  }

  function redesignSettings() {
    var panel = document.querySelector('.settings-panel');
    if (!panel) return;

    panel.classList.remove('phone-settings', 'phone-simple', 'phone-sequence');
    panel.classList.add('v59-settings');

    var tabs = panel.querySelector('.phone-mode-tabs');
    if (tabs) tabs.remove();

    var title = panel.querySelector('.settings-title');
    if (title) title.textContent = 'Créer ma respiration';

    var sub = panel.querySelector('.settings-sub');
    if (sub) sub.textContent = 'Prends le temps qui te semble juste.';

    var rows = panel.querySelectorAll('.setting-row');
    for (var i = 0; i < rows.length; i++) {
      var strong = rows[i].querySelector('.setting-label strong');
      var txt = textOf(strong);
      if (txt.indexOf('durée') !== -1) rows[i].classList.add('v59-duration');
      else if (txt.indexOf('inspiration') !== -1) rows[i].classList.add('v59-inhale');
      else if (txt.indexOf('expiration') !== -1) rows[i].classList.add('v59-exhale');
      else if (txt.indexOf('commencer') !== -1) rows[i].classList.add('v59-start');
      else if (txt.indexOf('bâton') !== -1 || txt.indexOf('baton') !== -1) rows[i].classList.add('v59-rainstick');
    }

    if (!panel.querySelector('.v59-breath-head')) {
      var firstRow = panel.querySelector('.v59-duration');
      if (firstRow) {
        var head = document.createElement('div');
        head.className = 'v59-section-head v59-breath-head';
        head.innerHTML = '<strong>MA RESPIRATION</strong><span>Règle ton rythme de base.</span>';
        firstRow.parentNode.insertBefore(head, firstRow);
      }
    }

    var rainRow = panel.querySelector('.rainstick-row');
    if (rainRow && !panel.querySelector('.v59-ambiance-head')) {
      var ambiance = document.createElement('div');
      ambiance.className = 'v59-section-head v59-ambiance-head';
      ambiance.innerHTML = '<strong>AMBIANCE</strong>';
      rainRow.parentNode.insertBefore(ambiance, rainRow);
    }

    var simpleGrid = panel.querySelector('.preset-grid:not(.sequence-grid)');
    var sequenceSection = panel.querySelector('.sequence-section');
    if (!simpleGrid) return;

    var slow = preparePreset(findSimple(simpleGrid, '4,6'), 'Ralentir', '4 / 6', 'slow');
    var balance = preparePreset(findSimple(simpleGrid, '5,5'), 'Équilibre', '5 / 5', 'balance');
    var dynamic = preparePreset(findSimple(simpleGrid, '6,4'), 'Dynamiser', '6 / 4', 'dynamic');

    var calm = preparePreset(findSequence(sequenceSection, 'calm'), 'Retrouver le calme', '4 / 6 → 5 / 5', 'calm');
    var energy = preparePreset(findSequence(sequenceSection, 'energy'), 'Retrouver du dynamisme', '6 / 4 → 5 / 5', 'energy');
    var custom = findSequence(sequenceSection, 'custom');
    var customEditor = sequenceSection ? sequenceSection.querySelector('.sequence-custom') : null;

    var progressive = findSequence(sequenceSection, 'progressive');
    if (progressive) progressive.remove();

    var oldTitle = panel.querySelector('.preset-title');
    var header = panel.querySelector('.v59-presets-head');
    if (!header) {
      header = document.createElement('div');
      header.className = 'v59-presets-head';
      header.innerHTML =
        '<div><strong>PRÉRÉGLAGES DE RESPIRATION</strong><span>Choisis un rythme qui te correspond.</span></div>' +
        '<div class="v59-custom-slot"></div>';
      simpleGrid.parentNode.insertBefore(header, simpleGrid);
    }
    if (oldTitle) oldTitle.remove();

    var slot = header.querySelector('.v59-custom-slot');
    if (custom && slot && !slot.contains(custom)) {
      custom.className = 'v59-custom-pill v60-custom-pill';
      custom.innerHTML =
        '<svg class="v60-custom-icon" viewBox="0 0 32 32" aria-hidden="true">' +
          '<path d="M9 7c6 1 10 5 10 11-5 1-10-2-12-6-1-2-1-4-1-5h3Z"/>' +
          '<path d="M11 9c3 3 5 6 6 10"/>' +
          '<path d="M20 9h8M22 16h6M19 23h9"/>' +
          '<circle cx="23" cy="9" r="1.7"/><circle cx="25" cy="16" r="1.7"/><circle cx="22" cy="23" r="1.7"/>' +
        '</svg><strong>Personnaliser</strong>';
      slot.appendChild(custom);
    }

    var ordered = [slow, calm, balance, energy, dynamic];
    simpleGrid.classList.add('v59-preset-grid');
    simpleGrid.innerHTML = '';
    for (var p = 0; p < ordered.length; p++) {
      if (ordered[p]) simpleGrid.appendChild(ordered[p]);
    }

    if (customEditor) {
      customEditor.classList.add('v59-custom-editor');
      simpleGrid.parentNode.insertBefore(customEditor, simpleGrid.nextSibling);
    }

    if (sequenceSection) sequenceSection.remove();

    var note = panel.querySelector('.sequence-note');
    if (note) note.remove();
  }

  var previousRenderSettings = renderSettings;
  renderSettings = function () {
    var currentPanel = document.querySelector('.settings-panel');
    var savedScrollTop = currentPanel ? currentPanel.scrollTop : 0;
    var savedWindowY = window.scrollY || 0;

    previousRenderSettings();
    redesignSettings();

    var restoredPanel = document.querySelector('.settings-panel');
    if (restoredPanel) {
      restoredPanel.scrollTop = savedScrollTop;
      requestAnimationFrame(function () {
        var panel = document.querySelector('.settings-panel');
        if (panel) panel.scrollTop = savedScrollTop;
        if (savedWindowY) window.scrollTo(0, savedWindowY);
      });
    }
  };

  if (state.screen === 'settings') renderSettings();
})();