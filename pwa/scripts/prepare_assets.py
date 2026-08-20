from pathlib import Path
from io import BytesIO
import base64
import re
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "pwa" / "www" / "assets"
OUT.mkdir(parents=True, exist_ok=True)

# Fond Réglages / introduction : image exacte déjà validée dans Android.
settings_dir = ROOT / "app" / "src" / "main" / "assets" / "settings_exact"
settings_b64 = "".join(
    p.read_text(encoding="utf-8").strip()
    for p in sorted(settings_dir.glob("*.txt"))
)
settings_bytes = base64.b64decode(settings_b64)
with Image.open(BytesIO(settings_bytes)) as im:
    im.convert("RGB").save(OUT / "settings_bg.jpg", quality=90, optimize=True, progressive=True)

# Fond de séance sans arbre : mêmes ressources que l'application Android.
java_dir = ROOT / "app" / "src" / "main" / "java" / "fr" / "prendresoindesonhetre" / "monoxygene"
curve_parts = []
for name in ("AssetCurve1.java", "AssetCurve2.java", "AssetCurve3.java"):
    text = (java_dir / name).read_text(encoding="utf-8")
    match = re.search(r'DATA\s*=\s*"([^"]+)"', text, re.S)
    if not match:
        raise RuntimeError(f"Impossible de lire {name}")
    curve_parts.append(match.group(1))
curve_bytes = base64.b64decode("".join(curve_parts))
with Image.open(BytesIO(curve_bytes)) as im:
    im.convert("RGB").save(OUT / "curve_bg.jpg", quality=90, optimize=True, progressive=True)

# Lotus exact utilisé dans l'application Android.
lotus_src = ROOT / "app" / "src" / "main" / "res" / "drawable" / "lotus_breathing.webp"
with Image.open(lotus_src) as im:
    lotus = im.convert("RGBA")
    lotus.save(OUT / "lotus.png", optimize=True)

# Icônes PWA à partir du même lotus, sur le bleu-canard de l'univers.
def make_icon(size: int, filename: str):
    icon = Image.new("RGB", (size, size), (17, 70, 82))
    source = lotus.copy()
    max_side = int(size * 0.78)
    source.thumbnail((max_side, max_side), Image.Resampling.LANCZOS)
    icon.paste(source, ((size-source.width)//2, (size-source.height)//2), source)
    icon.save(OUT / filename, optimize=True)

make_icon(192, "icon-192.png")
make_icon(512, "icon-512.png")
make_icon(180, "apple-touch-icon.png")

print("Assets PWA préparés : settings_bg.jpg, curve_bg.jpg, lotus.png et icônes")
