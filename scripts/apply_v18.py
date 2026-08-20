from pathlib import Path

path = Path('app/src/main/java/fr/prendresoindesonhetre/monoxygene/MainActivity.java')
s = path.read_text(encoding='utf-8')

# Rendre la barre de progression nettement plus visible sans alourdir l'écran.
old = '''            float progress=(float)(elapsed/total);\n            float progL=w*.105f,progR=w*.735f,progY=h*.927f;\n            p.setColor(Color.argb(120,255,255,255)); c.drawRoundRect(progL,progY-h*.004f,progR,progY+h*.016f,16,16,p);\n            p.setColor(Color.argb(60,90,202,224)); c.drawRoundRect(progL,progY-h*.008f,progL+(progR-progL)*progress,progY+h*.020f,18,18,p);\n            LinearGradient progGrad=new LinearGradient(progL,0,progR,0,new int[]{Color.rgb(73,207,216),Color.rgb(118,179,229),Color.rgb(150,127,217)},null,Shader.TileMode.CLAMP);\n            p.setShader(progGrad); c.drawRoundRect(progL,progY,progL+(progR-progL)*progress,progY+h*.012f,14,14,p); p.setShader(null);'''
new = '''            float progress=(float)(elapsed/total);\n            float progL=w*.105f,progR=w*.735f,progY=h*.927f;\n            // Fond plus net pour bien lire la longueur totale.\n            p.setColor(Color.argb(185,255,255,255));\n            c.drawRoundRect(progL,progY-h*.006f,progR,progY+h*.020f,18,18,p);\n            // Léger contraste derrière la partie déjà parcourue.\n            p.setColor(Color.argb(95,72,164,205));\n            c.drawRoundRect(progL,progY-h*.004f,progL+(progR-progL)*progress,progY+h*.018f,16,16,p);\n            // Barre colorée plus épaisse et plus saturée.\n            LinearGradient progGrad=new LinearGradient(progL,0,progR,0,new int[]{Color.rgb(57,210,218),Color.rgb(93,177,236),Color.rgb(157,119,226)},null,Shader.TileMode.CLAMP);\n            p.setShader(progGrad);\n            c.drawRoundRect(progL,progY,progL+(progR-progL)*progress,progY+h*.016f,16,16,p);\n            p.setShader(null);\n            // Petit repère au bout de la progression pour la rendre immédiatement perceptible.\n            float markerX=progL+(progR-progL)*progress;\n            p.setColor(Color.argb(245,255,255,255));\n            c.drawCircle(markerX,progY+h*.008f,h*.012f,p);'''

if old not in s:
    raise SystemExit('bloc barre de progression introuvable')
s = s.replace(old, new)

path.write_text(s, encoding='utf-8')
