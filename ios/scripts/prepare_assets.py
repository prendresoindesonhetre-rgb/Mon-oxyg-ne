from pathlib import Path
from io import BytesIO
import base64
import json
import re
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
RES = ROOT / "ios" / "MonOxygene" / "Resources"
RES.mkdir(parents=True, exist_ok=True)

# Fond Réglages / introduction : réutilise exactement l'image validée, déjà découpée
# en fragments base64 dans le projet Android.
settings_dir = ROOT / "app" / "src" / "main" / "assets" / "settings_exact"
settings_b64 = "".join(p.read_text(encoding="utf-8").strip() for p in sorted(settings_dir.glob("*.txt")))
settings_bytes = base64.b64decode(settings_b64)
with Image.open(BytesIO(settings_bytes)) as im:
    im.convert("RGB").save(RES / "settings_bg.jpg", quality=92, optimize=True)

# Fond de séance sans l'arbre : réutilise les données WebP déjà intégrées à Android.
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
    im.convert("RGB").save(RES / "curve_bg.jpg", quality=92, optimize=True)

# Lotus exact déjà utilisé sur Android.
lotus_src = ROOT / "app" / "src" / "main" / "res" / "drawable" / "lotus_breathing.webp"
with Image.open(lotus_src) as im:
    lotus = im.convert("RGBA")
    lotus.save(RES / "lotus.png", optimize=True)

# Icône iOS à partir du même lotus.
assets = RES / "Assets.xcassets"
appicon = assets / "AppIcon.appiconset"
appicon.mkdir(parents=True, exist_ok=True)

specs = [
    ("iphone", "20x20", 2, 40), ("iphone", "20x20", 3, 60),
    ("iphone", "29x29", 2, 58), ("iphone", "29x29", 3, 87),
    ("iphone", "40x40", 2, 80), ("iphone", "40x40", 3, 120),
    ("iphone", "60x60", 2, 120), ("iphone", "60x60", 3, 180),
    ("ios-marketing", "1024x1024", 1, 1024),
]
images = []
for idiom, size_name, scale, pixels in specs:
    filename = f"icon-{pixels}.png"
    icon = Image.new("RGB", (1024, 1024), (17, 70, 82))
    source = lotus.copy()
    source.thumbnail((800, 800), Image.Resampling.LANCZOS)
    if source.mode == "RGBA":
        icon.paste(source, ((1024-source.width)//2, (1024-source.height)//2), source)
    else:
        icon.paste(source, ((1024-source.width)//2, (1024-source.height)//2))
    icon.resize((pixels, pixels), Image.Resampling.LANCZOS).save(appicon / filename, optimize=True)
    item = {"idiom": idiom, "size": size_name, "filename": filename}
    if idiom != "ios-marketing":
        item["scale"] = f"{scale}x"
    else:
        item["scale"] = "1x"
    images.append(item)

(appicon / "Contents.json").write_text(json.dumps({
    "images": images,
    "info": {"author": "xcode", "version": 1}
}, indent=2), encoding="utf-8")

(assets / "Contents.json").write_text(json.dumps({
    "info": {"author": "xcode", "version": 1}
}, indent=2), encoding="utf-8")

print("Assets iOS préparés : settings_bg.jpg, curve_bg.jpg, lotus.png et AppIcon")
