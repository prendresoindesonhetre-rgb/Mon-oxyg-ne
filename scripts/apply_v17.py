from pathlib import Path

path = Path('app/src/main/java/fr/prendresoindesonhetre/monoxygene/MainActivity.java')
s = path.read_text(encoding='utf-8')

# Accentuer encore la fermeture du lotus en fin d'expiration tout en gardant
# exactement la meme taille maximale en fin d'inspiration.
old = 'float breatheScale=(float)(.84+.34*easedBreath);'
new = 'float breatheScale=(float)(.74+.44*easedBreath);'
if old not in s:
    raise SystemExit('breatheScale v16 introuvable')
s = s.replace(old, new)

path.write_text(s, encoding='utf-8')
