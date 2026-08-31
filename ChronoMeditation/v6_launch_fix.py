from pathlib import Path

manifest = Path('app/src/main/AndroidManifest.xml')
text = manifest.read_text()
text = text.replace('android:name=".MainActivity"', 'android:name="fr.prendresoindesonhetre.chronomeditation.MainActivity"')
manifest.write_text(text)
print('V6 launcher activity fixed to fully qualified class name')
