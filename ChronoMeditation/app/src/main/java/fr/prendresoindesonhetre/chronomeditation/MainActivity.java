package fr.prendresoindesonhetre.chronomeditation;

import android.app.*;
import android.content.*;
import android.content.res.ColorStateList;
import android.graphics.*;
import android.graphics.drawable.GradientDrawable;
import android.os.*;
import android.text.InputType;
import android.view.*;
import android.widget.*;
import org.json.*;
import java.text.Normalizer;
import java.util.*;

public class MainActivity extends Activity {
    private static final int MATCH = ViewGroup.LayoutParams.MATCH_PARENT;
    private static final int WRAP = ViewGroup.LayoutParams.WRAP_CONTENT;

    private final int BG = Color.rgb(248,246,242);
    private final int CARD = Color.rgb(255,253,250);
    private final int TURQ = Color.rgb(71,174,171);
    private final int SKY = Color.rgb(129,186,220);
    private final int VIOLET = Color.rgb(145,121,171);
    private final int BROWN = Color.rgb(132,108,88);
    private final int TEXT = Color.rgb(61,58,64);
    private final int SUB = Color.rgb(118,111,118);
    private final int LINE = Color.rgb(231,224,216);
    private final int SAY_A = Color.rgb(255,252,249);
    private final int SAY_B = Color.rgb(246,239,249);
    private final int DO_A = Color.rgb(235,249,247);
    private final int DO_B = Color.rgb(235,244,250);

    private SharedPreferences prefs;
    private final ArrayList<Session> sessions = new ArrayList<>();
    private LinearLayout root;
    private final Handler handler = new Handler(Looper.getMainLooper());
    private Runnable tick;
    private boolean running = false;
    private long globalElapsedMs = 0, phaseElapsedMs = 0, lastTick = 0;
    private int currentPhase = 0;
    private Session playingSession;

    private TextView globalTimer, phaseTimer, phaseName, nextPhase, phaseIndex;
    private TextView sayText, doText, breathState, inhaleValue, exhaleValue;
    private ProgressBar globalProgress, phaseProgress, breathProgress;
    private Button playPause, invertButton;
    private LinearLayout rainCard;
    private RainstickView rainstickView;

    static class Phase {
        String name, say, action;
        int minutes;
        boolean rainstick;
        int inhaleSeconds, exhaleSeconds;
        boolean reverse;
        Phase(String n,int m,String s,String a){ name=n;minutes=m;say=s;action=a;rainstick=false;inhaleSeconds=5;exhaleSeconds=5;reverse=false; }
        JSONObject toJson() throws JSONException {
            JSONObject o=new JSONObject();
            o.put("name",name);o.put("minutes",minutes);o.put("say",say);o.put("action",action);
            o.put("rainstick",rainstick);o.put("inhaleSeconds",inhaleSeconds);o.put("exhaleSeconds",exhaleSeconds);o.put("reverse",reverse);
            return o;
        }
        static Phase fromJson(JSONObject o){
            String legacy=o.optString("text","");
            Phase p=new Phase(o.optString("name","Phase"),o.optInt("minutes",5),o.optString("say",legacy),o.optString("action",""));
            p.rainstick=o.optBoolean("rainstick",norm(p.name).contains("baton de pluie"));
            p.inhaleSeconds=Math.max(2,o.optInt("inhaleSeconds",5));
            p.exhaleSeconds=Math.max(2,o.optInt("exhaleSeconds",5));
            p.reverse=o.optBoolean("reverse",false);
            return p;
        }
    }
    static class Session {
        String title; ArrayList<Phase> phases=new ArrayList<>();
        Session(String t){title=t;}
        int totalMinutes(){int n=0;for(Phase p:phases)n+=p.minutes;return n;}
        JSONObject toJson() throws JSONException {JSONObject o=new JSONObject();o.put("title",title);JSONArray a=new JSONArray();for(Phase p:phases)a.put(p.toJson());o.put("phases",a);return o;}
        static Session fromJson(JSONObject o){Session s=new Session(o.optString("title","Séance"));JSONArray a=o.optJSONArray("phases");if(a!=null)for(int i=0;i<a.length();i++){JSONObject p=a.optJSONObject(i);if(p!=null)s.phases.add(Phase.fromJson(p));}return s;}
    }
    static class Editors {
        EditText name,mins,say,action,inhale,exhale; CheckBox rain; Switch reverse;
        Editors(EditText n,EditText m,EditText s,EditText a,CheckBox r,EditText i,EditText e,Switch rev){name=n;mins=m;say=s;action=a;rain=r;inhale=i;exhale=e;reverse=rev;}
    }

    @Override public void onCreate(Bundle b){
        super.onCreate(b);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        prefs=getSharedPreferences("meditations",MODE_PRIVATE);
        load(); showHome();
    }

    private int dp(int x){return (int)(x*getResources().getDisplayMetrics().density+.5f);}
    private GradientDrawable round(int color,int stroke,int radius){GradientDrawable d=new GradientDrawable();d.setColor(color);d.setCornerRadius(dp(radius));if(stroke!=Color.TRANSPARENT)d.setStroke(dp(1),stroke);return d;}
    private GradientDrawable gradient(int a,int b,int radius){GradientDrawable d=new GradientDrawable(GradientDrawable.Orientation.TL_BR,new int[]{a,b});d.setCornerRadius(dp(radius));return d;}
    private TextView tv(String s,int size,boolean bold){TextView v=new TextView(this);v.setText(s);v.setTextSize(size);v.setTextColor(TEXT);if(bold)v.setTypeface(Typeface.DEFAULT,Typeface.BOLD);return v;}
    private Button btn(String s){Button b=new Button(this);b.setText(s);b.setAllCaps(false);b.setTextSize(15);b.setMinHeight(dp(46));return b;}
    private void primary(Button b){b.setTextColor(Color.WHITE);b.setBackground(round(TURQ,Color.TRANSPARENT,16));}
    private void secondary(Button b){b.setTextColor(BROWN);b.setBackground(round(Color.WHITE,LINE,16));}
    private void ghost(Button b){b.setTextColor(VIOLET);b.setBackground(round(Color.rgb(241,235,245),Color.TRANSPARENT,16));}
    private LinearLayout card(){LinearLayout l=new LinearLayout(this);l.setOrientation(LinearLayout.VERTICAL);l.setPadding(dp(18),dp(18),dp(18),dp(18));l.setBackground(round(CARD,LINE,22));if(Build.VERSION.SDK_INT>=21)l.setElevation(dp(1));return l;}
    private void spacer(ViewGroup p,int h){Space s=new Space(this);p.addView(s,new LinearLayout.LayoutParams(1,dp(h)));}
    private EditText input(String hint,boolean multi){EditText e=new EditText(this);e.setHint(hint);e.setTextColor(TEXT);e.setHintTextColor(Color.rgb(155,149,154));e.setTextSize(multi?17:16);e.setPadding(dp(14),dp(12),dp(14),dp(12));e.setBackground(round(Color.WHITE,LINE,15));if(multi){e.setMinLines(5);e.setGravity(Gravity.TOP|Gravity.START);e.setInputType(InputType.TYPE_CLASS_TEXT|InputType.TYPE_TEXT_FLAG_MULTI_LINE|InputType.TYPE_TEXT_FLAG_CAP_SENTENCES);}else{e.setSingleLine(true);}return e;}
    private void base(){root=new LinearLayout(this);root.setOrientation(LinearLayout.VERTICAL);root.setBackgroundColor(BG);root.setPadding(dp(14),dp(14),dp(14),dp(14));setContentView(root);}
    private TextView pill(String s,int bg,int color){TextView v=tv(s,12,true);v.setTextColor(color);v.setPadding(dp(11),dp(6),dp(11),dp(6));v.setBackground(round(bg,Color.TRANSPARENT,18));return v;}

    private void showHome(){
        stopTick();base();
        ScrollView sc=new ScrollView(this);LinearLayout content=new LinearLayout(this);content.setOrientation(LinearLayout.VERTICAL);sc.addView(content);root.addView(sc,new LinearLayout.LayoutParams(MATCH,0,1));
        LinearLayout hero=card();hero.setBackground(gradient(Color.rgb(255,253,250),Color.rgb(244,239,247),24));
        TextView brand=tv("Prendre soin de son Hêtre",14,true);brand.setTextColor(BROWN);hero.addView(brand);spacer(hero,6);
        TextView h=tv("Mes Méditations",30,true);h.setTextColor(VIOLET);hero.addView(h);spacer(hero,8);
        TextView sub=tv("Prépare ta séance, garde ton texte lisible et laisse l’application porter le rythme avec toi.",16,false);sub.setTextColor(SUB);sub.setLineSpacing(0,1.15f);hero.addView(sub);
        content.addView(hero);spacer(content,14);
        for(int i=0;i<sessions.size();i++){
            final int idx=i; Session s=sessions.get(i);LinearLayout c=card();
            TextView n=tv(s.title,20,true);c.addView(n);spacer(c,6);TextView meta=tv(s.totalMinutes()+" min • "+s.phases.size()+" temps",14,false);meta.setTextColor(SUB);c.addView(meta);spacer(c,14);
            LinearLayout row=new LinearLayout(this);Button start=btn("Lancer"),edit=btn("Modifier"),dup=btn("Dupliquer");primary(start);secondary(edit);ghost(dup);
            row.addView(start,new LinearLayout.LayoutParams(0,WRAP,1));LinearLayout.LayoutParams p2=new LinearLayout.LayoutParams(0,WRAP,1);p2.leftMargin=dp(8);row.addView(edit,p2);LinearLayout.LayoutParams p3=new LinearLayout.LayoutParams(0,WRAP,1);p3.leftMargin=dp(8);row.addView(dup,p3);c.addView(row);
            start.setOnClickListener(v->startSession(s));edit.setOnClickListener(v->editSession(idx));dup.setOnClickListener(v->{Session cp=copy(s);cp.title=s.title+" - copie";sessions.add(cp);save();showHome();});
            content.addView(c);spacer(content,12);
        }
        Button add=btn("+ Nouvelle séance");primary(add);add.setOnClickListener(v->{sessions.add(new Session("Nouvelle séance"));editSession(sessions.size()-1);});root.addView(add);
    }

    private void editSession(int index){
        base();Session s=sessions.get(index);
        Button back=btn("‹ Retour");ghost(back);back.setOnClickListener(v->{save();showHome();});root.addView(back);spacer(root,10);
        ScrollView sc=new ScrollView(this);LinearLayout content=new LinearLayout(this);content.setOrientation(LinearLayout.VERTICAL);sc.addView(content);root.addView(sc,new LinearLayout.LayoutParams(MATCH,0,1));
        LinearLayout intro=card();TextView t=tv("Construire la séance",27,true);t.setTextColor(VIOLET);intro.addView(t);spacer(intro,6);TextView help=tv("Sépare ce que tu dis de ce que tu fais. Le mode bâton de pluie possède son propre rythme réglable.",15,false);help.setTextColor(SUB);help.setLineSpacing(0,1.15f);intro.addView(help);spacer(intro,14);EditText title=input("Titre de la séance",false);title.setText(s.title);intro.addView(title);content.addView(intro);spacer(content,14);
        LinearLayout box=new LinearLayout(this);box.setOrientation(LinearLayout.VERTICAL);content.addView(box);ArrayList<Editors> editors=new ArrayList<>();
        final Runnable[] rebuild=new Runnable[1];
        rebuild[0]=()->{box.removeAllViews();editors.clear();for(int i=0;i<s.phases.size();i++){
            final int pos=i;Phase p=s.phases.get(i);LinearLayout pc=card();
            LinearLayout hr=new LinearLayout(this);hr.setGravity(Gravity.CENTER_VERTICAL);TextView lab=tv("Temps "+(i+1),17,true);lab.setTextColor(VIOLET);hr.addView(lab,new LinearLayout.LayoutParams(0,WRAP,1));hr.addView(pill(p.minutes+" min",Color.rgb(228,245,243),TURQ));pc.addView(hr);spacer(pc,10);
            EditText name=input("Nom du temps",false);name.setText(p.name);pc.addView(name);spacer(pc,9);
            EditText mins=input("Durée totale en minutes",false);mins.setInputType(InputType.TYPE_CLASS_NUMBER);mins.setText(String.valueOf(p.minutes));pc.addView(mins);spacer(pc,11);
            TextView sayLab=tv("À DIRE",12,true);sayLab.setTextColor(VIOLET);pc.addView(sayLab);spacer(pc,5);EditText say=input("Texte que tu souhaites dire",true);say.setText(p.say);say.setBackground(gradient(SAY_A,SAY_B,15));pc.addView(say);spacer(pc,11);
            TextView doLab=tv("À FAIRE / REPÈRES",12,true);doLab.setTextColor(TURQ);pc.addView(doLab);spacer(pc,5);EditText action=input("Silence, instrument, transition, coup de bol…",true);action.setText(p.action);action.setBackground(gradient(DO_A,DO_B,15));pc.addView(action);spacer(pc,12);
            CheckBox rain=new CheckBox(this);rain.setText("Mode bâton de pluie pour ce temps");rain.setTextColor(TEXT);rain.setChecked(p.rainstick);pc.addView(rain);
            LinearLayout rainSettings=new LinearLayout(this);rainSettings.setOrientation(LinearLayout.VERTICAL);rainSettings.setPadding(dp(12),dp(10),dp(12),dp(10));rainSettings.setBackground(round(Color.rgb(236,248,247),Color.TRANSPARENT,15));
            TextView rh=tv("Rythme du bâton",15,true);rh.setTextColor(BROWN);rainSettings.addView(rh);spacer(rainSettings,7);
            LinearLayout values=new LinearLayout(this);EditText inhale=input("Inspire (s)",false);inhale.setInputType(InputType.TYPE_CLASS_NUMBER);inhale.setText(String.valueOf(p.inhaleSeconds));EditText exhale=input("Expire (s)",false);exhale.setInputType(InputType.TYPE_CLASS_NUMBER);exhale.setText(String.valueOf(p.exhaleSeconds));values.addView(inhale,new LinearLayout.LayoutParams(0,WRAP,1));LinearLayout.LayoutParams exlp=new LinearLayout.LayoutParams(0,WRAP,1);exlp.leftMargin=dp(8);values.addView(exhale,exlp);rainSettings.addView(values);spacer(rainSettings,8);
            Switch reverse=new Switch(this);reverse.setText("Inverser le sens de départ");reverse.setChecked(p.reverse);rainSettings.addView(reverse);pc.addView(rainSettings);rainSettings.setVisibility(p.rainstick?View.VISIBLE:View.GONE);rain.setOnCheckedChangeListener((b,checked)->rainSettings.setVisibility(checked?View.VISIBLE:View.GONE));spacer(pc,10);
            Button del=btn("Supprimer ce temps");secondary(del);del.setOnClickListener(v->{sync(s,editors);if(pos<s.phases.size())s.phases.remove(pos);rebuild[0].run();});pc.addView(del);
            editors.add(new Editors(name,mins,say,action,rain,inhale,exhale,reverse));box.addView(pc);spacer(box,12);
        }};rebuild[0].run();
        LinearLayout actions=new LinearLayout(this);Button add=btn("+ Temps"),saveB=btn("Enregistrer");ghost(add);primary(saveB);actions.addView(add,new LinearLayout.LayoutParams(0,WRAP,1));LinearLayout.LayoutParams slp=new LinearLayout.LayoutParams(0,WRAP,1);slp.leftMargin=dp(8);actions.addView(saveB,slp);root.addView(actions);
        add.setOnClickListener(v->{sync(s,editors);s.phases.add(new Phase("Nouveau temps",5,"",""));rebuild[0].run();});saveB.setOnClickListener(v->{s.title=title.getText().toString().trim();if(s.title.isEmpty())s.title="Séance";sync(s,editors);save();Toast.makeText(this,"Séance enregistrée",Toast.LENGTH_SHORT).show();showHome();});
    }

    private void sync(Session s,ArrayList<Editors> es){for(int i=0;i<es.size()&&i<s.phases.size();i++){Editors e=es.get(i);Phase p=s.phases.get(i);p.name=e.name.getText().toString();p.say=e.say.getText().toString();p.action=e.action.getText().toString();try{p.minutes=Math.max(1,Integer.parseInt(e.mins.getText().toString()));}catch(Exception x){p.minutes=5;}p.rainstick=e.rain.isChecked();try{p.inhaleSeconds=Math.max(2,Math.min(15,Integer.parseInt(e.inhale.getText().toString())));}catch(Exception x){p.inhaleSeconds=5;}try{p.exhaleSeconds=Math.max(2,Math.min(15,Integer.parseInt(e.exhale.getText().toString())));}catch(Exception x){p.exhaleSeconds=5;}p.reverse=e.reverse.isChecked();}}

    private void startSession(Session s){if(s.phases.isEmpty()){Toast.makeText(this,"Ajoute au moins un temps.",Toast.LENGTH_SHORT).show();return;}playingSession=s;currentPhase=0;globalElapsedMs=phaseElapsedMs=0;running=false;showPlayer();}

    private void showPlayer(){
        base();
        LinearLayout header=card();header.setPadding(dp(14),dp(12),dp(14),dp(12));TextView st=tv(playingSession.title,16,true);st.setTextColor(VIOLET);header.addView(st);spacer(header,5);
        LinearLayout hrow=new LinearLayout(this);hrow.setGravity(Gravity.CENTER_VERTICAL);phaseName=tv("",19,true);hrow.addView(phaseName,new LinearLayout.LayoutParams(0,WRAP,1));phaseIndex=pill("",Color.rgb(241,235,245),VIOLET);hrow.addView(phaseIndex);header.addView(hrow);spacer(header,5);
        LinearLayout timers=new LinearLayout(this);globalTimer=tv("00:00",27,true);globalTimer.setTextColor(TURQ);phaseTimer=tv("",15,true);phaseTimer.setTextColor(BROWN);phaseTimer.setGravity(Gravity.END|Gravity.CENTER_VERTICAL);timers.addView(globalTimer,new LinearLayout.LayoutParams(0,WRAP,1));timers.addView(phaseTimer,new LinearLayout.LayoutParams(0,WRAP,1));header.addView(timers);spacer(header,6);
        globalProgress=new ProgressBar(this,null,android.R.attr.progressBarStyleHorizontal);globalProgress.setProgressTintList(ColorStateList.valueOf(TURQ));globalProgress.setProgressBackgroundTintList(ColorStateList.valueOf(Color.rgb(229,238,236)));header.addView(globalProgress,new LinearLayout.LayoutParams(MATCH,dp(5)));nextPhase=tv("",12,false);nextPhase.setTextColor(SUB);nextPhase.setPadding(0,dp(5),0,0);header.addView(nextPhase);root.addView(header);spacer(root,9);

        ScrollView scroll=new ScrollView(this);LinearLayout body=new LinearLayout(this);body.setOrientation(LinearLayout.VERTICAL);scroll.addView(body);root.addView(scroll,new LinearLayout.LayoutParams(MATCH,0,1));

        rainCard=card();rainCard.setBackground(gradient(Color.rgb(235,249,247),Color.rgb(235,244,250),22));TextView rt=tv("BÂTON DE PLUIE • LE RYTHME",12,true);rt.setTextColor(BROWN);rainCard.addView(rt);spacer(rainCard,6);breathState=tv("",26,true);breathState.setGravity(Gravity.CENTER);breathState.setTextColor(VIOLET);rainCard.addView(breathState);spacer(rainCard,6);
        rainstickView=new RainstickView(this,TURQ,SKY,VIOLET,BROWN);rainCard.addView(rainstickView,new LinearLayout.LayoutParams(MATCH,dp(160)));spacer(rainCard,6);
        breathProgress=new ProgressBar(this,null,android.R.attr.progressBarStyleHorizontal);breathProgress.setProgressTintList(ColorStateList.valueOf(VIOLET));breathProgress.setProgressBackgroundTintList(ColorStateList.valueOf(Color.rgb(223,237,238)));rainCard.addView(breathProgress,new LinearLayout.LayoutParams(MATCH,dp(8)));spacer(rainCard,10);
        LinearLayout adjust=new LinearLayout(this);adjust.setGravity(Gravity.CENTER);adjust.addView(makeTimingControl(true),new LinearLayout.LayoutParams(0,WRAP,1));LinearLayout.LayoutParams alp=new LinearLayout.LayoutParams(0,WRAP,1);alp.leftMargin=dp(8);adjust.addView(makeTimingControl(false),alp);rainCard.addView(adjust);spacer(rainCard,8);invertButton=btn("Inverser le sens");ghost(invertButton);invertButton.setOnClickListener(v->{Phase p=playingSession.phases.get(currentPhase);p.reverse=!p.reverse;save();updatePlayer();});rainCard.addView(invertButton);body.addView(rainCard);spacer(body,12);

        LinearLayout sayCard=styledTextCard("À DIRE",true);sayText=(TextView)sayCard.getChildAt(1);body.addView(sayCard);spacer(body,12);
        LinearLayout doCard=styledTextCard("À FAIRE / REPÈRES",false);doText=(TextView)doCard.getChildAt(1);body.addView(doCard);spacer(body,20);

        phaseProgress=new ProgressBar(this,null,android.R.attr.progressBarStyleHorizontal);phaseProgress.setProgressTintList(ColorStateList.valueOf(VIOLET));phaseProgress.setProgressBackgroundTintList(ColorStateList.valueOf(Color.rgb(237,231,242)));body.addView(phaseProgress,new LinearLayout.LayoutParams(MATCH,dp(5)));

        LinearLayout controls=new LinearLayout(this);Button prev=btn("‹"),next=btn("›");playPause=btn("Démarrer");secondary(prev);primary(playPause);ghost(next);controls.addView(prev,new LinearLayout.LayoutParams(0,WRAP,.8f));LinearLayout.LayoutParams plp=new LinearLayout.LayoutParams(0,WRAP,2f);plp.leftMargin=dp(8);controls.addView(playPause,plp);LinearLayout.LayoutParams nlp=new LinearLayout.LayoutParams(0,WRAP,.8f);nlp.leftMargin=dp(8);controls.addView(next,nlp);root.addView(controls);spacer(root,7);Button stop=btn("Arrêter la séance");ghost(stop);root.addView(stop);
        prev.setOnClickListener(v->changePhase(-1));next.setOnClickListener(v->changePhase(1));playPause.setOnClickListener(v->{if(running)pauseTimer();else resumeTimer();});stop.setOnClickListener(v->{pauseTimer();new AlertDialog.Builder(this).setMessage("Arrêter cette séance ?").setNegativeButton("Continuer",null).setPositiveButton("Arrêter",(d,w)->showHome()).show();});
        updatePlayer();
        tick=new Runnable(){public void run(){if(running){long now=SystemClock.elapsedRealtime();long d=now-lastTick;lastTick=now;globalElapsedMs+=d;phaseElapsedMs+=d;long dur=playingSession.phases.get(currentPhase).minutes*60000L;if(phaseElapsedMs>=dur){if(currentPhase<playingSession.phases.size()-1){buzz();currentPhase++;phaseElapsedMs=0;}else{pauseTimer();buzz();Toast.makeText(MainActivity.this,"Fin de la séance",Toast.LENGTH_LONG).show();}}updatePlayer();}handler.postDelayed(this,100);}};handler.post(tick);
    }

    private LinearLayout styledTextCard(String label,boolean say){LinearLayout c=card();c.setBackground(gradient(say?SAY_A:DO_A,say?SAY_B:DO_B,22));TextView l=tv(label,12,true);l.setTextColor(say?VIOLET:TURQ);c.addView(l);TextView txt=tv("",say?20:17,false);txt.setLineSpacing(dp(3),1.28f);txt.setPadding(0,dp(12),0,dp(8));c.addView(txt);return c;}

    private LinearLayout makeTimingControl(boolean inhale){
        LinearLayout box=new LinearLayout(this);box.setOrientation(LinearLayout.VERTICAL);box.setGravity(Gravity.CENTER);TextView title=tv(inhale?"INSPIRATION":"EXPIRATION",11,true);title.setTextColor(inhale?TURQ:VIOLET);box.addView(title);spacer(box,4);LinearLayout row=new LinearLayout(this);row.setGravity(Gravity.CENTER);Button minus=btn("−");Button plus=btn("+");minus.setMinWidth(dp(42));plus.setMinWidth(dp(42));ghost(minus);ghost(plus);TextView value=tv("5 s",18,true);value.setGravity(Gravity.CENTER);row.addView(minus);row.addView(value,new LinearLayout.LayoutParams(dp(62),WRAP));row.addView(plus);box.addView(row);if(inhale)inhaleValue=value;else exhaleValue=value;
        minus.setOnClickListener(v->adjustTiming(inhale,-1));plus.setOnClickListener(v->adjustTiming(inhale,1));return box;
    }

    private void adjustTiming(boolean inhale,int delta){Phase p=playingSession.phases.get(currentPhase);if(!p.rainstick)return;if(inhale)p.inhaleSeconds=Math.max(2,Math.min(15,p.inhaleSeconds+delta));else p.exhaleSeconds=Math.max(2,Math.min(15,p.exhaleSeconds+delta));save();updatePlayer();}

    private void updatePlayer(){
        Phase p=playingSession.phases.get(currentPhase);phaseName.setText(p.name);phaseIndex.setText((currentPhase+1)+" / "+playingSession.phases.size());globalTimer.setText(format(globalElapsedMs));long remain=Math.max(0,p.minutes*60000L-phaseElapsedMs);phaseTimer.setText(format(remain)+" restant");nextPhase.setText(currentPhase+1<playingSession.phases.size()?"Ensuite : "+playingSession.phases.get(currentPhase+1).name:"Dernier temps");sayText.setText(p.say.isEmpty()?"—":p.say);doText.setText(p.action.isEmpty()?"—":p.action);
        globalProgress.setMax(Math.max(1,playingSession.totalMinutes()*60000));globalProgress.setProgress((int)Math.min(globalElapsedMs,playingSession.totalMinutes()*60000L));phaseProgress.setMax(Math.max(1,p.minutes*60000));phaseProgress.setProgress((int)Math.min(phaseElapsedMs,p.minutes*60000L));
        rainCard.setVisibility(p.rainstick?View.VISIBLE:View.GONE);if(p.rainstick){inhaleValue.setText(p.inhaleSeconds+" s");exhaleValue.setText(p.exhaleSeconds+" s");updateRainstick(p);}    
    }

    private void updateRainstick(Phase p){
        long in=p.inhaleSeconds*1000L, ex=p.exhaleSeconds*1000L, cycle=in+ex;long pos=cycle==0?0:phaseElapsedMs%cycle;boolean inhale=pos<in;long part=inhale?pos:pos-in;long partDur=inhale?in:ex;float progress=partDur==0?0:(float)part/(float)partDur;long left=Math.max(0,partDur-part);breathState.setText((inhale?"INSPIRE":"EXPIRE")+"  •  "+String.format(Locale.FRANCE,"%.1f s",left/1000f));breathState.setTextColor(inhale?TURQ:VIOLET);breathProgress.setMax((int)partDur);breathProgress.setProgress((int)part);rainstickView.setBreath(inhale,progress,p.reverse);rainstickView.invalidate();
    }

    private void changePhase(int d){int n=currentPhase+d;if(n>=0&&n<playingSession.phases.size()){currentPhase=n;phaseElapsedMs=0;buzz();updatePlayer();}}
    private void resumeTimer(){running=true;lastTick=SystemClock.elapsedRealtime();playPause.setText("Pause");}
    private void pauseTimer(){running=false;if(playPause!=null)playPause.setText(globalElapsedMs==0?"Démarrer":"Reprendre");}
    private void stopTick(){running=false;if(tick!=null)handler.removeCallbacks(tick);tick=null;}
    private void buzz(){try{Vibrator v=(Vibrator)getSystemService(VIBRATOR_SERVICE);if(v==null)return;if(Build.VERSION.SDK_INT>=26)v.vibrate(VibrationEffect.createOneShot(60,VibrationEffect.DEFAULT_AMPLITUDE));else v.vibrate(60);}catch(Exception ignored){}}
    private String format(long ms){long s=ms/1000;return String.format(Locale.FRANCE,"%02d:%02d",s/60,s%60);}

    private Session copy(Session s){Session c=new Session(s.title);for(Phase p:s.phases){Phase q=new Phase(p.name,p.minutes,p.say,p.action);q.rainstick=p.rainstick;q.inhaleSeconds=p.inhaleSeconds;q.exhaleSeconds=p.exhaleSeconds;q.reverse=p.reverse;c.phases.add(q);}return c;}
    private void save(){try{JSONArray a=new JSONArray();for(Session s:sessions)a.put(s.toJson());prefs.edit().putString("sessions",a.toString()).apply();}catch(Exception ignored){}}
    private void load(){sessions.clear();String raw=prefs.getString("sessions","");try{if(!raw.isEmpty()){JSONArray a=new JSONArray(raw);for(int i=0;i<a.length();i++){JSONObject o=a.optJSONObject(i);if(o!=null)sessions.add(Session.fromJson(o));}}}catch(Exception ignored){}if(sessions.isEmpty()){sessions.add(defaultSession());save();}}

    private Session defaultSession(){Session s=new Session("Atelier de méditation — 19h30 à 21h");
        s.phases.add(new Phase("Accueil & intention",4,
            "Prenez le temps de vous installer.\n\nDe prendre votre place.\n\nEt avant même de commencer, je vous invite simplement à vous demander :\n\nPourquoi suis-je venu ici ce soir ?\n\nPourquoi ai-je choisi de venir m’asseoir, ou m’allonger, pendant un moment…\n\ndans le silence…\n\navec moi-même ?\n\nIl n’est pas nécessaire de chercher une grande réponse.\n\nPeut-être qu’une intention est déjà présente.\n\nPeut-être simplement une envie.\n\nUn besoin.\n\nOu peut-être juste celui de prendre ce temps pour vous.\n\nGardez simplement cela quelque part avec vous.\n\nSans chercher à en faire quoi que ce soit.",
            "Silence."));
        s.phases.add(new Phase("Prendre place",6,
            "Vous pouvez maintenant vous installer confortablement.\n\nEt progressivement…\n\nlaisser votre corps trouver sa juste place.\n\nPendant quelques instants, plus rien n’a besoin de tenir.\n\nVos jambes n’ont rien à tenir.\n\nVos bras non plus.\n\nVos mains peuvent simplement se déposer.\n\nVos épaules peuvent relâcher ce qu’elles retiennent.\n\nVotre mâchoire peut se desserrer.\n\nVotre visage peut se relâcher.\n\nEt vous pouvez simplement laisser le sol porter votre poids.\n\nPuis, sans chercher à modifier quoi que ce soit…\n\nfaites simplement un état des lieux.\n\nComment vous sentez-vous aujourd’hui ?\n\nY a-t-il des endroits qui semblent plus tendus ?\n\nD’autres plus légers ?\n\nPeut-être une émotion qui prend davantage de place.\n\nPeut-être beaucoup de pensées.\n\nPeut-être au contraire quelque chose de très calme.\n\nIl n’y a rien à réussir ou à changer. Simplement observer.",
            "Prévoir un silence après l’installation. Laisser de l’espace entre les questions."));
        s.phases.add(new Phase("Retrouver la respiration",4,
            "Puis doucement…\n\nportez votre attention sur votre respiration.\n\nSimplement prendre conscience qu’elle est là.\n\nLa respiration est assez particulière.\n\nC’est la seule fonction du corps qui est à la fois naturelle et que nous pouvons forcer.\n\nNous pouvons choisir de respirer plus profondément.\n\nDe ralentir.\n\nDe retenir notre souffle.\n\nEt pourtant…\n\ndès que nous cessons de nous en occuper…\n\nle corps continue à respirer tout seul à notre rythme.\n\nAlors observez d’abord comment vous respirez aujourd’hui.\n\nOù sentez-vous votre souffle ?\n\nPlutôt dans la poitrine ?\n\nDans le ventre ?\n\nJe vous rappelle que le cerveau émotionnel se trouve dans le ventre et qu’il est important de retrouver une respiration ventrale afin de nettoyer tous les tracas quotidiens.\n\nEst-ce que vous voyez ce nourrisson qui vient de naître, avec son ventre qui respire pleinement la vie ? Alors allez-y, imitez-le et retrouvez ce nourrisson intérieur qui respire pleinement.\n\nÀ l’inspire, laissez votre ventre se gonfler naturellement.\n\nEt à l’expiration… laissez-le redescendre.\n\nSans forcer.",
            "Observer quelques respirations naturelles avant de prendre le bâton de pluie."));
        Phase rain=new Phase("Cohérence cardiaque — bâton de pluie",5,
            "Et maintenant, pour ceux et celles qui le souhaitent, je vais vous proposer de laisser le son du bâton de pluie accompagner votre respiration.\n\nMais surtout…\n\nne cherchez pas à poursuivre le son.\n\nSi ce rythme ne vous convient pas, laissez votre corps respirer comme il en a besoin.\n\nLe bâton de pluie est simplement là comme un guide.\n\nÀ l’inspiration votre ventre se gonfle.\n\nEt à l’expire il se dégonfle.\n\nInspirez.\n\nEt expirez.\n\nVoilà, comme ceci c’est très bien.\n\nJe vais vous guider quelques instants comme ceci. Si vous perdez le rythme, si vous partez autre part, laissez-vous aller et laissez-vous voyager. Ce temps est d’abord un temps pour vous, pour vous alléger.",
            "Commencer le bâton de pluie. L’écran guide chaque bascule. Après quelques cycles, ne plus parler. Si une personne perd le rythme, la laisser voyager. Ne pas chercher la performance.");
        rain.rainstick=true;rain.inhaleSeconds=5;rain.exhaleSeconds=5;s.phases.add(rain);
        s.phases.add(new Phase("Revenir au souffle naturel",2,
            "Puis doucement…\n\nlaissez votre respiration retrouver son rythme naturel.\n\nVous n’avez plus besoin de la contrôler.\n\nPlus besoin de suivre quoi que ce soit.\n\nVotre corps peut reprendre tranquillement sa respiration.\n\nEt pendant quelques instants…\n\nRessentez simplement.",
            "Laisser le bâton de pluie s’éteindre. Quelques secondes de silence avant le tambour océan."));
        s.phases.add(new Phase("Tambour océan — le bord de la mer",7,
            "Et maintenant… pour ceux qui le souhaitent, je vous invite simplement à écouter.\n\nPeut-être pouvez-vous laisser ce son vous emmener quelque part.\n\nAu bord de la mer.\n\nPeut-être un endroit que vous connaissez.\n\nUn lieu où vous êtes allé pendant vos vacances.\n\nUn endroit qui vous rappelle un souvenir agréable.\n\nOu peut-être simplement un endroit que vous imaginez.\n\nUn lieu qui n’existe que pour vous.\n\nPeu importe.\n\nLaissez simplement apparaître un endroit dans lequel vous vous sentez bien.\n\nUn endroit dans lequel vous vous sentez pleinement en sécurité.\n\nPrenez le temps de sentir cet endroit.\n\nPeut-être la température de l’air.\n\nLe contact du sol.\n\nLe sable.\n\nLe vent.\n\nLa lumière.\n\nEt devant vous… la mer.\n\nUne vague arrive. Puis elle repart.\n\nUne autre vient jusqu’au rivage. Puis retourne vers le large.\n\nEt simplement… laissez-vous quelques instants ici.\n\nVous n’avez rien à faire. Rien à produire.\n\nSimplement écouter ce mouvement, l’observer, peut-être même le ressentir.\n\nQuelque chose arrive. Puis repart.\n\nUne vague revient. Puis elle repart à nouveau.",
            "Faire apparaître doucement le tambour océan. Vagues espacées. Plusieurs vagues sans parler."));
        s.phases.add(new Phase("Laisser partir",7,
            "Et doucement…\n\nnous approchons de l’automne.\n\nUne saison pendant laquelle la nature commence à changer de rythme.\n\nLes choses bougent. Se transforment.\n\nCertaines restent. Et d’autres commencent doucement à partir.\n\nComme la saison qui arrive, celle de l’automne.\n\nLes arbres laissent tomber leurs feuilles une par une.\n\nPetit à petit, ils laissent partir ce dont ils n’auront plus besoin pour continuer leur chemin.\n\nEt peut-être qu’aujourd’hui… il existe en vous quelque chose que vous n’avez plus besoin de retenir avec autant de force.\n\nNe cherchez pas.\n\nVous n’avez rien à trouver absolument.\n\nMais si quelque chose se présente…\n\nune pensée… une inquiétude… une attente… une habitude… une parole… une couleur… une image…\n\nObservez-le.\n\nEt si vous sentez que c’est le moment, vous pouvez finir par le déposer.\n\nLà. Sur la plage. Devant vous.\n\nSans le jeter. Sans essayer de vous en débarrasser.\n\nSimplement le poser.\n\nNe plus avoir besoin de le tenir pendant quelques instants.\n\nEt laissez une première vague venir jusqu’à lui. Puis repartir.\n\nUne autre revient. Puis repart à son tour.\n\nEt à chaque mouvement de la mer… vous pouvez laisser partir ce qui est prêt à partir.\n\nSeulement ce qui est prêt.\n\nCe qui a encore besoin de rester auprès de vous peut rester.\n\nIl n’y a rien à forcer.\n\nJuste laisser faire et peut-être même ressentir ce qui se dépose et cet allègement.\n\nJe vous laisse à présent dans le silence, et puis à un moment les vagues s’éloigneront pour laisser place à une musique douce.",
            "Silence + vagues. Puis ne plus parler. Espacer progressivement les vagues jusqu’à ce qu’elles s’éloignent."));
        s.phases.add(new Phase("Musique douce",5,"",
            "Lancer la musique. 4 à 5 minutes sans aucune parole. Laisser la musique diminuer ou terminer naturellement. Silence quelques secondes. Puis un coup de bol et laisser la vibration disparaître complètement."));
        s.phases.add(new Phase("Transition vers l’assise",3,
            "Reprenez doucement conscience du corps et de la respiration. Remettez un peu de mouvement dans les doigts et les pieds.\n\nPuis venez avec douceur vous placer sur un côté. Prenez quelques instants dans cette position, sans urgence.\n\nÀ votre rythme, revenez ensuite vous installer en position assise.",
            "Toujours passer doucement sur le côté avant de revenir à l’assise."));
        s.phases.add(new Phase("Trois espaces d’observation",5,
            "Avant le silence, retrouver les trois espaces :\n\nÉmotionnel et respiratoire : observer ce qui est présent et retrouver un souffle complètement naturel.\n\nPhysique : sentir l’assise, les points d’appui, la verticalité, les tensions et les zones relâchées.\n\nMental : observer les pensées qui apparaissent et passent, sans chercher à faire le vide.\n\nJe vais maintenant vous laisser dans cette rencontre avec vous-même. Je n’interviendrai plus. Le silence vous appartient. Le son du bol viendra simplement en marquer la fin.",
            "Après cette introduction : silence complet, ne plus intervenir verbalement."));
        s.phases.add(new Phase("Méditation silencieuse",20,"","Silence complet. Ne pas intervenir. À la fin : un coup de bol, puis laisser résonner entièrement."));
        s.phases.add(new Phase("Transition douce",3,"Prenez votre temps. Retrouvez doucement la respiration et le corps. Remettez du mouvement.","Venir doucement sur un côté. Rester quelques instants avant de revenir à son rythme."));
        s.phases.add(new Phase("Troisième temps — musique",20,"Vous n’avez rien à chercher, rien à comprendre, rien à modifier. Simplement écouter et observer ce que la musique vient rencontrer en vous.","Relancer la même musique que dans le premier temps, sans expliquer le rappel. Laisser le cerveau reconnaître ce fil sonore. Parler le moins possible."));
        s.phases.add(new Phase("Retour final",4,"Retrouvez doucement le contact du corps, la respiration et les sons autour de vous. Observez simplement comment vous êtes maintenant.","Faire disparaître progressivement la musique. Remettre du mouvement. Passer doucement sur un côté. Puis revenir s’asseoir à son rythme."));
        return s;
    }

    private static String norm(String s){if(s==null)return"";return Normalizer.normalize(s.toLowerCase(Locale.ROOT),Normalizer.Form.NFD).replaceAll("\\p{M}+","");}

    public static class RainstickView extends View {
        private final Paint body=new Paint(Paint.ANTI_ALIAS_FLAG),edge=new Paint(Paint.ANTI_ALIAS_FLAG),seed=new Paint(Paint.ANTI_ALIAS_FLAG),wave=new Paint(Paint.ANTI_ALIAS_FLAG);
        private final int turq,sky,violet,brown;private boolean inhale=true,reverse=false;private float progress=0;
        RainstickView(Context c,int t,int s,int v,int b){super(c);turq=t;sky=s;violet=v;brown=b;edge.setStyle(Paint.Style.STROKE);edge.setStrokeWidth(4f);edge.setColor(brown);wave.setStyle(Paint.Style.STROKE);wave.setStrokeWidth(3f);}
        void setBreath(boolean i,float p,boolean r){inhale=i;progress=Math.max(0,Math.min(1,p));reverse=r;}
        @Override protected void onDraw(Canvas c){super.onDraw(c);float w=getWidth(),h=getHeight();if(w<=0||h<=0)return;float dir=(reverse?-1f:1f);float from=inhale?-24f:24f;float to=inhale?24f:-24f;float angle=(from+(to-from)*progress)*dir;c.save();c.rotate(angle,w/2,h/2);
            RectF r=new RectF(w*.12f,h*.40f,w*.88f,h*.60f);body.setShader(new LinearGradient(r.left,r.top,r.right,r.bottom,new int[]{Color.argb(60,132,108,88),Color.argb(70,turq),Color.argb(55,sky),Color.argb(45,violet)},null,Shader.TileMode.CLAMP));c.drawRoundRect(r,r.height()/2,r.height()/2,body);c.drawRoundRect(r,r.height()/2,r.height()/2,edge);
            for(int i=0;i<22;i++){seed.setColor(i%3==0?turq:(i%3==1?sky:violet));float x=r.left+18+(r.width()-36)*i/21f;float y=r.centerY()+((i%4)-1.5f)*5;c.drawCircle(x,y,4,seed);}c.restore();
            wave.setColor(inhale?turq:violet);float y=h*.86f;for(int i=0;i<3;i++){RectF a=new RectF(w*.37f-i*9,y-i*4,w*.63f+i*9,y+18+i*4);c.drawArc(a,200,140,false,wave);} }
    }
}
