from pathlib import Path
import re

path = Path('app/src/main/java/fr/prendresoindesonhetre/monoxygene/MainActivity.java')
s = path.read_text(encoding='utf-8')

# Respiration du lotus : un simple gonflement/repli doux.
s = s.replace(
    'float breatheScale=(float)(0.86+0.24*(waveAt(elapsed)+1.0)/2.0);',
    'float breatheScale=(float)(0.92+0.14*(waveAt(elapsed)+1.0)/2.0);'
)

# Supprimer entièrement le halo lumineux / nuage qui était dessiné autour du lotus.
# On conserve uniquement l'appel au lotus lui-même.
s, visual_count = re.subn(
    r'int visualCycle=\(int\)Math\.floor\(elapsed/\(inhaleSec\+exhaleSec\)\);.*?drawBreathingFlower\(c,flowerX,flowerY,h\*\.0275f,breatheScale\);',
    'drawBreathingFlower(c,flowerX,flowerY,h*.0275f,breatheScale);',
    s,
    flags=re.S
)
if visual_count != 1:
    raise SystemExit(f'visual effect removal count={visual_count}')

# Remplacer le rendu du lotus par l'image seule.
# Aucun cercle, halo, aura, contour animé ou effet diffus n'est ajouté.
replacement = '''void drawBreathingFlower(Canvas c,float cx,float cy,float radius,float scale){
            if(lotusBmp==null){
                p.setStyle(Paint.Style.FILL);
                p.setColor(Color.argb(235,130,198,230));
                c.drawCircle(cx,cy,radius*.55f,p);
                return;
            }

            float halfW=radius*2.78f*scale;
            float halfH=radius*2.63f*scale;
            RectF dst=new RectF(cx-halfW,cy-halfH,cx+halfW,cy+halfH);

            p.setAlpha(255);
            p.setStyle(Paint.Style.FILL);
            c.drawBitmap(lotusBmp,null,dst,p);
        }

        void drawTinyFlower'''

s, lotus_count = re.subn(
    r'void drawBreathingFlower\(Canvas c,float cx,float cy,float radius,float scale\)\{.*?\n        \}\n\n        void drawTinyFlower',
    replacement,
    s,
    flags=re.S
)
if lotus_count != 1:
    raise SystemExit(f'lotus replacement count={lotus_count}')

path.write_text(s, encoding='utf-8')
