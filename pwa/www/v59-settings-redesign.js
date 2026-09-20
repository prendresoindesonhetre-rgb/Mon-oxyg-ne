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

  function preparePreset(button, title, rhythm) {
    if (!button) return null;
    button.classList.add('v59-preset');
    button.innerHTML = '<strong>' + title + '</strong><span>' + rhythm + '</span>';
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

    var slow = preparePreset(findSimple(simpleGrid, '4,6'), 'Ralentir', '4 / 6');
    var balance = preparePreset(findSimple(simpleGrid, '5,5'), 'Équilibre', '5 / 5');
    var dynamic = preparePreset(findSimple(simpleGrid, '6,4'), 'Dynamiser', '6 / 4');

    var calm = preparePreset(findSequence(sequenceSection, 'calm'), 'Retrouver le calme', '4 / 6 → 5 / 5');
    var energy = preparePreset(findSequence(sequenceSection, 'energy'), 'Retrouver du dynamisme', '6 / 4 → 5 / 5');
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
      custom.className = 'v59-custom-pill';
      custom.innerHTML = '<strong>Personnaliser</strong>';
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