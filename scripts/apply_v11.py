from pathlib import Path

path = Path('app/src/main/java/fr/prendresoindesonhetre/monoxygene/MainActivity.java')
s = path.read_text(encoding='utf-8')

# Descendre encore la sinusoïde tout en gardant une belle amplitude.
s = s.replace(
    'float top=h*.300f,bottom=h*.790f,mid=(top+bottom)/2f,amp=(bottom-top)*.44f;',
    'float top=h*.340f,bottom=h*.820f,mid=(top+bottom)/2f,amp=(bottom-top)*.42f;'
)

# Donner un peu plus de présence au titre respiratoire.
s = s.replace(
    'textFace(c,inhale?"Inspirez":"Expirez",w*.50f,h*.112f,h*.054f,Color.WHITE,Paint.Align.CENTER,titleFace);',
    'textFace(c,inhale?"Inspirez":"Expirez",w*.50f,h*.112f,h*.058f,Color.WHITE,Paint.Align.CENTER,titleFace);'
)

# Agrandir surtout les consignes / sous-textes, pour une lecture facile sur téléphone.
s = s.replace(
    'textFace(c,breathGuide,w*.50f,h*.176f,h*.0290f,Color.argb(248,255,255,255),Paint.Align.CENTER,mediumFace);',
    'textFace(c,breathGuide,w*.50f,h*.181f,h*.0335f,Color.argb(252,255,255,255),Paint.Align.CENTER,mediumFace);'
)

# Le petit temps de phase reste secondaire mais devient plus lisible.
s = s.replace(
    'textFace(c,String.format(Locale.FRANCE,"%.1f s",phaseRemain),w*.50f,h*.224f,h*.0215f,Color.argb(220,255,255,255),Paint.Align.CENTER,bodyFace);',
    'textFace(c,String.format(Locale.FRANCE,"%.1f s",phaseRemain),w*.50f,h*.236f,h*.0240f,Color.argb(232,255,255,255),Paint.Align.CENTER,bodyFace);'
)

path.write_text(s, encoding='utf-8')
