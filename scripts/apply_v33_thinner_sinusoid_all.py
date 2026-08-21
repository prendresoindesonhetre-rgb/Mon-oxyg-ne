from pathlib import Path
import sys

MODE = sys.argv[1] if len(sys.argv) > 1 else "all"

ANDROID_OLD = 'stroke.setStrokeCap(Paint.Cap.ROUND); float sinusoidLineW=isTabletLayout()?Math.max(3.1f,2.3f*getResources().getDisplayMetrics().density):Math.max(3.1f,w*.0026f); stroke.setStrokeWidth(sinusoidLineW);'
ANDROID_NEW = 'stroke.setStrokeCap(Paint.Cap.ROUND); float sinusoidLineW=isTabletLayout()?Math.max(2.8f,2.05f*getResources().getDisplayMetrics().density):Math.max(2.8f,w*.00235f); stroke.setStrokeWidth(sinusoidLineW);'
PWA_OLD = '.wave-line{fill:none;stroke:url(#waveGradient);stroke-width:3.7;stroke-linecap:round}'
PWA_NEW = '.wave-line{fill:none;stroke:url(#waveGradient);stroke-width:3.4;stroke-linecap:round}'
IOS_OLD = 'context.stroke(path, with: .linearGradient(grad, startPoint: CGPoint(x: 0, y: 0), endPoint: CGPoint(x: size.width, y: 0)), lineWidth: 4.2)'
IOS_NEW = 'context.stroke(path, with: .linearGradient(grad, startPoint: CGPoint(x: 0, y: 0), endPoint: CGPoint(x: size.width, y: 0)), lineWidth: 3.8)'


def patch_android():
    path = Path('app/src/main/java/fr/prendresoindesonhetre/monoxygene/MainActivity.java')
    s = path.read_text(encoding='utf-8')
    if ANDROID_OLD not in s:
        raise SystemExit('Trait principal Android v32 introuvable')
    s = s.replace(ANDROID_OLD, ANDROID_NEW, 1)
    path.write_text(s, encoding='utf-8')
    print('Android: trait principal affiné sur téléphone et tablette, halo inchangé')


def patch_pwa():
    css = Path('pwa/www/styles.css')
    s = css.read_text(encoding='utf-8')
    if PWA_OLD not in s:
        raise SystemExit('Trait principal PWA v32 introuvable')
    s = s.replace(PWA_OLD, PWA_NEW, 1)
    css.write_text(s, encoding='utf-8')

    sw = Path('pwa/www/sw.js')
    sws = sw.read_text(encoding='utf-8')
    old_cache = "const CACHE_NAME = 'mon-oxygene-pwa-v12-lotus-slightly-larger';"
    new_cache = "const CACHE_NAME = 'mon-oxygene-pwa-v13-thinner-sinusoid-all';"
    if old_cache not in sws:
        raise SystemExit('Cache PWA v12 introuvable')
    sws = sws.replace(old_cache, new_cache, 1)
    sw.write_text(sws, encoding='utf-8')
    print('PWA/iPhone web: trait principal affiné, halo et lotus inchangés')


def patch_ios():
    path = Path('ios/MonOxygene/ContentView.swift')
    s = path.read_text(encoding='utf-8')
    if IOS_OLD not in s:
        raise SystemExit('Trait principal iOS v32 introuvable')
    s = s.replace(IOS_OLD, IOS_NEW, 1)
    path.write_text(s, encoding='utf-8')
    print('iOS natif: trait principal affiné 4.2 -> 3.8, halo inchangé')


if MODE in ('android', 'all'):
    patch_android()
if MODE in ('pwa', 'all'):
    patch_pwa()
if MODE in ('ios', 'all'):
    patch_ios()
if MODE not in ('android', 'pwa', 'ios', 'all'):
    raise SystemExit('Mode attendu: android, pwa, ios ou all')
