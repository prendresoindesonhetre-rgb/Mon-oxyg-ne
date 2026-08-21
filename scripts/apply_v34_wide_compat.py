from pathlib import Path
import sys

MODE = sys.argv[1] if len(sys.argv) > 1 else "all"


def split_top_level_args(text):
    args = []
    start = 0
    depth = 0
    quote = None
    escape = False
    for i, ch in enumerate(text):
        if quote:
            if escape:
                escape = False
            elif ch == '\\':
                escape = True
            elif ch == quote:
                quote = None
            continue
        if ch in ('"', "'"):
            quote = ch
        elif ch in '([{':
            depth += 1
        elif ch in ')]}':
            depth -= 1
        elif ch == ',' and depth == 0:
            args.append(text[start:i].strip())
            start = i + 1
    args.append(text[start:].strip())
    return args


def matching_paren(text, open_pos):
    depth = 0
    quote = None
    escape = False
    for i in range(open_pos, len(text)):
        ch = text[i]
        if quote:
            if escape:
                escape = False
            elif ch == '\\':
                escape = True
            elif ch == quote:
                quote = None
            continue
        if ch in ('"', "'"):
            quote = ch
        elif ch == '(':
            depth += 1
        elif ch == ')':
            depth -= 1
            if depth == 0:
                return i
    raise SystemExit('Parenthèse drawRoundRect non fermée')


def patch_android():
    path = Path('app/src/main/java/fr/prendresoindesonhetre/monoxygene/MainActivity.java')
    s = path.read_text(encoding='utf-8')
    needle = '.drawRoundRect('
    pos = 0
    replacements = []
    while True:
        idx = s.find(needle, pos)
        if idx < 0:
            break
        open_pos = idx + len(needle) - 1
        close_pos = matching_paren(s, open_pos)
        inner = s[open_pos + 1:close_pos]
        args = split_top_level_args(inner)
        if len(args) == 7:
            new_inner = 'new RectF(' + ','.join(args[:4]) + '),' + ','.join(args[4:])
            replacements.append((open_pos + 1, close_pos, new_inner))
        pos = close_pos + 1
    for start, end, new_inner in reversed(replacements):
        s = s[:start] + new_inner + s[end:]
    path.write_text(s, encoding='utf-8')
    print(f'Android: {len(replacements)} drawRoundRect adaptés pour Android 4.4')


def patch_pwa():
    sw = Path('pwa/www/sw.js')
    s = sw.read_text(encoding='utf-8')
    old_cache = "const CACHE_NAME = 'mon-oxygene-pwa-v13-thinner-sinusoid-all';"
    new_cache = "const CACHE_NAME = 'mon-oxygene-pwa-v14-wide-compat';"
    if old_cache not in s:
        raise SystemExit('Cache PWA v13 introuvable')
    s = s.replace(old_cache, new_cache, 1)
    marker = "  './app.js',\n"
    addition = "  './app.js',\n  './compat-init.js',\n  './legacy.css',\n  './polyfills.js',\n"
    if marker not in s:
        raise SystemExit('Liste CORE PWA introuvable')
    s = s.replace(marker, addition, 1)
    sw.write_text(s, encoding='utf-8')
    print('PWA: cache et ressources de compatibilité ancienne génération ajoutés')


if MODE in ('android', 'all'):
    patch_android()
if MODE in ('pwa', 'all'):
    patch_pwa()
if MODE not in ('android', 'pwa', 'all'):
    raise SystemExit('Mode attendu: android, pwa ou all')
