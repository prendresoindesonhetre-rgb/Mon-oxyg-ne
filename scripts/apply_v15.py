from pathlib import Path

path = Path('app/src/main/java/fr/prendresoindesonhetre/monoxygene/MainActivity.java')
s = path.read_text(encoding='utf-8')

# Synchroniser explicitement le gonflement du lotus avec la phase affichée.
# Le lotus grandit pendant toute l'inspiration et rétrécit pendant toute l'expiration,
# en utilisant exactement les mêmes durées que le moteur respiratoire.
old = 'float breatheScale=(float)(0.92+0.14*(waveAt(elapsed)+1.0)/2.0);'
new = '''double cyclePos=mod(elapsed, inhaleSec+exhaleSec);\n            double breathQ;\n            if(startWithInhale){\n                if(cyclePos<inhaleSec){\n                    breathQ=cyclePos/inhaleSec;\n                }else{\n                    breathQ=1.0-(cyclePos-inhaleSec)/exhaleSec;\n                }\n            }else{\n                if(cyclePos<exhaleSec){\n                    breathQ=1.0-cyclePos/exhaleSec;\n                }else{\n                    breathQ=(cyclePos-exhaleSec)/inhaleSec;\n                }\n            }\n            breathQ=Math.max(0.0,Math.min(1.0,breathQ));\n            // Adoucir les changements aux débuts/fins de phase sans créer de décalage.\n            double easedBreath=.5-.5*Math.cos(Math.PI*breathQ);\n            float breatheScale=(float)(.93+.14*easedBreath);'''

if old not in s:
    raise SystemExit('breatheScale v14 introuvable')
s = s.replace(old, new)

path.write_text(s, encoding='utf-8')
