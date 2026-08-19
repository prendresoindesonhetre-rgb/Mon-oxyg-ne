from pathlib import Path
import re

path = Path('app/src/main/java/fr/prendresoindesonhetre/monoxygene/MainActivity.java')
s = path.read_text(encoding='utf-8')

# Lisibilité mobile : homogénéiser et agrandir les textes de toutes les explications.
s = s.replace('textFace(c,introKickers[introPage],left,h*.122f,h*.0185f,Color.rgb(87,137,154),Paint.Align.LEFT,mediumFace);',
              'textFace(c,introKickers[introPage],left,h*.122f,h*.0210f,Color.rgb(87,137,154),Paint.Align.LEFT,mediumFace);')
s = s.replace('float titleSize=introPage==2?h*.039f:h*.047f;',
              'float titleSize=introPage==2?h*.0415f:h*.0485f;')
s = s.replace('float bodySize=introPage==5?h*.0270f:h*.0290f;',
              'float bodySize=h*.0285f;')
s = s.replace('bodySize,Color.rgb(61,83,99),1.48f,bodyFace)',
              'bodySize,Color.rgb(61,83,99),1.38f,bodyFace)')
s = s.replace('bodySize*1.04f,Color.rgb(57,126,142),1.40f,accentFace)',
              'bodySize*1.02f,Color.rgb(57,126,142),1.32f,accentFace)')
s = s.replace('h*.020f,Color.rgb(106,125,137),Paint.Align.CENTER,bodyFace)',
              'h*.0225f,Color.rgb(106,125,137),Paint.Align.CENTER,bodyFace)')

# Page Inspire / Expire : tous les niveaux de texte sont agrandis.
s = s.replace('h*.026f,Color.rgb(54,132,149),Paint.Align.LEFT,mediumFace)',
              'h*.0290f,Color.rgb(54,132,149),Paint.Align.LEFT,mediumFace)')
s = s.replace('h*.0235f,Color.rgb(65,84,98),1.38f,bodyFace)',
              'h*.0250f,Color.rgb(65,84,98),1.34f,bodyFace)')
s = s.replace('h*.0220f,Color.rgb(62,135,151),Paint.Align.LEFT,accentFace)',
              'h*.0235f,Color.rgb(62,135,151),Paint.Align.LEFT,accentFace)')
s = s.replace('h*.026f,Color.rgb(111,88,176),Paint.Align.LEFT,mediumFace)',
              'h*.0290f,Color.rgb(111,88,176),Paint.Align.LEFT,mediumFace)')
s = s.replace('h*.0220f,Color.rgb(111,88,176),Paint.Align.LEFT,accentFace)',
              'h*.0235f,Color.rgb(111,88,176),Paint.Align.LEFT,accentFace)')
s = s.replace('h*.0220f,Color.rgb(58,115,134),Paint.Align.CENTER,accentFace)',
              'h*.0235f,Color.rgb(58,115,134),Paint.Align.CENTER,accentFace)')

# Page rythmes : cartes plus faciles à lire sur téléphone.
s = s.replace('float cardH=h*.115f, gap=h*.018f;',
              'float cardH=h*.123f, gap=h*.016f;')
s = s.replace('h*.0240f,colors[i],Paint.Align.LEFT,mediumFace)',
              'h*.0260f,colors[i],Paint.Align.LEFT,mediumFace)')
s = s.replace('h*.0220f,colors[i],Paint.Align.RIGHT,mediumFace)',
              'h*.0240f,colors[i],Paint.Align.RIGHT,mediumFace)')
s = s.replace('h*.0200f,Color.rgb(68,86,99),1.28f,bodyFace)',
              'h*.0220f,Color.rgb(68,86,99),1.24f,bodyFace)')
s = s.replace('y+h*.415f,right-left,h*.0225f,Color.rgb(58,123,139),1.36f,accentFace)',
              'y+h*.435f,right-left,h*.0235f,Color.rgb(58,123,139),1.30f,accentFace)')

# Boutons de navigation plus lisibles.
s = s.replace('getHeight()*.0205f,primary?Color.WHITE:Color.rgb(69,96,112),Paint.Align.CENTER,mediumFace)',
              'getHeight()*.0230f,primary?Color.WHITE:Color.rgb(69,96,112),Paint.Align.CENTER,mediumFace)')

# La fleur respire réellement : expansion/repli plus perceptible et doux.
s = s.replace('float breatheScale=(float)(0.96+0.07*(waveAt(elapsed)+1.0)/2.0);',
              'float breatheScale=(float)(0.86+0.24*(waveAt(elapsed)+1.0)/2.0);')
s = s.replace('drawBreathingFlower(c,flowerX,flowerY,h*.031f,breatheScale);',
              'drawBreathingFlower(c,flowerX,flowerY,h*.034f,breatheScale);')

replacement = '''void drawBreathingFlower(Canvas c,float cx,float cy,float radius,float scale){
            c.save();
            c.translate(cx,cy);
            float pulse=Math.max(0f,Math.min(1f,(scale-.86f)/.24f));
            c.rotate((pulse-.5f)*3.0f);
            c.scale(scale,scale);
            p.setStyle(Paint.Style.FILL);

            float haloR=radius*(1.38f+.34f*pulse);
            p.setColor(Color.argb((int)(28+34*pulse),91,207,226));
            c.drawCircle(0,0,haloR,p);
            p.setColor(Color.argb((int)(18+26*pulse),151,130,225));
            c.drawCircle(0,0,haloR*.82f,p);

            int[] outer={
                Color.argb(182,111,220,232),
                Color.argb(176,130,203,240),
                Color.argb(170,161,149,230),
                Color.argb(176,118,193,229)
            };
            for(int i=0;i<12;i++){
                c.save();
                c.rotate(i*30f);
                float len=radius*(1.42f + .10f*(float)Math.sin(i*1.7));
                float width=radius*(.23f + .025f*(i%3));
                RectF petal=new RectF(-width,-len,width,-radius*.08f);
                LinearGradient pg=new LinearGradient(0,-len,0,-radius*.05f,
                        new int[]{Color.argb(105,235,247,255),outer[i%outer.length]},null,Shader.TileMode.CLAMP);
                p.setShader(pg);
                c.drawOval(petal,p);
                p.setShader(null);
                c.restore();
            }

            int[] inner={
                Color.argb(220,150,225,237),
                Color.argb(214,161,203,240),
                Color.argb(208,178,160,232)
            };
            for(int i=0;i<7;i++){
                c.save();
                c.rotate(12f+i*(360f/7f));
                float len=radius*(.94f+.08f*(float)Math.cos(i));
                RectF petal=new RectF(-radius*.25f,-len,radius*.25f,-radius*.04f);
                p.setColor(inner[i%inner.length]);
                c.drawOval(petal,p);
                p.setColor(Color.argb(82,255,255,255));
                c.drawOval(new RectF(-radius*.10f,-len*.88f,radius*.10f,-radius*.18f),p);
                c.restore();
            }

            p.setColor(Color.argb(245,248,252,254));
            c.drawCircle(0,0,radius*.34f,p);
            RadialGradient heart=new RadialGradient(0,0,radius*.27f,
                    new int[]{Color.rgb(239,251,253),Color.rgb(118,203,225),Color.rgb(151,135,224)},
                    null,Shader.TileMode.CLAMP);
            p.setShader(heart);
            c.drawCircle(0,0,radius*.25f,p);
            p.setShader(null);
            p.setColor(Color.argb(210,255,255,255));
            c.drawCircle(-radius*.07f,-radius*.08f,radius*.055f,p);

            p.setStyle(Paint.Style.STROKE);
            p.setStrokeWidth(Math.max(1.2f,radius*.05f));
            p.setColor(Color.argb(92,245,252,255));
            c.drawCircle(0,0,radius*(1.44f+.06f*pulse),p);
            p.setStyle(Paint.Style.FILL);
            c.restore();
        }

        void drawTinyFlower'''

s, n = re.subn(r'void drawBreathingFlower\(Canvas c,float cx,float cy,float radius,float scale\)\{.*?\n        \}\n\n        void drawTinyFlower', replacement, s, flags=re.S)
if n != 1:
    raise SystemExit(f'flower replacement count={n}')

path.write_text(s, encoding='utf-8')
