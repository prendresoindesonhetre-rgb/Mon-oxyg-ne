// Bâton de pluie : le son monte avec l'inspiration et redescend avec l'expiration.
// Réglages sonores repris à l'identique de la v83 validée.
(function () {
  'use strict';

  var CLE_ACTIF = 'mon-oxygene-rainstick-enabled';
  var CLE_VOLUME = 'mon-oxygene-rainstick-volume';
  var FICHIER = './assets/rainstick/ambient-rainstick.mp3';
  // Aucun chevauchement : le son descend avant le changement de souffle, s'arrête au sommet,
  // puis repart de zéro juste après.
  var FONDU_SORTIE_MS = 1100;
  var FONDU_ENTREE_MS = 650;
  var VITESSE = 0.88;
  var DEPART_INSPIRE = 0.65;
  var DEPART_EXPIRE = 6.00;
  var VOLUME_MAX = 0.52;

  var lecteur = null;
  var lecteurActif = null;
  var cleActive = null;
  var jeton = 0;
  var minuterieFin = null;
  var fondus = new WeakMap();

  function bornes(v, min, max) { return Math.max(min, Math.min(max, v)); }

  function lireActif() {
    try { return localStorage.getItem(CLE_ACTIF) !== '0'; } catch (_) { return true; }
  }
  function lireVolume() {
    try {
      var brut = localStorage.getItem(CLE_VOLUME);
      var v = brut === null || brut === '' ? NaN : Number(brut);
      return Number.isFinite(v) && v >= 0 ? bornes(v, 0, 1) : 0.55;
    } catch (_) { return 0.55; }
  }
  function enregistrer() {
    try {
      localStorage.setItem(CLE_ACTIF, Baton.actif ? '1' : '0');
      localStorage.setItem(CLE_VOLUME, String(Baton.volume));
    } catch (_) {}
  }

  function annulerFondu(audio) {
    var minuterie = audio && fondus.get(audio);
    if (minuterie) { clearInterval(minuterie); fondus.delete(audio); }
  }

  function fondu(audio, depuis, vers, dureeMs, fin) {
    annulerFondu(audio);
    var debut = Date.now();
    audio.volume = bornes(depuis, 0, 1);
    var minuterie = setInterval(function () {
      var t = Math.min(1, (Date.now() - debut) / Math.max(1, dureeMs));
      var adouci = t * t * (3 - 2 * t);
      audio.volume = bornes(depuis + (vers - depuis) * adouci, 0, 1);
      if (t >= 1) {
        annulerFondu(audio);
        if (fin) fin();
      }
    }, 20);
    fondus.set(audio, minuterie);
  }

  // Un seul lecteur pour l'inspiration et l'expiration : sur certains téléphones,
  // un second lecteur lancé plus tard est bloqué et l'expiration restait muette.
  function obtenirLecteur() {
    if (!lecteur) {
      lecteur = new Audio(FICHIER);
      lecteur.preload = 'auto';
      lecteur.loop = true;
      lecteur.volume = 0;
      try {
        lecteur.playbackRate = VITESSE;
        lecteur.preservesPitch = false;
        lecteur.mozPreservesPitch = false;
        lecteur.webkitPreservesPitch = false;
      } catch (_) {}
      try { lecteur.load(); } catch (_) {}
    }
    return lecteur;
  }

  function effacerMinuterieFin() {
    if (minuterieFin) { clearTimeout(minuterieFin); minuterieFin = null; }
  }

  function arreter(garderCle) {
    jeton++;
    effacerMinuterieFin();
    if (lecteurActif) {
      annulerFondu(lecteurActif);
      try { lecteurActif.pause(); } catch (_) {}
      lecteurActif = null;
    }
    if (garderCle !== true) cleActive = null;
  }

  function jouerPhase(sorte, secondes, decalage, cle) {
    effacerMinuterieFin();
    cleActive = cle;
    var monJeton = ++jeton;
    var audio = obtenirLecteur();
    lecteurActif = audio;
    annulerFondu(audio);
    try { audio.pause(); } catch (_) {}
    audio.volume = 0;

    function commencer() {
      if (monJeton !== jeton || cleActive !== cle || !Baton.actif) return;
      var depart = sorte === 'monte' ? DEPART_INSPIRE : DEPART_EXPIRE;
      var avance = bornes(Number(decalage) || 0, 0, secondes);
      try {
        var position = depart + avance * VITESSE;
        if (Number.isFinite(audio.duration) && audio.duration > 0.5) {
          position = position % Math.max(0.5, audio.duration - 0.05);
        }
        audio.currentTime = position;
      } catch (_) {}

      var volumeCible = bornes(Baton.volume, 0, VOLUME_MAX);
      var resteMs = Math.max(0, (secondes - avance) * 1000);
      audio.volume = 0;
      var lecture;
      try { lecture = audio.play(); } catch (_) { return; }
      if (lecture && typeof lecture.catch === 'function') lecture.catch(function () {});

      var entreeMs = Math.min(FONDU_ENTREE_MS, Math.max(120, resteMs * 0.22));
      fondu(audio, 0, volumeCible, entreeMs);

      // Le son redescend avant le changement de souffle et atteint zéro exactement au sommet.
      var sortieMs = Math.min(FONDU_SORTIE_MS, Math.max(180, resteMs * 0.28));
      minuterieFin = setTimeout(function () {
        if (monJeton !== jeton || lecteurActif !== audio || cleActive !== cle) return;
        fondu(audio, audio.volume, 0, sortieMs, function () {
          if (monJeton === jeton && lecteurActif === audio && cleActive === cle) {
            try { audio.pause(); } catch (_) {}
          }
        });
      }, Math.max(entreeMs, resteMs - sortieMs));
    }

    if (audio.readyState >= 1) commencer();
    else {
      audio.addEventListener('loadedmetadata', commencer, { once: true });
      try { audio.load(); } catch (_) {}
    }
  }

  function phaseA(ecoule, plan, debutInspire) {
    var element = plan[plan.length - 1];
    var index = plan.length - 1;
    for (var i = 0; i < plan.length; i++) {
      if (ecoule < plan[i].endSec) { element = plan[i]; index = i; break; }
    }
    if (ecoule >= element.endSec && index === plan.length - 1) return null;

    var inspire = bornes(Math.round(Number(element.inhaleSec) || 5), 2, 8);
    var expire = bornes(Math.round(Number(element.exhaleSec) || 5), 2, 8);
    var local = Math.max(0, ecoule - Number(element.startSec || 0));
    var cycle = inspire + expire;
    var decale = local + (Number(element.phaseOffsetSec) || 0);
    var numero = Math.floor(decale / cycle);
    var m = decale - numero * cycle;
    var inspiration, avance, duree, moitie;
    if (debutInspire) {
      inspiration = m < inspire;
      if (inspiration) { avance = m; duree = inspire; moitie = 0; }
      else { avance = m - inspire; duree = expire; moitie = 1; }
    } else {
      inspiration = !(m < expire);
      if (!inspiration) { avance = m; duree = expire; moitie = 0; }
      else { avance = m - expire; duree = inspire; moitie = 1; }
    }
    return {
      cle: index + ':' + numero + ':' + moitie + ':' + (inspiration ? 'monte' : 'descend'),
      sorte: inspiration ? 'monte' : 'descend',
      duree: duree,
      avance: avance
    };
  }

  var Baton = {
    actif: lireActif(),
    volume: lireVolume(),

    precharger: function () {
      if (Baton.actif) obtenirLecteur();
    },

    // Appelé à chaque image de la séance.
    synchroniser: function (seance) {
      if (!seance || !seance.sonAutorise || !Baton.actif) { arreter(); return; }
      if (seance.enPause) { arreter(true); return; }
      var phase = phaseA(seance.ecoule, seance.plan, seance.debutInspire);
      if (!phase) { arreter(); return; }
      if (phase.cle !== cleActive) jouerPhase(phase.sorte, phase.duree, phase.avance, phase.cle);
    },

    arreter: arreter,

    basculer: function () {
      Baton.actif = !Baton.actif;
      enregistrer();
      if (Baton.actif) obtenirLecteur();
      else arreter();
    },

    changerVolume: function (v) {
      Baton.volume = bornes(v, 0, 1);
      enregistrer();
      if (lecteurActif && !lecteurActif.paused) {
        fondu(lecteurActif, bornes(lecteurActif.volume, 0, 1), bornes(Baton.volume, 0, VOLUME_MAX), 180);
      }
    },

    // Pour la reprise après une pause ou une activation pendant la séance.
    relancer: function () { cleActive = null; },

    _phaseA: phaseA
  };

  window.addEventListener('pagehide', function () { arreter(); });
  window.BatonDePluie = Baton;
})();
