// Mon Oxygène : les écrans (accueil web, introduction, réglages, séance) et la fenêtre Mon Oxygène Plus.
(function () {
  'use strict';

  var R = window.Respiration;
  var LigneVague = window.LigneVague;
  var Baton = window.BatonDePluie;
  var Plus = window.MonOxygenePlus;
  var app = document.getElementById('app');
  var toast = document.getElementById('toast');

  var DIAPOS = [
    {
      surtitre: 'Respirer en conscience',
      titre: 'Mon Oxygène',
      corps:
        '<p><strong>Respirer est la seule fonction du corps à la fois automatique et que l’on peut contrôler.<br>Lorsqu’on y met de la conscience et du sens, chaque souffle devient un retour à soi.</strong></p>' +
        '<p>Mon Oxygène est une application de respiration guidée pensée comme un espace intérieur.</p>' +
        '<p>Un moment pour accueillir ce qui est là, et laisser un peu plus de place à ce que l’on ressent.</p>' +
        '<p>Nous ne contrôlons pas ce qui nous entoure.</p>' +
        '<p>Mais nous pouvons contrôler deux choses :<br>nos actions… et nos réactions.</p>' +
        '<p class="citation"><strong>On ne respire pas pour changer le monde,</strong><br><strong>mais pour retrouver un peu plus de liberté dans la manière d’y répondre.</strong></p>'
    },
    {
      surtitre: 'Créer un espace intérieur',
      titre: 'La respiration crée un espace de retour à soi',
      corps:
        '<p>Respirer, ce n’est pas chercher à effacer ce que l’on ressent.</p>' +
        '<p>C’est une façon de revenir doucement à soi, de prendre un peu de recul, et de laisser les choses se poser.</p>' +
        '<p>Cela permet de reconnaître ce que l’on vit, sans se juger, et de lui redonner sa juste place.</p>' +
        '<p><strong>Dans les moments d’inconfort, la respiration devient un chemin simple pour se recentrer et retrouver un peu de sécurité intérieure.</strong></p>' +
        '<p>Et pour y parvenir, il est important d’engager le ventre quand on respire. C’est ici que se situe le cerveau émotionnel, l’endroit où se logent tous les inconforts. Respirer par le ventre permet de les nettoyer.</p>' +
        '<p class="citation-fin"><em>Le temps d’inspiration ou d’expiration joue également un rôle important.</em></p>'
    },
    {
      surtitre: 'Laisser le souffle circuler',
      titre: 'À l’inspiration',
      corps:
        '<div class="carte carte-souffle"><img class="souffle-grand" src="./assets/souffle-inspiration.png" alt=""><div><p>Inspire doucement par le nez. Laisse le ventre se gonfler naturellement.</p></div></div>' +
        '<p class="citation"><strong>L’inspiration active le corps : <u>elle apporte de l’énergie</u>.</strong><br>Un temps d’inspiration plus long que celui de l’expiration permet de retrouver du dynamisme.</p>' +
        '<p>Si cela t’aide, tu peux imaginer que tu inspires une <strong>lumière douce</strong>, qui vient apporter un peu d’espace, de chaleur ou de calme à l’intérieur de toi.</p>'
    },
    {
      surtitre: 'Laisser le souffle circuler',
      titre: 'À l’expiration',
      corps:
        '<div class="carte carte-souffle"><img class="souffle-grand" src="./assets/souffle-expiration.png" alt=""><div><p>Expire doucement par la bouche. Le ventre redescend sans effort.</p></div></div>' +
        '<p class="citation"><strong>L’expiration apaise le corps : <u>elle ramène le calme</u>.</strong><br>Un temps d’expiration plus long que celui de l’inspiration permet de retrouver de l’apaisement.</p>' +
        '<p>Si cela t’aide, tu peux imaginer que tu expires un <strong>petit nuage sombre</strong>, qui emporte avec lui ce qui te pèse, sans chercher à faire disparaître ce que tu ressens.</p>'
    },
    {
      surtitre: 'Écouter son besoin du moment',
      titre: 'Choisir son juste rythme',
      corps:
        '<div class="trois-cartes">' +
          '<div class="carte"><img class="carte-dessin" src="./assets/presets/ralentir.png" alt=""><h3>Ralentir</h3><span class="mots"><span class="ligne-r">Inspire <em>4 s</em> · Expire <em>6 s</em><span class="court">(4 / 6)</span></span></span><p>Pour retrouver le calme.</p></div>' +
          '<div class="carte"><img class="carte-dessin" src="./assets/presets/equilibre.png" alt=""><h3>Équilibre</h3><span class="mots"><span class="ligne-r">Inspire <em>5 s</em> · Expire <em>5 s</em><span class="court">(5 / 5)</span></span></span><p>Pour retrouver de l’équilibre.</p></div>' +
          '<div class="carte"><img class="carte-dessin" src="./assets/presets/dynamiser.png" alt=""><h3>Dynamiser</h3><span class="mots"><span class="ligne-r">Inspire <em>6 s</em> · Expire <em>4 s</em><span class="court">(6 / 4)</span></span></span><p>Pour retrouver de l’énergie.</p></div>' +
        '</div>' +
        '<p>Commence par écouter ton besoin du moment : t’apaiser, retrouver ton équilibre ou te dynamiser. Puis adapte la durée de ton inspiration et de ton expiration en fonction de cela, en respectant tes capacités.</p>' +
        '<p>L’idéal est de faire la respiration Équilibre 3 fois par jour, et les autres en fonction des ressentis et des besoins.</p>' +
        '<p><strong>Il n’existe pas de bon rythme universel.</strong><br><strong>Il y a seulement celui dans lequel ta respiration reste fluide et confortable.</strong></p>' +
        '<p>Prends le temps d’expérimenter pour trouver ton rythme le plus juste.</p>'
    },
    {
      surtitre: 'D’un outil vers une ressource',
      titre: 'Avec le temps',
      corps:
        '<p>Au fil des séances, ta respiration t’apporte bien plus qu’une détente du moment.</p>' +
        '<p>Peu à peu, tu apprends à mieux te connaître, à sentir plus tôt ce qui se passe en toi, et à t’offrir un espace avant d’agir ou de réagir.</p>' +
        '<p>Ton souffle devient alors un repère naturel : un refuge intérieur que tu sauras retrouver sans effort.</p>' +
        '<p>Une manière de <strong>prendre soin de ton Être</strong> : revenir à toi avec douceur, t’écouter, et accueillir ce qui est là.</p>' +
        '<p><strong>La respiration ne change pas forcément ce qui se passe autour de toi. Mais elle peut changer la manière dont tu le traverses et le perçois.</strong></p>' +
        '<p class="citation citation-fin">Ici, tu n’as rien à réussir, rien à forcer. Laisse simplement faire, de la manière la plus juste et la plus confortable pour toi, en faisant confiance à tes ressentis.</p>'
    }
  ];

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
  var CONDITIONS = 'https://prendresoindesonhetre-rgb.github.io/Mon-oxyg-ne/conditions.html';
  // De combien le lotus est posé au-dessus de la ligne (en % de sa hauteur) : au départ (posé dans le creux),
  // puis pendant la séance (sa place la plus basse) — choix de Yoann le 18 nov. 2026.
  // Pendant « Installe-toi », on le voit posé LOTUS_ATTENTE secondes, puis il descend en LOTUS_DESCENTE secondes ;
  // le 3·2·1 démarre dès qu'il est arrivé, sans temps d'arrêt.
  var LOTUS_POSE = 30;
  var LOTUS_REPOS = 9;
  var LOTUS_ATTENTE = 0.6;
  var LOTUS_DESCENTE = 3;
  var LOTUS_AVANCE = 0;
  // Avant la séance : le temps de s'installer (celui de la descente du lotus), puis un décompte doux 3, 2, 1.
  var INSTALLATION = LOTUS_ATTENTE + LOTUS_DESCENTE;
  var DECOMPTE = 3;
  var PREPARATION = INSTALLATION + DECOMPTE;

  // Séance offerte : la cohérence cardiaque de base.
  var GRATUIT = { mode: 'simple', durationMin: 5, inhaleSec: 5, exhaleSec: 5, startWithInhale: true, etapes: [] };

  var ICONES = {
    cadenas: '<svg class="cadenas" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/><rect x="5.5" y="10.5" width="13" height="10" rx="2.6"/></svg>',
    etoile: '<svg class="etoile" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5c.6 4.6 2.9 6.9 7.5 7.5-4.6.6-6.9 2.9-7.5 7.5-.6-4.6-2.9-6.9-7.5-7.5 4.6-.6 6.9-2.9 7.5-7.5Z"/><path d="M19 15.5c.25 1.9 1.1 2.75 3 3-1.9.25-2.75 1.1-3 3-.25-1.9-1.1-2.75-3-3 1.9-.25 2.75-1.1 3-3Z"/></svg>',
    coche: '<svg class="coche" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.2 4.2L19 7"/></svg>',
    personnaliser: '<svg class="icone-perso" viewBox="0 0 32 32" aria-hidden="true"><path d="M9 7c6 1 10 5 10 11-5 1-10-2-12-6-1-2-1-4-1-5h3Z"/><path d="M11 9c3 3 5 6 6 10"/><path d="M20 9h8M22 16h6M19 23h9"/><circle cx="23" cy="9" r="1.7"/><circle cx="25" cy="16" r="1.7"/><circle cx="22" cy="23" r="1.7"/></svg>',
    pause: '<rect x="8" y="5" width="8" height="30" rx="3"></rect><rect x="24" y="5" width="8" height="30" rx="3"></rect>',
    lecture: '<path d="M11 6 L32 20 L11 34 Z"></path>'
  };

  // La petite onde du temps (6 ondulations très douces, repère 1000 × 20).
  var CHEMIN_ONDE = (function () {
    var d = '';
    for (var x = 0; x <= 1000; x += 10) d += (x ? ' L' : 'M') + x + ' ' + (10 + 3.2 * Math.sin(x / 1000 * Math.PI * 12)).toFixed(2);
    return d;
  })();

  // « Mon Oxygène » : son écriture (image), en haut à gauche de chaque écran.
  var LOGO = '<img class="marque" src="./assets/logo.png" alt="Mon Oxygène" draggable="false">';

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
    quiOuvert: false,
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

  // Une petite icône devant chaque ligne de réglage (choix de Yoann, 26 nov. 2026) :
  // les souffles dessinés de l'introduction pour l'inspiration et l'expiration, des traits fins pour le reste.
  var ICONES_LIGNES = {
    'Durée de la séance': '<svg viewBox="0 0 24 24"><circle cx="12" cy="13.5" r="7.5"/><path d="M12 9.5v4.2l2.8 1.8M9.5 3.5h5"/></svg>',
    'Inspiration': '<img class="souffle" src="./assets/souffle-inspiration-fleche.png" alt="">',
    'Expiration': '<img class="souffle" src="./assets/souffle-expiration-fleche.png" alt="">',
    'Rythme': '<svg viewBox="0 0 24 24"><path d="M2.5 12c2.2-4.5 4.3-4.5 6.4 0s4.3 4.5 6.4 0 4.3-4.5 6.2 0"/></svg>',
    'Commencer par': '<svg viewBox="0 0 24 24"><path d="M6.5 21V4M6.5 5h10.5l-2.4 3.7L17 12.4H6.5"/></svg>',
    'Bâton de pluie': '<svg viewBox="0 0 24 24"><path d="M8.5 4.5C6.3 7.7 5.2 9.6 5.2 11.1a3.3 3.3 0 0 0 6.6 0c0-1.5-1.1-3.4-3.3-6.6Z"/><path d="M16.5 10.5c-1.6 2.3-2.4 3.7-2.4 4.8a2.4 2.4 0 0 0 4.8 0c0-1.1-.8-2.5-2.4-4.8Z"/></svg>'
  };
  function ligne(nom, contenu, classe) {
    var icone = ICONES_LIGNES[nom] ? '<span class="ligne-icone" aria-hidden="true">' + ICONES_LIGNES[nom] + '</span>' : '';
    return '<div class="ligne' + (classe ? ' ' + classe : '') + '"><span class="ligne-nom">' + icone + '<span>' + nom + '&nbsp;:</span></span>' + contenu + '</div>';
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
        '<input class="baton-volume" type="range" min="0" max="100" step="1" style="--rempli:' + pourcent + '%" value="' + pourcent + '" aria-label="Volume du bâton de pluie">' +
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
    return '<section class="ecran fond-arbre">' + LOGO +
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
    return '<section class="ecran fond-arbre">' + LOGO +
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
    return '<section class="ecran fond-arbre">' + LOGO +
      '<button class="relire" data-action="relire" data-index="0" aria-label="Comprendre le pouvoir de ma respiration" title="Comprendre le pouvoir de ma respiration">' +
        '<img src="./assets/lotus.png" alt="">' +
      '</button>' +
      '<div class="panneau panneau-reglages" data-ajuster>' +
        '<header class="reglages-tete"><h1 class="titre-reglages">Créer ma respiration</h1>' + pastillePlus() + '</header>' +
        '<div class="reglages-corps' + (r.mode === 'perso' ? ' mode-perso' : '') + '">' +
          '<section class="bloc zone-respiration" aria-label="Ma respiration">' +
            lignesRespiration(r, verrouille) +
          '</section>' +
          '<div class="bloc zone-debut">' + ligneDebut(r, verrouille) + '</div>' +
          '<section class="bloc zone-choix">' +
            '<div class="choix-tete"><h2 class="bloc-titre">Préréglages de respiration&nbsp;:</h2>' + pastillePerso(r, verrouille) + '</div>' +
            tuiles(r, verrouille) +
          '</section>' +
          '<section class="bloc zone-baton" aria-label="Bâton de pluie">' +
            ligneBaton(verrouille) +
          '</section>' +
        '</div>' +
        '<div class="reglages-pied">' +
          '<button class="bouton-commencer" data-action="commencer">Commencer ma séance</button>' +
        '</div>' +
      '</div></section>';
  }

  function ecranSeance() {
    var r = etat.seance.plan[0];
    var total = Math.ceil(R.dureePlan(etat.seance.plan));
    return '<section class="ecran fond-lac seance">' + LOGO +
      '<div class="seance-boutons">' +
        '<button class="rond" data-action="pause" aria-label="Pause"><svg id="iconePause" viewBox="0 0 40 40">' + ICONES.pause + '</svg></button>' +
        '<button class="rond" data-action="arreter" aria-label="Arrêter"><svg viewBox="0 0 40 40"><rect x="8" y="8" width="24" height="24" rx="4"></rect></svg></button>' +
      '</div>' +
      '<div class="phase">' +
        '<div class="phase-titre fondu" id="phaseTitre"></div>' +
        '<div class="phase-consigne fondu" id="phaseConsigne"></div>' +
        '<div class="phase-compte" id="phaseCompte"></div>' +
      '</div>' +
      // Sa ligne aquarelle, dessinée sur toute la largeur de l'écran, et le lotus qui la suit
      '<div class="scene-vague" id="sceneVague"' + (etat.seance.commencee ? '' : ' style="opacity:0"') + '>' +
        '<canvas class="toile-vague" id="toileVague" aria-hidden="true"></canvas>' +
        '<img src="./assets/lotus.png" class="lotus" id="lotus" alt="">' +
      '</div>' +
      // Le temps, posé sur l'eau comme un reflet : une petite onde qui se colore au fil de la séance
      '<div class="progression">' +
        '<div class="progression-gauche">' +
          '<div class="rythme" id="rythme">Inspire ' + R.formaterDuree(r.inhaleSec) + ' · Expire ' + R.formaterDuree(r.exhaleSec) + '</div>' +
          '<svg class="onde" viewBox="0 0 1000 20" preserveAspectRatio="none" aria-hidden="true">' +
            '<defs><linearGradient id="ondeCouleur" x1="0" x2="1"><stop offset="0" stop-color="#7fd0dc"></stop><stop offset=".5" stop-color="#8fb1ec"></stop><stop offset="1" stop-color="#b39be6"></stop></linearGradient></defs>' +
            '<path class="onde-reflet" pathLength="100" d="' + CHEMIN_ONDE + '"></path>' +
            '<path class="onde-calme" pathLength="100" d="' + CHEMIN_ONDE + '"></path>' +
            '<path class="onde-faite" id="ondeFaite" pathLength="100" stroke-dasharray="0.5 100" d="' + CHEMIN_ONDE + '"></path>' +
          '</svg>' +
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
    return '<div class="offres">' + html + '</div><button class="lien" data-action="restaurer">Restaurer mes achats</button>';
  }

  function fenetrePlus() {
    var avantages = '';
    for (var i = 0; i < AVANTAGES.length; i++) avantages += '<li>' + ICONES.coche + '<span>' + AVANTAGES[i] + '</span></li>';
    // « Qui suis-je ? » : sa carte, calée en bas à gauche de la fenêtre (27 nov. 2026)
    avantages += '<li class="carte-qui" data-action="ouvrir-qui" role="button" tabindex="0"><img src="./assets/logo-hetre-enfant.png" alt=""><div><strong>Qui suis-je ?</strong><span>Yoann · Prendre soin de son Hêtre</span></div></li>';
    var code = '';
    if (!Plus.actif || Plus.source === 'cadeau') {
      code = '<div class="code">' +
        '<label for="codeCadeau">J’ai un code cadeau</label>' +
        '<div class="code-ligne"><input id="codeCadeau" placeholder="OXY-…" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" value="' + etat.codeSaisi.replace(/"/g, '&quot;') + '">' +
        '<button class="bouton-principal" data-action="activer-code">Activer</button></div>' +
        (etat.messageCode ? '<p class="code-message' + (etat.messageCode.ok ? ' reussi' : '') + '">' + etat.messageCode.message + '</p>'
          : Plus.messageCadeau && !Plus.actif ? '<p class="code-message">' + Plus.messageCadeau + '</p>' : '') +
      '</div>';
    }
    return '<div class="voile" data-action="fermer-plus-fond">' +
      '<div class="panneau fenetre-plus" role="dialog" aria-modal="true" aria-label="Mon Oxygène Plus" data-ajuster>' +
        '<button class="fermer" data-action="fermer-plus" aria-label="Fermer">×</button>' +
        '<header class="plus-tete">' + ICONES.etoile + '<div><h2>Mon Oxygène Plus</h2><p>Ta respiration, entièrement à ta mesure.</p></div></header>' +
        '<div class="plus-corps">' +
          '<ul class="avantages">' + avantages + '</ul>' +
          '<div class="plus-actions">' + zoneOffres() + code +
            // les deux politiques, toujours visibles en bas de la fenêtre (avec ou sans offres, avec ou sans code)
            '<p class="mentions mentions-liens"><a href="' + CONDITIONS + '" target="_blank" rel="noopener">Conditions d’utilisation</a> · <a href="' + CONFIDENTIALITE + '" target="_blank" rel="noopener">Politique de confidentialité</a></p>' +
          '</div>' +
        '</div>' +
      '</div></div>';
  }

  // « Qui suis-je ? » : la page de Yoann (ses mots), ouverte depuis la fenêtre Plus
  var SITE_HETRE = 'https://prendresoindesonhetre.fr';
  function fenetreQui() {
    var nbsp = '&nbsp;';
    return '<div class="voile voile-qui" data-action="fermer-qui-fond">' +
      '<div class="qui-page" role="dialog" aria-modal="true" aria-label="Qui suis-je ?">' +
        '<button class="qui-fermer" data-action="fermer-qui" aria-label="Fermer">×</button>' +
        '<div class="qui-tete"><div class="qui-logo"><img src="./assets/logo-hetre-enfant.png" alt=""></div><div>' +
          '<h2 class="qui-titre">Qui suis-je ?</h2>' +
          '<p class="qui-pres">Je m’appelle <strong>Yoann</strong>. Je suis le fondateur de Prendre soin de son' + nbsp + 'Hêtre. Initialement <strong>moniteur éducateur diplômé d’État</strong>, je suis également <strong>hypnocoach</strong>. J’accompagne depuis 8' + nbsp + 'ans petits et grands qui vivent des inconforts au' + nbsp + 'quotidien. Je suis convaincu que nos émotions ne sont pas des ennemies à faire taire, mais des messages à écouter : ce sont notre boussole' + nbsp + 'intérieure.</p>' +
        '</div></div>' +
        '<div class="qui-filet"></div>' +
        '<div class="qui-colonnes">' +
          '<div><h3>Pourquoi j’ai créé Mon Oxygène</h3><p>Lors de mes accompagnements individuels ou en groupe, j’ai pu voir combien la respiration, en y remettant du sens, peut changer les inconforts du quotidien. J’ai donc voulu que chaque personne puisse réapprendre ce pouvoir afin de rendre plus confortables et gérables les moments d’inconfort, peu importe où l’on se' + nbsp + 'trouve.</p></div>' +
          '<div><h3>Mes accompagnements</h3><p>Au quotidien, j’accompagne enfants et adultes en individuel ou en groupe, grâce à des <strong>séances d’accompagnement émotionnel</strong> individuelles, des <strong>ateliers de relaxation et/ou de méditation</strong>, où je guide la respiration grâce au bâton de pluie que tu retrouveras dans l’application.</p></div>' +
        '</div>' +
        '<div class="qui-pied"><p class="qui-mention">Ces accompagnements relèvent du bien-être et ne remplacent pas un suivi médical ou psychologique.</p>' +
          '<a class="qui-bouton" href="' + SITE_HETRE + '" target="_blank" rel="noopener">Pour en découvrir plus</a></div>' +
      '</div></div>';
  }

  // Mise en page de « Qui suis-je ? » (validée par Yoann le 27 nov. 2026) : le texte prend la plus grande taille qui tient ;
  // les deux colonnes finissent sur la même ligne ; UN SEUL écart vertical partout (haut de page, autour des deux traits,
  // bas de page), mesuré sur le texte réel ; logo centré sur le titre + la présentation ; croix dans la ligne du titre.
  // Toutes les croix ont la taille de celle des explications (validée) : environ 4,4 % de la hauteur, sans dépasser 2,4 % de la largeur.
  function tailleCroix() { return Math.floor(Math.min(window.innerHeight * .044, window.innerWidth * .024)); }

  function ajusterQui() {
    var pg = app.querySelector('.qui-page');
    if (!pg) return;
    var tete = pg.querySelector('.qui-tete'), f1 = pg.querySelector('.qui-filet'), cols = pg.querySelector('.qui-colonnes'),
        pied = pg.querySelector('.qui-pied'), bt = pied.querySelector('a'), x = pg.querySelector('.qui-fermer'), img = tete.querySelector('img');
    var encre = function (e) {
      var rg = document.createRange(); rg.selectNodeContents(e);
      var rc = [].filter.call(rg.getClientRects(), function (q) { return q.width > 1; });
      return { top: Math.min.apply(null, rc.map(function (q) { return q.top; })), bottom: Math.max.apply(null, rc.map(function (q) { return q.bottom; })) };
    };
    function equilibrer() {
      var ps = cols.querySelectorAll('p'), meilleur = null;
      for (var k = 38; k <= 62; k++) {
        cols.style.gridTemplateColumns = k + 'fr ' + (100 - k) + 'fr';
        var a = ps[0].getBoundingClientRect().bottom, b = ps[1].getBoundingClientRect().bottom, d = Math.abs(a - b), m = Math.max(a, b);
        if (!meilleur || d < meilleur.d - .5 || (Math.abs(d - meilleur.d) <= .5 && m < meilleur.m)) meilleur = { k: k, d: d, m: m };
      }
      cols.style.gridTemplateColumns = meilleur.k + 'fr ' + (100 - meilleur.k) + 'fr';
      return meilleur.d;
    }
    function espacer() {
      var E = Math.round(.95 * parseFloat(getComputedStyle(pg).fontSize));
      pg.style.paddingTop = pg.style.paddingBottom = E + 'px'; f1.style.margin = E + 'px 0'; pied.style.marginTop = pied.style.paddingTop = E + 'px';
      img.style.transform = '';
      for (var passe = 0; passe < 4; passe++) {
        var h2a = encre(tete.querySelector('.qui-titre')), pra = encre(tete.querySelector('.qui-pres')), L1 = img.getBoundingClientRect();
        img.style.transform = 'translateY(' + ((parseFloat((img.style.transform.match(/-?[0-9.]+/) || [0])[0]) || 0) + ((h2a.top + pra.bottom) / 2 - (L1.top + L1.bottom) / 2)) + 'px)';
        var P = pg.getBoundingClientRect(), L = img.getBoundingClientRect(), h2 = encre(tete.querySelector('.qui-titre')), pr = encre(tete.querySelector('.qui-pres'));
        var hautTete = Math.min(L.top, h2.top), basTete = Math.max(L.bottom, pr.bottom);
        var h3 = [].map.call(cols.querySelectorAll('h3'), encre), ps = [].map.call(cols.querySelectorAll('p'), encre);
        var hautCols = Math.min(h3[0].top, h3[1].top), basCols = Math.max(ps[0].bottom, ps[1].bottom), F1 = f1.getBoundingClientRect(), PI = pied.getBoundingClientRect(), B = bt.getBoundingClientRect();
        var ajuste = function (el, prop, ecart) { el.style[prop] = Math.max(0, (parseFloat(el.style[prop]) || 0) + (E - ecart)) + 'px'; };
        ajuste(pg, 'paddingTop', hautTete - P.top);
        ajuste(f1, 'marginTop', F1.top - basTete);
        ajuste(f1, 'marginBottom', hautCols - F1.bottom);
        ajuste(pied, 'marginTop', PI.top - basCols);
        ajuste(pied, 'paddingTop', B.top - PI.top);
        ajuste(pg, 'paddingBottom', P.bottom - B.bottom);
        // croix : dans la ligne du titre, centrée sur lui, bord droit aligné sur le bord droit du texte
        var T = tete.querySelector('.qui-titre').getBoundingClientRect(), cote = tailleCroix(), droite = P.right - cols.getBoundingClientRect().right;
        x.style.width = x.style.height = x.style.lineHeight = cote + 'px'; x.style.fontSize = (cote / 1.6) + 'px';
        x.style.right = droite + 'px'; x.style.top = (T.top + T.height / 2 - cote / 2 - P.top) + 'px';
        var XB = x.getBoundingClientRect();
        x.style.right = (droite + (XB.right - (P.right - droite))) + 'px';
        x.style.top = (parseFloat(x.style.top) - ((XB.top + XB.bottom) / 2 - (T.top + T.bottom) / 2)) + 'px';
      }
    }
    pg.style.fontSize = '';
    var taille = parseFloat(getComputedStyle(pg).fontSize), essais = 0;
    var depart = taille, reste = equilibrer(); espacer();
    while (((pg.scrollHeight > pg.clientHeight + 1) || (reste > 1 && taille > depart * .88)) && taille > TAILLE_MINI_INTRO && essais < 80) {
      taille -= 0.25; pg.style.fontSize = taille + 'px'; reste = equilibrer(); espacer(); essais++;
    }
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
    if (etat.quiOuvert && etat.plusOuvert && etat.ecran !== 'seance') html += fenetreQui();
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
  var TAILLE_MINI_INTRO = 11;
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
  // L'arbre est équilibré sur chaque écran : même écart entre le haut de l'écran et le sommet du feuillage
  // qu'entre ses racines et le bas de l'écran (repères mesurés sur son image 1448 × 1086 : 255 px et 749 px).
  // L'image prend toute la largeur ; un petit zoom seulement si l'écran est presque carré.
  var SOMMET_ARBRE = 255 / 1086, RACINE_ARBRE = 749 / 1086, MILIEU_ARBRE = (SOMMET_ARBRE + RACINE_ARBRE) / 2;
  // Debout (tablette) : une version de son aquarelle préparée pour l’écran debout (assets/fond-arbre-debout.jpg,
  // 1968 × 2230) : l’arbre au centre, le côté gauche = reflet du côté droit de sa peinture (axe = le tronc),
  // la prairie prolongée vers le bas. L’arbre garde sa taille, ses racines juste au-dessus du cadre (38 % de la hauteur).
  var ARBRE_DEBOUT = 0.38, DEBOUT = { largeur: 1968, hauteur: 2230, troncX: 520 + 297, racineY: 749 };
  function estDebout() { return window.innerHeight > window.innerWidth && window.innerWidth >= 600; }
  function cadrerArbre() {
    var fonds = app.querySelectorAll('.fond-arbre');
    for (var i = 0; i < fonds.length; i++) {
      var W = fonds[i].clientWidth, H = fonds[i].clientHeight;
      if (!W || !H) continue;
      if (estDebout()) {
        var racine = ARBRE_DEBOUT * H * 0.97;
        var s = Math.max(racine / DEBOUT.racineY, (W / 2) / DEBOUT.troncX, (W / 2) / (DEBOUT.largeur - DEBOUT.troncX));
        fonds[i].style.backgroundImage = 'url(./assets/fond-arbre-debout.jpg)';
        fonds[i].style.backgroundSize = Math.round(DEBOUT.largeur * s) + 'px ' + Math.round(DEBOUT.hauteur * s) + 'px';
        fonds[i].style.backgroundPosition = Math.round(W / 2 - DEBOUT.troncX * s) + 'px ' + Math.round(racine - DEBOUT.racineY * s) + 'px';
        fonds[i].style.backgroundColor = '#ecf4fc';
        continue;
      }
      fonds[i].style.backgroundImage = ''; fonds[i].style.backgroundColor = '';
      var z = Math.max(1, (H / 2) / (MILIEU_ARBRE * 0.75 * W), (H / 2) / ((1 - MILIEU_ARBRE) * 0.75 * W));
      var hauteurImage = 0.75 * W * z;
      var y = hauteurImage > H + 0.5 ? (MILIEU_ARBRE * hauteurImage - H / 2) / (hauteurImage - H) : 0.5;
      fonds[i].style.backgroundSize = (z * 100).toFixed(2) + '% auto';
      fonds[i].style.backgroundPosition = '50% ' + (R.bornes(y, 0, 1) * 100).toFixed(2) + '%';
    }
  }

  // Le lac : toute la largeur ; on le place pour que le temps (en bas, vers 92 % de la hauteur de l'écran)
  // soit toujours posé sur l'eau (vers 78 % de la hauteur de son image), quelle que soit la forme de l'écran.
  var EAU_IMAGE = 0.78, EAU_ECRAN = 0.92;
  function cadrerLac() {
    var fonds = app.querySelectorAll('.fond-lac');
    for (var i = 0; i < fonds.length; i++) {
      var W = fonds[i].clientWidth, H = fonds[i].clientHeight;
      if (!W || !H) continue;
      var hauteurImage = Math.max(H, 0.75 * W), largeurImage = hauteurImage / 0.75;
      var y = hauteurImage > H + 0.5 ? (EAU_IMAGE * hauteurImage - EAU_ECRAN * H) / (hauteurImage - H) : 0.5;
      fonds[i].style.backgroundSize = Math.round(largeurImage) + 'px ' + Math.round(hauteurImage) + 'px';
      fonds[i].style.backgroundPosition = '50% ' + (R.bornes(y, 0, 1) * 100).toFixed(2) + '%';
    }
  }

  // Introduction : la même taille de titre et de texte sur toutes les pages (choix de Yoann, 26 nov. 2026).
  // On cherche la plus grande taille qui tient sur CHAQUE page, en essayant les pages une à une dans le cadre ;
  // le résultat est gardé pour cette taille d'écran.
  var memoireIntro = { cle: '', taille: 0 };
  function tailleCommuneIntro(el) {
    var cle = window.innerWidth + 'x' + window.innerHeight + (etat.relecture ? 'r' : '');
    if (memoireIntro.cle === cle) return memoireIntro.taille;
    var sur = el.querySelector('.surtitre'), titre = el.querySelector('.grand-titre'), corps = el.querySelector('.intro-corps');
    var avant = [sur.innerHTML, titre.innerHTML, corps.innerHTML];
    // on repart des réglages d'origine (une mesure précédente a pu fixer des tailles et des écarts)
    var nav0 = el.querySelector('.intro-nav');
    sur.style.fontSize = ''; titre.style.fontSize = ''; corps.style.lineHeight = ''; corps.style.removeProperty('--ecart-p');
    if (nav0) { nav0.style.fontSize = ''; nav0.style.paddingTop = ''; }
    el.style.fontSize = '';
    var depart = parseFloat(getComputedStyle(el).fontSize), taille = depart;
    for (var d = 0; d < DIAPOS.length; d++) {
      sur.innerHTML = DIAPOS[d].surtitre; titre.innerHTML = DIAPOS[d].titre; corps.innerHTML = insecables(DIAPOS[d].corps);
      el.style.fontSize = taille + 'px';
      var essais = 0;
      while (deborde(el) && taille > TAILLE_MINI_INTRO && essais < 80) { taille -= 0.25; el.style.fontSize = taille + 'px'; essais++; }
    }
    sur.innerHTML = avant[0]; titre.innerHTML = avant[1]; corps.innerHTML = avant[2];
    memoireIntro = { cle: cle, taille: taille };
    return taille;
  }

  // Taille de texte que prend la page la plus chargée de l'introduction (mesurée une fois par taille d'écran).
  var ECART_TEXTE_INTRO = 1.05, memoireTexte = { cle: '', taille: 0 };
  function texteMiniIntro(el, plafond) {
    var cle = window.innerWidth + 'x' + window.innerHeight + (etat.relecture ? 'r' : '') + '|' + plafond.toFixed(2);
    if (memoireTexte.cle === cle) return memoireTexte.taille;
    var sur = el.querySelector('.surtitre'), titre = el.querySelector('.grand-titre'), corps = el.querySelector('.intro-corps');
    var avant = [sur.innerHTML, titre.innerHTML, corps.innerHTML, el.style.fontSize, corps.style.lineHeight, corps.style.getPropertyValue('--ecart-p')];
    corps.style.lineHeight = ''; corps.style.removeProperty('--ecart-p');
    var ecarts = [corps.style.gap, corps.style.paddingTop, corps.style.marginTop];
    corps.style.gap = corps.style.paddingTop = corps.style.marginTop = '';
    var mini = plafond;
    for (var d = 0; d < DIAPOS.length; d++) {
      sur.innerHTML = DIAPOS[d].surtitre; titre.innerHTML = DIAPOS[d].titre; corps.innerHTML = DIAPOS[d].corps;
      var taille = plafond, essais = 0; el.style.fontSize = taille + 'px';
      while (deborde(el) && taille > TAILLE_MINI_INTRO && essais < 120) { taille -= 0.25; el.style.fontSize = taille + 'px'; essais++; }
      mini = Math.min(mini, taille);
    }
    sur.innerHTML = avant[0]; titre.innerHTML = avant[1]; corps.innerHTML = avant[2]; el.style.fontSize = avant[3];
    corps.style.lineHeight = avant[4]; if (avant[5]) corps.style.setProperty('--ecart-p', avant[5]);
    corps.style.gap = ecarts[0]; corps.style.paddingTop = ecarts[1]; corps.style.marginTop = ecarts[2];
    // petite marge (1,5 %) : sur la vraie page, la plus chargée finit parfois un cran plus petite que mesuré ici ;
    // ainsi l'écart entre les pages reste bien sous 5 %
    mini = mini * 0.985;
    memoireTexte = { cle: cle, taille: mini };
    return mini;
  }

  // Séance : quatre écarts, de haut en bas. Le bord du haut (écran → consignes) égale le bord du bas (temps → écran) ;
  // l'écart consignes → vague égale l'écart vague → temps ; les bords valent le tiers des écarts du milieu.
  // « Mon Oxygène » et les boutons Pause / Stop sont centrés sur la ligne du titre. Choix de Yoann, 26 nov. 2026.
  var BORD_SUR_ECART = 1 / 3;
  var HAUTEUR_MARQUE = 30.4 / 412;
  function placerSeance() {
    var ecran = app.querySelector('.seance');
    if (!ecran || !ecran.clientHeight) return;
    var H = ecran.clientHeight, W = ecran.clientWidth;
    // Debout (tablette), tout est dimensionné comme sur l’écran couché de même largeur ;
    // le logo et Pause/Stop restent seuls sur la ligne du haut, les consignes passent en dessous.
    var debout = estDebout(), Href = debout ? Math.min(H, 0.75 * W) : H;
    LigneVague.regler(0.37 * Href / H, debout ? 3 : 4);
    var taille = Href * HAUTEUR_MARQUE, zone = debout ? Math.round(0.035 * W + taille) : 0;
    var phase = ecran.querySelector('.phase'), prog = ecran.querySelector('.progression');
    // Hauteur du bloc des consignes quand il est complet (titre, consigne, secondes), mesurée sur une copie invisible :
    // le bloc garde ainsi la même place pendant toute la séance, même quand la consigne ou les secondes disparaissent.
    var essai = document.createElement('div');
    essai.className = 'phase';
    essai.setAttribute('aria-hidden', 'true');
    essai.style.visibility = 'hidden';
    essai.style.top = '0px';
    essai.innerHTML = '<div class="phase-titre">Inspire</div><div class="phase-consigne">Par le nez</div><div class="phase-compte">2.5 s</div>';
    ecran.appendChild(essai);
    var debut = essai.getBoundingClientRect().top, haut = Infinity, bas = -Infinity;
    for (var i = 0; i < essai.children.length; i++) {
      var r = essai.children[i].getBoundingClientRect();
      haut = Math.min(haut, r.top); bas = Math.max(bas, r.bottom);
    }
    var titre = essai.children[0].getBoundingClientRect();
    ecran.removeChild(essai);
    var hc = bas - haut;
    // Bloc du temps : de « Inspire 5 s · Expire 5 s » jusqu'au bas de la barre et du minuteur.
    var rp = prog.getBoundingClientRect(), rythme = prog.querySelector('.rythme');
    var hautTemps = rythme ? Math.min(rp.top, rythme.getBoundingClientRect().top) : rp.top;
    var ht = rp.bottom - hautTemps;
    var hv = LigneVague.ampleur * H;
    var ecart = Math.max(0, (H - zone - hc - hv - ht) / (2 + 2 * BORD_SUR_ECART)), bord = BORD_SUR_ECART * ecart;
    phase.style.top = (zone + bord - (haut - debut)) + 'px';
    prog.style.bottom = bord + 'px';
    LigneVague.placer((zone + bord + hc + ecart) / H);
    // « Mon Oxygène » et les boutons (halo compris) ont la même hauteur, proportionnelle à celle de l'écran
    // (7,4 % : 30 px sur un téléphone couché, 59 px sur une tablette), centrés sur la ligne du titre.
    var ligneTitre = debout ? 0.0175 * W + taille / 2 : bord + (titre.top - haut) + titre.height / 2;
    var logo = ecran.querySelector('img.marque'), boutons = ecran.querySelector('.seance-boutons');
    if (logo) {
      logo.style.width = 'auto';
      logo.style.height = taille + 'px';
      logo.style.top = (ligneTitre - taille / 2) + 'px';
      centrerLogo(logo, ecran);
    }
    if (boutons) {
      var ronds = boutons.querySelectorAll('.rond');
      for (var j = 0; j < ronds.length; j++) { ronds[j].style.width = taille + 'px'; ronds[j].style.height = taille + 'px'; }
      boutons.style.top = (ligneTitre - boutons.offsetHeight / 2) + 'px';
    }
  }

  function ajuster() {
    remettreCamera();
    cadrerArbre();
    cadrerLac();
    placerSeance();
    ajusterLargeur();
    var panneaux = app.querySelectorAll('[data-ajuster]');
    for (var i = 0; i < panneaux.length; i++) {
      var el = panneaux[i];
      // Introduction : le surtitre et le titre gardent la même taille sur toutes les pages ;
      // le texte grandit pour bien remplir la page (jusqu'à 80 % du titre), ou rapetisse si la page est chargée.
      var plafond = 0;
      if (el.classList.contains('panneau-intro')) {
        var commune = tailleCommuneIntro(el);
        var sur = el.querySelector('.surtitre'), grand = el.querySelector('.grand-titre');
        sur.style.fontSize = ''; grand.style.fontSize = '';
        el.style.fontSize = commune + 'px';
        var tailleSur = parseFloat(getComputedStyle(sur).fontSize), tailleTitre = parseFloat(getComputedStyle(grand).fontSize);
        sur.style.fontSize = tailleSur + 'px'; grand.style.fontSize = tailleTitre + 'px';
        // les boutons du bas (Précédent, points, Suivant) gardent aussi la même taille sur toutes les pages
        var nav = el.querySelector('.intro-nav'), fermer = el.querySelector('.fermer');
        if (nav) {
          nav.style.fontSize = commune + 'px';
        }
        if (fermer) fermer.style.fontSize = (tailleCroix() / 1.6) + 'px'; // même croix que la fenêtre Plus et « Qui suis-je ? »
        plafond = tailleTitre * 0.8; // le texte grandit pour remplir chaque page (choix de Yoann : la taille unique faisait trop vide)
        // … mais sans trop d'écart d'une page à l'autre (27 nov. 2026 : « on voit trop la différence ») : au plus 5 %
        // au-dessus de la page la plus chargée ; le reste de la place est rempli en aérant les lignes (remplirPage).
        plafond = Math.min(plafond, texteMiniIntro(el, plafond) * ECART_TEXTE_INTRO);
      }
      el.style.fontSize = '';
      var taille = plafond || parseFloat(getComputedStyle(el).fontSize);
      if (plafond) el.style.fontSize = taille + 'px';
      var essais = 0, intro = el.classList.contains('panneau-intro'), mini = intro ? TAILLE_MINI_INTRO : 9;
      el.classList.remove('defile');
      var corpsIntro = el.querySelector('.intro-corps');
      if (corpsIntro) { corpsIntro.style.gap = ''; corpsIntro.style.paddingTop = ''; corpsIntro.style.marginTop = ''; }
      var navIntro = intro ? el.querySelector('.intro-nav') : null;
      if (navIntro) navIntro.style.paddingTop = '';
      if (intro) eviterLignesCourtes(el, false);
      while (deborde(el) && taille > mini && essais < 120) {
        taille -= 0.25;
        el.style.fontSize = taille + 'px';
        essais++;
      }
      // Très petit écran (téléphone de 4 pouces) : le texte ne descend pas sous 11 px pour rester lisible ;
      // s'il ne tient toujours pas, il défile dans le cadre, les boutons restent en bas (26 nov. 2026).
      // les derniers mots liés ne doivent pas faire rapetisser le texte : si un paragraphe y gagne une ligne de trop, on le laisse tel quel
      if (intro) eviterLignesCourtes(el, true);
      if (intro) ajusterRythmes(el);
      if (intro && deborde(el)) el.classList.add('defile');
      // Introduction : s'il reste de la place, les lignes s'écartent doucement jusqu'à remplir la page
      // (le texte occupe toute la hauteur entre le titre et les boutons, sans grand vide en bas).
      else {
        // le blanc du bas se mesure jusqu'aux boutons eux-mêmes (pas jusqu'au cadre invisible au-dessus d'eux) :
        // la même marge en haut (sous le titre) et en bas (au-dessus des boutons) — Yoann, 28 nov. 2026
        if (plafond && navIntro) navIntro.style.paddingTop = '0px';
        if (plafond && el.querySelector('.carte-souffle, .trois-cartes, .citation-fin')) egaliserBlocs(el);
        else if (plafond) remplirPage(el);
      }
      if (el.classList.contains('panneau-reglages')) equilibrerReglages(el);
    }
    placerMarque();
    eviterCamera();
    var croixPlus = app.querySelector('.fenetre-plus .fermer');
    if (croixPlus) {
      // même taille que les autres croix ; centrée sur le titre « Mon Oxygène Plus », bord droit aligné sur le contenu de la fenêtre
      croixPlus.style.fontSize = (tailleCroix() / 1.6) + 'px'; croixPlus.style.top = croixPlus.style.right = '';
      var fen = croixPlus.closest('.fenetre-plus'), titre = fen.querySelector('.plus-tete h2'), corps = fen.querySelector('.plus-corps');
      if (titre && corps) {
        var F = fen.getBoundingClientRect(), Tt = titre.getBoundingClientRect(), C = corps.getBoundingClientRect(), X = croixPlus.getBoundingClientRect();
        croixPlus.style.right = (F.right - C.right) + 'px';
        croixPlus.style.top = (Tt.top + Tt.height / 2 - X.height / 2 - F.top) + 'px';
      }
    }
    ajusterQui();
  }

  // Caméra dans l’écran (trou ou encoche) : l’appli Android donne sa place exacte (MonOxygeneEcran.decoupes, en px CSS).
  // « Mon Oxygène », le lotus et Pause/Stop restent collés aux coins et ne s’écartent que si la caméra les touche
  // (choix de Yoann, 26 nov. 2026 : Mon Oxygène doit s’adapter à chaque téléphone).
  var ELEMENTS_COINS = 'img.marque, .relire, .seance-boutons';
  function decoupesCamera() {
    try {
      var texte = window.MonOxygeneEcran && MonOxygeneEcran.decoupes ? MonOxygeneEcran.decoupes() : '';
      return texte ? JSON.parse(texte) : [];
    } catch (e) { return []; }
  }
  function remettreCamera() {
    var els = app.querySelectorAll(ELEMENTS_COINS);
    for (var i = 0; i < els.length; i++) els[i].style.transform = '';
  }
  function eviterCamera() {
    var trous = decoupesCamera();
    if (!trous.length) return;
    var MARGE = 8, els = app.querySelectorAll(ELEMENTS_COINS);
    for (var i = 0; i < els.length; i++) {
      var e = els[i].getBoundingClientRect(), dx = 0, aGauche = (e.left + e.right) / 2 < window.innerWidth / 2;
      if (!e.width) continue;
      for (var k = 0; k < trous.length; k++) {
        var t = trous[k];
        if (e.right < t.g - MARGE || e.left > t.d + MARGE || e.bottom < t.h - MARGE || e.top > t.b + MARGE) continue;
        // on pousse vers l’intérieur de l’écran, juste assez pour passer la caméra
        dx = aGauche ? Math.max(dx, t.d + MARGE - e.left) : Math.min(dx, t.g - MARGE - e.right);
      }
      if (dx) els[i].style.transform = 'translateX(' + dx + 'px)';
    }
  }

  // Debout (tablette), « Mon Oxygène » est centré en haut, au-dessus de l’arbre (choix de Yoann, 26 nov. 2026).
  function centrerLogo(logo, ecran) {
    logo.style.left = estDebout() ? Math.round((ecran.clientWidth - logo.getBoundingClientRect().width) / 2) + 'px' : '';
  }

  // Introduction et réglages : « Mon Oxygène » a la même taille que pendant la séance (7,4 % de la hauteur de l'écran).
  // Sur les réglages, il est centré sur la ligne de « Créer ma respiration », et le bouton lotus a la hauteur de
  // « Commencer ma séance », centré sur sa ligne (choix de Yoann, 26 nov. 2026).
  function placerMarque() {
    var ecran = app.querySelector('.ecran');
    if (!ecran || ecran.classList.contains('seance') || !ecran.clientHeight) return;
    var logo = ecran.querySelector('img.marque');
    if (!logo) return;
    var origine = ecran.getBoundingClientRect().top, taille = ecran.clientHeight * HAUTEUR_MARQUE;
    logo.style.width = 'auto'; logo.style.height = taille + 'px';
    var titre = ecran.querySelector('.titre-reglages');
    logo.style.top = '';
    centrerLogo(logo, ecran);
    if (titre && !estDebout()) {
      var t = titre.getBoundingClientRect();
      logo.style.top = (t.top - origine + t.height / 2 - taille / 2) + 'px';
    }
    // Le bouton lotus (retour à l’introduction) va dans le coin en bas à gauche, en miroir de « Mon Oxygène » :
    // même écart avec le bord gauche, et le même écart avec le bas que le logo avec le haut (choix de Yoann, 26 nov. 2026).
    var lotus = ecran.querySelector('.relire'), go = ecran.querySelector('.bouton-commencer');
    if (lotus && go) {
      var g = go.getBoundingClientRect(), l = logo.getBoundingClientRect(), cadre = ecran.getBoundingClientRect();
      lotus.style.width = g.height + 'px'; lotus.style.height = g.height + 'px';
      lotus.style.top = 'auto'; lotus.style.bottom = (l.top - cadre.top) + 'px';
      lotus.style.left = (l.left - cadre.left) + 'px';
      var panneau = ecran.querySelector('.panneau-reglages');
      if (panneau && estDebout()) {
        // debout, le cadre occupe le bas : le lotus reste à gauche (aligné sur le logo), posé juste au-dessus du cadre
        var p = panneau.getBoundingClientRect();
        lotus.style.bottom = (cadre.bottom - p.top + (l.top - cadre.top)) + 'px';
        lotus.style.left = (p.left - cadre.left) + 'px';
      }
    }
  }

  // Réglages : l'écart entre « Préréglages de respiration : » et les cases est le même qu'entre les cases
  // et « Commencer ma séance » (choix de Yoann, 26 nov. 2026). La place en trop aère les lignes de réglages.
  function equilibrerReglages(el) {
    var tete = el.querySelector('.choix-tete'), tuiles = el.querySelector('.tuiles'), bouton = el.querySelector('.bouton-commencer');
    if (!tete || !tuiles || !bouton) return;
    el.style.removeProperty('--pad-ligne');
    tuiles.style.marginTop = '';
    var haut = function () { return tuiles.getBoundingClientRect().top - tete.getBoundingClientRect().bottom; };
    var bas = function () { return bouton.getBoundingClientRect().top - tuiles.getBoundingClientRect().bottom; };
    var pad = 0.6, essais = 0;
    // la place en trop au-dessus du bouton va d'abord aux lignes de réglages
    while (bas() - haut() > 1 && essais < 80) {
      pad += 0.02;
      el.style.setProperty('--pad-ligne', pad.toFixed(2) + 'em');
      if (deborde(el)) { pad -= 0.02; el.style.setProperty('--pad-ligne', pad.toFixed(2) + 'em'); break; }
      essais++;
    }
    // puis on égalise exactement les deux écarts autour des cases
    var ecart = bas() - haut();
    if (Math.abs(ecart) > 0.5) {
      var marge = parseFloat(getComputedStyle(tuiles).marginTop) + ecart / 2;
      tuiles.style.marginTop = Math.max(0, marge) + 'px';
    }
    // jamais rien qui dépasse du cadre : on resserre les lignes si besoin, et on rééquilibre
    essais = 0;
    while (deborde(el) && pad > 0.2 && essais < 40) {
      pad -= 0.02;
      el.style.setProperty('--pad-ligne', pad.toFixed(2) + 'em');
      tuiles.style.marginTop = '';
      var e2 = bas() - haut();
      tuiles.style.marginTop = Math.max(0, parseFloat(getComputedStyle(tuiles).marginTop) + e2 / 2) + 'px';
      essais++;
    }
  }

  // S'il reste de la place, les lignes puis les paragraphes s'écartent doucement pour occuper la page ;
  // le petit reste se partage à parts égales au-dessus et en dessous du texte (style.css, .intro-texte).
  function remplirPage(el) {
    var corps = el.querySelector('.intro-corps'), nav = el.querySelector('.intro-nav');
    if (!corps || !nav) return;
    corps.style.lineHeight = '';
    corps.style.removeProperty('--ecart-p');
    corps.style.position = ''; corps.style.top = '';
    var taille = parseFloat(getComputedStyle(corps).fontSize);
    var interligne = parseFloat(getComputedStyle(corps).lineHeight) / taille;
    var libre = function () { return nav.getBoundingClientRect().top - corps.getBoundingClientRect().bottom; };
    var essais = 0;
    while (libre() > taille * 0.9 && interligne < 1.7 && essais < 80) {
      interligne += 0.02;
      corps.style.lineHeight = interligne.toFixed(2);
      if (deborde(el)) { interligne -= 0.02; corps.style.lineHeight = interligne.toFixed(2); break; }
      essais++;
    }
    var ecart = 0.5;
    while (libre() > taille * 0.9 && ecart < 1.4 && essais < 160) {
      ecart += 0.03;
      corps.style.setProperty('--ecart-p', ecart.toFixed(2) + 'em');
      if (deborde(el)) { ecart -= 0.03; corps.style.setProperty('--ecart-p', ecart.toFixed(2) + 'em'); break; }
      essais++;
    }
    // le même espace au-dessus et au-dessous du texte (au pixel près) : le bloc glisse de la moitié de la différence
    var titre = el.querySelector('.grand-titre'), blocs = corps.children;
    if (titre && blocs.length) {
      var haut = blocs[0].getBoundingClientRect().top - titre.getBoundingClientRect().bottom;
      var bas = nav.getBoundingClientRect().top - blocs[blocs.length - 1].getBoundingClientRect().bottom;
      if (Math.abs(haut - bas) > 0.5) { corps.style.position = 'relative'; corps.style.top = ((bas - haut) / 2).toFixed(2) + 'px'; }
    }
  }

  // Un paragraphe dont la dernière ligne n'a qu'un ou deux mots (règle de Yoann : pas de mot seul en bout de ligne) :
  // ses derniers mots sont liés entre eux pour descendre ensemble ; les autres lignes restent pleines.
  // typographie française : « : ; ! ? » jamais seuls en début de ligne, et une durée « 5 s / 5 s » jamais coupée
  function insecables(html) {
    return html.replace(/ ([:;!?\u00bb])/g, '\u00a0$1').replace(/\u00ab /g, '\u00ab\u00a0')
      .replace(/(\d+) s \/ (\d+) s/g, '$1\u00a0s\u00a0/\u00a0$2\u00a0s');
  }
  function lignesDe(p) {
    var r = document.createRange(); r.selectNodeContents(p);
    var lignes = [], rects = r.getClientRects();
    for (var k = 0; k < rects.length; k++) {
      var t = Math.round(rects[k].top), d = lignes[lignes.length - 1];
      if (d && Math.abs(d.top - t) < 3) { d.gauche = Math.min(d.gauche, rects[k].left); d.droite = Math.max(d.droite, rects[k].right); }
      else lignes.push({ top: t, gauche: rects[k].left, droite: rects[k].right });
    }
    return lignes;
  }
  function lierDerniersMots(html, n) {
    var lies = 0, dansBalise = false, s = html.split('');
    for (var k = s.length - 1; k >= 0 && lies < n; k--) {
      if (s[k] === '>') dansBalise = true;
      else if (s[k] === '<') dansBalise = false;
      else if (!dansBalise && s[k] === ' ') { s[k] = ' '; lies++; }
    }
    return s.join('');
  }
  function eviterLignesCourtes(el, lier) {
    Array.prototype.forEach.call(el.querySelectorAll('.intro-corps p'), function (p) {
      if (p.dataset.texte === undefined) p.dataset.texte = insecables(p.innerHTML);
      p.innerHTML = p.dataset.texte;
      if (!lier) return;
      var largeur = p.getBoundingClientRect().width;
      // texte justifié : on ne lie que les deux derniers mots (en lier plus ferait de grands trous dans la ligne d'avant)
      var maxi = getComputedStyle(p).textAlign === 'justify' ? 1 : 3;
      for (var n = 1; n <= maxi; n++) {
        var lignes = lignesDe(p);
        if (lignes.length < 2) return;
        var der = lignes[lignes.length - 1];
        if (der.droite - der.gauche >= largeur * 0.22) return;
        var avantLien = p.innerHTML;
        p.innerHTML = lierDerniersMots(p.dataset.texte, n);
        if (deborde(el)) { p.innerHTML = avantLien; return; }
      }
    });
  }

  // « Choisir son juste rythme » : chaque ligne « Inspire 4 s · Expire 6 s → 4/6 » (avec son « ou ») tient dans son cadre ;
  // sinon les lignes de ce cadre rapetissent juste assez (la marge du cadre est gardée de chaque côté)
  function ajusterRythmes(el) {
    Array.prototype.forEach.call(el.querySelectorAll('.trois-cartes .carte'), function (carte) {
      var mots = carte.querySelector('.mots');
      if (!mots) return;
      mots.style.fontSize = '';
      var cs = getComputedStyle(carte), r = carte.getBoundingClientRect();
      var gauche = r.left + parseFloat(cs.paddingLeft) + parseFloat(cs.borderLeftWidth), droite = r.right - parseFloat(cs.paddingRight) - parseFloat(cs.borderRightWidth);
      var taille = parseFloat(getComputedStyle(mots).fontSize), essais = 0;
      var deborde = function () {
        var g = 1e9, d = -1e9;
        Array.prototype.forEach.call(mots.querySelectorAll('.ligne-r, .ou'), function (x) { var q = x.getBoundingClientRect(); g = Math.min(g, q.left); d = Math.max(d, q.right); });
        return g < gauche - 0.5 || d > droite + 0.5;
      };
      while (deborde() && essais < 40) { taille -= 0.25; mots.style.fontSize = taille + 'px'; essais++; }
    });
  }

  // Pages faites de blocs (carte, citation, cadres) : le même écart sous le titre, entre chaque bloc et au-dessus des boutons.
  function egaliserBlocs(el) {
    var corps = el.querySelector('.intro-corps'), titre = el.querySelector('.grand-titre'), nav = el.querySelector('.intro-nav');
    if (!corps || !titre || !nav) return;
    corps.style.gap = ''; corps.style.paddingTop = '0px'; corps.style.marginTop = '';
    // un dessin pas encore chargé n'a pas de hauteur : on recalcule quand il arrive
    Array.prototype.forEach.call(corps.querySelectorAll('img'), function (im) {
      if (!im.complete && !im.dataset.attendu) { im.dataset.attendu = '1'; im.addEventListener('load', ajusterPlusTard, { once: true }); }
    });
    // la page peut être en train de s'animer (agrandie ou rapetissée) : on ramène les mesures à sa vraie taille
    var echelle = el.getBoundingClientRect().height / el.offsetHeight || 1;
    // « À l'inspiration » et « À l'expiration » : le cadre et son dessin restent exactement à la même place sur les deux pages
    // (la phrase du cadre prend la largeur de la plus longue des deux)
    var hauteurPaire = 0;
    if (corps.querySelector('.carte-souffle')) {
      var html = corps.innerHTML, largeur = 0;
      DIAPOS.forEach(function (d) {
        if (d.corps.indexOf('carte-souffle') < 0) return;
        corps.innerHTML = insecables(d.corps);
        largeur = Math.max(largeur, corps.querySelector('.carte-souffle .souffle-grand + div').getBoundingClientRect().width / echelle);
      });
      // … et les deux pages prennent les mêmes écarts, calculés sur la plus haute des deux
      DIAPOS.forEach(function (d) {
        if (d.corps.indexOf('carte-souffle') < 0) return;
        corps.innerHTML = insecables(d.corps);
        corps.querySelector('.carte-souffle').style.gridTemplateColumns = 'auto ' + largeur.toFixed(2) + 'px';
        var h = 0;
        Array.prototype.forEach.call(corps.children, function (b) { h += b.getBoundingClientRect().height / echelle; });
        hauteurPaire = Math.max(hauteurPaire, h);
      });
      corps.innerHTML = html;
      corps.querySelector('.carte-souffle').style.gridTemplateColumns = 'auto ' + largeur.toFixed(2) + 'px';
    }
    var blocs = Array.prototype.slice.call(corps.children), hauteur = 0;
    blocs.forEach(function (b) { hauteur += b.getBoundingClientRect().height / echelle; });
    hauteur = Math.max(hauteur, hauteurPaire);
    var bas = titre.getBoundingClientRect().bottom, depart = (corps.getBoundingClientRect().top - bas) / echelle;
    var libre = (nav.getBoundingClientRect().top - bas) / echelle - hauteur;
    var ecart = libre / (blocs.length + 1);
    ecart = Math.max(0, ecart);
    corps.style.gap = ecart.toFixed(2) + 'px';
    // page chargée : le texte remonte un peu sous le titre pour garder le même écart partout
    if (ecart >= depart) corps.style.paddingTop = (ecart - depart).toFixed(2) + 'px';
    else corps.style.marginTop = (parseFloat(getComputedStyle(corps).marginTop) + ecart - depart).toFixed(2) + 'px';
  }

  var minuterieAjustement = 0;
  function ajusterPlusTard() {
    clearTimeout(minuterieAjustement);
    minuterieAjustement = setTimeout(ajuster, 80);
  }
  window.addEventListener('resize', ajusterPlusTard);
  window.addEventListener('monoxygene-decoupes', ajusterPlusTard); // la caméra a changé de place (téléphone retourné)
  window.addEventListener('orientationchange', function () { setTimeout(ajuster, 250); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { memoireIntro.cle = ''; memoireTexte.cle = ''; ajuster(); });

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
    titre.classList.toggle('installation', installation);
    // « Installe-toi confortablement », sur une seule ligne, sans phrase en dessous
    ecrire('phaseTitre', installation ? 'Installe-toi confortablement' : String(Math.ceil(avantDepart)));
    ecrire('phaseConsigne', installation
      ? ''
      : (s.debutInspire ? 'Prépare-toi à inspirer par le nez' : 'Prépare-toi à expirer par la bouche'));
    ecrire('phaseCompte', '');

    var ecouleDepuisDebut = PREPARATION - avantDepart;
    document.getElementById('sceneVague').style.opacity = Math.min(1, Math.max(0, ecouleDepuisDebut / 1.6)).toFixed(3);
    var hauteur = LigneVague.dessiner(document.getElementById('toileVague'), s.plan, 0, s.debutInspire);

    var lotus = document.getElementById('lotus');
    var echelle = 0.82 + 0.18 * R.ampleur(s.plan, 0, s.debutInspire) + 0.035 * (1 - Math.cos(ecouleDepuisDebut * Math.PI * 2 / 3)) / 2;
    // Pendant « Installe-toi », le lotus apparaît posé dans le creux, puis descend tout doucement jusqu'à sa place
    // de séance, juste au-dessus du trait ; une fois bien placé, le 3·2·1 se fait sans qu'il bouge.
    var reste = installation ? Math.max(0, Math.min(1, (avantDepart - DECOMPTE - LOTUS_AVANCE) / LOTUS_DESCENTE)) : 0;
    var doux = reste * reste * (3 - 2 * reste);
    var leve = LOTUS_REPOS + (LOTUS_POSE - LOTUS_REPOS) * doux;
    lotus.style.top = (hauteur * 100).toFixed(3) + '%';
    lotus.style.transform = 'translate(-50%,' + (-50 - leve).toFixed(2) + '%) scale(' + echelle.toFixed(4) + ')';
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

    // Sa ligne aquarelle ; le lotus suit le trait, au milieu de l'écran, posé juste un peu au-dessus
    var hauteur = LigneVague.dessiner(document.getElementById('toileVague'), s.plan, ecoule, s.debutInspire);
    var lotus = document.getElementById('lotus');
    var echelle = 0.82 + 0.18 * R.ampleur(s.plan, ecoule, s.debutInspire);
    lotus.style.top = (hauteur * 100).toFixed(3) + '%';
    lotus.style.transform = 'translate(-50%,' + (-50 - LOTUS_REPOS) + '%) scale(' + echelle.toFixed(4) + ')';

    // L'onde du temps se colore jusqu'au bout de la séance
    document.getElementById('ondeFaite').setAttribute('stroke-dasharray', Math.max(0.5, Math.min(1, ecoule / total) * 100).toFixed(2) + ' 100');

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
      case 'fermer-plus': etat.plusOuvert = false; etat.quiOuvert = false; etat.messageCode = null; break;
      case 'ouvrir-qui': etat.quiOuvert = true; break;
      case 'fermer-qui': etat.quiOuvert = false; break;
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
    if (cible.getAttribute('data-action') === 'fermer-qui-fond') {
      if (evenement.target !== cible) return;
      etat.quiOuvert = false;
      afficher();
      return;
    }
    if (cible.getAttribute('data-action') === 'fermer-plus-fond') {
      if (evenement.target !== cible) return;
      etat.plusOuvert = false;
      etat.quiOuvert = false;
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
      cible.style.setProperty('--rempli', cible.value + '%');
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
    if (evenement.key === 'Escape' && etat.quiOuvert) { etat.quiOuvert = false; afficher(); return; }
    if (evenement.key === 'Escape' && etat.plusOuvert) { etat.plusOuvert = false; afficher(); }
    if ((evenement.key === 'Enter' || evenement.key === ' ') && evenement.target.classList && evenement.target.classList.contains('carte-qui')) { evenement.preventDefault(); action(evenement.target); }
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
