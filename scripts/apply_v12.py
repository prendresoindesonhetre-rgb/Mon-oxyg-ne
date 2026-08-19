from pathlib import Path

path = Path('app/src/main/java/fr/prendresoindesonhetre/monoxygene/MainActivity.java')
s = path.read_text(encoding='utf-8')

# Remettre « Inspirez / Expirez » à sa taille précédente : ce n'est pas ce texte qui devait être agrandi.
s = s.replace(
    'textFace(c,inhale?"Inspirez":"Expirez",w*.50f,h*.112f,h*.058f,Color.WHITE,Paint.Align.CENTER,titleFace);',
    'textFace(c,inhale?"Inspirez":"Expirez",w*.50f,h*.112f,h*.054f,Color.WHITE,Paint.Align.CENTER,titleFace);'
)

# Agrandir nettement les petites consignes / sous-textes :
# « Par le nez • le ventre se gonfle », « Par la bouche • le ventre se dégonfle »
# ainsi que les phrases de visualisation lumière / nuage.
s = s.replace(
    'textFace(c,breathGuide,w*.50f,h*.181f,h*.0335f,Color.argb(252,255,255,255),Paint.Align.CENTER,mediumFace);',
    'textFace(c,breathGuide,w*.50f,h*.184f,h*.0385f,Color.argb(255,255,255,255),Paint.Align.CENTER,mediumFace);'
)

path.write_text(s, encoding='utf-8')
