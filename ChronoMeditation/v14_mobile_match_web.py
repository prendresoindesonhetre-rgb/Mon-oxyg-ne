from pathlib import Path

ROOT=Path(__file__).resolve().parent
JAVA=ROOT/'app/src/main/java/fr/prendresoindesonhetre/chronomeditation/MainActivity.java'
GRADLE=ROOT/'app/build.gradle'

s=JAVA.read_text(encoding='utf-8')
s=s.replace('https://kzviewbnnnzdyocdjtah.supabase.co/functions/v1/regie-app','https://prendresoindesonhetre-rgb.github.io/Mon-oxyg-ne/regie-v14/')
s=s.replace('s.setLoadWithOverviewMode(true);','s.setLoadWithOverviewMode(false);')
s=s.replace('s.setUseWideViewPort(true);','s.setUseWideViewPort(false);')
s=s.replace('s.setBuiltInZoomControls(false);','s.setTextZoom(100);\n        s.setBuiltInZoomControls(false);')
JAVA.write_text(s,encoding='utf-8')

g=GRADLE.read_text(encoding='utf-8')
g=g.replace('versionCode 14','versionCode 15').replace("versionName '14.0-secure'","versionName '14.1-mobile-web'")
GRADLE.write_text(g,encoding='utf-8')

print('V14.1 mobile layout now uses the exact published web application')
