from pathlib import Path

path = Path('app/src/main/java/fr/prendresoindesonhetre/monoxygene/MainActivity.java')
s = path.read_text(encoding='utf-8')

# Rendre la respiration du lotus nettement plus visible tout en restant douce.
# Le rythme reste strictement synchronisé avec Inspirez / Expirez :
# taille minimale en fin d'expiration, taille maximale en fin d'inspiration.
old_scale = 'float breatheScale=(float)(.93+.14*easedBreath);'
new_scale = 'float breatheScale=(float)(.84+.34*easedBreath);'
if old_scale not in s:
    raise SystemExit('breatheScale v15 introuvable')
s = s.replace(old_scale, new_scale)

# Le lotus est légèrement plus présent à l'écran pour que son mouvement soit perceptible
# sans ajouter de halo, aura, cercle ou autre effet autour.
old_draw = 'drawBreathingFlower(c,flowerX,flowerY,h*.0275f,breatheScale);'
new_draw = 'drawBreathingFlower(c,flowerX,flowerY,h*.0305f,breatheScale);'
if old_draw not in s:
    raise SystemExit('appel lotus v15 introuvable')
s = s.replace(old_draw, new_draw)

path.write_text(s, encoding='utf-8')
