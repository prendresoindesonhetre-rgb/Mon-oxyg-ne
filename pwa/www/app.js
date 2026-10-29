// Mon Oxygène : les écrans (accueil web, introduction, réglages, séance) et la fenêtre Mon Oxygène Plus.
(function () {
  'use strict';

  var R = window.Respiration;
  var Baton = window.BatonDePluie;
  var Plus = window.MonOxygenePlus;
  var app = document.getElementById('app');
  var toast = document.getElementById('toast');

  var DIAPOS = [
    {
      surtitre: 'Respirer en conscience',
      titre: 'Mon Oxygène',
      corps:
        '<p><strong>Respirer est un besoin vital.<br>Mais lorsqu’on y met de la conscience et du sens, chaque souffle devient un retour à soi.</strong></p>' +
        '<p>Mon Oxygène est une application de respiration guidée pensée comme un espace intérieur.</p>' +
        '<p>Un moment pour accueillir ce qui est là, et laisser un peu plus de place à ce que l’on ressent.</p>'
    },
    {
      surtitre: 'Retrouver sa marge de choix',
      titre: 'Ce que l’on ne contrôle pas',
      corps:
        '<p>Nous ne contrôlons pas ce qui nous entoure.</p>' +
        '<p>Mais nous pouvons contrôler deux choses :<br>nos actions… et nos réactions.</p>' +
        '<p class="citation"><strong>On ne respire pas pour changer le monde,</strong><br><strong>mais pour retrouver un peu plus de liberté dans la manière d’y répondre.</strong></p>'
    },
    {
      surtitre: 'Créer un espace intérieur',
      titre: 'La respiration crée un espace de retour à soi',
      corps:
        '<p>Respirer ne cherche pas à effacer ce que l’on ressent.</p>' +
        '<p>C’est une façon de revenir doucement à soi, de prendre un peu de recul, et de laisser les choses se poser.</p>' +
        '<p>Cela permet d’accueillir ce qui est là, sans se juger, et de lui redonner sa juste place.</p>' +
        '<p><strong>Dans les moments d’inconfort, la respiration devient un chemin simple pour revenir à soi et retrouver un peu de sécurité intérieure.</strong></p>'
    },
    {
      surtitre: 'Laisser le souffle circuler',
      titre: 'Inspire & Expire',
      corps:
        '<div class="deux-cartes">' +
          '<div class="carte"><h3>À l’inspiration</h3>' +
            '<p>Inspire doucement par le nez. Laisse le ventre se gonfler naturellement.</p>' +
            '<p>Si cela t’aide, tu peux imaginer que tu inspires une <strong>lumière douce</strong>, qui vient apporter un peu d’espace, de chaleur ou de calme à l’intérieur de toi.</p></div>' +
          '<div class="carte"><h3>À l’expiration</h3>' +
            '<p>Expire doucement par la bouche. Le ventre redescend sans effort.</p>' +
            '<p>Tu peux imaginer que ton expiration emporte <strong>ce dont tu ne souhaites plus t’encombrer</strong>, sans chercher à faire disparaître ce que tu ressens.</p></div>' +
        '</div>' +
        '<p class="citation"><strong>Inspire ce qui te fait du bien.</strong><br><strong>Expire ce qui ne te convient plus.</strong><br>Le plus important n’est pas l’amplitude, mais le confort. Reste à l’écoute de ce qui te semble juste.</p>'
    },
    {
      surtitre: 'Écouter son besoin du moment',
      titre: 'Choisir son juste rythme',
      corps:
        '<div class="trois-cartes">' +
          '<div class="carte"><h3>Retrouver l’équilibre</h3><b>5 s / 5 s</b><p>Un rythme simple et régulier pour revenir à soi.</p></div>' +
          '<div class="carte"><h3>Ralentir</h3><b>4 s / 6 s ou 3 s / 5 s</b><p>Pour accompagner le calme et relâcher progressivement.</p></div>' +
          '<div class="carte"><h3>Dynamiser</h3><b>6 s / 4 s ou 5 s / 3 s</b><p>Pour soutenir l’énergie et la mise en mouvement.</p></div>' +
        '</div>' +
        '<p><strong>Il n’existe pas de bon rythme universel.</strong><br><strong>Il y a seulement celui dans lequel ta respiration reste fluide et confortable.</strong></p>'
    },
    {
      surtitre: 'D’un outil vers une ressource',
      titre: 'Avec le temps',
      corps:
        '<p>Pratiquer régulièrement ne sert pas seulement à se détendre sur le moment.</p>' +
        '<p>Avec le temps, on apprend à mieux se connaître. À reconnaître plus tôt ce qui se passe en soi. Et à créer plus facilement un espace avant d’agir ou de réagir.</p>' +
        '<p>Petit à petit, la respiration devient un repère naturel. Un espace intérieur que tu sauras retrouver facilement.</p>' +
        '<p>Une manière de <strong>prendre soin de son Hêtre</strong> : revenir à soi avec douceur, s’écouter, et accueillir ce qui est là.</p>' +
        '<p><strong>La respiration ne change pas forcément ce qui se passe autour de nous. Mais elle peut changer la manière dont nous le traversons et le percevons.</strong></p>' +
        '<p class="citation">Pour cela, tu n’as rien à réussir, rien à forcer. Laisse simplement faire, de la manière la plus juste et la plus confortable pour toi, en faisant confiance à tes ressentis.</p>'
    }
  ];

  // La page « Inspire & Expire » : l'explication de la respiration.
  var DIAPO_RESPIRATION = 3;

  var PRESELECTIONS = [
    { id: 'ralentir', nom: 'Ralentir', rythme: '4 / 6', icone: 'ralentir', mode: 'simple', inspire: 4, expire: 6 },
    { id: 'calme', nom: 'Retrouver le calme', rythme: '4 / 6 → 5 / 5', icone: 'retrouver-calme', mode: 'calme' },
    { id: 'equilibre', nom: 'Équilibre', rythme: '5 / 5', icone: 'equilibre', mode: 'simple', inspire: 5, expire: 5 },
    { id: 'dynamisme', nom: 'Retrouver du dynamisme', rythme: '6 / 4 → 5 / 5', icone: 'retrouver-dynamisme', mode: 'dynamisme' },
    { id: 'dynamiser', nom: 'Dynamiser', rythme: '6 / 4', icone: 'dynamiser', mode: 'simple', inspire: 6, expire: 4 }
  ];

  var AVANTAGES = [
    'La durée de ta séance, de 1 à 20 minutes',
    'Ton rythme, de 2 à 8 secondes pour inspirer et pour expirer',
    'Commencer par l’expiration',
    'Les préréglages Ralentir et Dynamiser',
    'Les enchaînements Retrouver le calme et Retrouver du dynamisme',
    'Tes propres étapes avec Personnaliser',
    'Le bâton de pluie qui accompagne ton souffle'
  ];

  var CONFIDENTIALITE = 'https://prendresoindesonhetre-rgb.github.io/Mon-oxyg-ne/confidentialite.html';
  // Avant la séance : 3 s pour s'installer, puis un décompte doux 3, 2, 1.
  var INSTALLATION = 3;
  var DECOMPTE = 3;
  var PREPARATION = INSTALLATION + DECOMPTE;

  // Séance offerte : la cohérence cardiaque de base.
  var GRATUIT = { mode: 'simple', durationMin: 5, inhaleSec: 5, exhaleSec: 5, startWithInhale: true, etapes: [] };

  var ICONES = {
    cadenas: '<svg class="cadenas" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/><rect x="5.5" y="10.5" width="13" height="10" rx="2.6"/></svg>',
    etoile: '<svg class="etoile" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5c.6 4.6 2.9 6.9 7.5 7.5-4.6.6-6.9 2.9-7.5 7.5-.6-4.6-2.9-6.9-7.5-7.5 4.6-.6 6.9-2.9 7.5-7.5Z"/><path d="M19 15.5c.25 1.9 1.1 2.75 3 3-1.9.25-2.75 1.1-3 3-.25-1.9-1.1-2.75-3-3 1.9-.25 2.75-1.1 3-3Z"/></svg>',
    coche: '<svg class="coche" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.2 4.2L19 7"/></svg>',
    personnaliser: '<svg class="icone-perso" viewBox="0 0 32 32" aria-hidden="true"><path d="M9 7c6 1 10 5 10 11-5 1-10-2-12-6-1-2-1-4-1-5h3Z"/><path d="M11 9c3 3 5 6 6 10"/><path d="M20 9h8M22 16h6M19 23h9"/><circle cx="23" cy="9" r="1.7"/><circle cx="25" cy="16" r="1.7"/><circle cx="22" cy="23" r="1.7"/></svg>',
    livre: '<svg class="icone-relire" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 6.5C10 5 7.2 4.6 4 5v13c3.2-.4 6 0 8 1.5 2-1.5 4.8-1.9 8-1.5V5c-3.2-.4-6 0-8 1.5Z"/><path d="M12 6.5v13"/></svg>',
    souffle: '<svg class="icone-relire" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9h11a3 3 0 1 0-3-3"/><path d="M3 13h15a3 3 0 1 1-3 3"/><path d="M3 17h6"/></svg>',
    pause: '<rect x="8" y="5" width="8" height="30" rx="3"></rect><rect x="24" y="5" width="8" height="30" rx="3"></rect>',
    lecture: '<path d="M11 6 L32 20 L11 34 Z"></path>'
  };

  var dansAppli = !!(window.MonOxygeneEcran || window.MonOxygeneAchats) ||
    window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  var estIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  var introVue = false;
  try { introVue = !!localStorage.getItem('mon-oxygene-intro-seen'); } catch (_) {}

  var etat = {
    ecran: dansAppli ? (introVue ? 'reglages' : 'intro') : 'accueil',
    diapo: 0,
    reglages: {
      mode: 'simple', durationMin: 5, inhaleSec: 5, exhaleSec: 5, startWithInhale: true,
      etapes: [{ durationMin: 2.5, inhaleSec: 4, exhaleSec: 6 }, { durationMin: 2.5, inhaleSec: 5, exhaleSec: 5 }]
    },
    seance: null,
    relecture: false,
    plusOuvert: false,
    codeSaisi: '',
    messageCode: null,
    installation: null,
    verrouEcran: null
  };

  function reglagesEnCours() { return Plus.actif ? etat.reglages : GRATUIT; }

  // ---------- Petits morceaux d'interface ----------

  function compteur(cle, valeur, texte, min, max, verrouille) {
    if (verrouille) {
      return '<button class="compteur verrouille" data-action="plus-requis" aria-label="' + texte + ', disponible avec Mon Oxygène Plus">' +
        ICONES.cadenas + '<span class="compteur-valeur">' + texte + '</span></button>';
    }
    return '<div class="compteur">' +
      '<button data-action="pas" data-cle="' + cle + '" data-sens="-1" aria-label="Diminuer"' + (valeur <= min ? ' disabled' : '') + '>−</button>' +
      '<span class="compteur-valeur">' + texte + '</span>' +
      '<button data-action="pas" data-cle="' + cle + '" data-sens="1" aria-label="Augmenter"' + (valeur >= max ? ' disabled' : '') + '>+</button>' +
    '</div>';
  }

  function ligne(nom, contenu, classe) {
    return '<div class="ligne' + (classe ? ' ' + classe : '') + '"><span class="ligne-nom">' + nom + '</span>' + contenu + '</div>';
  }

  function minicompteur(index, cle, valeur, texte, min, max) {
    return '<div class="mini"><button data-action="etape-pas" data-index="' + index + '" data-cle="' + cle + '" data-sens="-1" aria-label="Diminuer"' + (valeur <= min ? ' disabled' : '') + '>−</button>' +
      '<b>' + texte + '</b>' +
      '<button data-action="etape-pas" data-index="' + index + '" data-cle="' + cle + '" data-sens="1" aria-label="Augmenter"' + (valeur >= max ? ' disabled' : '') + '>+</button></div>';
  }

  function dureeTotaleEtapes(etapes) {
    var total = 0;
    for (var i = 0; i < etapes.length; i++) total += Math.round(Number(etapes[i].durationMin || 0) * 60);
    return total;
  }

  function lignesRespiration(r, verrouille) {
    if (r.mode === 'perso') {
      var etapes = '';
      for (var i = 0; i < r.etapes.length; i++) {
        var e = r.etapes[i];
        var cycle = e.inhaleSec + e.exhaleSec;
        etapes += '<div class="etape">' +
          '<strong>Étape ' + (i + 1) + '</strong>' +
          minicompteur(i, 'durationMin', Math.round(e.durationMin * 60), R.formaterDuree(Math.round(e.durationMin * 60)), cycle, 1200) +
          minicompteur(i, 'inhaleSec', e.inhaleSec, R.formaterDuree(e.inhaleSec), 2, 8) +
          minicompteur(i, 'exhaleSec', e.exhaleSec, R.formaterDuree(e.exhaleSec), 2, 8) +
          (r.etapes.length > 2 ? '<button class="etape-retirer" data-action="etape-retirer" data-index="' + i + '" aria-label="Retirer l’étape ' + (i + 1) + '">×</button>' : '<span></span>') +
        '</div>';
      }
      return '<div class="enchainement">' +
        '<div class="enchainement-tete"><strong>Mon enchaînement</strong><span>Durée totale : ' + R.formaterDuree(dureeTotaleEtapes(r.etapes)) + '</span></div>' +
        '<div class="etape etapes-entete"><span></span><span>Durée</span><span>Inspire</span><span>Expire</span><span></span></div>' +
        '<div class="etapes">' + etapes + '</div>' +
        '<button class="ajouter-etape" data-action="etape-ajouter">+ Ajouter une étape</button>' +
      '</div>';
    }
    var html = ligne('Durée de la séance', compteur('durationMin', r.durationMin, r.durationMin + ' min', 1, 20, verrouille));
    if (r.mode === 'calme' || r.mode === 'dynamisme') {
      var texte = r.mode === 'calme' ? '4 / 6 puis 5 / 5' : '6 / 4 puis 5 / 5';
      return html + ligne('Rythme', '<span class="rythme-fixe">' + texte + '</span>');
    }
    return html +
      ligne('Inspiration', compteur('inhaleSec', r.inhaleSec, R.formaterDuree(r.inhaleSec), 2, 8, verrouille)) +
      ligne('Expiration', compteur('exhaleSec', r.exhaleSec, R.formaterDuree(r.exhaleSec), 2, 8, verrouille));
  }

  function ligneDebut(r, verrouille) {
    var inspire = r.startWithInhale;
    function pilule(valeur, texte, actif) {
      if (verrouille && !actif) return '<button class="pilule verrouillee" data-action="plus-requis">' + ICONES.cadenas + texte + '</button>';
      return '<button class="pilule' + (actif ? ' active' : '') + '" data-action="debut" data-valeur="' + valeur + '" aria-pressed="' + actif + '">' + texte + '</button>';
    }
    return ligne('Commencer par', '<div class="choix-debut">' + pilule('inspire', 'Inspire', inspire) + pilule('expire', 'Expire', !inspire) + '</div>');
  }

  function preselectionChoisie(r) {
    if (r.mode === 'calme' || r.mode === 'dynamisme' || r.mode === 'perso') return r.mode;
    for (var i = 0; i < PRESELECTIONS.length; i++) {
      var p = PRESELECTIONS[i];
      if (p.mode === 'simple' && p.inspire === r.inhaleSec && p.expire === r.exhaleSec) return p.id;
    }
    return null;
  }

  function tuiles(r, verrouille) {
    var choisie = preselectionChoisie(r);
    var html = '';
    function tuile(id, icone, nom, rythme, action) {
      var bloquee = verrouille && id !== 'equilibre';
      return '<button class="tuile' + (choisie === id ? ' choisie' : '') + (bloquee ? ' verrouillee' : '') + '" data-action="' + (bloquee ? 'plus-requis' : action) + '" data-id="' + id + '" aria-pressed="' + (choisie === id) + '">' +
        '<span class="tuile-icone">' + icone + '</span>' +
        '<span class="tuile-texte"><strong>' + nom + '</strong><span>' + rythme + '</span></span>' +
        (bloquee ? ICONES.cadenas : '') +
      '</button>';
    }
    for (var i = 0; i < PRESELECTIONS.length; i++) {
      var p = PRESELECTIONS[i];
      html += tuile(p.id, '<img src="./assets/presets/' + p.icone + '.png" alt="" draggable="false">', p.nom, p.rythme, 'preselection');
    }
    return '<div class="tuiles">' + html + '</div>';
  }

  // « Personnaliser » : un petit bouton à côté du titre des préréglages.
  function pastillePerso(r, verrouille) {
    var actif = r.mode === 'perso';
    return '<button class="pilule pastille-perso' + (actif ? ' active' : '') + (verrouille ? ' verrouillee' : '') + '" data-action="' + (verrouille ? 'plus-requis' : 'perso') + '" aria-pressed="' + actif + '">' +
      (verrouille ? ICONES.cadenas : ICONES.personnaliser) + 'Personnaliser</button>';
  }

  function ligneBaton(verrouille) {
    if (verrouille) {
      return ligne('Bâton de pluie', '<button class="pilule verrouillee" data-action="plus-requis">' + ICONES.cadenas + 'Plus</button>', 'ligne-baton');
    }
    var pourcent = Math.round(Baton.volume * 100);
    return ligne('Bâton de pluie',
      '<div class="baton' + (Baton.actif ? '' : ' eteint') + '">' +
        '<button class="pilule' + (Baton.actif ? ' active' : '') + '" data-action="baton-basculer" aria-pressed="' + Baton.actif + '">' + (Baton.actif ? 'Activé' : 'Sans son') + '</button>' +
        '<input class="baton-volume" type="range" min="0" max="100" step="1" value="' + pourcent + '" aria-label="Volume du bâton de pluie">' +
        '<span class="baton-pourcent">' + pourcent + '&nbsp;%</span>' +
      '</div>', 'ligne-baton');
  }

  function pastillePlus() {
    return '<button class="pastille-plus' + (Plus.actif ? ' active' : '') + '" data-action="ouvrir-plus">' +
      ICONES.etoile + (Plus.actif ? 'Plus' : 'Débloquer Plus') + '</button>';
  }

  // ---------- Écrans ----------

  function ecranAccueil() {
    var conseil = 'Tu peux aussi ouvrir Mon Oxygène directement dans ton navigateur.';
    if (estIOS) conseil = 'Sur iPhone : ouvre ce lien dans Safari, touche le bouton Partager, puis « Ajouter à l’écran d’accueil ».';
    else if (!etat.installation) conseil = 'Sur Android : ouvre le menu du navigateur puis choisis « Installer l’application » ou « Ajouter à l’écran d’accueil ».';
    return '<section class="ecran fond-arbre">' +
      '<div class="panneau panneau-accueil" data-ajuster>' +
        '<div class="surtitre">Prendre un temps pour soi</div>' +
        '<h1 class="grand-titre">Mon Oxygène</h1>' +
        '<p class="accueil-texte">Un espace de respiration guidée que tu peux installer simplement sur ton téléphone, puis retrouver comme une application.</p>' +
        '<div class="accueil-boutons">' +
          '<button class="bouton-principal" data-action="installer">Installer Mon Oxygène</button>' +
          '<button class="bouton-secondaire" data-action="ouvrir">Ouvrir l’application</button>' +
        '</div>' +
        '<p class="accueil-conseil">' + conseil + '</p>' +
      '</div></section>';
  }

  function ecranIntro() {
    var d = DIAPOS[etat.diapo];
    var derniere = etat.diapo === DIAPOS.length - 1;
    var points = '';
    for (var i = 0; i < DIAPOS.length; i++) {
      points += '<button class="point' + (i === etat.diapo ? ' actif' : '') + '" data-action="diapo" data-index="' + i + '" aria-label="Page ' + (i + 1) + '"></button>';
    }
    return '<section class="ecran fond-arbre">' +
      '<div class="panneau panneau-intro" data-ajuster>' +
        (etat.relecture ? '<button class="fermer" data-action="fermer-intro" aria-label="Revenir à ma respiration">×</button>' : '') +
        '<div class="intro-texte">' +
          '<div class="surtitre">' + d.surtitre + '</div>' +
          '<h1 class="grand-titre">' + d.titre + '</h1>' +
          '<div class="intro-corps">' + d.corps + '</div>' +
        '</div>' +
        '<nav class="intro-nav">' +
          '<button class="bouton-nav" data-action="precedent"' + (etat.diapo === 0 ? ' disabled' : '') + '>Précédent</button>' +
          '<div class="points">' + points + '</div>' +
          '<button class="bouton-nav suivant" data-action="suivant">' + (derniere ? (etat.relecture ? 'Ma respiration' : 'Configurer') : 'Suivant') + '</button>' +
        '</nav>' +
      '</div></section>';
  }

  function ecranReglages() {
    var verrouille = !Plus.actif;
    var r = reglagesEnCours();
    return '<section class="ecran fond-arbre">' +
      '<div class="marque">Mon Oxygène</div>' +
      '<nav class="relire">' +
        '<button data-action="relire" data-index="0">' + ICONES.livre + 'Relire l’introduction</button>' +
        '<button data-action="relire" data-index="' + DIAPO_RESPIRATION + '">' + ICONES.souffle + 'Comment respirer</button>' +
      '</nav>' +
      '<div class="panneau panneau-reglages" data-ajuster>' +
        '<header class="reglages-tete"><h1 class="titre-reglages">Créer ma respiration</h1>' + pastillePlus() + '</header>' +
        '<p class="sous-titre">Prends le temps qui te semble juste.</p>' +
        '<div class="reglages-corps' + (r.mode === 'perso' ? ' mode-perso' : '') + '">' +
          '<section class="bloc zone-respiration">' +
            '<h2 class="bloc-titre">Ma respiration</h2>' +
            lignesRespiration(r, verrouille) +
          '</section>' +
          '<div class="bloc zone-debut">' + ligneDebut(r, verrouille) + '</div>' +
          '<section class="bloc zone-choix">' +
            '<div class="choix-tete"><h2 class="bloc-titre">Préréglages de respiration</h2>' + pastillePerso(r, verrouille) + '</div>' +
            tuiles(r, verrouille) +
          '</section>' +
          '<section class="bloc zone-baton">' +
            '<h2 class="bloc-titre">Ambiance</h2>' +
            ligneBaton(verrouille) +
          '</section>' +
        '</div>' +
        '<div class="reglages-pied">' +
          '<p class="securite"><strong>Écoute ton corps.</strong> La respiration doit toujours rester confortable. En cas de vertige, gêne, essoufflement ou malaise, arrête l’exercice et reprends simplement ta respiration naturelle.</p>' +
          '<button class="bouton-commencer" data-action="commencer">Commencer ma séance</button>' +
        '</div>' +
      '</div></section>';
  }

  function ecranSeance() {
    var r = etat.seance.plan[0];
    var total = Math.ceil(R.dureePlan(etat.seance.plan));
    return '<section class="ecran fond-courbe seance">' +
      '<div class="marque marque-seance">Mon Oxygène</div>' +
      '<div class="seance-boutons">' +
        '<button class="rond" data-action="pause" aria-label="Pause"><svg id="iconePause" viewBox="0 0 40 40">' + ICONES.pause + '</svg></button>' +
        '<button class="rond" data-action="arreter" aria-label="Arrêter"><svg viewBox="0 0 40 40"><rect x="8" y="8" width="24" height="24" rx="4"></rect></svg></button>' +
      '</div>' +
      '<div class="phase">' +
        '<div class="phase-titre fondu" id="phaseTitre"></div>' +
        '<div class="phase-consigne fondu" id="phaseConsigne"></div>' +
        '<div class="phase-compte" id="phaseCompte"></div>' +
      '</div>' +
      '<div class="scene-vague" id="sceneVague"' + (etat.seance.commencee ? '' : ' style="opacity:0"') + '>' +
        '<svg viewBox="0 0 1000 500" preserveAspectRatio="none" aria-hidden="true">' +
          '<defs><linearGradient id="degradeVague" x1="0" y1="0" x2="1" y2="0">' +
            '<stop offset="0%" stop-color="#48d3dc"></stop><stop offset="52%" stop-color="#69beeb"></stop><stop offset="100%" stop-color="#9e80e2"></stop>' +
          '</linearGradient></defs>' +
          '<path class="vague-halo" id="vagueHalo"></path>' +
          '<path class="vague-ligne" id="vagueLigne"></path>' +
        '</svg>' +
        '<img src="./assets/lotus.png" class="lotus" id="lotus" alt="">' +
      '</div>' +
      '<div class="progression">' +
        '<div class="progression-gauche">' +
          '<div class="rythme" id="rythme">Inspire ' + R.formaterDuree(r.inhaleSec) + ' · Expire ' + R.formaterDuree(r.exhaleSec) + '</div>' +
          '<div class="piste"><div class="piste-ombre" id="pisteOmbre"></div><div class="piste-remplie" id="pisteRemplie"></div><div class="piste-curseur" id="pisteCurseur"></div></div>' +
        '</div>' +
        '<div class="minuteur" id="minuteur">' + Math.floor(total / 60) + ':' + String(total % 60).padStart(2, '0') + '</div>' +
      '</div>' +
    '</section>';
  }

  function texteEssai(periode) {
    var m = /^P(\d+)([DWMY])$/.exec(periode || '');
    if (!m) return 'Essai gratuit';
    var n = Number(m[1]);
    var unite = { D: ['jour', 'jours'], W: ['semaine', 'semaines'], M: ['mois', 'mois'], Y: ['an', 'ans'] }[m[2]];
    if (m[2] === 'W') return n + ' ' + unite[n > 1 ? 1 : 0] + (n > 1 ? ' gratuites' : ' gratuite');
    return n + ' ' + unite[n > 1 ? 1 : 0] + (n > 1 ? ' gratuits' : ' gratuit');
  }

  function texteOffre(o) {
    if (o.type === 'unique') return { titre: 'À vie', detail: o.prix + ' en une seule fois' };
    var annuel = o.periode === 'P1Y';
    var prix = o.prix + (annuel ? ' par an' : ' par mois');
    return { titre: annuel ? 'À l’année' : 'Au mois', detail: o.essai ? texteEssai(o.essai) + ', puis ' + prix : prix };
  }

  function zoneOffres() {
    var g = Plus.google;
    if (Plus.actif) {
      if (Plus.source === 'cadeau') {
        return '<p class="plus-etat">' + ICONES.coche + (Plus.finCadeau ? 'Mon Oxygène Plus t’est offert jusqu’au ' + Plus.dateLisible(Plus.finCadeau) + '.' : 'Mon Oxygène Plus t’est offert à vie.') + '</p>';
      }
      return '<p class="plus-etat">' + ICONES.coche + 'Mon Oxygène Plus est actif. Merci pour ton soutien !</p>' +
        (g.aVie ? '' : '<button class="bouton-secondaire" data-action="gerer">Gérer mon abonnement</button>');
    }
    if (!Plus.android) {
      return '<p class="plus-info">L’abonnement se prend dans l’appli Android Mon Oxygène, sur Google Play.</p>';
    }
    if (!g.pret) {
      return g.erreur
        ? '<p class="plus-info">Les offres ne sont pas disponibles pour le moment. Vérifie ta connexion et que Google Play est à jour.</p><button class="bouton-secondaire" data-action="restaurer">Réessayer</button>'
        : '<p class="plus-info">Chargement des offres…</p>';
    }
    var html = '';
    var abonnement = false;
    for (var i = 0; i < g.offres.length; i++) {
      var t = texteOffre(g.offres[i]);
      if (g.offres[i].type !== 'unique') abonnement = true;
      html += '<button class="offre" data-action="acheter" data-index="' + i + '"><strong>' + t.titre + '</strong><span>' + t.detail + '</span></button>';
    }
    if (!html) html = '<p class="plus-info">Les offres arrivent très bientôt.</p>';
    if (g.enAttente) html += '<p class="plus-info">Ton paiement est en attente de validation par Google Play.</p>';
    if (abonnement) html += '<p class="mentions">Renouvellement automatique, sans engagement : tu peux annuler à tout moment dans Google Play, rubrique Abonnements. L’essai gratuit est réservé à une première souscription.</p>';
    html += '<p class="mentions"><a href="' + CONFIDENTIALITE + '" target="_blank" rel="noopener">Politique de confidentialité</a></p>';
    return '<div class="offres">' + html + '</div><button class="lien" data-action="restaurer">Restaurer mes achats</button>';
  }

  function fenetrePlus() {
    var avantages = '';
    for (var i = 0; i < AVANTAGES.length; i++) avantages += '<li>' + ICONES.coche + '<span>' + AVANTAGES[i] + '</span></li>';
    var code = '';
    if (!Plus.actif || Plus.source === 'cadeau') {
      code = '<div class="code">' +
        '<label for="codeCadeau">J’ai un code cadeau</label>' +
        '<div class="code-ligne"><input id="codeCadeau" placeholder="OXY-…" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" value="' + etat.codeSaisi.replace(/"/g, '&quot;') + '">' +
        '<button class="bouton-principal" data-action="activer-code">Activer</button></div>' +
        (etat.messageCode ? '<p class="code-message' + (etat.messageCode.ok ? ' reussi' : '') + '">' + etat.messageCode.message + '</p>' : '') +
      '</div>';
    }
    return '<div class="voile" data-action="fermer-plus-fond">' +
      '<div class="panneau fenetre-plus" role="dialog" aria-modal="true" aria-label="Mon Oxygène Plus" data-ajuster>' +
        '<button class="fermer" data-action="fermer-plus" aria-label="Fermer">×</button>' +
        '<header class="plus-tete">' + ICONES.etoile + '<div><h2>Mon Oxygène Plus</h2><p>Ta respiration, entièrement à ta mesure.</p></div></header>' +
        '<div class="plus-corps">' +
          '<ul class="avantages">' + avantages + '</ul>' +
          '<div class="plus-actions">' + zoneOffres() + code + '</div>' +
        '</div>' +
      '</div></div>';
  }

  // ---------- Affichage et ajustement à l'écran ----------

  function afficher() {
    annulerImage();
    var html = '';
    if (etat.ecran === 'accueil') html = ecranAccueil();
    else if (etat.ecran === 'intro') html = ecranIntro();
    else if (etat.ecran === 'reglages') html = ecranReglages();
    else if (etat.ecran === 'seance') html = ecranSeance();
    if (etat.plusOuvert && etat.ecran !== 'seance') html += fenetrePlus();
    app.innerHTML = html;
    ajuster();
    if (etat.ecran === 'seance') animer(performance.now());
  }

  // Largeur du cadre blanc, comme dans la v83 : de 49 % de la largeur sur un écran très allongé
  // à 64 % sur un écran presque carré (tablette), sans jamais être plus étroit que la mise en page téléphone.
  function ajusterLargeur() {
    var l = window.innerWidth, h = window.innerHeight;
    var long = Math.max(l, h), allonge = long / Math.max(1, Math.min(l, h));
    var carre = R.bornes((1.82 - allonge) / 0.49, 0, 1);
    var commeAvant = R.bornes(long * (0.49 + 0.15 * carre), 300, 820);
    var telephone = Math.min(l * 0.8 - 28, R.bornes(l * 0.3 + 220, 380, 880));
    var largeur = Math.min(Math.max(commeAvant, telephone), l * 0.82 - 28);
    document.documentElement.style.setProperty('--largeur-cadre', Math.round(largeur) + 'px');
  }

  // Chaque panneau garde la plus grande taille de texte qui tient entièrement à l'écran.
  function deborde(el) {
    if (el.scrollHeight > el.clientHeight + 1 || el.scrollWidth > el.clientWidth + 1) return true;
    // Un bouton qui dépasse dans la marge intérieure du cadre compte aussi.
    var cadre = el.getBoundingClientRect();
    var limite = cadre.right - parseFloat(getComputedStyle(el).paddingRight) + 1;
    var controles = el.querySelectorAll('button:not(.fermer), input, .compteur');
    for (var i = 0; i < controles.length; i++) {
      if (controles[i].getBoundingClientRect().right > limite) return true;
    }
    return false;
  }
  function ajuster() {
    ajusterLargeur();
    var panneaux = app.querySelectorAll('[data-ajuster]');
    for (var i = 0; i < panneaux.length; i++) {
      var el = panneaux[i];
      el.style.fontSize = '';
      var taille = parseFloat(getComputedStyle(el).fontSize);
      var essais = 0;
      while (deborde(el) && taille > 9 && essais < 60) {
        taille -= 0.25;
        el.style.fontSize = taille + 'px';
        essais++;
      }
    }
  }

  var minuterieAjustement = 0;
  function ajusterPlusTard() {
    clearTimeout(minuterieAjustement);
    minuterieAjustement = setTimeout(ajuster, 80);
  }
  window.addEventListener('resize', ajusterPlusTard);
  window.addEventListener('orientationchange', function () { setTimeout(ajuster, 250); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(ajuster);

  function montrerToast(message) {
    toast.textContent = message;
    toast.classList.add('visible');
    clearTimeout(montrerToast.minuterie);
    montrerToast.minuterie = setTimeout(function () { toast.classList.remove('visible'); }, 2600);
  }

  // ---------- Séance ----------

  function demanderVerrou() {
    try {
      if ('wakeLock' in navigator) {
        navigator.wakeLock.request('screen').then(function (v) { etat.verrouEcran = v; }).catch(function () {});
      }
    } catch (_) {}
  }
  function libererVerrou() {
    if (etat.verrouEcran) {
      try { etat.verrouEcran.release().catch(function () {}); } catch (_) {}
      etat.verrouEcran = null;
    }
  }

  function commencerSeance() {
    var r = reglagesEnCours();
    etat.seance = {
      plan: R.construirePlan(r),
      debutInspire: !!r.startWithInhale,
      sonAutorise: Plus.actif,
      // Le temps de la séance commence après la préparation : il est négatif pendant celle-ci.
      debut: performance.now() + PREPARATION * 1000,
      pauseTotale: 0,
      pauseDebut: 0,
      enPause: false,
      image: 0
    };
    etat.ecran = 'seance';
    etat.plusOuvert = false;
    demanderVerrou();
    if (Plus.actif) Baton.precharger();
    afficher();
  }

  function annulerImage() {
    if (etat.seance && etat.seance.image) cancelAnimationFrame(etat.seance.image);
    if (etat.seance) etat.seance.image = 0;
  }

  function arreterSeance() {
    annulerImage();
    Baton.arreter();
    libererVerrou();
    etat.seance = null;
    etat.ecran = 'reglages';
    afficher();
  }

  function basculerPause() {
    var s = etat.seance;
    if (!s) return;
    var maintenant = performance.now();
    if (!s.enPause) {
      s.enPause = true;
      s.pauseDebut = maintenant;
      Baton.arreter();
    } else {
      s.enPause = false;
      s.pauseTotale += maintenant - s.pauseDebut;
      s.pauseDebut = 0;
    }
    var icone = document.getElementById('iconePause');
    if (icone) icone.innerHTML = s.enPause ? ICONES.lecture : ICONES.pause;
  }

  function tempsEcoule(s, maintenant) {
    var instant = s.enPause ? s.pauseDebut : maintenant;
    return (instant - s.debut - s.pauseTotale) / 1000;
  }

  // Change un texte de la séance, avec un fondu quand il change vraiment.
  function ecrire(id, texte) {
    var el = document.getElementById(id);
    if (el.textContent === texte) return;
    el.textContent = texte;
    if (el.classList.contains('fondu')) {
      el.classList.remove('apparition');
      void el.offsetWidth;
      el.classList.add('apparition');
    }
  }

  // Préparation : la courbe apparaît en fondu, le lotus attend là où le souffle va commencer
  // et respire tout doucement ; rien ne défile et le minuteur ne compte pas encore.
  function animerPreparation(s, avantDepart) {
    var titre = document.getElementById('phaseTitre');
    var installation = avantDepart > DECOMPTE;
    titre.classList.toggle('compte', !installation);
    ecrire('phaseTitre', installation ? 'Installe-toi' : String(Math.ceil(avantDepart)));
    ecrire('phaseConsigne', installation
      ? 'Relâche les épaules et laisse ton souffle se poser'
      : (s.debutInspire ? 'Prépare-toi à inspirer par le nez' : 'Prépare-toi à expirer par la bouche'));
    ecrire('phaseCompte', '');

    var ecouleDepuisDebut = PREPARATION - avantDepart;
    document.getElementById('sceneVague').style.opacity = Math.min(1, Math.max(0, ecouleDepuisDebut / 1.6)).toFixed(3);
    var chemin = R.cheminVague(s.plan, 0, s.debutInspire);
    document.getElementById('vagueLigne').setAttribute('d', chemin);
    document.getElementById('vagueHalo').setAttribute('d', chemin);

    var lotus = document.getElementById('lotus');
    var y = 250 - 190.5 * R.vague(s.plan, 0, s.debutInspire);
    var echelle = 0.655 + 0.28 * R.ampleur(s.plan, 0, s.debutInspire) + 0.035 * (1 - Math.cos(ecouleDepuisDebut * Math.PI * 2 / 3)) / 2;
    lotus.style.top = (y / 5) + '%';
    lotus.style.transform = 'translate(-50%,-50%) scale(' + echelle.toFixed(4) + ')';
  }

  function animer(maintenant) {
    var s = etat.seance;
    if (!s || etat.ecran !== 'seance') return;
    var ecoule = tempsEcoule(s, maintenant);
    var total = R.dureePlan(s.plan);

    if (ecoule < 0) {
      animerPreparation(s, -ecoule);
      s.image = requestAnimationFrame(animer);
      return;
    }
    if (!s.commencee) {
      s.commencee = true;
      document.getElementById('sceneVague').style.opacity = '';
      document.getElementById('phaseTitre').classList.remove('compte');
    }

    Baton.synchroniser({ ecoule: ecoule, plan: s.plan, debutInspire: s.debutInspire, enPause: s.enPause, sonAutorise: s.sonAutorise });

    var reste = Math.max(0, total - ecoule);
    if (reste <= 0) {
      arreterSeance();
      montrerToast('Séance terminée.');
      return;
    }

    var r = R.rythmeA(s.plan, ecoule);
    var inspiration = R.estInspiration(s.plan, ecoule, s.debutInspire);
    ecrire('phaseTitre', inspiration ? 'Inspire' : 'Expire');
    ecrire('phaseConsigne', R.consigne(s.plan, ecoule, inspiration));
    document.getElementById('phaseCompte').textContent = R.resteDePhase(s.plan, ecoule, s.debutInspire).toFixed(1) + ' s';
    document.getElementById('rythme').textContent = 'Inspire ' + R.formaterDuree(r.inhaleSec) + '   ·   Expire ' + R.formaterDuree(r.exhaleSec);

    var chemin = R.cheminVague(s.plan, ecoule, s.debutInspire);
    document.getElementById('vagueLigne').setAttribute('d', chemin);
    document.getElementById('vagueHalo').setAttribute('d', chemin);

    var lotus = document.getElementById('lotus');
    var y = 250 - 190.5 * R.vague(s.plan, ecoule, s.debutInspire);
    var echelle = 0.655 + 0.28 * R.ampleur(s.plan, ecoule, s.debutInspire);
    lotus.style.top = (y / 5) + '%';
    lotus.style.transform = 'translate(-50%,-50%) scale(' + echelle.toFixed(4) + ')';

    var pourcent = (Math.max(0, Math.min(1, ecoule / total)) * 100).toFixed(3) + '%';
    document.getElementById('pisteRemplie').style.width = pourcent;
    document.getElementById('pisteOmbre').style.width = pourcent;
    document.getElementById('pisteCurseur').style.left = pourcent;

    var secondes = Math.ceil(reste);
    document.getElementById('minuteur').textContent = Math.floor(secondes / 60) + ':' + String(secondes % 60).padStart(2, '0');

    s.image = requestAnimationFrame(animer);
  }

  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible' && etat.ecran === 'seance' && !etat.verrouEcran) demanderVerrou();
  });

  // ---------- Réglages ----------

  function changerReglage(cle, sens) {
    var r = etat.reglages;
    if (cle === 'durationMin') r.durationMin = R.bornes(r.durationMin + sens, 1, 20);
    else r[cle] = R.bornes(r[cle] + sens, 2, 8);
  }

  function changerEtape(index, cle, sens) {
    var e = etat.reglages.etapes[index];
    if (!e) return;
    if (cle === 'durationMin') {
      // La durée d'une étape avance d'un cycle complet (inspire + expire) à la fois.
      var cycle = Math.max(4, Number(e.inhaleSec || 5) + Number(e.exhaleSec || 5));
      var actuelle = Math.max(cycle, Math.round(Number(e.durationMin || 0) * 60));
      e.durationMin = R.bornes(actuelle + (sens > 0 ? cycle : -cycle), cycle, 1200) / 60;
    } else {
      e[cle] = R.bornes(e[cle] + sens, 2, 8);
    }
    etat.reglages.durationMin = dureeTotaleEtapes(etat.reglages.etapes) / 60;
  }

  function choisirPreselection(id) {
    var r = etat.reglages;
    for (var i = 0; i < PRESELECTIONS.length; i++) {
      var p = PRESELECTIONS[i];
      if (p.id !== id) continue;
      if (r.mode === 'perso') r.durationMin = Math.max(1, Math.min(20, Math.round(r.durationMin)));
      r.mode = p.mode;
      if (p.mode === 'simple') { r.inhaleSec = p.inspire; r.exhaleSec = p.expire; }
    }
  }

  // ---------- Événements ----------

  function action(cible) {
    var a = cible.getAttribute('data-action');
    var d = cible.dataset;
    switch (a) {
      case 'installer': installer(); return;
      case 'ouvrir': etat.ecran = 'intro'; break;
      case 'precedent': if (etat.diapo > 0) etat.diapo--; break;
      case 'suivant':
        if (etat.diapo === DIAPOS.length - 1) {
          try { localStorage.setItem('mon-oxygene-intro-seen', '1'); } catch (_) {}
          etat.ecran = 'reglages';
          etat.relecture = false;
        } else etat.diapo++;
        break;
      case 'diapo': etat.diapo = Number(d.index); break;
      case 'relire': etat.diapo = Number(d.index); etat.relecture = true; etat.ecran = 'intro'; break;
      case 'fermer-intro': etat.relecture = false; etat.ecran = 'reglages'; break;
      case 'pas': if (!Plus.actif) return ouvrirPlus(); changerReglage(d.cle, Number(d.sens)); break;
      case 'debut': if (!Plus.actif) return ouvrirPlus(); etat.reglages.startWithInhale = d.valeur === 'inspire'; break;
      case 'preselection': if (!Plus.actif) return ouvrirPlus(); choisirPreselection(d.id); break;
      case 'perso':
        if (!Plus.actif) return ouvrirPlus();
        etat.reglages.mode = 'perso';
        etat.reglages.durationMin = dureeTotaleEtapes(etat.reglages.etapes) / 60;
        break;
      case 'etape-pas': changerEtape(Number(d.index), d.cle, Number(d.sens)); break;
      case 'etape-retirer':
        if (etat.reglages.etapes.length > 2) etat.reglages.etapes.splice(Number(d.index), 1);
        etat.reglages.durationMin = dureeTotaleEtapes(etat.reglages.etapes) / 60;
        break;
      case 'etape-ajouter':
        etat.reglages.etapes.push({ durationMin: 1, inhaleSec: 5, exhaleSec: 5 });
        etat.reglages.durationMin = dureeTotaleEtapes(etat.reglages.etapes) / 60;
        break;
      case 'baton-basculer':
        Baton.basculer();
        if (etat.seance) Baton.relancer();
        break;
      case 'commencer': commencerSeance(); return;
      case 'pause': basculerPause(); return;
      case 'arreter': arreterSeance(); return;
      case 'plus-requis':
      case 'ouvrir-plus': return ouvrirPlus();
      case 'fermer-plus': etat.plusOuvert = false; etat.messageCode = null; break;
      case 'acheter': Plus.acheter(Plus.google.offres[Number(d.index)]); return;
      case 'restaurer': Plus.restaurer(); return;
      case 'gerer': Plus.gerer(); return;
      case 'activer-code': activerCode(); return;
      default: return;
    }
    afficher();
  }

  function ouvrirPlus() {
    etat.plusOuvert = true;
    etat.messageCode = null;
    afficher();
  }

  function activerCode() {
    var saisie = document.getElementById('codeCadeau');
    etat.codeSaisi = saisie ? saisie.value : etat.codeSaisi;
    Plus.activerCode(etat.codeSaisi).then(function (resultat) {
      etat.messageCode = resultat;
      if (resultat.ok) etat.codeSaisi = '';
      afficher();
    });
  }

  app.addEventListener('click', function (evenement) {
    var cible = evenement.target.closest('[data-action]');
    if (!cible || cible.disabled) return;
    // Un clic sur le voile ferme la fenêtre Plus, pas un clic à l'intérieur.
    if (cible.getAttribute('data-action') === 'fermer-plus-fond') {
      if (evenement.target !== cible) return;
      etat.plusOuvert = false;
      etat.messageCode = null;
      afficher();
      return;
    }
    action(cible);
  });

  app.addEventListener('input', function (evenement) {
    var cible = evenement.target;
    if (cible.classList.contains('baton-volume')) {
      Baton.changerVolume(Number(cible.value) / 100);
      var etiquette = app.querySelector('.baton-pourcent');
      if (etiquette) etiquette.innerHTML = Math.round(Baton.volume * 100) + '&nbsp;%';
    } else if (cible.id === 'codeCadeau') {
      etat.codeSaisi = cible.value;
    }
  });

  app.addEventListener('keydown', function (evenement) {
    if (evenement.target.id === 'codeCadeau' && evenement.key === 'Enter') activerCode();
  });
  document.addEventListener('keydown', function (evenement) {
    if (evenement.key === 'Escape' && etat.plusOuvert) { etat.plusOuvert = false; afficher(); }
  });

  // Achats ou code cadeau : les réglages et la fenêtre Plus se mettent à jour (pas pendant une séance).
  Plus.surChangement(function () {
    if (etat.ecran === 'reglages' || etat.plusOuvert) {
      var saisie = document.getElementById('codeCadeau');
      if (saisie) etat.codeSaisi = saisie.value;
      afficher();
    }
  });

  // ---------- Installation de la version web ----------

  window.addEventListener('beforeinstallprompt', function (evenement) {
    evenement.preventDefault();
    etat.installation = evenement;
    if (etat.ecran === 'accueil') afficher();
  });
  window.addEventListener('appinstalled', function () {
    etat.installation = null;
    montrerToast('Mon Oxygène est installé sur ton appareil.');
  });

  function installer() {
    if (etat.installation) {
      var invite = etat.installation;
      invite.prompt();
      invite.userChoice.then(function (choix) {
        if (choix.outcome === 'accepted') {
          etat.installation = null;
          montrerToast('Installation lancée.');
        }
      });
      return;
    }
    montrerToast(estIOS ? 'Safari → Partager → Ajouter à l’écran d’accueil' : 'Menu du navigateur → Installer l’application');
  }

  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener('load', function () { navigator.serviceWorker.register('./sw.js').catch(function () {}); });
  }

  // Verrouille le paysage quand l'appli web est installée (le navigateur l'ignore sinon).
  function verrouillerPaysage() {
    try {
      if (dansAppli && screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(function () {});
    } catch (_) {}
  }
  verrouillerPaysage();
  document.addEventListener('pointerdown', verrouillerPaysage, { once: true, passive: true });

  afficher();
})();
