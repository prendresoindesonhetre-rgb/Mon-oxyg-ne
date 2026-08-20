from pathlib import Path

path = Path("app/src/main/java/fr/prendresoindesonhetre/monoxygene/MainActivity.java")
s = path.read_text(encoding="utf-8")

old = '''        void drawIntro(Canvas c){\n            int w=getWidth(),h=getHeight();'''
new = '''        void drawIntro(Canvas c){\n            if(isTabletLayout()){ drawIntroTablet(c); return; }\n            int w=getWidth(),h=getHeight();'''
if old not in s:
    raise SystemExit("drawIntro marker not found")
s = s.replace(old, new, 1)

marker = '''        void drawSettings(Canvas c){'''
if marker not in s:
    raise SystemExit("drawSettings marker not found")

insert = r'''        boolean isTabletLayout(){
            return getResources().getConfiguration().smallestScreenWidthDp >= 600;
        }

        float measureWrappedHeightFace(String s,float maxW,float size,float spacing,Typeface face){
            p.setTextSize(size);
            p.setTypeface(face);
            float lineH=size*spacing;
            float height=0f;
            String[] paras=s.split("\\n",-1);
            for(String para:paras){
                if(para.length()==0){ height+=lineH*.60f; continue; }
                String[] words=para.split(" ");
                String line="";
                int lines=0;
                for(String word:words){
                    String test=line.length()==0?word:line+" "+word;
                    if(p.measureText(test)>maxW && line.length()>0){
                        lines++;
                        line=word;
                    }else line=test;
                }
                if(line.length()>0) lines++;
                height+=lines*lineH;
            }
            return height;
        }

        void drawIntroTablet(Canvas c){
            int w=getWidth(),h=getHeight();
            drawBitmapCover(c,settingsBg);

            LinearGradient veil=new LinearGradient(w*.28f,0,w,0,
                    new int[]{Color.argb(5,255,255,255),Color.argb(48,245,250,255),Color.argb(92,245,249,255)},
                    null,Shader.TileMode.CLAMP);
            p.setShader(veil); c.drawRect(w*.25f,0,w,h,p); p.setShader(null);

            // Cette branche n'est utilisée que sur les tablettes (>= 600 dp).
            // Le dessin téléphone v21 reste donc strictement inchangé.
            float l=w*.345f,t=h*.035f,r=w*.978f,b=h*.965f;
            p.setColor(Color.argb(210,251,253,255)); c.drawRoundRect(l,t,r,b,44,44,p);
            p.setStyle(Paint.Style.STROKE);
            p.setStrokeWidth(Math.max(1.5f,w*.0012f));
            p.setColor(Color.argb(78,125,177,197));
            c.drawRoundRect(l+w*.008f,t+h*.012f,r-w*.008f,b-h*.012f,38,38,p);
            p.setStyle(Paint.Style.FILL);

            float left=l+w*.034f, right=r-w*.032f;
            float maxW=right-left;

            textFace(c,introKickers[introPage],left,h*.105f,h*.0195f,Color.rgb(87,137,154),Paint.Align.LEFT,mediumFace);
            drawTinyFlower(c,right-w*.010f,h*.098f,h*.0135f,.88f);

            skipBtn.set(r-w*.125f,t+h*.016f,r-w*.020f,t+h*.064f);
            textFace(c,"Passer",skipBtn.centerX(),skipBtn.centerY()+h*.006f,h*.0205f,Color.rgb(106,125,137),Paint.Align.CENTER,bodyFace);

            float titleSize=introPage==2?h*.0385f:h*.0435f;
            float titleY=h*.155f;
            float afterTitle=wrappedTextFace(c,introTitles[introPage],left,titleY,maxW,titleSize,Color.rgb(46,75,101),1.10f,titleFace);
            float underlineY=afterTitle-h*.010f;
            p.setColor(Color.argb(90,81,184,198));
            c.drawRoundRect(left,underlineY,left+w*.060f,underlineY+h*.004f,4,4,p);

            float contentY=underlineY+h*.043f;
            if(introPage==3){
                drawIntroBreath(c,left,right,contentY);
            }else if(introPage==4){
                drawIntroRhythms(c,left,right,contentY-h*.008f);
            }else{
                float contentBottom=h*.780f;
                float gap=h*.021f;
                float bodySize=introPage==5?h*.0245f:h*.0260f;
                float minSize=h*.0190f;
                while(bodySize>minSize){
                    float need=measureWrappedHeightFace(introBodies[introPage],maxW,bodySize,1.34f,bodyFace)
                            +gap
                            +measureWrappedHeightFace(introAccents[introPage],maxW,bodySize*1.01f,1.30f,accentFace);
                    if(contentY+need<=contentBottom) break;
                    bodySize-=h*.0005f;
                }
                float y=wrappedTextFace(c,introBodies[introPage],left,contentY,maxW,bodySize,Color.rgb(61,83,99),1.34f,bodyFace);
                y+=gap;
                wrappedTextFace(c,introAccents[introPage],left,y,maxW,bodySize*1.01f,Color.rgb(57,126,142),1.30f,accentFace);
            }

            float dotY=h*.818f;
            float spacing=Math.min(w*.018f,h*.030f);
            float center=(l+r)/2f;
            float start=center-spacing*(introTitles.length-1)/2f;
            for(int i=0;i<introTitles.length;i++){
                p.setColor(i==introPage?Color.rgb(76,187,201):Color.argb(80,74,112,130));
                c.drawCircle(start+i*spacing,dotY,h*(i==introPage?.0065f:.0041f),p);
            }

            backBtn.set(l+w*.026f,h*.858f,l+w*.135f,h*.928f);
            nextBtn.set(r-w*.170f,h*.858f,r-w*.026f,h*.928f);
            if(introPage>0) navButton(c,backBtn,"‹",false);
            navButton(c,nextBtn,introPage==introTitles.length-1?"Choisir":"Suivant",true);
        }

'''
s = s.replace(marker, insert + marker, 1)
path.write_text(s, encoding="utf-8")
print("Mon Oxygène v22 : mise en page tablette ajoutée, interface téléphone v21 inchangée")
