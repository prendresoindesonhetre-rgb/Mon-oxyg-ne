from pathlib import Path
import re

path = Path('app/src/main/java/fr/prendresoindesonhetre/monoxygene/MainActivity.java')
s = path.read_text(encoding='utf-8')

# Respiration du lotus : mouvement doux uniquement, sans halo ni effet autour.
s = s.replace(
    'float breatheScale=(float)(0.86+0.24*(waveAt(elapsed)+1.0)/2.0);',
    'float breatheScale=(float)(0.92+0.14*(waveAt(elapsed)+1.0)/2.0);'
)

# Supprimer les effets ajoutés autour du lotus pendant les cycles de visualisation.
s = re.sub(
    r'''int visualCycle=\(int\)Math\.floor\(elapsed/\(inhaleSec\+exhaleSec\)\);\n            boolean showVisual=visualCycle<4 && \(visualCycle%2\)==1;\n            if\(showVisual\)\{\n                if\(inhale\)\{.*?\n            \}\n            ''',
    '',
    s,
    flags=re.S
)

# Remplacer le rendu du lotus par l'image seule, qui se gonfle à l'inspiration
# et se dégonfle à l'expiration. Aucun cercle, halo, contour ou aura n'est dessiné.
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

s, n = re.subn(
    r'void drawBreathingFlower\(Canvas c,float cx,float cy,float radius,float scale\)\{.*?\n        \}\n\n        void drawTinyFlower',
    replacement,
    s,
    flags=re.S
)
if n != 1:
    raise SystemExit(f'lotus replacement count={n}')

path.write_text(s, encoding='utf-8')
