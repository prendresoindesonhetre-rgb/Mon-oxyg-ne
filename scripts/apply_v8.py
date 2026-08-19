from pathlib import Path
import re

path = Path('app/src/main/java/fr/prendresoindesonhetre/monoxygene/MainActivity.java')
s = path.read_text(encoding='utf-8')

# 1) Utiliser réellement le lotus fourni dans l'application.
s = s.replace('Bitmap settingsBg, curveBg;', 'Bitmap settingsBg, curveBg, lotusBmp;')
s = s.replace('curveBg = decode(BackgroundAssets.CURVE);',
              'curveBg = decode(BackgroundAssets.CURVE);\n            lotusBmp = BitmapFactory.decodeResource(getResources(), R.drawable.lotus_breathing);')

# 2) Navigation des explications : boutons Suivant/Retour plus grands et plus lisibles sur téléphone.
s = s.replace('backBtn.set(l+w*.030f,h*.855f,l+w*.132f,h*.916f);',
              'backBtn.set(l+w*.030f,h*.842f,l+w*.150f,h*.925f);')
s = s.replace('nextBtn.set(r-w*.170f,h*.855f,r-w*.030f,h*.916f);',
              'nextBtn.set(r-w*.205f,h*.842f,r-w*.030f,h*.925f);')
s = s.replace('getHeight()*.0230f,primary?Color.WHITE:Color.rgb(69,96,112),Paint.Align.CENTER,mediumFace)',
              'getHeight()*.0260f,primary?Color.WHITE:Color.rgb(69,96,112),Paint.Align.CENTER,mediumFace)')

# 3) Page « Choisir son juste rythme » : cartes nettement plus grandes.
s = s.replace('float cardH=h*.123f, gap=h*.016f;',
              'float cardH=h*.145f, gap=h*.014f;')
s = s.replace('h*.0260f,colors[i],Paint.Align.LEFT,mediumFace)',
              'h*.0300f,colors[i],Paint.Align.LEFT,mediumFace)')
s = s.replace('h*.0240f,colors[i],Paint.Align.RIGHT,mediumFace)',
              'h*.0280f,colors[i],Paint.Align.RIGHT,mediumFace)')
s = s.replace('h*.0220f,Color.rgb(68,86,99),1.24f,bodyFace)',
              'h*.0250f,Color.rgb(68,86,99),1.22f,bodyFace)')
s = s.replace('y+h*.435f,right-left,h*.0235f,Color.rgb(58,123,139),1.30f,accentFace)',
              'y+h*.480f,right-left,h*.0250f,Color.rgb(58,123,139),1.28f,accentFace)')

# 4) Réglages : les cases « Rythmes proposés » sont plus hautes et leurs textes plus grands.
s = s.replace('textFace(c,"Rythmes proposés",x,h*.730f,h*.020f,Color.rgb(91,110,121),Paint.Align.LEFT,bodyFace);',
              'textFace(c,"Rythmes proposés",x,h*.712f,h*.0235f,Color.rgb(91,110,121),Paint.Align.LEFT,mediumFace);')
s = s.replace('presetEq.set(x,h*.750f,x+chipW,h*.818f);',
              'presetEq.set(x,h*.738f,x+chipW,h*.835f);')
s = s.replace('presetSlow.set(x+chipW+chipGap,h*.750f,x+2*chipW+chipGap,h*.818f);',
              'presetSlow.set(x+chipW+chipGap,h*.738f,x+2*chipW+chipGap,h*.835f);')
s = s.replace('presetMove.set(x+2*chipW+2*chipGap,h*.750f,r-w*.033f,h*.818f);',
              'presetMove.set(x+2*chipW+2*chipGap,h*.738f,r-w*.033f,h*.835f);')
s = s.replace('getHeight()*.0175f,accent,Paint.Align.CENTER,mediumFace)',
              'getHeight()*.0215f,accent,Paint.Align.CENTER,mediumFace)')
s = s.replace('getHeight()*.0185f,Color.rgb(65,89,104),Paint.Align.CENTER,bodyFace)',
              'getHeight()*.0215f,Color.rgb(65,89,104),Paint.Align.CENTER,mediumFace)')
s = s.replace('r.top+getHeight()*.027f', 'r.top+getHeight()*.036f')
s = s.replace('r.top+getHeight()*.052f', 'r.top+getHeight()*.071f')

# 5) Lotus exact : remplacer le dessin procédural par l'image fournie.
replacement = '''void drawBreathingFlower(Canvas c,float cx,float cy,float radius,float scale){
            float pulse=Math.max(0f,Math.min(1f,(scale-.86f)/.24f));

            // Halo doux : il s'élargit avec l'inspiration et se resserre avec l'expiration.
            p.setStyle(Paint.Style.FILL);
            p.setColor(Color.argb((int)(24+34*pulse),82,204,222));
            c.drawCircle(cx,cy,radius*(1.85f+.35f*pulse),p);
            p.setColor(Color.argb((int)(16+24*pulse),151,128,222));
            c.drawCircle(cx,cy,radius*(1.48f+.28f*pulse),p);

            if(lotusBmp==null){
                p.setColor(Color.argb(235,130,198,230));
                c.drawCircle(cx,cy,radius,p);
                return;
            }

            // Le vrai lotus fourni : ouverture légèrement plus large à l'inspiration.
            float sx=.88f + .18f*pulse;
            float sy=.91f + .11f*pulse;
            float halfW=radius*2.85f*sx;
            float halfH=radius*2.70f*sy;
            RectF dst=new RectF(cx-halfW,cy-halfH,cx+halfW,cy+halfH);

            p.setAlpha(250);
            c.drawBitmap(lotusBmp,null,dst,p);
            p.setAlpha(255);
        }

        void drawTinyFlower'''

s, n = re.subn(r'void drawBreathingFlower\(Canvas c,float cx,float cy,float radius,float scale\)\{.*?\n        \}\n\n        void drawTinyFlower', replacement, s, flags=re.S)
if n != 1:
    raise SystemExit(f'lotus replacement count={n}')

path.write_text(s, encoding='utf-8')
