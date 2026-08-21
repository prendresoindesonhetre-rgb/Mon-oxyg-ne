from pathlib import Path
import sys

MODE = sys.argv[1] if len(sys.argv) > 1 else 'all'


def patch_android():
    gradle = Path('app/build.gradle')
    s = gradle.read_text(encoding='utf-8')
    old_id = "applicationId 'fr.prendresoindesonhetre.monoxygene'"
    if old_id not in s:
        raise SystemExit('applicationId Android attendu introuvable')
    s = s.replace(old_id, "applicationId 'fr.prendresoindesonhetre.monoxygene.finalapp'", 1)
    if 'versionCode 36' not in s or "versionName '1.0.36'" not in s:
        raise SystemExit('Version Android v36 introuvable')
    s = s.replace('versionCode 36', 'versionCode 37', 1)
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
    marker = "  './responsive.js',\n"
    if marker not in s:
        raise SystemExit('Ressource responsive.js introuvable dans CORE')
    s = s.replace(marker, marker + "  './v37-fixes.css',\n", 1)
    sw.write_text(s, encoding='utf-8')
    print('PWA v37 : nouveau cache indépendant + correctifs petits écrans activés')


if MODE in ('android', 'all'):
    patch_android()
if MODE in ('pwa', 'all'):
    patch_pwa()
if MODE not in ('android', 'pwa', 'all'):
    raise SystemExit('Mode attendu: android, pwa ou all')
