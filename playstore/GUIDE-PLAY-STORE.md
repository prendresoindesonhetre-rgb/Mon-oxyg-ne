# Publier Mon Oxygène sur le Play Store

- `pwa/www/` (à la racine du dépôt) : **l'appli elle-même**, une seule source pour le site web et pour l'appli Android.
- `playstore/app/` : l'enveloppe Android. À chaque construction, elle reprend le contenu de `pwa/www` (sans la Régie) et ajoute les paiements Google Play.
- `playstore/fiche/` : les images de la fiche Play Store.
- `.github/workflows/playstore.yml` : GitHub construit l'appli à chaque modification de `pwa/www` ou de `playstore/`.

Identifiant de l'appli : `fr.prendresoindesonhetre.monoxygene` (définitif, il ne pourra plus changer).

**Gratuit** : l'introduction et la séance de base de cohérence cardiaque (5 min, inspire 5 s, expire 5 s, en commençant par l'inspiration, sans son).
**Mon Oxygène Plus** : tout le reste (durée et rythme libres, commencer par l'expiration, Ralentir, Dynamiser, les enchaînements, Personnaliser, le bâton de pluie).

---

## Étape 1 — Clé d'envoi dans GitHub ✅ (déjà fait)

Les secrets `MON_OXYGENE_CLE` et `MON_OXYGENE_MOT_DE_PASSE` sont en place : les fichiers construits sont signés avec ta clé.
Garde précieusement `A-COPIER-DANS-GITHUB.txt` et `mon-oxygene-cle-envoi.p12`, **jamais dans le dépôt** (il est public).

## Étape 2 — Politique de confidentialité ✅ (en ligne)

https://prendresoindesonhetre-rgb.github.io/Mon-oxyg-ne/confidentialite.html

## Étape 3 — Le compte développeur « Organisation »

1. **Numéro D-U-N-S** de l'entreprise : avec l'outil gratuit d'Apple, https://developer.apple.com/enroll/duns-lookup/ (un identifiant Apple gratuit suffit). Il retrouve le numéro s'il existe, sinon il en demande un gratuitement. Ne paie rien à Altares ou à un autre site.
2. Inscription sur https://play.google.com/console/signup → type de compte **Organisation**. Le nom et l'adresse doivent être **exactement** ceux du D-U-N-S (ceux de l'annuaire des entreprises).
3. Frais d'inscription : 25 $, une seule fois. Google vérifie ensuite l'identité de la personne responsable du compte.

Avec un compte organisation, le test fermé obligatoire (12 testeurs pendant 14 jours) ne s'applique pas.

## Étape 4 — Le profil de paiement (pour recevoir l'argent de Mon Oxygène Plus)

Play Console → **Paramètres** → **Profil de paiement** (ou « Configurer un compte marchand ») :
coordonnées de l'entreprise, compte bancaire, informations fiscales. Google prélève 15 % sur les abonnements et reverse le reste chaque mois.

## Étape 5 — Créer l'appli dans la Play Console

**Créer une application** :
- Nom : `Mon Oxygène`
- Langue par défaut : Français (France)
- Application ou jeu : **Application**
- Gratuite ou payante : **Gratuite** (les achats Plus se font dans l'appli)

## Étape 6 — « Contenu de l'application » : les réponses

| Rubrique | Réponse |
|---|---|
| Règles de confidentialité | https://prendresoindesonhetre-rgb.github.io/Mon-oxyg-ne/confidentialite.html |
| Accès à l'application | Toutes les fonctionnalités sont accessibles sans identifiant (pas de compte). Les fonctions Plus se débloquent par un achat Google Play ou un code cadeau. |
| Annonces | Non, l'appli ne contient pas d'annonces |
| Classification du contenu | Questionnaire IARC : catégorie « Toutes les autres types d'applications ». Répondre **Oui** à « achats numériques » (achats intégrés) et **Non** à tout le reste → tout public (PEGI 3) |
| Public cible | **18 ans et plus** (ou cocher aussi 13–15 et 16–17 ans). Ne pas cocher les moins de 13 ans, sinon les règles du programme « Familles » s'appliquent. |
| Sécurité des données | « Votre appli collecte-t-elle ou partage-t-elle des types de données utilisateur obligatoires ? » → **Non** : l'appli n'envoie rien, les paiements sont traités par Google Play. |
| Identifiant publicitaire | **Non**, l'appli ne l'utilise pas |
| Applis de santé | Choisir la case qui correspond à la **relaxation / gestion du stress / bien-être mental**. L'appli ne collecte aucune donnée de santé. |
| Applis gouvernementales, fonctionnalités financières, actualités | Non / aucune |

## Étape 7 — Fiche du Play Store

**Présence sur le Play Store → Fiche principale du Play Store**

**Nom de l'application** (30 caractères maximum)
```
Mon Oxygène
```

**Description courte** (80 caractères maximum)
```
Respiration guidée pour se poser, retrouver le calme et revenir à soi.
```

**Description complète**
```
Mon Oxygène est un espace de respiration guidée pour revenir à soi.

Respirer est un besoin vital. Lorsqu'on y met de la conscience et du sens, chaque souffle devient un retour à soi. Mon Oxygène t'accompagne pour prendre un moment, accueillir ce qui est là et laisser les choses se poser.

COMMENT ÇA MARCHE
Une courbe douce se déroule à l'écran et un lotus la suit : il monte pendant l'inspiration et redescend pendant l'expiration. Il suffit de laisser ta respiration l'accompagner.
• Inspire par le nez, le ventre se gonfle.
• Expire par la bouche, le ventre se dégonfle.

GRATUIT
La séance de cohérence cardiaque de base : 5 minutes, 5 secondes pour inspirer, 5 secondes pour expirer.

AVEC MON OXYGÈNE PLUS
• La durée de ta séance, de 1 à 20 minutes
• Ton rythme, de 2 à 8 secondes pour inspirer et pour expirer
• Commencer par l'inspiration ou par l'expiration
• Les préréglages Ralentir (4 / 6) et Dynamiser (6 / 4)
• Les enchaînements Retrouver le calme (4 / 6 puis 5 / 5) et Retrouver du dynamisme (6 / 4 puis 5 / 5)
• Personnaliser : tes propres étapes, enchaînées automatiquement
• Un bâton de pluie qui accompagne doucement chaque souffle, au volume que tu choisis
Abonnement au mois ou à l'année avec 7 jours d'essai gratuit, sans engagement.

SIMPLE ET RESPECTUEUX
• Aucune publicité, aucun compte à créer
• Fonctionne sans connexion internet
• Aucune donnée collectée : tes réglages restent sur ton appareil

Une manière de prendre soin de son Hêtre : revenir à soi avec douceur, s'écouter et accueillir ce qui est là. Tu n'as rien à réussir, rien à forcer.

Mon Oxygène est conçue par Prendre soin de son Hêtre.

Écoute ton corps : la respiration doit toujours rester confortable. En cas de vertige, de gêne, d'essoufflement ou de malaise, arrête l'exercice et reprends ta respiration naturelle. Mon Oxygène ne remplace pas l'avis d'un médecin ou d'un professionnel de santé.
```

**Images** (dossier `fiche/`)
- Icône de l'application (512 × 512) : `icone-play-store-512.png`
- Image de présentation (1024 × 500) : `image-de-presentation-1024x500.png`
- Captures d'écran du téléphone : les images de `captures-telephone/`, dans l'ordre
- Captures d'écran des tablettes 7 et 10 pouces : les images de `captures-tablette/`

**Paramètres de la fiche** (Présence sur le Play Store → Paramètres de la fiche)
- Catégorie : **Santé et remise en forme**
- Adresse e-mail de contact : celle de l'entreprise (elle est visible publiquement)

## Étape 8 — Premier envoi de l'appli (test interne)

Google n'autorise à créer l'abonnement qu'**après** un premier envoi d'une version qui contient les paiements.

1. Récupère le fichier `.aab` : sur GitHub, onglet **Actions** → **Mon Oxygène pour le Play Store** → la dernière construction réussie → en bas, **Artifacts** → télécharge le zip. Il contient :
   - `Mon-Oxygene-PlayStore-vN.aab` : **le fichier à envoyer à Google** ;
   - `Mon-Oxygene-essai-vN.apk` : la même appli, à installer directement sur ton téléphone pour l'essayer.
2. Play Console → **Tester → Tests internes** → **Créer une release**. À la première release, accepte la **signature d'application Play** (Google garde la clé de signature finale, ta clé ne sert qu'à envoyer).
3. Ajoute le fichier `.aab`, avec la note de version : `Première version de Mon Oxygène sur le Play Store.` Enregistre, puis envoie.
4. Dans **Testeurs**, ajoute ton adresse Gmail (et celles de quelques proches) : le lien du test interne permet d'installer l'appli depuis le Play Store.

## Étape 9 — Créer Mon Oxygène Plus dans la Play Console

**Monétiser → Produits → Abonnements → Créer un abonnement**
- ID du produit : `mon_oxygene_plus` (exactement, il ne peut plus changer)
- Nom : `Mon Oxygène Plus`
- Ajoute **deux forfaits de base** :
  - ID `mensuel` : renouvellement automatique, **1 mois**, ton prix → **Activer** ;
  - ID `annuel` : renouvellement automatique, **1 an**, ton prix → **Activer**.
- Sur chaque forfait, **Ajouter une offre** : ID `essai-7-jours`, éligibilité « Nouveaux clients », phase **Essai gratuit de 7 jours** → **Activer**.

**Achat à vie (facultatif, quand tu veux)** : **Monétiser → Produits → Produits intégrés** (ou « Produits ponctuels ») → **Créer**
- ID du produit : `mon_oxygene_plus_a_vie` (exactement)
- Nom : `Mon Oxygène Plus à vie`, ton prix → **Activer**.

L'appli affiche toute seule les formules actives, avec les prix de Google : tu peux changer un prix, ajouter ou désactiver l'achat à vie à tout moment, sans nouvelle version de l'appli.

**Essayer les achats sans payer** : Play Console → **Paramètres** → **Test des licences** → ajoute les adresses Gmail des testeurs. Ces comptes voient « Achat test » et ne sont pas débités ; les abonnements de test se renouvellent toutes les quelques minutes.

## Étape 10 — Publication

**Production → Créer une release** : ajoute le `.aab` (le même ou un plus récent), choisis les **pays** (France, Belgique, Suisse, Canada, Luxembourg…), puis **Envoyer pour examen**. Pour une première appli, compte quelques jours, parfois plus. Tu reçois un e-mail dès qu'elle est publiée.

Bon à savoir :
- Les anciennes APK de test de Mon Oxygène ont d'autres identifiants : elles resteront installées à côté. Tu peux les désinstaller.
- Une appli installée depuis l'APK d'essai doit être désinstallée avant d'installer celle du Play Store (les signatures sont différentes).
- Dans la Play Console, **Intégrité de l'application → Signature d'application** affiche le « certificat de la clé d'importation ». Son empreinte SHA-256 doit être la même que celle notée dans `A-COPIER-DANS-GITHUB.txt`.

## Offrir Mon Oxygène Plus : les codes cadeaux

Le fichier `generateur-codes-cadeaux-mon-oxygene.html` (remis à part, **à garder pour toi**, jamais dans le dépôt) fabrique les codes :

1. Ouvre-le sur ton ordinateur (double-clic : il s'ouvre dans le navigateur, sans connexion).
2. Choisis la durée (1 mois, 3 mois, 6 mois, 1 an ou à vie), éventuellement le prénom de la personne (pour ton historique).
3. **Créer le code**, puis **Copier le message prêt à envoyer** et colle-le dans un SMS ou un e-mail.

La personne touche « Débloquer Plus » dans l'appli, puis colle le code dans « J'ai un code cadeau ». Les codes marchent dans l'appli Android et sur la version web (pratique pour l'iPhone).

À savoir :
- La date de fin d'un code est fixée le jour où tu le crées (un code « 1 mois » créé le 29 octobre finit le 29 novembre).
- Un code est vérifié sans connexion : il ne peut pas être annulé une fois envoyé, et la personne peut le transmettre. Pour un accès « à vie », réserve-le aux personnes de confiance.
- Les codes sont **gratuits** : Google interdit de vendre l'accès à Plus en dehors de Google Play.

## Mises à jour

Chaque modification de `pwa/www/` ou de `playstore/` relance la construction sur GitHub, avec un numéro de version plus grand. Il suffit ensuite d'envoyer le nouveau `.aab` dans la Play Console (**Production → Créer une release**). La version web se met à jour toute seule quand la branche est fusionnée dans `main`.
