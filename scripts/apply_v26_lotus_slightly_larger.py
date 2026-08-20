from pathlib import Path
import sys

MODE = sys.argv[1] if len(sys.argv) > 1 else "all"

ANDROID_OLD = 'float breatheScale=(float)(.64+.48*easedBreath);'
ANDROID_NEW = 'float breatheScale=(float)(.66+.48*easedBreath);'
PWA_OLD = 'const scale = 0.64 + 0.48 * breathEase(elapsed);'
PWA_NEW = 'const scale = 0.66 + 0.48 * breathEase(elapsed);'


def patch_android():
    path = Path('app/src/main/java/fr/prendresoindesonhetre/monoxygene/MainActivity.java')
    s = path.read_text(encoding='utf-8')
    if ANDROID_OLD not in s:
        raise SystemExit('Échelle lotus Android v25 introuvable')
    s = s.replace(ANDROID_OLD, ANDROID_NEW, 1)
    path.write_text(s, encoding='utf-8')
    print('Android: lotus légèrement agrandi 66% -> 114%')


def patch_pwa():
    path = Path('pwa/www/app.js')
    s = path.read_text(encoding='utf-8')
    if PWA_OLD not in s:
        raise SystemExit('Échelle lotus PWA v25 introuvable')
    s = s.replace(PWA_OLD, PWA_NEW, 1)
    path.write_text(s, encoding='utf-8')

    sw = Path('pwa/www/sw.js')
    sws = sw.read_text(encoding='utf-8')
    old_cache = "const CACHE_NAME = 'mon-oxygene-pwa-v6-lotus-balanced';"
    new_cache = "const CACHE_NAME = 'mon-oxygene-pwa-v7-lotus-slightly-larger';"
    if old_cache not in sws:
        raise SystemExit('Cache PWA v6 introuvable après patch v25')
    sws = sws.replace(old_cache, new_cache, 1)
    sw.write_text(sws, encoding='utf-8')
    print('PWA: lotus légèrement agrandi 66% -> 114%, cache renouvelé')


if MODE in ('android', 'all'):
    patch_android()
if MODE in ('pwa', 'all'):
    patch_pwa()
if MODE not in ('android', 'pwa', 'all'):
    raise SystemExit('Mode attendu: android, pwa ou all')
