from pathlib import Path

path = Path('app/src/main/java/fr/prendresoindesonhetre/monoxygene/MainActivity.java')
s = path.read_text(encoding='utf-8')

# Accentuer uniquement le repli en fin d'expiration :
# taille maximale inchangée à la fin de l'inspiration (1.18),
# mais taille minimale nettement plus petite à la fin de l'expiration (0.70).
old = 'float breatheScale=(float)(.84+.34*easedBreath);'
new = 'float breatheScale=(float)(.70+.48*easedBreath);'
if old not in s:
    raise SystemExit('breatheScale v16 introuvable')
s = s.replace(old, new)

path.write_text(s, encoding='utf-8')
