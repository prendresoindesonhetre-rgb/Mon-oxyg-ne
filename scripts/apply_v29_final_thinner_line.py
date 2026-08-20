from pathlib import Path
import sys

MODE = sys.argv[1] if len(sys.argv) > 1 else "all"

ANDROID_OLD = 'stroke.setStrokeCap(Paint.Cap.ROUND); stroke.setStrokeWidth(Math.max(3.3f,w*.00275f));'
ANDROID_NEW = 'stroke.setStrokeCap(Paint.Cap.ROUND); stroke.setStrokeWidth(Math.max(3.1f,w*.0026f));'
PWA_OLD = '.wave-line{fill:none;stroke:url(#waveGradient);stroke-width:4.0;stroke-linecap:round}'
PWA_NEW = '.wave-line{fill:none;stroke:url(#waveGradient);stroke-width:3.7;stroke-linecap:round}'


def patch_android():
    path = Path('app/src/main/java/fr/prendresoindesonhetre/monoxygene/MainActivity.java')
    s = path.read_text(encoding='utf-8')
    if ANDROID_OLD not in s:
        raise SystemExit('Trait principal Android v28 introuvable')
    s = s.replace(ANDROID_OLD, ANDROID_NEW, 1)
    path.write_text(s, encoding='utf-8')
    print('Android: trait principal de la sinusoïde très légèrement affiné une dernière fois')


def patch_pwa():
    css = Path('pwa/www/styles.css')
    s = css.read_text(encoding='utf-8')
    if PWA_OLD not in s:
        raise SystemExit('Trait principal PWA v28 introuvable')
    s = s.replace(PWA_OLD, PWA_NEW, 1)
    css.write_text(s, encoding='utf-8')

    sw = Path('pwa/www/sw.js')
    sws = sw.read_text(encoding='utf-8')
    old_cache = "const CACHE_NAME = 'mon-oxygene-pwa-v9-thinner-line-only';"
    new_cache = "const CACHE_NAME = 'mon-oxygene-pwa-v10-final-thinner-line';"
    if old_cache not in sws:
        raise SystemExit('Cache PWA v9 introuvable')
    sws = sws.replace(old_cache, new_cache, 1)
    sw.write_text(sws, encoding='utf-8')
    print('PWA: trait principal très légèrement affiné une dernière fois, halo inchangé')


if MODE in ('android', 'all'):
    patch_android()
if MODE in ('pwa', 'all'):
    patch_pwa()
if MODE not in ('android', 'pwa', 'all'):
    raise SystemExit('Mode attendu: android, pwa ou all')
