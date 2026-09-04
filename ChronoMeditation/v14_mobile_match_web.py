from pathlib import Path

ROOT=Path(__file__).resolve().parent
JAVA=ROOT/'app/src/main/java/fr/prendresoindesonhetre/chronomeditation/MainActivity.java'

s=JAVA.read_text(encoding='utf-8')
s=s.replace('https://kzviewbnnnzdyocdjtah.supabase.co/functions/v1/regie-app','https://prendresoindesonhetre-rgb.github.io/Mon-oxyg-ne/regie-v14/')
s=s.replace('s.setLoadWithOverviewMode(true);','s.setLoadWithOverviewMode(false);')
s=s.replace('s.setUseWideViewPort(true);','s.setUseWideViewPort(false);')
if 's.setTextZoom(100);' not in s:
    s=s.replace('s.setBuiltInZoomControls(false);','s.setTextZoom(100);\n        s.setBuiltInZoomControls(false);')
JAVA.write_text(s,encoding='utf-8')

print('V14.2 mobile layout uses the exact permanent web application')