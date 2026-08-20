from pathlib import Path
import sys

MODE = sys.argv[1] if len(sys.argv) > 1 else "all"

ANDROID_OLD = 'float breatheScale=(float)(.70+.48*easedBreath);'
ANDROID_NEW = 'float breatheScale=(float)(.58+.47*easedBreath);'
PWA_OLD = 'const scale = 0.70 + 0.48 * breathEase(elapsed);'
PWA_NEW = 'const scale = 0.58 + 0.47 * breathEase(elapsed);'


def patch_android():
    path = Path('app/src/main/java/fr/prendresoindesonhetre/monoxygene/MainActivity.java')
    s = path.read_text(encoding='utf-8')
    if ANDROID_OLD not in s:
        raise SystemExit('Échelle lotus Android v23 introuvable')
    s = s.replace(ANDROID_OLD, ANDROID_NEW, 1)
    path.write_text(s, encoding='utf-8')
    print('Android: lotus 58% -> 105%')


def patch_pwa():
    path = Path('pwa/www/app.js')
    s = path.read_text(encoding='utf-8')
    if PWA_OLD not in s:
        raise SystemExit('Échelle lotus PWA v23 introuvable')
    s = s.replace(PWA_OLD, PWA_NEW, 1)
    path.write_text(s, encoding='utf-8')

    sw = Path('pwa/www/sw.js')
    sws = sw.read_text(encoding='utf-8')
    old_cache = "const CACHE_NAME = 'mon-oxygene-pwa-v3-landscape';"
    new_cache = "const CACHE_NAME = 'mon-oxygene-pwa-v5-lotus-scale';"
    if old_cache in sws:
        sws = sws.replace(old_cache, new_cache, 1)
    elif new_cache not in sws:
        raise SystemExit('Nom du cache PWA inattendu')
    sw.write_text(sws, encoding='utf-8')
    print('PWA: lotus 58% -> 105%, cache renouvelé')


if MODE in ('android', 'all'):
    patch_android()
if MODE in ('pwa', 'all'):
    patch_pwa()
if MODE not in ('android', 'pwa', 'all'):
    raise SystemExit('Mode attendu: android, pwa ou all')
