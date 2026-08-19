from pathlib import Path

path = Path('app/src/main/java/fr/prendresoindesonhetre/monoxygene/MainActivity.java')
s = path.read_text(encoding='utf-8')

# Consignes sous Inspire / Expire, avec une hiérarchie claire sur téléphone.
old = '''            boolean inhale=isInhaleAt(elapsed);\n            textFace(c,inhale?"Inspirez":"Expirez",w*.50f,h*.135f,h*.052f,Color.WHITE,Paint.Align.CENTER,titleFace);\n            double phaseRemain=phaseRemaining(elapsed);\n            textFace(c,String.format(Locale.FRANCE,"%.1f s",phaseRemain),w*.50f,h*.177f,h*.022f,Color.argb(225,255,255,255),Paint.Align.CENTER,bodyFace);'''
new = '''            boolean inhale=isInhaleAt(elapsed);\n            textFace(c,inhale?"Inspirez":"Expirez",w*.50f,h*.112f,h*.054f,Color.WHITE,Paint.Align.CENTER,titleFace);\n            String breathGuide=inhale?"Par le nez  •  le ventre se gonfle":"Par la bouche  •  le ventre se dégonfle";\n            textFace(c,breathGuide,w*.50f,h*.171f,h*.0255f,Color.argb(245,255,255,255),Paint.Align.CENTER,mediumFace);\n            double phaseRemain=phaseRemaining(elapsed);\n            textFace(c,String.format(Locale.FRANCE,"%.1f s",phaseRemain),w*.50f,h*.209f,h*.0215f,Color.argb(220,255,255,255),Paint.Align.CENTER,bodyFace);'''
if old not in s:
    raise SystemExit('bloc consignes introuvable')
s = s.replace(old, new)

# Sinusoïde légèrement plus ample verticalement et horizontalement.
s = s.replace('float top=h*.265f,bottom=h*.705f,mid=(top+bottom)/2f,amp=(bottom-top)*.40f;',
              'float top=h*.245f,bottom=h*.745f,mid=(top+bottom)/2f,amp=(bottom-top)*.46f;')
s = s.replace('double visibleSpan=cycle*4.65;', 'double visibleSpan=cycle*4.35;')

# Lotus un peu plus petit afin de laisser la sinusoïde au premier plan.
s = s.replace('drawBreathingFlower(c,flowerX,flowerY,h*.034f,breatheScale);',
              'drawBreathingFlower(c,flowerX,flowerY,h*.0275f,breatheScale);')

path.write_text(s, encoding='utf-8')
