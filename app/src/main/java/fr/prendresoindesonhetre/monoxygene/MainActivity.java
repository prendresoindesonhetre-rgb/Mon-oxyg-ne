package fr.prendresoindesonhetre.monoxygene;

import android.app.Activity;
import android.os.Bundle;
import android.os.SystemClock;
import android.graphics.*;
import android.view.*;
import android.content.*;
import android.util.Base64;
import java.util.*;

public class MainActivity extends Activity {
    @Override public void onCreate(Bundle b){
        super.onCreate(b);
        getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN);
        getWindow().getDecorView().setSystemUiVisibility(5894 | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY);
        setContentView(new BreathingView(this));
    }

    static class BreathingView extends View {
        static final int INTRO=0, SETTINGS=1, SESSION=2;
        Paint p = new Paint(Paint.ANTI_ALIAS_FLAG);
        Paint stroke = new Paint(Paint.ANTI_ALIAS_FLAG);
        Paint glow = new Paint(Paint.ANTI_ALIAS_FLAG);
        Bitmap settingsBg, curveBg;
        int screen = INTRO;
        int introPage = 0;
        int durationMin = 5;
        int inhaleSec = 5;
        int exhaleSec = 5;
        boolean startWithInhale = true;
        boolean paused = false;
        long startMs, pausedAt, pausedTotal;

        RectF nextBtn=new RectF(), backBtn=new RectF(), skipBtn=new RectF();
        RectF minusDur=new RectF(), plusDur=new RectF();
        RectF minusIn=new RectF(), plusIn=new RectF();
        RectF minusOut=new RectF(), plusOut=new RectF();
        RectF inhaleFirstBtn=new RectF(), exhaleFirstBtn=new RectF();
        RectF presetEq=new RectF(), presetSlow=new RectF(), presetMove=new RectF();
        RectF startBtn=new RectF(), pauseBtn=new RectF(), stopBtn=new RectF(), infoBtn=new RectF();

        String[] introTitles = new String[]{
                "Mon Oxygène",
                "Ce que l’on ne contrôle pas",
                "La respiration crée un espace de retour à soi",
                "Inspire & Expire",
                "Choisir son juste rythme",
                "Avec le temps"
        };

        String[] introBodies = new String[]{
                "Respirer c’est bien… en conscience et en y mettant du sens, c’est mieux.\n\nMon Oxygène est une application de respiration guidée pensée comme un espace intérieur. Un moment pour accueillir ce qui est là, et laisser un peu plus de place à ce que l’on ressent.",
                "Nous ne contrôlons pas ce qui nous entoure.\n\nMais nous pouvons contrôler deux choses : nos actions… et nos réactions.",
                "Respirer ne cherche pas à effacer ce que l’on ressent.\n\nC’est une façon de revenir doucement à soi, de prendre un peu de recul, et de laisser les choses se poser.\n\nCela permet d’accueillir ce qui est là, sans se juger, et de lui redonner sa juste place.",
                "À l’inspiration\nInspire doucement par le nez. Laisse le ventre se gonfler naturellement. Si cela t’aide, imagine que tu inspires une lumière douce, qui apporte un peu d’espace, de chaleur ou de calme à l’intérieur de toi.\n\nÀ l’expiration\nExpire doucement par la bouche. Le ventre redescend sans effort. Tu peux imaginer que ton expiration emporte ce dont tu ne souhaites plus t’encombrer : une tension, un poids, une agitation, ou simplement ce que tu as besoin de relâcher.",
                "Retrouver l’équilibre — 5 / 5\nUn rythme simple et régulier pour revenir à soi.\n\nRalentir — expiration plus longue\n4 / 6 ou 3 / 5, pour accompagner le calme et relâcher progressivement.\n\nDynamiser — inspiration plus longue\n6 / 4 ou 5 / 3, pour soutenir l’énergie et la mise en mouvement.",
                "Petit à petit, la respiration devient un repère naturel. Un espace intérieur que tu sauras retrouver plus facilement.\n\nUne manière de prendre soin de son Hêtre : revenir à soi avec douceur, s’écouter, et accueillir ce qui est là.\n\nLa respiration ne change pas forcément ce qui se passe autour de nous."
        };

        String[] introAccents = new String[]{
                "Respirer partout, simplement… mais surtout en y mettant du sens.",
                "On ne respire pas pour changer le monde, mais pour retrouver un peu plus de liberté dans la manière d’y répondre.",
                "Dans les moments d’inconfort, la respiration devient un chemin simple pour revenir à soi et retrouver un peu de sécurité intérieure.",
                "Inspire ce qui te fait du bien.\nExpire ce qui ne te convient plus.\n\nLe plus important n’est pas l’amplitude, mais le confort. Reste à l’écoute de ce qui te semble juste.",
                "Il n’existe pas de bon rythme universel. Il y a seulement celui dans lequel ta respiration reste fluide et confortable.",
                "Mais elle peut changer la manière dont nous le traversons et le percevons.\n\nPour cela, tu n’as rien à réussir, rien à forcer. Laisse simplement faire, de la manière la plus juste et la plus confortable pour toi, en faisant confiance à tes ressentis."
        };

        BreathingView(Context c){
            super(c);
            stroke.setStyle(Paint.Style.STROKE);
            glow.setStyle(Paint.Style.STROKE);
            setKeepScreenOn(true);
            settingsBg = decode(BackgroundAssets.SETTINGS);
            curveBg = decode(BackgroundAssets.CURVE);
        }

        Bitmap decode(String[] chunks){
            StringBuilder sb=new StringBuilder();
            for(String s:chunks) sb.append(s);
            byte[] data=Base64.decode(sb.toString(),Base64.DEFAULT);
            return BitmapFactory.decodeByteArray(data,0,data.length);
        }

        @Override protected void onDraw(Canvas c){
            super.onDraw(c);
            if(screen==INTRO) drawIntro(c);
            else if(screen==SETTINGS) drawSettings(c);
            else drawSession(c);
            if(screen==SESSION && !paused) postInvalidateOnAnimation();
        }

        void drawBitmapCover(Canvas c, Bitmap bmp){
            if(bmp==null){ c.drawColor(Color.rgb(210,225,240)); return; }
            int vw=getWidth(), vh=getHeight(), bw=bmp.getWidth(), bh=bmp.getHeight();
            float viewRatio=(float)vw/vh, bmpRatio=(float)bw/bh;
            Rect src=new Rect();
            if(bmpRatio>viewRatio){
                int cropW=Math.round(bh*viewRatio); int left=(bw-cropW)/2;
                src.set(left,0,left+cropW,bh);
            }else{
                int cropH=Math.round(bw/viewRatio); int top=(bh-cropH)/2;
                src.set(0,top,bw,top+cropH);
            }
            c.drawBitmap(bmp,src,new Rect(0,0,vw,vh),p);
        }

        void drawIntro(Canvas c){
            int w=getWidth(),h=getHeight();
            drawBitmapCover(c,settingsBg);
            p.setColor(Color.argb(28,28,62,80)); c.drawRect(0,0,w,h,p);
            float l=w*.47f,t=h*.055f,r=w*.955f,b=h*.945f;
            p.setColor(Color.argb(220,250,252,255)); c.drawRoundRect(l,t,r,b,36,36,p);
            p.setColor(Color.argb(70,255,255,255)); c.drawRoundRect(l+w*.012f,t+h*.018f,r-w*.012f,b-h*.018f,28,28,p);

            float left=l+w*.045f, right=r-w*.045f;
            text(c,introTitles[introPage],left,h*.145f,h*.052f,Color.rgb(43,78,105),Paint.Align.LEFT,true);
            float bodySize = introPage==3 ? h*.0275f : (introPage==4 ? h*.030f : h*.0315f);
            float y=h*.215f;
            y=wrappedText(c,introBodies[introPage],left,y,right-left,bodySize,Color.rgb(48,75,96),1.33f,false);
            y += h*.018f;
            wrappedText(c,introAccents[introPage],left,y,right-left,bodySize*1.02f,Color.rgb(51,121,139),1.32f,true);

            backBtn.set(l+w*.035f,h*.855f,l+w*.155f,h*.922f);
            nextBtn.set(r-w*.185f,h*.855f,r-w*.035f,h*.922f);
            skipBtn.set(r-w*.185f,t+h*.025f,r-w*.035f,t+h*.080f);
            if(introPage>0) softButton(c,backBtn,"Précédent",false);
            softButton(c,nextBtn,introPage==introTitles.length-1?"Choisir mon rythme":"Suivant",true);
            text(c,"Passer",skipBtn.centerX(),skipBtn.centerY()+h*.010f,h*.025f,Color.rgb(75,104,123),Paint.Align.CENTER,false);

            float dotY=h*.805f; float spacing=w*.017f; float start=w*.715f-spacing*(introTitles.length-1)/2f;
            for(int i=0;i<introTitles.length;i++){
                p.setColor(i==introPage?Color.rgb(74,177,190):Color.argb(110,70,105,125));
                c.drawCircle(start+i*spacing,dotY,h*(i==introPage?.008f:.0055f),p);
            }
        }

        void drawSettings(Canvas c){
            int w=getWidth(),h=getHeight();
            drawBitmapCover(c,settingsBg);
            p.setColor(Color.argb(22,22,55,70)); c.drawRect(0,0,w,h,p);
            float l=w*.515f,t=h*.045f,r=w*.965f,b=h*.955f;
            p.setColor(Color.argb(216,250,252,255)); c.drawRoundRect(l,t,r,b,36,36,p);
            float cx=(l+r)/2f;
            text(c,"Mon Oxygène",cx,h*.12f,h*.050f,Color.rgb(40,76,103),Paint.Align.CENTER,true);
            text(c,"Choisis ce qui est juste pour toi aujourd’hui",cx,h*.168f,h*.026f,Color.rgb(72,100,120),Paint.Align.CENTER,false);

            float labelX=l+w*.035f;
            drawStepper(c,"Durée de la séance",durationMin+" min",labelX,h*.255f,minusDur,plusDur);
            drawStepper(c,"Inspiration",inhaleSec+" s",labelX,h*.385f,minusIn,plusIn);
            drawStepper(c,"Expiration",exhaleSec+" s",labelX,h*.515f,minusOut,plusOut);

            text(c,"Commencer par",labelX,h*.625f,h*.028f,Color.rgb(48,79,102),Paint.Align.LEFT,true);
            inhaleFirstBtn.set(l+w*.035f,h*.655f,l+w*.205f,h*.715f);
            exhaleFirstBtn.set(l+w*.225f,h*.655f,l+w*.395f,h*.715f);
            toggleButton(c,inhaleFirstBtn,"Inspirer",startWithInhale);
            toggleButton(c,exhaleFirstBtn,"Expirer",!startWithInhale);

            text(c,"Rythmes proposés",labelX,h*.765f,h*.025f,Color.rgb(69,96,115),Paint.Align.LEFT,false);
            presetEq.set(l+w*.035f,h*.785f,l+w*.145f,h*.837f);
            presetSlow.set(l+w*.155f,h*.785f,l+w*.275f,h*.837f);
            presetMove.set(l+w*.285f,h*.785f,l+w*.415f,h*.837f);
            chip(c,presetEq,"Équilibre 5/5"); chip(c,presetSlow,"Ralentir 4/6"); chip(c,presetMove,"Dynamiser 6/4");

            startBtn.set(l+w*.10f,h*.865f,r-w*.10f,h*.928f);
            p.setColor(Color.rgb(72,172,187)); c.drawRoundRect(startBtn,42,42,p);
            text(c,"Commencer la séance",startBtn.centerX(),startBtn.centerY()+h*.011f,h*.029f,Color.WHITE,Paint.Align.CENTER,true);

            infoBtn.set(l+w*.008f,t+h*.008f,l+w*.080f,t+h*.055f);
            text(c,"↶ Infos",infoBtn.centerX(),infoBtn.centerY()+h*.007f,h*.021f,Color.rgb(78,104,120),Paint.Align.CENTER,false);
        }

        void drawStepper(Canvas c,String label,String value,float x,float y,RectF minus,RectF plus){
            int w=getWidth(),h=getHeight();
            text(c,label,x,y,h*.028f,Color.rgb(48,79,102),Paint.Align.LEFT,true);
            float cy=y+h*.050f;
            minus.set(x,cy-h*.026f,x+w*.052f,cy+h*.026f);
            plus.set(x+w*.245f,cy-h*.026f,x+w*.297f,cy+h*.026f);
            p.setColor(Color.argb(205,255,255,255)); c.drawRoundRect(minus,24,24,p); c.drawRoundRect(plus,24,24,p);
            p.setStyle(Paint.Style.STROKE); p.setStrokeWidth(2); p.setColor(Color.argb(95,63,112,135)); c.drawRoundRect(minus,24,24,p); c.drawRoundRect(plus,24,24,p); p.setStyle(Paint.Style.FILL);
            text(c,"−",minus.centerX(),minus.centerY()+h*.014f,h*.045f,Color.rgb(55,100,124),Paint.Align.CENTER,false);
            text(c,"+",plus.centerX(),plus.centerY()+h*.014f,h*.043f,Color.rgb(55,100,124),Paint.Align.CENTER,false);
            text(c,value,x+w*.149f,cy+h*.012f,h*.035f,Color.rgb(45,77,99),Paint.Align.CENTER,true);
        }

        void toggleButton(Canvas c,RectF r,String s,boolean selected){
            p.setColor(selected?Color.rgb(85,183,196):Color.argb(200,255,255,255)); c.drawRoundRect(r,30,30,p);
            text(c,s,r.centerX(),r.centerY()+getHeight()*.009f,getHeight()*.024f,selected?Color.WHITE:Color.rgb(56,91,111),Paint.Align.CENTER,true);
        }

        void chip(Canvas c,RectF r,String s){
            p.setColor(Color.argb(190,255,255,255)); c.drawRoundRect(r,25,25,p);
            text(c,s,r.centerX(),r.centerY()+getHeight()*.007f,getHeight()*.0185f,Color.rgb(57,92,112),Paint.Align.CENTER,true);
        }

        void drawSession(Canvas c){
            int w=getWidth(),h=getHeight();
            drawBitmapCover(c,curveBg);
            p.setColor(Color.argb(28,17,45,66)); c.drawRect(0,0,w,h,p);
            long now=paused?pausedAt:SystemClock.elapsedRealtime();
            double elapsed=(now-startMs-pausedTotal)/1000.0;
            double total=durationMin*60.0;
            double remain=Math.max(0,total-elapsed);
            if(remain<=0){ screen=SETTINGS; paused=false; invalidate(); return; }

            boolean inhale=isInhaleAt(elapsed);
            text(c,inhale?"Inspirez":"Expirez",w*.50f,h*.145f,h*.060f,Color.WHITE,Paint.Align.CENTER,true);
            double phaseRemain=phaseRemaining(elapsed);
            text(c,String.format(Locale.FRANCE,"%.1f s",phaseRemain),w*.50f,h*.195f,h*.026f,Color.argb(230,255,255,255),Paint.Align.CENTER,false);
            int sec=(int)Math.ceil(remain); String time=String.format(Locale.FRANCE,"%d:%02d",sec/60,sec%60);
            text(c,time,w*.91f,h*.105f,h*.036f,Color.WHITE,Paint.Align.CENTER,true);
            text(c,"Mon Oxygène",w*.075f,h*.105f,h*.028f,Color.WHITE,Paint.Align.LEFT,true);

            float top=h*.28f,bottom=h*.70f,mid=(top+bottom)/2f,amp=(bottom-top)*.39f;
            p.setColor(Color.argb(55,18,45,68)); c.drawRoundRect(w*.035f,top-h*.075f,w*.965f,bottom+h*.075f,42,42,p);
            Path path=new Path();
            double cycle=inhaleSec+exhaleSec;
            double visibleSpan=cycle*4.6;
            for(int i=0;i<=720;i++){
                float x=(float)i/720*w;
                double t=elapsed+(x/w-.5)*visibleSpan;
                float y=(float)(mid-amp*waveAt(t));
                if(i==0) path.moveTo(x,y); else path.lineTo(x,y);
            }
            glow.setStrokeCap(Paint.Cap.ROUND); glow.setStrokeWidth(Math.max(10,w*.008f)); glow.setColor(Color.argb(80,90,220,235)); c.drawPath(path,glow);
            stroke.setStrokeCap(Paint.Cap.ROUND); stroke.setStrokeWidth(Math.max(4,w*.0033f)); stroke.setColor(Color.argb(245,255,255,255)); c.drawPath(path,stroke);
            float dotX=w*.50f; float dotY=(float)(mid-amp*waveAt(elapsed));
            p.setColor(Color.rgb(91,211,225)); c.drawCircle(dotX,dotY,h*.024f,p);
            p.setStyle(Paint.Style.STROKE); p.setStrokeWidth(h*.005f); p.setColor(Color.WHITE); c.drawCircle(dotX,dotY,h*.024f,p); p.setStyle(Paint.Style.FILL);

            float progress=(float)(elapsed/total);
            p.setColor(Color.argb(110,255,255,255)); c.drawRoundRect(w*.18f,h*.815f,w*.82f,h*.829f,20,20,p);
            p.setColor(Color.rgb(97,204,216)); c.drawRoundRect(w*.18f,h*.815f,w*(.18f+.64f*progress),h*.829f,20,20,p);
            text(c,"Inspire "+inhaleSec+" s   •   Expire "+exhaleSec+" s",w*.50f,h*.865f,h*.022f,Color.WHITE,Paint.Align.CENTER,true);

            pauseBtn.set(w*.35f,h*.895f,w*.48f,h*.965f); stopBtn.set(w*.52f,h*.895f,w*.65f,h*.965f);
            p.setColor(Color.argb(205,250,252,255)); c.drawRoundRect(pauseBtn,32,32,p); c.drawRoundRect(stopBtn,32,32,p);
            text(c,paused?"Reprendre":"Pause",pauseBtn.centerX(),pauseBtn.centerY()+h*.010f,h*.025f,Color.rgb(44,78,101),Paint.Align.CENTER,true);
            text(c,"Arrêter",stopBtn.centerX(),stopBtn.centerY()+h*.010f,h*.025f,Color.rgb(44,78,101),Paint.Align.CENTER,true);
        }

        boolean isInhaleAt(double t){
            double cycle=inhaleSec+exhaleSec;
            double m=mod(t,cycle);
            if(startWithInhale) return m<inhaleSec;
            return !(m<exhaleSec);
        }

        double phaseRemaining(double t){
            double cycle=inhaleSec+exhaleSec;
            double m=mod(t,cycle);
            if(startWithInhale){ return m<inhaleSec ? inhaleSec-m : cycle-m; }
            return m<exhaleSec ? exhaleSec-m : cycle-m;
        }

        double waveAt(double t){
            double cycle=inhaleSec+exhaleSec;
            double m=mod(t,cycle);
            if(startWithInhale){
                if(m<inhaleSec){ double q=m/inhaleSec; return -Math.cos(Math.PI*q); }
                double q=(m-inhaleSec)/exhaleSec; return Math.cos(Math.PI*q);
            }else{
                if(m<exhaleSec){ double q=m/exhaleSec; return Math.cos(Math.PI*q); }
                double q=(m-exhaleSec)/inhaleSec; return -Math.cos(Math.PI*q);
            }
        }

        double mod(double a,double b){ double m=a%b; return m<0?m+b:m; }

        void softButton(Canvas c,RectF r,String s,boolean primary){
            p.setColor(primary?Color.rgb(72,172,187):Color.argb(195,255,255,255)); c.drawRoundRect(r,30,30,p);
            text(c,s,r.centerX(),r.centerY()+getHeight()*.009f,getHeight()*.024f,primary?Color.WHITE:Color.rgb(57,91,111),Paint.Align.CENTER,true);
        }

        float wrappedText(Canvas c,String s,float x,float y,float maxW,float size,int color,float spacing,boolean bold){
            p.setTextSize(size); p.setTypeface(bold?Typeface.create("sans",Typeface.BOLD):Typeface.create("sans",Typeface.NORMAL)); p.setColor(color); p.setTextAlign(Paint.Align.LEFT);
            float lineH=size*spacing;
            String[] paras=s.split("\\n",-1);
            for(String para:paras){
                if(para.length()==0){ y+=lineH*.52f; continue; }
                String[] words=para.split(" "); String line="";
                for(String word:words){
                    String test=line.length()==0?word:line+" "+word;
                    if(p.measureText(test)>maxW && line.length()>0){ c.drawText(line,x,y,p); y+=lineH; line=word; }
                    else line=test;
                }
                if(line.length()>0){ c.drawText(line,x,y,p); y+=lineH; }
            }
            return y;
        }

        void text(Canvas c,String s,float x,float y,float size,int color,Paint.Align align,boolean bold){
            p.setShader(null); p.setColor(color); p.setTextSize(size); p.setTextAlign(align); p.setTypeface(bold?Typeface.create("sans",Typeface.BOLD):Typeface.create("sans",Typeface.NORMAL));
            String[] lines=s.split("\\n");
            for(int i=0;i<lines.length;i++) c.drawText(lines[i],x,y+i*size*1.25f,p);
        }

        @Override public boolean onTouchEvent(MotionEvent e){
            if(e.getAction()!=MotionEvent.ACTION_UP) return true;
            float x=e.getX(),y=e.getY();
            if(screen==INTRO){
                if(skipBtn.contains(x,y)){ screen=SETTINGS; }
                else if(introPage>0 && backBtn.contains(x,y)){ introPage--; }
                else if(nextBtn.contains(x,y)){
                    if(introPage<introTitles.length-1) introPage++;
                    else screen=SETTINGS;
                }
            } else if(screen==SETTINGS){
                if(infoBtn.contains(x,y)){ screen=INTRO; introPage=0; }
                else if(minusDur.contains(x,y)) durationMin=Math.max(1,durationMin-1);
                else if(plusDur.contains(x,y)) durationMin=Math.min(20,durationMin+1);
                else if(minusIn.contains(x,y)) inhaleSec=Math.max(2,inhaleSec-1);
                else if(plusIn.contains(x,y)) inhaleSec=Math.min(10,inhaleSec+1);
                else if(minusOut.contains(x,y)) exhaleSec=Math.max(2,exhaleSec-1);
                else if(plusOut.contains(x,y)) exhaleSec=Math.min(10,exhaleSec+1);
                else if(inhaleFirstBtn.contains(x,y)) startWithInhale=true;
                else if(exhaleFirstBtn.contains(x,y)) startWithInhale=false;
                else if(presetEq.contains(x,y)){ inhaleSec=5; exhaleSec=5; }
                else if(presetSlow.contains(x,y)){ inhaleSec=4; exhaleSec=6; }
                else if(presetMove.contains(x,y)){ inhaleSec=6; exhaleSec=4; }
                else if(startBtn.contains(x,y)){
                    screen=SESSION; paused=false; pausedTotal=0; startMs=SystemClock.elapsedRealtime();
                }
            } else {
                if(pauseBtn.contains(x,y)){
                    if(!paused){ paused=true; pausedAt=SystemClock.elapsedRealtime(); }
                    else { paused=false; pausedTotal += SystemClock.elapsedRealtime()-pausedAt; }
                } else if(stopBtn.contains(x,y)){ screen=SETTINGS; paused=false; }
            }
            invalidate(); return true;
        }
    }
}
