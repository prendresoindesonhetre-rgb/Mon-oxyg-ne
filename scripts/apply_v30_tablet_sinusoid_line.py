from pathlib import Path

path = Path('app/src/main/java/fr/prendresoindesonhetre/monoxygene/MainActivity.java')
s = path.read_text(encoding='utf-8')

old = 'stroke.setStrokeCap(Paint.Cap.ROUND); stroke.setStrokeWidth(Math.max(3.1f,w*.0026f));'
new = 'stroke.setStrokeCap(Paint.Cap.ROUND); float sinusoidLineW=isTabletLayout()?Math.max(3.1f,2.3f*getResources().getDisplayMetrics().density):Math.max(3.1f,w*.0026f); stroke.setStrokeWidth(sinusoidLineW);'

if old not in s:
    raise SystemExit('Trait principal v29 introuvable pour correction tablette')

s = s.replace(old, new, 1)
path.write_text(s, encoding='utf-8')
print('Android v30 : finesse v29 conservée sur téléphone et corrigée physiquement sur tablette')
