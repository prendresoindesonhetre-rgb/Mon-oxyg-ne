from pathlib import Path
import sys

MODE = sys.argv[1] if len(sys.argv) > 1 else "all"

ANDROID_OLD = 'float breatheScale=(float)(.65+.48*easedBreath);'
ANDROID_NEW = 'float breatheScale=(float)(.655+.48*easedBreath);'
PWA_OLD = 'const scale = 0.65 + 0.48 * breathEase(elapsed);'
PWA_NEW = 'const scale = 0.655 + 0.48 * breathEase(elapsed);'


def patch_android():
    path = Path('app/src/main/java/fr/prendresoindesonhetre/monoxygene/MainActivity.java')
    s = path.read_text(encoding='utf-8')
    if ANDROID_OLD not in s:
        raise SystemExit('Échelle lotus Android v31 introuvable')
    s = s.replace(ANDROID_OLD, ANDROID_NEW, 1)
    path.write_text(s, encoding='utf-8')
    print('Android: lotus très légèrement augmenté 65.5% -> 113.5% sur téléphone et tablette')


def patch_pwa():
    path = Path('pwa/www/app.js')
    s = path.read_text(encoding='utf-8')
    if PWA_OLD not in s:
        raise SystemExit('Échelle lotus PWA v31 introuvable')
    s = s.replace(PWA_OLD, PWA_NEW, 1)
    path.write_text(s, encoding='utf-8')

    sw = Path('pwa/www/sw.js')
    sws = sw.read_text(encoding='utf-8')
    old_cache = "const CACHE_NAME = 'mon-oxygene-pwa-v11-lotus-slightly-smaller';"
    new_cache = "const CACHE_NAME = 'mon-oxygene-pwa-v12-lotus-slightly-larger';"
    if old_cache not in sws:
        raise SystemExit('Cache PWA v11 introuvable')
    sws = sws.replace(old_cache, new_cache, 1)
    sw.write_text(sws, encoding='utf-8')
    print('PWA: lotus très légèrement augmenté 65.5% -> 113.5%, cache renouvelé')


if MODE in ('android', 'all'):
    patch_android()
if MODE in ('pwa', 'all'):
    patch_pwa()
if MODE not in ('android', 'pwa', 'all'):
    raise SystemExit('Mode attendu: android, pwa ou all')
