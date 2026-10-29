// Mon Oxygène Plus : qui y a droit (achat Google Play ou code cadeau), et les offres à afficher.
// Les paiements passent par l'appli Android (pont MonOxygeneAchats) ; les codes cadeaux
// sont vérifiés ici, sans connexion, grâce à leur signature.
(function () {
  'use strict';

  // Clé publique des codes cadeaux (ECDSA P-256). La clé privée reste dans le générateur privé.
  var CLE_PUBLIQUE = 'BFp_yLsAnnESeqvvPyzONNNsLEWxbe3S7kv0eOwcL47mkEXNkS9z1uuBoP4w9xV-dtsHqVz0IivmJLhrFnznnPA';
  var CLE_CODE = 'mon-oxygene-code-cadeau';
  // Dernier état connu des achats Google : évite d'afficher les cadenas le temps que Google Play réponde.
  var CLE_INDICE = 'mon-oxygene-plus-google';
  var JOUR_ZERO = Date.UTC(2026, 0, 1);
  var MS_JOUR = 86400000;

  var pont = window.MonOxygeneAchats || null;
  var ecouteurs = [];

  var Plus = {
    android: !!pont,
    actif: false,
    source: null,        // 'google' ou 'cadeau'
    finCadeau: null,     // date de fin d'un code cadeau ; null pour un code à vie
    google: { pret: false, actif: false, aVie: false, enAttente: false, offres: [], erreur: null },
    cadeau: null         // { fin: Date | null }
  };

  function lire(cle) { try { return localStorage.getItem(cle); } catch (_) { return null; } }
  function ecrire(cle, valeur) {
    try { if (valeur === null) localStorage.removeItem(cle); else localStorage.setItem(cle, valeur); } catch (_) {}
  }

  function versOctets(texte) {
    var b = texte.replace(/-/g, '+').replace(/_/g, '/');
    while (b.length % 4) b += '=';
    var binaire = atob(b);
    var octets = new Uint8Array(binaire.length);
    for (var i = 0; i < binaire.length; i++) octets[i] = binaire.charCodeAt(i);
    return octets;
  }
  function versTexte(octets) {
    var binaire = '';
    for (var i = 0; i < octets.length; i++) binaire += String.fromCharCode(octets[i]);
    return btoa(binaire).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  function jourActuel() { return Math.floor((Date.now() - JOUR_ZERO) / MS_JOUR); }

  function dateLisible(date) {
    try { return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }); }
    catch (_) { return date.toISOString().slice(0, 10); }
  }

  // Un code : « OXY- » puis 72 octets en base64url = 8 octets de contenu + 64 octets de signature.
  // Contenu : version (1), mois offerts (0 = à vie), jour de fin (2 octets, compté depuis le 1er janvier 2026), 4 octets au hasard.
  function extraire(texte) {
    var trouve = String(texte || '').replace(/\s+/g, '').match(/OXY-([A-Za-z0-9_-]{96})/i);
    if (!trouve) return null;
    var octets;
    try { octets = versOctets(trouve[1]); } catch (_) { return null; }
    if (octets.length !== 72) return null;
    return { texte: 'OXY-' + trouve[1], contenu: octets.slice(0, 8), signature: octets.slice(8) };
  }

  function verifierSignature(contenu, signature) {
    if (pont && typeof pont.verifierCode === 'function') {
      try { return Promise.resolve(!!pont.verifierCode(versTexte(contenu), versTexte(signature))); } catch (_) {}
    }
    if (window.crypto && crypto.subtle) {
      return crypto.subtle.importKey('raw', versOctets(CLE_PUBLIQUE), { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify'])
        .then(function (cle) { return crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, cle, signature, contenu); })
        .catch(function () { return false; });
    }
    return Promise.resolve(false);
  }

  // Résultat : { ok, fin (Date ou null pour à vie), message }
  function examiner(texte) {
    var code = extraire(texte);
    var inconnu = { ok: false, message: 'Ce code n’est pas reconnu. Vérifie qu’il est copié en entier.' };
    if (!code || code.contenu[0] !== 1) return Promise.resolve(inconnu);
    return verifierSignature(code.contenu, code.signature).then(function (valide) {
      if (!valide) return inconnu;
      var mois = code.contenu[1];
      if (mois === 0) return { ok: true, code: code.texte, fin: null, message: 'Mon Oxygène Plus t’est offert à vie. Belle respiration !' };
      var jourFin = (code.contenu[2] << 8) | code.contenu[3];
      var fin = new Date(JOUR_ZERO + jourFin * MS_JOUR);
      if (jourActuel() > jourFin) return { ok: false, message: 'Ce code cadeau a expiré le ' + dateLisible(fin) + '.' };
      return { ok: true, code: code.texte, fin: fin, message: 'Mon Oxygène Plus t’est offert jusqu’au ' + dateLisible(fin) + '.' };
    });
  }

  function prevenir() {
    for (var i = 0; i < ecouteurs.length; i++) {
      try { ecouteurs[i](Plus); } catch (_) {}
    }
  }

  function recalculer() {
    var cadeauValide = !!Plus.cadeau && (!Plus.cadeau.fin || jourActuel() <= Math.floor((Plus.cadeau.fin - JOUR_ZERO) / MS_JOUR));
    if (Plus.cadeau && !cadeauValide) { Plus.cadeau = null; ecrire(CLE_CODE, null); }
    Plus.actif = Plus.google.actif || cadeauValide;
    Plus.source = Plus.google.actif ? 'google' : (cadeauValide ? 'cadeau' : null);
    Plus.finCadeau = cadeauValide ? Plus.cadeau.fin : null;
    prevenir();
  }

  // Appelé par l'appli Android avec l'état des achats et des offres Google Play.
  window.MonOxygenePlusAndroid = function (donnees) {
    var d = typeof donnees === 'string' ? JSON.parse(donnees) : donnees;
    Plus.google = {
      pret: !!d.pret,
      // Google Play injoignable : on garde le dernier état connu plutôt que de couper l'accès.
      actif: d.pret ? !!d.actif : Plus.google.actif,
      aVie: !!d.aVie,
      enAttente: !!d.enAttente,
      offres: Array.isArray(d.offres) ? d.offres : [],
      erreur: d.erreur || null
    };
    if (d.pret) ecrire(CLE_INDICE, d.actif ? '1' : '0');
    recalculer();
  };

  Plus.surChangement = function (fonction) { ecouteurs.push(fonction); };

  Plus.activerCode = function (texte) {
    return examiner(texte).then(function (resultat) {
      if (resultat.ok) {
        Plus.cadeau = { fin: resultat.fin };
        ecrire(CLE_CODE, resultat.code);
        recalculer();
      }
      return resultat;
    });
  };

  Plus.acheter = function (offre) { if (pont) pont.acheter(offre.produit, offre.plan || ''); };
  Plus.restaurer = function () { if (pont) pont.restaurer(); };
  Plus.gerer = function () { if (pont) pont.gerer(); };
  Plus.dateLisible = dateLisible;

  // Démarrage : code cadeau déjà enregistré, puis état des achats Google.
  if (pont && lire(CLE_INDICE) === '1') Plus.google.actif = true;
  recalculer();
  var codeEnregistre = lire(CLE_CODE);
  if (codeEnregistre) {
    examiner(codeEnregistre).then(function (resultat) {
      Plus.cadeau = resultat.ok ? { fin: resultat.fin } : null;
      if (!resultat.ok) ecrire(CLE_CODE, null);
      recalculer();
    });
  }
  if (pont) {
    try { pont.demarrer(); } catch (_) {}
  }
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') recalculer();
  });

  window.MonOxygenePlus = Plus;
})();
