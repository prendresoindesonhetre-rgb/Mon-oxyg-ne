package fr.prendresoindesonhetre.monoxygene;

import android.app.Activity;
import android.os.Bundle;
import android.os.SystemClock;
import android.graphics.*;
import android.graphics.drawable.*;
import android.view.*;
import android.content.*;
import java.util.Locale;

public class MainActivity extends Activity {
    @Override public void onCreate(Bundle b){
        super.onCreate(b);
        getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN);
        getWindow().getDecorView().setSystemUiVisibility(5894 | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY);
        setContentView(new BreathingView(this));
    }

    static class BreathingView extends View {
        Paint p = new Paint(Paint.ANTI_ALIAS_FLAG);
        Paint stroke = new Paint(Paint.ANTI_ALIAS_FLAG);
        int durationMin = 5;
        int bpm = 6;
        boolean session = false, paused = false;
        long startMs, pausedAt, pausedTotal;
        RectF minusDur=new RectF(), plusDur=new RectF(), minusBpm=new RectF(), plusBpm=new RectF(), startBtn=new RectF(), pauseBtn=new RectF(), stopBtn=new RectF();

        BreathingView(Context c){
            super(c);
            stroke.setStyle(Paint.Style.STROKE);
            setKeepScreenOn(true);
        }

        @Override protected void onDraw(Canvas c){
            super.onDraw(c);
            if(session) drawSession(c); else drawSettings(c);
            if(session && !paused) postInvalidateOnAnimation();
        }

        void drawBackground(Canvas c, boolean withTree){
            int w=getWidth(), h=getHeight();
            LinearGradient sky = new LinearGradient(0,0,w,h,
                    new int[]{Color.rgb(123,190,230), Color.rgb(221,210,244), Color.rgb(255,224,183)},
                    new float[]{0f,.52f,1f}, Shader.TileMode.CLAMP);
            p.setShader(sky); c.drawRect(0,0,w,h,p); p.setShader(null);
            p.setColor(Color.argb(80,80,110,155));
            Path m=new Path(); m.moveTo(0,h*.68f); m.lineTo(w*.16f,h*.49f); m.lineTo(w*.29f,h*.66f); m.lineTo(w*.44f,h*.53f); m.lineTo(w*.61f,h*.69f); m.lineTo(w*.79f,h*.55f); m.lineTo(w,h*.67f); m.lineTo(w,h); m.lineTo(0,h); m.close(); c.drawPath(m,p);
            p.setColor(Color.argb(105,115,172,205)); c.drawRect(0,h*.72f,w,h,p);
            p.setColor(Color.argb(80,245,245,255)); c.drawRect(0,h*.73f,w,h*.87f,p);
            if(withTree){
                float x=w*.17f;
                p.setStrokeWidth(w*.022f); p.setStrokeCap(Paint.Cap.ROUND); p.setColor(Color.rgb(185,177,169));
                c.drawLine(x,h*.78f,x,h*.30f,p); c.drawLine(x,h*.47f,x-w*.08f,h*.22f,p); c.drawLine(x,h*.44f,x+w*.10f,h*.20f,p);
                p.setColor(Color.rgb(83,210,225)); c.drawCircle(x-w*.05f,h*.22f,w*.10f,p); c.drawCircle(x+w*.04f,h*.18f,w*.11f,p); c.drawCircle(x+w*.11f,h*.27f,w*.09f,p);
                p.setColor(Color.argb(210,104,115,220)); c.drawCircle(x-w*.01f,h*.18f,w*.055f,p); c.drawCircle(x+w*.09f,h*.18f,w*.05f,p);
                p.setColor(Color.argb(190,112,221,233)); c.drawCircle(x-w*.10f,h*.28f,w*.06f,p);
            }
        }

        void drawSettings(Canvas c){
            int w=getWidth(), h=getHeight(); drawBackground(c,true);
            float cardL=w*.53f, cardT=h*.10f, cardR=w*.94f, cardB=h*.90f;
            p.setColor(Color.argb(190,255,255,255)); c.drawRoundRect(cardL,cardT,cardR,cardB,34,34,p);
            text(c,"Mon Oxygène",w*.735f,h*.21f,h*.072f,Color.rgb(41,74,104),Paint.Align.CENTER,true);
            text(c,"Cohérence cardiaque",w*.735f,h*.275f,h*.034f,Color.rgb(75,105,130),Paint.Align.CENTER,false);
            text(c,"Durée de la séance",w*.60f,h*.40f,h*.036f,Color.rgb(47,79,103),Paint.Align.LEFT,false);
            control(c,w*.66f,h*.49f,durationMin+" min",minusDur,plusDur);
            text(c,"Respirations par minute",w*.60f,h*.61f,h*.036f,Color.rgb(47,79,103),Paint.Align.LEFT,false);
            control(c,w*.66f,h*.70f,bpm+" / min",minusBpm,plusBpm);
            startBtn.set(w*.62f,h*.79f,w*.86f,h*.875f);
            p.setColor(Color.argb(230,74,172,188)); c.drawRoundRect(startBtn,50,50,p);
            text(c,"Commencer",startBtn.centerX(),startBtn.centerY()+h*.013f,h*.037f,Color.WHITE,Paint.Align.CENTER,true);
        }

        void control(Canvas c,float cx,float cy,String value,RectF minus,RectF plus){
            int w=getWidth(),h=getHeight(); float bw=w*.052f,bh=h*.070f;
            minus.set(cx-bw*1.8f,cy-bh/2,cx-bw*.8f,cy+bh/2); plus.set(cx+bw*2.0f,cy-bh/2,cx+bw*3.0f,cy+bh/2);
            p.setColor(Color.argb(205,255,255,255)); c.drawRoundRect(minus,25,25,p); c.drawRoundRect(plus,25,25,p);
            text(c,"−",minus.centerX(),minus.centerY()+h*.015f,h*.053f,Color.rgb(53,95,122),Paint.Align.CENTER,false);
            text(c,"+",plus.centerX(),plus.centerY()+h*.015f,h*.053f,Color.rgb(53,95,122),Paint.Align.CENTER,false);
            text(c,value,cx+w*.055f,cy+h*.013f,h*.045f,Color.rgb(49,76,102),Paint.Align.CENTER,true);
        }

        void drawSession(Canvas c){
            int w=getWidth(), h=getHeight(); drawBackground(c,false);
            p.setColor(Color.argb(45,255,255,255)); c.drawRect(0,0,w,h,p);
            long now=paused?pausedAt:SystemClock.elapsedRealtime();
            double elapsed=(now-startMs-pausedTotal)/1000.0;
            double total=durationMin*60.0;
            double remain=Math.max(0,total-elapsed);
            if(remain<=0){ session=false; paused=false; invalidate(); return; }
            double cyclesPerSec=bpm/60.0;
            double phase=(elapsed*cyclesPerSec)%1.0;
            boolean inhale=phase<.5;
            text(c,inhale?"Inspirez":"Expirez",w*.50f,h*.15f,h*.067f,Color.rgb(43,76,108),Paint.Align.CENTER,true);
            int sec=(int)Math.ceil(remain); String time=String.format(Locale.FRANCE,"%d:%02d",sec/60,sec%60);
            text(c,time,w*.90f,h*.12f,h*.036f,Color.rgb(43,76,108),Paint.Align.CENTER,true);

            float top=h*.28f, bottom=h*.70f, mid=(top+bottom)/2f, amp=(bottom-top)*.40f;
            stroke.setStrokeWidth(Math.max(4,w*.0035f)); stroke.setColor(Color.argb(225,255,255,255)); stroke.setStyle(Paint.Style.STROKE); stroke.setStrokeCap(Paint.Cap.ROUND);
            Path path=new Path();
            double visibleCycles=4.3;
            for(int i=0;i<=600;i++){
                float x=(float)i/600*w;
                double cyc=(x/w-.50)*visibleCycles + elapsed*cyclesPerSec;
                float y=(float)(mid + amp*Math.cos(cyc*Math.PI*2));
                if(i==0) path.moveTo(x,y); else path.lineTo(x,y);
            }
            p.setColor(Color.argb(60,36,72,110)); c.drawRoundRect(w*.04f,top-h*.09f,w*.96f,bottom+h*.09f,42,42,p);
            c.drawPath(path,stroke);
            float dotX=w*.50f; float dotY=(float)(mid+amp*Math.cos(elapsed*cyclesPerSec*Math.PI*2));
            p.setColor(Color.rgb(103,219,228)); c.drawCircle(dotX,dotY,h*.025f,p); p.setStyle(Paint.Style.STROKE); p.setStrokeWidth(h*.006f); p.setColor(Color.WHITE); c.drawCircle(dotX,dotY,h*.025f,p); p.setStyle(Paint.Style.FILL);

            float progress=(float)(elapsed/total); p.setColor(Color.argb(95,255,255,255)); c.drawRoundRect(w*.18f,h*.82f,w*.82f,h*.835f,20,20,p); p.setColor(Color.rgb(108,205,217)); c.drawRoundRect(w*.18f,h*.82f,w*(.18f+.64f*progress),h*.835f,20,20,p);
            pauseBtn.set(w*.36f,h*.875f,w*.48f,h*.955f); stopBtn.set(w*.52f,h*.875f,w*.64f,h*.955f);
            p.setColor(Color.argb(190,255,255,255)); c.drawRoundRect(pauseBtn,35,35,p); c.drawRoundRect(stopBtn,35,35,p);
            text(c,paused?"Reprendre":"Pause",pauseBtn.centerX(),pauseBtn.centerY()+h*.012f,h*.029f,Color.rgb(44,76,104),Paint.Align.CENTER,true);
            text(c,"Arrêter",stopBtn.centerX(),stopBtn.centerY()+h*.012f,h*.029f,Color.rgb(44,76,104),Paint.Align.CENTER,true);
        }

        void text(Canvas c,String s,float x,float y,float size,int color,Paint.Align align,boolean bold){
            p.setShader(null); p.setColor(color); p.setTextSize(size); p.setTextAlign(align); p.setTypeface(bold?Typeface.create("sans",Typeface.BOLD):Typeface.create("sans",Typeface.NORMAL)); c.drawText(s,x,y,p);
        }

        @Override public boolean onTouchEvent(android.view.MotionEvent e){
            if(e.getAction()!=MotionEvent.ACTION_UP) return true; float x=e.getX(),y=e.getY();
            if(!session){
                if(minusDur.contains(x,y)) durationMin=Math.max(1,durationMin-1);
                else if(plusDur.contains(x,y)) durationMin=Math.min(20,durationMin+1);
                else if(minusBpm.contains(x,y)) bpm=Math.max(4,bpm-1);
                else if(plusBpm.contains(x,y)) bpm=Math.min(8,bpm+1);
                else if(startBtn.contains(x,y)){session=true; paused=false; pausedTotal=0; startMs=SystemClock.elapsedRealtime();}
            } else {
                if(pauseBtn.contains(x,y)){
                    if(!paused){ paused=true; pausedAt=SystemClock.elapsedRealtime(); }
                    else { paused=false; pausedTotal += SystemClock.elapsedRealtime()-pausedAt; }
                } else if(stopBtn.contains(x,y)){ session=false; paused=false; }
            }
            invalidate(); return true;
        }
    }
}
