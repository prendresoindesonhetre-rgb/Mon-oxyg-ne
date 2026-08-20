from pathlib import Path

path = Path('app/src/main/java/fr/prendresoindesonhetre/monoxygene/MainActivity.java')
s = path.read_text(encoding='utf-8')

# Inverser les boutons Stop / Pause et les recentrer sous l'affichage du temps.
old = '''            float btnCy=h*.905f, rr=h*.036f;\n            pauseBtn.set(w*.825f-rr,btnCy-rr,w*.825f+rr,btnCy+rr);\n            stopBtn.set(w*.905f-rr,btnCy-rr,w*.905f+rr,btnCy+rr);\n            drawRemoteButton(c,pauseBtn,paused?1:0);\n            drawRemoteButton(c,stopBtn,2);'''
new = '''            float btnCy=h*.905f, rr=h*.036f;\n            // Le groupe de commandes est centré sous le compteur de temps (centre ~ 90 % de la largeur).\n            float controlsCenter=w*.900f;\n            float controlsGap=w*.038f;\n            // Ordre inversé : Stop à gauche, Pause à droite.\n            stopBtn.set(controlsCenter-controlsGap-rr,btnCy-rr,controlsCenter-controlsGap+rr,btnCy+rr);\n            pauseBtn.set(controlsCenter+controlsGap-rr,btnCy-rr,controlsCenter+controlsGap+rr,btnCy+rr);\n            drawRemoteButton(c,stopBtn,2);\n            drawRemoteButton(c,pauseBtn,paused?1:0);'''

if old not in s:
    raise SystemExit('bloc boutons pause/stop introuvable')
s = s.replace(old, new)

path.write_text(s, encoding='utf-8')
