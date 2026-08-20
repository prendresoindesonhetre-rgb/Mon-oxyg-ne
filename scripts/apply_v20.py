from pathlib import Path

path = Path('app/src/main/java/fr/prendresoindesonhetre/monoxygene/MainActivity.java')
s = path.read_text(encoding='utf-8')

# Déplacer le compteur de temps à droite de la barre de progression, sur la même ligne.
old_time = 'RectF timePill=new RectF(w*.835f,h*.055f,w*.965f,h*.125f);'
new_time = 'RectF timePill=new RectF(w*.770f,h*.888f,w*.965f,h*.968f);'
if old_time not in s:
    raise SystemExit('timePill actuel introuvable')
s = s.replace(old_time, new_time)

# Mettre les commandes en haut à droite : Pause à gauche, Stop à droite.
old_controls = '''            float btnCy=h*.905f, rr=h*.036f;\n            // Le groupe de commandes est centré sous le compteur de temps (centre ~ 90 % de la largeur).\n            float controlsCenter=w*.900f;\n            float controlsGap=w*.038f;\n            // Ordre inversé : Stop à gauche, Pause à droite.\n            stopBtn.set(controlsCenter-controlsGap-rr,btnCy-rr,controlsCenter-controlsGap+rr,btnCy+rr);\n            pauseBtn.set(controlsCenter+controlsGap-rr,btnCy-rr,controlsCenter+controlsGap+rr,btnCy+rr);\n            drawRemoteButton(c,stopBtn,2);\n            drawRemoteButton(c,pauseBtn,paused?1:0);'''
new_controls = '''            float btnCy=h*.090f, rr=h*.036f;\n            // Commandes en haut à droite, à la place de l'ancien compteur de temps.\n            // Pause à gauche, Stop à droite.\n            float pauseCx=w*.875f;\n            float stopCx=w*.940f;\n            pauseBtn.set(pauseCx-rr,btnCy-rr,pauseCx+rr,btnCy+rr);\n            stopBtn.set(stopCx-rr,btnCy-rr,stopCx+rr,btnCy+rr);\n            drawRemoteButton(c,pauseBtn,paused?1:0);\n            drawRemoteButton(c,stopBtn,2);'''
if old_controls not in s:
    raise SystemExit('bloc v19 des boutons introuvable')
s = s.replace(old_controls, new_controls)

path.write_text(s, encoding='utf-8')
