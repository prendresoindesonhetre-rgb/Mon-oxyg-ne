# Publier Mon Oxygène sur le Play Store

Tout ce qui concerne la version Play Store est dans ce dossier `playstore/` :

- `app/` : l'appli Android. Elle contient la version web v83 validée (dans `app/src/main/assets/web/`), avec deux corrections : le bouton choisi est lisible sur téléphone, et le bâton de pluie démarre à 55 %.
- `fiche/` : les images de la fiche Play Store (icône, bannière, captures téléphone et tablette).
- `.github/workflows/playstore.yml` (à la racine du dépôt) : GitHub construit l'appli à chaque modification de ce dossier.

Identifiant de l'appli : `fr.prendresoindesonhetre.monoxygene` (définitif, il ne pourra plus changer).

---

## Étape 1 — Donner la clé d'envoi à GitHub (5 minutes)

La clé sert à prouver à Google que c'est bien toi qui envoies l'appli. Elle est dans le fichier `A-COPIER-DANS-GITHUB.txt` que Claude t'a remis, avec le fichier `mon-oxygene-cle-envoi.p12`.

1. Range ces deux fichiers en lieu sûr (ton ordinateur et une sauvegarde). **Ne les mets jamais dans le dépôt : il est public.**
2. Sur github.com, ouvre le dépôt **Mon-oxyg-ne** → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**.
3. Crée les 2 secrets indiqués dans le fichier :
   - `MON_OXYGENE_CLE` : la longue ligne de lettres et de chiffres, en entier ;
   - `MON_OXYGENE_MOT_DE_PASSE` : le mot de passe.
4. Relance la construction : onglet **Actions** → **Mon Oxygène pour le Play Store** → **Run workflow**.

Quand c'est fait, le résumé de la construction n'affiche plus l'avertissement « clé de test ».

## Étape 2 — Mettre en ligne la politique de confidentialité

Google demande l'adresse d'une page « Politique de confidentialité ». Elle est prête (`pwa/www/confidentialite.html`) et sera en ligne quand la branche `claude/wonderful-davinci-j5g0gn` sera fusionnée dans `main` :

https://prendresoindesonhetre-rgb.github.io/Mon-oxyg-ne/confidentialite.html

À vérifier avant : le nom de l'éditeur (« Prendre soin de son Hêtre ») et l'adresse e-mail de contact (prendresoindesonhetre@gmail.com).

## Étape 3 — Créer le compte développeur « Organisation »

1. Il faut d'abord un **numéro D-U-N-S** pour ton entreprise. Il est gratuit et délivré par Dun & Bradstreet. Ton entreprise en a peut-être déjà un : la Play Console propose de le rechercher, ou d'en faire la demande, pendant l'inscription. Compte jusqu'à quelques semaines s'il faut le créer.
2. Inscription sur https://play.google.com/console/signup → type de compte **Organisation**.
3. Les informations de l'entreprise (nom, adresse) doivent être **exactement** celles enregistrées pour le D-U-N-S.
4. Frais d'inscription : 25 $, une seule fois. Google vérifie ensuite l'identité de la personne responsable du compte.

Avec un compte organisation, le test fermé obligatoire (12 testeurs pendant 14 jours) ne s'applique pas.

## Étape 4 — Créer l'appli dans la Play Console

**Créer une application** :
- Nom : `Mon Oxygène`
- Langue par défaut : Français (France)
- Application ou jeu : **Application**
- Gratuite ou payante : **Gratuite**

## Étape 5 — « Contenu de l'application » : les réponses

| Rubrique | Réponse |
|---|---|
| Règles de confidentialité | https://prendresoindesonhetre-rgb.github.io/Mon-oxyg-ne/confidentialite.html |
| Accès à l'application | Toutes les fonctionnalités sont accessibles sans restriction (pas de compte, pas de connexion) |
| Annonces | Non, l'appli ne contient pas d'annonces |
| Classification du contenu | Questionnaire IARC : catégorie « Toutes les autres types d'applications », répondre **Non** à toutes les questions (violence, sexualité, langage, achats, partage de position, échanges entre utilisateurs…) → classée tout public (PEGI 3) |
| Public cible | **18 ans et plus** (ou cocher aussi 13–15 et 16–17 ans). Ne pas cocher les moins de 13 ans, sinon les règles du programme « Familles » s'appliquent. |
| Sécurité des données | « Votre appli collecte-t-elle ou partage-t-elle des types de données utilisateur obligatoires ? » → **Non**. |
| Identifiant publicitaire | **Non**, l'appli ne l'utilise pas |
| Applis de santé | Choisir la case qui correspond à la **relaxation / gestion du stress / bien-être mental**. L'appli ne collecte aucune donnée de santé. |
| Applis gouvernementales, fonctionnalités financières, actualités | Non / aucune |

## Étape 6 — Fiche du Play Store

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

CINQ PRÉRÉGLAGES
• Ralentir : 4 s / 6 s
• Retrouver le calme : de 4 / 6 vers 5 / 5
• Équilibre : 5 s / 5 s
• Retrouver du dynamisme : de 6 / 4 vers 5 / 5
• Dynamiser : 6 s / 4 s

À TON RYTHME
• Inspiration et expiration réglables de 2 à 8 secondes
• Séance de 1 à 20 minutes
• Commencer par l'inspiration ou par l'expiration
• Mode « Personnaliser » pour faire évoluer ton rythme au fil de la séance
• Un bâton de pluie qui accompagne doucement chaque souffle, au volume que tu choisis

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
- Captures d'écran du téléphone : les 5 images de `captures-telephone/`, dans l'ordre
- Captures d'écran des tablettes 7 et 10 pouces : les 5 images de `captures-tablette/`

**Paramètres de la fiche** (Présence sur le Play Store → Paramètres de la fiche)
- Catégorie : **Santé et remise en forme**
- Adresse e-mail de contact : celle de l'entreprise (elle est visible publiquement)

## Étape 7 — Envoyer l'appli

1. Récupère le fichier `.aab` : sur GitHub, onglet **Actions** → **Mon Oxygène pour le Play Store** → la dernière construction réussie (après l'étape 1) → en bas, **Artifacts** → télécharge le zip. Il contient :
   - `Mon-Oxygene-PlayStore-vN.aab` : **le fichier à envoyer à Google** ;
   - `Mon-Oxygene-essai-vN.apk` : la même appli, à installer directement sur ton téléphone pour l'essayer.
2. Conseillé : un essai par le Play Store avec **Tester → Tests internes** (toi et quelques adresses Gmail, sans examen long) :
   - **Créer une release**. À la première release, accepte la **signature d'application Play** (Google garde la clé de signature finale, et ta clé ne sert qu'à envoyer).
   - Ajoute le fichier `.aab`, avec la note de version : `Première version de Mon Oxygène sur le Play Store.`
   - Enregistre, puis envoie.
3. Ensuite, **Production → Créer une release**. Ajoute le même `.aab` (ou un plus récent), choisis les **pays** (France, Belgique, Suisse, Canada, Luxembourg…), puis **Envoyer pour examen**.
4. Google examine l'appli. Pour une première appli, compte quelques jours, parfois plus. Tu reçois un e-mail dès qu'elle est publiée.

Bon à savoir :
- Les anciennes APK de test de Mon Oxygène ont d'autres identifiants : elles resteront installées à côté. Tu peux les désinstaller.
- Une appli installée depuis l'APK d'essai doit être désinstallée avant d'installer celle du Play Store (les signatures sont différentes).
- Dans la Play Console, **Intégrité de l'application → Signature d'application** affiche le « certificat de la clé d'importation ». Son empreinte SHA-256 doit être la même que celle notée dans `A-COPIER-DANS-GITHUB.txt`.

## Mises à jour

Chaque modification envoyée dans `playstore/` relance la construction sur GitHub, avec un numéro de version plus grand. Il suffit ensuite d'envoyer le nouveau `.aab` dans la Play Console (**Production → Créer une release**).

Si le contenu web change (`pwa/www`), il faut aussi recopier les fichiers modifiés dans `playstore/app/src/main/assets/web/`.
