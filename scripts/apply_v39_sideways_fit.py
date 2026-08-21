from pathlib import Path
import sys

MODE = sys.argv[1] if len(sys.argv) > 1 else 'pwa'


def patch_pwa():
    sw = Path('pwa/www/sw.js')
    s = sw.read_text(encoding='utf-8')
    old_cache = "const CACHE_NAME = 'mon-oxygene-pwa-v17-true-responsive';"
    new_cache = "const CACHE_NAME = 'mon-oxygene-pwa-v18-sideways-fit';"
    if old_cache not in s:
        raise SystemExit('Cache PWA v17 introuvable')
    s = s.replace(old_cache, new_cache, 1)
    marker = "  './v38-responsive.css',\n"
    if marker not in s:
        raise SystemExit('v38-responsive.css introuvable dans CORE')
    s = s.replace(marker, marker + "  './v39-landscape-fit.css',\n", 1)
    sw.write_text(s, encoding='utf-8')
    print('PWA v39 : paysage permanent + ajustement exact au viewport visible')


if MODE in ('pwa', 'all'):
    patch_pwa()
elif MODE == 'android':
    print('v39 : Android reste déjà forcé en paysage, aucun changement requis')
else:
    raise SystemExit('Mode attendu: android, pwa ou all')
