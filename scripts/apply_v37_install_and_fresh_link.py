from pathlib import Path
import sys

MODE = sys.argv[1] if len(sys.argv) > 1 else 'all'


def patch_android():
    gradle = Path('app/build.gradle')
    s = gradle.read_text(encoding='utf-8')
    s = s.replace("applicationId 'fr.prendresoindesonhetre.monoxygene'", "applicationId 'fr.prendresoindesonhetre.monoxygene.finalapp'", 1)
    s = s.replace("versionCode 36", "versionCode 37", 1)
    s = s.replace("versionName '1.0.36'", "versionName '1.0.37'", 1)
    gradle.write_text(s, encoding='utf-8')
    print('Android v37 : nouvel identifiant de paquet pour éviter les conflits de signature des anciennes APK')


def patch_pwa():
    sw = Path('pwa/www/sw.js')
    s = sw.read_text(encoding='utf-8')
    old_cache = "const CACHE_NAME = 'mon-oxygene-pwa-v15-responsive-auto';"
    new_cache = "const CACHE_NAME = 'mon-oxygene-pwa-v16-fresh-mobile';"
    if old_cache not in s:
        raise SystemExit('Cache PWA v15 introuvable')
    s = s.replace(old_cache, new_cache, 1)
    sw.write_text(s, encoding='utf-8')
    print('PWA v37 : nouveau cache indépendant activé')


if MODE in ('android', 'all'):
    patch_android()
if MODE in ('pwa', 'all'):
    patch_pwa()
if MODE not in ('android', 'pwa', 'all'):
    raise SystemExit('Mode attendu: android, pwa ou all')
