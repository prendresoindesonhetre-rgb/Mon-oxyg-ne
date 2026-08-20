from pathlib import Path

path = Path('app/src/main/java/fr/prendresoindesonhetre/monoxygene/MainActivity.java')
s = path.read_text(encoding='utf-8')

# Conserver exactement la disposition v20, mais rendre les deux commandes plus présentes.
old_size = 'float btnCy=h*.090f, rr=h*.036f;'
new_size = 'float btnCy=h*.090f, rr=h*.041f;'
if old_size not in s:
    raise SystemExit('taille boutons v20 introuvable')
s = s.replace(old_size, new_size)

old_button = '''        void drawRemoteButton(Canvas c,RectF r,int mode){\n            p.setColor(Color.argb(105,250,253,255)); c.drawOval(r,p);\n            p.setStyle(Paint.Style.STROKE); p.setStrokeWidth(1.5f); p.setColor(Color.argb(95,255,255,255)); c.drawOval(r,p); p.setStyle(Paint.Style.FILL);\n            float cx=r.centerX(),cy=r.centerY(),h=getHeight();\n            p.setColor(Color.argb(245,255,255,255));\n            if(mode==0){\n                float barW=h*.006f,barH=h*.026f,gap=h*.006f;\n                c.drawRoundRect(cx-gap-barW,cy-barH,cx-gap,cy+barH,4,4,p);\n                c.drawRoundRect(cx+gap,cy-barH,cx+gap+barW,cy+barH,4,4,p);\n            }else if(mode==1){\n                Path tri=new Path(); tri.moveTo(cx-h*.010f,cy-h*.021f); tri.lineTo(cx+h*.023f,cy); tri.lineTo(cx-h*.010f,cy+h*.021f); tri.close(); c.drawPath(tri,p);\n            }else{\n                float s=h*.020f; c.drawRoundRect(cx-s,cy-s,cx+s,cy+s,5,5,p);\n            }\n        }'''

new_button = '''        void drawRemoteButton(Canvas c,RectF r,int mode){\n            float cx=r.centerX(),cy=r.centerY(),h=getHeight();\n            // Fond bleu-canard plus soutenu : lisible même sur les zones claires du paysage.\n            p.setColor(Color.argb(205,50,111,145));\n            c.drawOval(r,p);\n            // Double contour discret pour détacher nettement le bouton du fond.\n            p.setStyle(Paint.Style.STROKE);\n            p.setStrokeWidth(Math.max(2.2f,h*.0032f));\n            p.setColor(Color.argb(230,240,252,255));\n            c.drawOval(r,p);\n            p.setStrokeWidth(Math.max(1.0f,h*.0014f));\n            p.setColor(Color.argb(175,92,210,220));\n            RectF inner=new RectF(r.left+h*.004f,r.top+h*.004f,r.right-h*.004f,r.bottom-h*.004f);\n            c.drawOval(inner,p);\n            p.setStyle(Paint.Style.FILL);\n            // Symboles légèrement plus grands et totalement opaques.\n            p.setColor(Color.WHITE);\n            if(mode==0){\n                float barW=h*.008f,barH=h*.030f,gap=h*.007f;\n                c.drawRoundRect(cx-gap-barW,cy-barH,cx-gap,cy+barH,5,5,p);\n                c.drawRoundRect(cx+gap,cy-barH,cx+gap+barW,cy+barH,5,5,p);\n            }else if(mode==1){\n                Path tri=new Path(); tri.moveTo(cx-h*.012f,cy-h*.025f); tri.lineTo(cx+h*.027f,cy); tri.lineTo(cx-h*.012f,cy+h*.025f); tri.close(); c.drawPath(tri,p);\n            }else{\n                float ss=h*.023f; c.drawRoundRect(cx-ss,cy-ss,cx+ss,cy+ss,6,6,p);\n            }\n        }'''

if old_button not in s:
    raise SystemExit('drawRemoteButton original introuvable')
s = s.replace(old_button, new_button)

path.write_text(s, encoding='utf-8')
