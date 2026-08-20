from pathlib import Path
import re
import sys

MODE = sys.argv[1] if len(sys.argv) > 1 else "all"

PWA_GLOW_OLD = '.wave-glow{fill:none;stroke:url(#waveGradient);stroke-width:13;opacity:.24;stroke-linecap:round;filter:blur(2px)}'
PWA_GLOW_NEW = '.wave-glow{fill:none;stroke:url(#waveGradient);stroke-width:12;opacity:.24;stroke-linecap:round;filter:blur(2px)}'
PWA_LINE_OLD = '.wave-line{fill:none;stroke:url(#waveGradient);stroke-width:4.8;stroke-linecap:round}'
PWA_LINE_NEW = '.wave-line{fill:none;stroke:url(#waveGradient);stroke-width:4.4;stroke-linecap:round}'


def patch_android():
    path = Path('app/src/main/java/fr/prendresoindesonhetre/monoxygene/MainActivity.java')
    s = path.read_text(encoding='utf-8')

    s, glow_count = re.subn(
        r'glow\.setStrokeCap\(Paint\.Cap\.ROUND\);\s*glow\.setStrokeWidth\([^;]+\);',
        'glow.setStrokeCap(Paint.Cap.ROUND); glow.setStrokeWidth(Math.max(9f,w*.0074f));',
        s,
        count=1,
    )
    s, line_count = re.subn(
        r'stroke\.setStrokeCap\(Paint\.Cap\.ROUND\);\s*stroke\.setStrokeWidth\([^;]+\);',
        'stroke.setStrokeCap(Paint.Cap.ROUND); stroke.setStrokeWidth(Math.max(3.6f,w*.0030f));',
        s,
        count=1,
    )
    if glow_count != 1 or line_count != 1:
        raise SystemExit(f'Épaisseur de sinusoïde Android introuvable (glow={glow_count}, line={line_count})')

    path.write_text(s, encoding='utf-8')
    print('Android: sinusoïde légèrement affinée, forme et rythme inchangés')


def patch_pwa():
    css = Path('pwa/www/styles.css')
    s = css.read_text(encoding='utf-8')
    if PWA_GLOW_OLD not in s or PWA_LINE_OLD not in s:
        raise SystemExit('Épaisseur de sinusoïde PWA v26 introuvable')
    s = s.replace(PWA_GLOW_OLD, PWA_GLOW_NEW, 1)
    s = s.replace(PWA_LINE_OLD, PWA_LINE_NEW, 1)
    css.write_text(s, encoding='utf-8')

    sw = Path('pwa/www/sw.js')
    sws = sw.read_text(encoding='utf-8')
    old_cache = "const CACHE_NAME = 'mon-oxygene-pwa-v7-lotus-slightly-larger';"
    new_cache = "const CACHE_NAME = 'mon-oxygene-pwa-v8-thinner-sinusoid';"
    if old_cache not in sws:
        raise SystemExit('Cache PWA v7 introuvable')
    sws = sws.replace(old_cache, new_cache, 1)
    sw.write_text(sws, encoding='utf-8')
    print('PWA: sinusoïde légèrement affinée, cache renouvelé')


if MODE in ('android', 'all'):
    patch_android()
if MODE in ('pwa', 'all'):
    patch_pwa()
if MODE not in ('android', 'pwa', 'all'):
    raise SystemExit('Mode attendu: android, pwa ou all')
