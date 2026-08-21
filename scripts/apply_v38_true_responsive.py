from pathlib import Path
import sys

MODE = sys.argv[1] if len(sys.argv) > 1 else 'pwa'


def patch_pwa():
    sw = Path('pwa/www/sw.js')
    s = sw.read_text(encoding='utf-8')
    old_cache = "const CACHE_NAME = 'mon-oxygene-pwa-v16-fresh-mobile';"
    new_cache = "const CACHE_NAME = 'mon-oxygene-pwa-v17-true-responsive';"
    if old_cache not in s:
        raise SystemExit('Cache PWA v16 introuvable')
    s = s.replace(old_cache, new_cache, 1)
    marker = "  './v37-fixes.css',\n"
    if marker not in s:
        raise SystemExit('v37-fixes.css introuvable dans CORE')
    s = s.replace(marker, marker + "  './v38-responsive.css',\n", 1)
    sw.write_text(s, encoding='utf-8')
    print('PWA v38 : vrai responsive portrait/paysage et nouveau cache activés')


if MODE in ('pwa', 'all'):
    patch_pwa()
elif MODE == 'android':
    print('v38 : aucun changement Android requis')
else:
    raise SystemExit('Mode attendu: android, pwa ou all')
