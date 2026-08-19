from pathlib import Path

path = Path('app/src/main/java/fr/prendresoindesonhetre/monoxygene/MainActivity.java')
s = path.read_text(encoding='utf-8')

# Descendre la sinusoïde pour qu'elle ne chevauche plus les consignes.
s = s.replace('float top=h*.245f,bottom=h*.745f,mid=(top+bottom)/2f,amp=(bottom-top)*.46f;',
              'float top=h*.300f,bottom=h*.790f,mid=(top+bottom)/2f,amp=(bottom-top)*.44f;')

# Pendant les quatre premiers cycles seulement, alterner deux cycles de consigne corporelle
# et deux cycles de visualisation. Ensuite, seul Inspirez / Expirez reste affiché.
old = '''            String breathGuide=inhale?"Par le nez  •  le ventre se gonfle":"Par la bouche  •  le ventre se dégonfle";\n            textFace(c,breathGuide,w*.50f,h*.171f,h*.0255f,Color.argb(245,255,255,255),Paint.Align.CENTER,mediumFace);\n            double phaseRemain=phaseRemaining(elapsed);'''
new = '''            int guideCycle=(int)Math.floor(elapsed/(inhaleSec+exhaleSec));\n            boolean showGuide=guideCycle<4;\n            boolean imageCycle=(guideCycle%2)==1;\n            if(showGuide){\n                String breathGuide;\n                if(imageCycle){\n                    breathGuide=inhale?"Imagine une lumière douce qui entre avec ton souffle":"Imagine un nuage sombre qui s'éloigne doucement";\n                }else{\n                    breathGuide=inhale?"Par le nez  •  le ventre se gonfle":"Par la bouche  •  le ventre se dégonfle";\n                }\n                textFace(c,breathGuide,w*.50f,h*.176f,h*.0290f,Color.argb(248,255,255,255),Paint.Align.CENTER,mediumFace);\n            }\n            double phaseRemain=phaseRemaining(elapsed);'''
if old not in s:
    raise SystemExit('bloc guide respiratoire introuvable')
s = s.replace(old, new)

# Le compteur reste visible, sous la zone de consigne.
s = s.replace('textFace(c,String.format(Locale.FRANCE,"%.1f s",phaseRemain),w*.50f,h*.209f,h*.0215f,Color.argb(220,255,255,255),Paint.Align.CENTER,bodyFace);',
              'textFace(c,String.format(Locale.FRANCE,"%.1f s",phaseRemain),w*.50f,h*.224f,h*.0215f,Color.argb(220,255,255,255),Paint.Align.CENTER,bodyFace);')

# Le halo lumineux / nuage n'apparaît que sur les cycles de visualisation (2 et 4),
# pour éviter de surcharger l'écran.
anchor = 'drawBreathingFlower(c,flowerX,flowerY,h*.0275f,breatheScale);'
if anchor not in s:
    raise SystemExit('appel lotus introuvable')
visual = '''int visualCycle=(int)Math.floor(elapsed/(inhaleSec+exhaleSec));\n            boolean showVisual=visualCycle<4 && (visualCycle%2)==1;\n            if(showVisual){\n                if(inhale){\n                    float glow=(float)Math.max(0.0,Math.min(1.0,(waveAt(elapsed)+1.0)/2.0));\n                    p.setStyle(Paint.Style.FILL);\n                    p.setColor(Color.argb((int)(18+34*glow),235,248,255));\n                    c.drawCircle(flowerX,flowerY,h*(.055f+.018f*glow),p);\n                    p.setColor(Color.argb((int)(12+24*glow),122,214,232));\n                    c.drawCircle(flowerX,flowerY,h*(.041f+.014f*glow),p);\n                } else {\n                    float release=(float)Math.max(0.0,Math.min(1.0,1.0-(waveAt(elapsed)+1.0)/2.0));\n                    p.setStyle(Paint.Style.FILL);\n                    for(int i=0;i<5;i++){\n                        float drift=h*(.018f*i + .025f*release*i);\n                        float rr=h*(.010f+.005f*i+.007f*release);\n                        int alpha=(int)(42*(1.0-i/6.0)*(1.0-.45*release));\n                        p.setColor(Color.argb(Math.max(5,alpha),67,71,96));\n                        c.drawCircle(flowerX+drift,flowerY-h*(.010f*i),rr,p);\n                    }\n                }\n            }\n            ''' + anchor
s = s.replace(anchor, visual)

path.write_text(s, encoding='utf-8')
