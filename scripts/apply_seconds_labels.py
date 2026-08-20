from pathlib import Path
import sys

mode = sys.argv[1] if len(sys.argv) > 1 else "all"

TARGETS = []
if mode in ("android", "all"):
    TARGETS.append(Path("app/src/main/java/fr/prendresoindesonhetre/monoxygene/MainActivity.java"))
if mode in ("pwa", "all"):
    TARGETS.append(Path("pwa/www/app.js"))

replacements = [
    ("5 s / 5 s", "5s/5s"),
    ("4 s / 6 s", "4s/6s"),
    ("3 s / 5 s", "3s/5s"),
    ("6 s / 4 s", "6s/4s"),
    ("5 s / 3 s", "5s/3s"),
    ("5 / 5", "5s/5s"),
    ("4 / 6", "4s/6s"),
    ("3 / 5", "3s/5s"),
    ("6 / 4", "6s/4s"),
    ("5 / 3", "5s/3s"),
    ("Équilibre 5/5", "Équilibre 5s/5s"),
    ("Ralentir 4/6", "Ralentir 4s/6s"),
    ("Dynamiser 6/4", "Dynamiser 6s/4s"),
]

changed_total = 0
for path in TARGETS:
    if not path.exists():
        raise SystemExit(f"Fichier introuvable: {path}")
    text = path.read_text(encoding="utf-8")
    before = text
    for old, new in replacements:
        text = text.replace(old, new)
    if text != before:
        path.write_text(text, encoding="utf-8")
        changed_total += 1
        print(f"Secondes ajoutées dans {path}")
    else:
        print(f"Aucune modification nécessaire dans {path}")

if changed_total == 0:
    raise SystemExit("Aucun libellé de rythme n'a été modifié")

print("Libellés respiratoires uniformisés avec la notation en secondes")
