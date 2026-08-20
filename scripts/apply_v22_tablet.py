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

        float measureWrappedHeight(String s,float maxW,float size,float spacing,boolean bold){
            p.setTextSize(size);
            p.setTypeface(bold?Typeface.create("sans",Typeface.BOLD):Typeface.create("sans",Typeface.NORMAL));
            float lineH=size*spacing;
            float height=0f;
            String[] paras=s.split("\\n",-1);
            for(String para:paras){
                if(para.length()==0){ height+=lineH*.52f; continue; }
                String[] words=para.split(" ");
                String line="";
                int lines=0;
                for(String word:words){
                    String test=line.length()==0?word:line+" "+word;
                    if(p.measureText(test)>maxW && line.length()>0){
                        lines++;
                        line=word;
                    } else line=test;
                }
                if(line.length()>0) lines++;
                height += lines*lineH;
            }
            return height;
        }

        void drawIntroTablet(Canvas c){
            int w=getWidth(),h=getHeight();
            drawBitmapCover(c,settingsBg);
            p.setColor(Color.argb(28,28,62,80)); c.drawRect(0,0,w,h,p);

            // Tablette uniquement : carte plus large et zone de lecture plus confortable.
            float l=w*.355f,t=h*.035f,r=w*.978f,b=h*.965f;
            p.setColor(Color.argb(224,250,252,255)); c.drawRoundRect(l,t,r,b,42,42,p);
            p.setColor(Color.argb(72,255,255,255)); c.drawRoundRect(l+w*.010f,t+h*.014f,r-w*.010f,b-h*.014f,34,34,p);

            float left=l+w*.034f, right=r-w*.032f;
            float maxW=right-left;

            skipBtn.set(r-w*.145f,t+h*.018f,r-w*.028f,t+h*.070f);
            text(c,"Passer",skipBtn.centerX(),skipBtn.centerY()+h*.008f,h*.021f,Color.rgb(75,104,123),Paint.Align.CENTER,false);

            float titleSize=h*.043f;
            float titleY=h*.125f;
            float afterTitle=wrappedText(c,introTitles[introPage],left,titleY,maxW,titleSize,Color.rgb(43,78,105),1.10f,true);
            float y=afterTitle+h*.015f;

            // On réserve toujours le bas de la carte pour la pagination et les boutons.
            float contentBottom=h*.775f;
            float bodySize = introPage==3 ? h*.0240f : (introPage==4 ? h*.0250f : (introPage==5 ? h*.0243f : h*.0260f));
            float minSize=h*.0185f;
            float gap=h*.016f;
            while(bodySize>minSize){
                float need=measureWrappedHeight(introBodies[introPage],maxW,bodySize,1.28f,false)
                        + gap
                        + measureWrappedHeight(introAccents[introPage],maxW,bodySize*1.01f,1.27f,true);
                if(y+need<=contentBottom) break;
                bodySize-=h*.00055f;
            }

            y=wrappedText(c,introBodies[introPage],left,y,maxW,bodySize,Color.rgb(48,75,96),1.28f,false);
            y+=gap;
            wrappedText(c,introAccents[introPage],left,y,maxW,bodySize*1.01f,Color.rgb(51,121,139),1.27f,true);

            float dotY=h*.817f;
            float spacing=Math.min(w*.018f,h*.030f);
            float center=(l+r)/2f;
            float start=center-spacing*(introTitles.length-1)/2f;
            for(int i=0;i<introTitles.length;i++){
                p.setColor(i==introPage?Color.rgb(74,177,190):Color.argb(110,70,105,125));
                c.drawCircle(start+i*spacing,dotY,h*(i==introPage?.0075f:.0052f),p);
            }

            backBtn.set(l+w*.030f,h*.858f,l+w*.155f,h*.930f);
            nextBtn.set(r-w*.205f,h*.858f,r-w*.030f,h*.930f);
            if(introPage>0) softButton(c,backBtn,"Précédent",false);
            softButton(c,nextBtn,introPage==introTitles.length-1?"Choisir mon rythme":"Suivant",true);
        }

'''
s = s.replace(marker, insert + marker, 1)
path.write_text(s, encoding="utf-8")
print("Mon Oxygène v22 : mise en page tablette ajoutée, interface téléphone inchangée")
