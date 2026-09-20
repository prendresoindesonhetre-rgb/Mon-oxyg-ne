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
          '<path class="i-leaf-fill" d="M31 9c-6 .4-12 3.7-15.2 8.7-2.3 3.7-2.6 7.8-1.3 11.2 4.1.6 8.6-.6 12.1-3.4 4.9-3.9 7.1-10.5 6.6-16.1-.7-.3-1.4-.4-2.2-.4Z"/>' +
          '<path class="i-leaf-line" d="M31.2 11.7c-4.7 4.7-8.5 9.4-11.4 14.3M25 17.5l-5.4-.4m8.8 5-5.6.7"/>' +
          '<path class="i-violet-line i-dashed" d="M35 14c3 5.4 1.4 11.4-3.3 16.1-4.2 4.1-9.8 6.4-15.6 7"/>' +
          '<circle class="i-violet-dot" cx="14.5" cy="37.2" r="1.35"/>' +
        '</svg>',
      calm:
        '<svg viewBox="0 0 48 48" aria-hidden="true">' +
          '<path class="i-tree-fill" d="M21 12.5c0 5.1-.2 9.6-1.1 13.6-.8 3.5-2 6.8-3.8 10.3h15.8c-1.8-3.5-3-6.8-3.8-10.3-.9-4-1.1-8.5-1.1-13.6Z"/>' +
          '<path class="i-tree-line" d="M24 13v17M24 19l-7-6M24 20l7-7M18.5 35.7 12 40m11-4.3L20 41m9.5-5.3L36 40m-11-4.3L28 41"/>' +
          '<path class="i-leaf-fill small" d="M12.8 10.4c3.7.2 6.7 2.1 8.2 5-2.3 2.4-5.6 3.1-8.5 1.7-2.1-1-3.4-3-3.6-5.3 1.1-.8 2.4-1.3 3.9-1.4Z"/>' +
          '<path class="i-leaf-fill small" d="M35.2 10.4c-3.7.2-6.7 2.1-8.2 5 2.3 2.4 5.6 3.1 8.5 1.7 2.1-1 3.4-3 3.6-5.3-1.1-.8-2.4-1.3-3.9-1.4Z"/>' +
          '<path class="i-soft-line" d="M11 42h26"/>' +
        '</svg>',
      balance:
        '<svg viewBox="0 0 48 48" aria-hidden="true">' +
          '<path class="i-soft-line" d="M24 10v27M12 35h24"/>' +
          '<path class="i-leaf-fill" d="M12 14c5 .2 9.3 2.6 11.5 6.5-3.1 3.2-7.7 4.1-11.4 2.1-2.8-1.4-4.6-4-4.9-7 1.4-1 3-1.5 4.8-1.6Z"/>' +
          '<path class="i-leaf-fill" d="M36 14c-5 .2-9.3 2.6-11.5 6.5 3.1 3.2 7.7 4.1 11.4 2.1 2.8-1.4 4.6-4 4.9-7-1.4-1-3-1.5-4.8-1.6Z"/>' +
          '<path class="i-violet-line" d="M13 17.5c3.3 1.8 6.1 4.2 8.4 7.2M35 17.5c-3.3 1.8-6.1 4.2-8.4 7.2"/>' +
          '<circle class="i-violet-dot" cx="24" cy="37.3" r="2"/>' +
        '</svg>',
      energy:
        '<svg viewBox="0 0 48 48" aria-hidden="true">' +
          '<path class="i-soft-line" d="M12 39c5-1.8 9-4.8 12-9.2 2.9-4.3 4.8-9.2 5.9-14.6"/>' +
          '<path class="i-tree-line" d="M22 37c1-9.4 3.8-16.5 8.6-21.4"/>' +
          '<path class="i-leaf-fill small" d="M31 12.5c4.1.1 7.4 2.1 9.2 5.3-2.5 2.8-6.1 3.7-9.4 2.1-2.3-1.1-3.8-3.2-4.1-5.8 1.2-1 2.6-1.5 4.3-1.6Z"/>' +
          '<path class="i-leaf-fill small" d="M21 22c-3.8.2-6.8 2.2-8.2 5.2 2.4 2.4 5.7 3 8.7 1.5 2-1.1 3.3-3.1 3.4-5.5-1.1-.8-2.4-1.2-3.9-1.2Z"/>' +
          '<path class="i-violet-line" d="M34 11l2.5-3M37.5 13h4M31.5 8.5V5"/>' +
        '</svg>',
      dynamic:
        '<svg viewBox="0 0 48 48" aria-hidden="true">' +
          '<path class="i-tree-fill" d="M21.5 21c0 4.1-.4 7.5-1.3 10.3-.6 1.8-1.4 3.6-2.4 5.3h12.4c-1-1.7-1.8-3.5-2.4-5.3-.9-2.8-1.3-6.2-1.3-10.3Z"/>' +
          '<path class="i-tree-line" d="M24 21v13M24 24l-6-5M24 25l6-6"/>' +
          '<path class="i-leaf-fill small" d="M14 14c4 .2 7.4 2.1 9.1 5.2-2.4 2.7-6 3.5-9.1 1.9-2.3-1.2-3.7-3.2-4-5.7 1.1-.8 2.4-1.3 4-1.4Z"/>' +
          '<path class="i-leaf-fill small" d="M34 14c-4 .2-7.4 2.1-9.1 5.2 2.4 2.7 6 3.5 9.1 1.9 2.3-1.2 3.7-3.2 4-5.7-1.1-.8-2.4-1.3-4-1.4Z"/>' +
          '<path class="i-violet-line" d="M24 5v5M10 9l3.4 3M38 9l-3.4 3M6 20h5M37 20h5"/>' +
        '</svg>'
    };
    return '<span class="v60-preset-icon v63-icon v63-icon-' + kind + '">' + icons[kind] + '</span>';
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