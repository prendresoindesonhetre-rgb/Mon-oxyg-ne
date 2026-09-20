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
        '<svg viewBox="0 0 48 48" aria-hidden="true">' +
          '<path class="i-main" d="M29 10c-8 2-14 8-15 17 7 1 14-2 18-8 2-3 3-6 3-9-2 0-4 0-6 0Z"/>' +
          '<path class="i-accent" d="M31 14c-5 5-9 10-12 17"/>' +
          '<path class="i-soft" d="M11 35c6 3 16 3 23-1"/>' +
          '<path class="i-soft" d="M14 40c5 2 12 2 17 0"/>' +
        '</svg>',
      calm:
        '<svg viewBox="0 0 48 48" aria-hidden="true">' +
          '<ellipse class="i-soft" cx="24" cy="36" rx="15" ry="5"/>' +
          '<ellipse class="i-soft" cx="24" cy="36" rx="9" ry="3"/>' +
          '<path class="i-main" d="M28 13c-7 2-11 7-11 14 6 1 11-1 14-6 2-3 2-6 2-9-2 0-3 0-5 1Z"/>' +
          '<path class="i-accent" d="M29 16c-4 4-7 8-9 13"/>' +
        '</svg>',
      balance:
        '<svg viewBox="0 0 48 48" aria-hidden="true">' +
          '<path class="i-main" d="M12 14c7 1 12 5 13 12-6 1-12-2-15-7-1-2-1-4-1-6 1 0 2 0 3 1Z"/>' +
          '<path class="i-main" d="M36 14c-7 1-12 5-13 12 6 1 12-2 15-7 1-2 1-4 1-6-1 0-2 0-3 1Z"/>' +
          '<path class="i-accent" d="M16 17c4 3 7 7 8 12m8-12c-4 3-7 7-8 12"/>' +
          '<circle class="i-dot" cx="24" cy="34" r="2.4"/>' +
        '</svg>',
      energy:
        '<svg viewBox="0 0 48 48" aria-hidden="true">' +
          '<path class="i-main" d="M22 30c0-8 3-14 10-18 4 7 3 14-2 19-3 3-6 4-8 4Z"/>' +
          '<path class="i-main small-leaf" d="M20 31c-5-1-8-4-9-9 5-1 9 1 11 5 1 2 1 3 1 5Z"/>' +
          '<path class="i-accent" d="M23 35c2-9 6-15 11-20"/>' +
          '<path class="i-soft" d="M14 38c8-1 14-5 19-12"/>' +
          '<path class="i-soft" d="M31 12l3-2m-1 5 3 0"/>' +
        '</svg>',
      dynamic:
        '<svg viewBox="0 0 48 48" aria-hidden="true">' +
          '<path class="i-main" d="M28 16c-7 2-11 7-11 14 6 1 12-2 15-7 1-2 2-5 2-8-2 0-4 0-6 1Z"/>' +
          '<path class="i-accent" d="M29 19c-4 4-7 8-9 13"/>' +
          '<path class="i-ray" d="M24 6v5m0 26v5M8 24h5m22 0h5M12 12l4 4m16 16 4 4m0-24-4 4M16 32l-4 4"/>' +
        '</svg>'
    };
    return '<span class="v60-preset-icon v60-icon-' + kind + '">' + icons[kind] + '</span>';
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
    previousRenderSettings();
    redesignSettings();
  };

  if (state.screen === 'settings') renderSettings();
})();