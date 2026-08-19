from pathlib import Path

path = Path('app/src/main/java/fr/prendresoindesonhetre/monoxygene/MainActivity.java')
s = path.read_text(encoding='utf-8')

# Descendre la sinusoïde pour qu'elle ne chevauche plus les consignes.
s = s.replace('float top=h*.245f,bottom=h*.745f,mid=(top+bottom)/2f,amp=(bottom-top)*.46f;',
              'float top=h*.300f,bottom=h*.790f,mid=(top+bottom)/2f,amp=(bottom-top)*.44f;')

# Agrandir légèrement les consignes sous Inspirez / Expirez.
s = s.replace('textFace(c,breathGuide,w*.50f,h*.171f,h*.0255f,Color.argb(245,255,255,255),Paint.Align.CENTER,mediumFace);',
              'textFace(c,breathGuide,w*.50f,h*.174f,h*.0290f,Color.argb(248,255,255,255),Paint.Align.CENTER,mediumFace);')

# Ajouter un message symbolique très doux : lumière à l'inspiration, nuage à l'expiration.
old = '''            String breathGuide=inhale?"Par le nez  •  le ventre se gonfle":"Par la bouche  •  le ventre se dégonfle";\n            textFace(c,breathGuide,w*.50f,h*.174f,h*.0290f,Color.argb(248,255,255,255),Paint.Align.CENTER,mediumFace);\n            double phaseRemain=phaseRemaining(elapsed);'''
new = '''            String breathGuide=inhale?"Par le nez  •  le ventre se gonfle":"Par la bouche  •  le ventre se dégonfle";\n            textFace(c,breathGuide,w*.50f,h*.174f,h*.0290f,Color.argb(248,255,255,255),Paint.Align.CENTER,mediumFace);\n            String imageGuide=inhale?"Imagine une lumière douce qui entre avec ton souffle":"Laisse partir ce dont tu ne souhaites plus t'encombrer";\n            textFace(c,imageGuide,w*.50f,h*.215f,h*.0225f,Color.argb(230,238,247,255),Paint.Align.CENTER,accentFace);\n            double phaseRemain=phaseRemaining(elapsed);'''
if old not in s:
    raise SystemExit('bloc guide respiratoire introuvable')
s = s.replace(old, new)

# Décaler légèrement le compteur de phase sous la nouvelle ligne symbolique.
s = s.replace('textFace(c,String.format(Locale.FRANCE,"%.1f s",phaseRemain),w*.50f,h*.209f,h*.0215f,Color.argb(220,255,255,255),Paint.Align.CENTER,bodyFace);',
              'textFace(c,String.format(Locale.FRANCE,"%.1f s",phaseRemain),w*.50f,h*.250f,h*.0215f,Color.argb(220,255,255,255),Paint.Align.CENTER,bodyFace);')

# Ajouter une lumière respirante autour du lotus à l'inspiration et un nuage doux qui se dissipe à l'expiration.
anchor = 'drawBreathingFlower(c,flowerX,flowerY,h*.0275f,breatheScale);'
if anchor not in s:
    raise SystemExit('appel lotus introuvable')
visual = '''if(inhale){
                float glow=(float)Math.max(0.0,Math.min(1.0,(waveAt(elapsed)+1.0)/2.0));
                p.setStyle(Paint.Style.FILL);
                p.setColor(Color.argb((int)(18+34*glow),235,248,255));
                c.drawCircle(flowerX,flowerY,h*(.055f+.018f*glow),p);
                p.setColor(Color.argb((int)(12+24*glow),122,214,232));
                c.drawCircle(flowerX,flowerY,h*(.041f+.014f*glow),p);
            } else {
                float release=(float)Math.max(0.0,Math.min(1.0,1.0-(waveAt(elapsed)+1.0)/2.0));
                p.setStyle(Paint.Style.FILL);
                for(int i=0;i<5;i++){
                    float drift=h*(.018f*i + .025f*release*i);
                    float rr=h*(.010f+.005f*i+.007f*release);
                    int alpha=(int)(42*(1.0-i/6.0)*(1.0-.45*release));
                    p.setColor(Color.argb(Math.max(5,alpha),67,71,96));
                    c.drawCircle(flowerX+drift,flowerY-h*(.010f*i),rr,p);
                }
            }
            ''' + anchor
s = s.replace(anchor, visual)

path.write_text(s, encoding='utf-8')
