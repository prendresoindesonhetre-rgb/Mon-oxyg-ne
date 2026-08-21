from pathlib import Path

# v36 ne modifie aucun élément visuel ni fonctionnel.
# Ce marqueur permet simplement d'identifier clairement le nouveau build APK
# réalisé à partir de la version responsive v35.
path = Path('app/src/main/java/fr/prendresoindesonhetre/monoxygene/MainActivity.java')
s = path.read_text(encoding='utf-8')
marker = 'public class MainActivity extends Activity {'
replacement = 'public class MainActivity extends Activity {\n    // Mon Oxygène v36 — build responsive final.'
if marker not in s:
    raise SystemExit('MainActivity marker introuvable')
s = s.replace(marker, replacement, 1)
path.write_text(s, encoding='utf-8')
print('Mon Oxygène v36 : build responsive final, aucun changement visuel')
