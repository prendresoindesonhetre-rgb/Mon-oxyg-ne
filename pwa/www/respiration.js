// Moteur de respiration : le plan d'une séance et la position du souffle à chaque instant.
// Calculs repris à l'identique de la v83 validée ; ils ne dépendent ni de l'écran ni du son.
(function () {
  'use strict';

  var ENCHAINEMENTS = {
    calme: [[4, 6], [5, 5]],
    dynamisme: [[6, 4], [5, 5]]
  };

  function bornes(valeur, min, max) {
    return Math.max(min, Math.min(max, valeur));
  }

  function formaterDuree(totalSecondes) {
    var secondes = Math.max(0, Math.round(Number(totalSecondes) || 0));
    if (secondes < 60) return secondes + ' s';
    var minutes = Math.floor(secondes / 60);
    var reste = secondes % 60;
    return minutes + ' min' + (reste ? ' ' + reste + ' s' : '');
  }

  // Au changement de rythme, la courbe reprend au même point du souffle (pas de saut).
  function decalageDePhase(precedent, inspire, expire, debutInspire) {
    if (!precedent) return 0;
    var prevInspire = Math.max(2, Number(precedent.inhaleSec) || 5);
    var prevExpire = Math.max(2, Number(precedent.exhaleSec) || 5);
    var prevCycle = prevInspire + prevExpire;
    var decale = (Number(precedent.phaseOffsetSec) || 0) + Number(precedent.durationSec || 0);
    var m = ((decale % prevCycle) + prevCycle) % prevCycle;
    if (m < 0.000001 || prevCycle - m < 0.000001) m = 0;

    if (debutInspire) {
      if (m < prevInspire) return (m / prevInspire) * inspire;
      return inspire + ((m - prevInspire) / prevExpire) * expire;
    }
    if (m < prevExpire) return (m / prevExpire) * expire;
    return expire + ((m - prevExpire) / prevInspire) * inspire;
  }

  function ajouterEtape(plan, inspireSec, expireSec, dureeSec, debutSec, debutInspire) {
    var inspire = Math.max(2, Number(inspireSec) || 5);
    var expire = Math.max(2, Number(expireSec) || 5);
    var precedent = plan.length ? plan[plan.length - 1] : null;
    plan.push({
      inhaleSec: inspire,
      exhaleSec: expire,
      durationSec: dureeSec,
      startSec: debutSec,
      endSec: debutSec + dureeSec,
      phaseOffsetSec: decalageDePhase(precedent, inspire, expire, debutInspire)
    });
  }

  function partager(rythmes, totalSecondes, debutInspire) {
    var plan = [];
    var debut = 0;
    for (var i = 0; i < rythmes.length; i++) {
      var duree = i === rythmes.length - 1 ? totalSecondes - debut : totalSecondes / rythmes.length;
      if (duree < 0) duree = 0;
      ajouterEtape(plan, rythmes[i][0], rythmes[i][1], duree, debut, debutInspire);
      debut += duree;
    }
    return plan;
  }

  // reglages : { mode: 'simple' | 'calme' | 'dynamisme' | 'perso', durationMin, inhaleSec, exhaleSec,
  //              startWithInhale, etapes: [{ durationMin, inhaleSec, exhaleSec }] }
  function construirePlan(reglages) {
    var debutInspire = !!reglages.startWithInhale;
    var totalSecondes = Math.max(30, Number(reglages.durationMin) * 60);
    if (ENCHAINEMENTS[reglages.mode]) return partager(ENCHAINEMENTS[reglages.mode], totalSecondes, debutInspire);
    if (reglages.mode === 'perso') {
      var plan = [];
      var debut = 0;
      for (var i = 0; i < reglages.etapes.length; i++) {
        var etape = reglages.etapes[i];
        var cycleMinimum = Math.max(4, Number(etape.inhaleSec || 5) + Number(etape.exhaleSec || 5));
        var duree = Math.max(cycleMinimum, Math.round(Number(etape.durationMin) * 60));
        ajouterEtape(plan, etape.inhaleSec, etape.exhaleSec, duree, debut, debutInspire);
        debut += duree;
      }
      return plan;
    }
    return [{
      inhaleSec: reglages.inhaleSec,
      exhaleSec: reglages.exhaleSec,
      durationSec: totalSecondes,
      startSec: 0,
      endSec: totalSecondes
    }];
  }

  function dureePlan(plan) {
    return plan[plan.length - 1].endSec;
  }

  function rythmeA(plan, t) {
    if (t < 0) {
      return { inhaleSec: plan[0].inhaleSec, exhaleSec: plan[0].exhaleSec, startSec: plan[0].startSec, endSec: plan[0].endSec,
        localT: t, phaseOffsetSec: Number(plan[0].phaseOffsetSec) || 0, index: 0, count: plan.length };
    }
    var element = plan[plan.length - 1];
    var index = plan.length - 1;
    for (var i = 0; i < plan.length; i++) {
      if (t < plan[i].endSec) { element = plan[i]; index = i; break; }
    }
    return { inhaleSec: element.inhaleSec, exhaleSec: element.exhaleSec, startSec: element.startSec, endSec: element.endSec,
      localT: t - element.startSec, phaseOffsetSec: Number(element.phaseOffsetSec) || 0, index: index, count: plan.length };
  }

  function positionCycle(plan, t) {
    var r = rythmeA(plan, t);
    var cycle = r.inhaleSec + r.exhaleSec;
    var decale = r.localT + (Number(r.phaseOffsetSec) || 0);
    return ((decale % cycle) + cycle) % cycle;
  }

  function estInspiration(plan, t, debutInspire) {
    var r = rythmeA(plan, t);
    var m = positionCycle(plan, t);
    if (debutInspire) return m < r.inhaleSec;
    return !(m < r.exhaleSec);
  }

  function resteDePhase(plan, t, debutInspire) {
    var r = rythmeA(plan, t);
    var cycle = r.inhaleSec + r.exhaleSec;
    var m = positionCycle(plan, t);
    if (debutInspire) return m < r.inhaleSec ? r.inhaleSec - m : cycle - m;
    return m < r.exhaleSec ? r.exhaleSec - m : cycle - m;
  }

  // Hauteur de la courbe entre -1 (creux) et 1 (sommet).
  function vague(plan, t, debutInspire) {
    var r = rythmeA(plan, t);
    var m = positionCycle(plan, t);
    if (debutInspire) {
      if (m < r.inhaleSec) return -Math.cos(Math.PI * (m / r.inhaleSec));
      return Math.cos(Math.PI * ((m - r.inhaleSec) / r.exhaleSec));
    }
    if (m < r.exhaleSec) return Math.cos(Math.PI * (m / r.exhaleSec));
    return -Math.cos(Math.PI * ((m - r.exhaleSec) / r.inhaleSec));
  }

  // Ampleur du souffle entre 0 et 1 : sert à faire grandir le lotus.
  function ampleur(plan, t, debutInspire) {
    var r = rythmeA(plan, t);
    var m = positionCycle(plan, t);
    var q;
    if (debutInspire) q = m < r.inhaleSec ? m / r.inhaleSec : 1 - (m - r.inhaleSec) / r.exhaleSec;
    else q = m < r.exhaleSec ? 1 - m / r.exhaleSec : (m - r.exhaleSec) / r.inhaleSec;
    q = bornes(q, 0, 1);
    return 0.5 - 0.5 * Math.cos(Math.PI * q);
  }

  // Consigne des quatre premiers cycles de chaque rythme, puis silence.
  function consigne(plan, t, inspiration) {
    var r = rythmeA(plan, t);
    var cycle = r.inhaleSec + r.exhaleSec;
    var decale = Math.max(0, r.localT + (Number(r.phaseOffsetSec) || 0));
    var numeroCycle = Math.floor(decale / cycle);
    if (numeroCycle >= 4) return '';
    if (numeroCycle % 2 === 1) {
      return inspiration
        ? 'Imagine une lumière douce qui entre avec ton souffle'
        : 'Et à présent, imagine que tu souffles un nuage sombre';
    }
    return inspiration
      ? 'Par le nez  •  ton ventre se gonfle'
      : 'Par la bouche  •  ton ventre se dégonfle';
  }

  // Tracé SVG (repère 1000 × 500) : un peu plus de quatre cycles visibles, l'instant présent au milieu.
  function cheminVague(plan, t, debutInspire) {
    var r = rythmeA(plan, t);
    var cycle = r.inhaleSec + r.exhaleSec;
    var etendue = cycle * 4.35;
    var points = 280;
    var d = '';
    for (var i = 0; i <= points; i++) {
      var x = i / points * 1000;
      var instant = t + (i / points - 0.5) * etendue;
      var y = 250 - 190.5 * vague(plan, instant, debutInspire);
      d += (i === 0 ? 'M' : 'L') + x.toFixed(1) + ',' + y.toFixed(1) + ' ';
    }
    return d;
  }

  window.Respiration = {
    bornes: bornes,
    formaterDuree: formaterDuree,
    construirePlan: construirePlan,
    dureePlan: dureePlan,
    rythmeA: rythmeA,
    estInspiration: estInspiration,
    resteDePhase: resteDePhase,
    vague: vague,
    ampleur: ampleur,
    consigne: consigne,
    cheminVague: cheminVague
  };
})();
