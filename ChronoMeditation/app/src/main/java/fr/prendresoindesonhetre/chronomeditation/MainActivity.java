package fr.prendresoindesonhetre.chronomeditation;
import android.app.Activity;
import android.app.AlertDialog;
import android.content.Context;
import android.content.SharedPreferences;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.LinearGradient;
import android.graphics.Paint;
import android.graphics.RectF;
import android.graphics.Shader;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.os.SystemClock;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.text.InputType;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.ScrollView;
import android.widget.Space;
import android.widget.TextView;
import android.widget.Toast;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import java.util.ArrayList;
import java.util.Locale;
public class MainActivity extends Activity {
private static final int MATCH = ViewGroup.LayoutParams.MATCH_PARENT;
private static final int WRAP = ViewGroup.LayoutParams.WRAP_CONTENT;
private final int BG = Color.rgb(247, 245, 241);
private final int CARD = Color.rgb(255, 252, 248);
private final int TURQ = Color.rgb(74, 180, 176);
private final int SKY = Color.rgb(130, 188, 224);
private final int VIOLET = Color.rgb(145, 121, 171);
private final int TEXT = Color.rgb(64, 61, 67);
private final int SUBTEXT = Color.rgb(117, 111, 116);
private final int BROWN = Color.rgb(138, 113, 91);
private final int SOFT = Color.rgb(238, 232, 242);
private final int SOFT_TURQ = Color.rgb(226, 245, 243);
private SharedPreferences prefs;
private final ArrayList<Session> sessions = new ArrayList<>();
private LinearLayout root;
private final Handler handler = new Handler(Looper.getMainLooper());
private Runnable tick;
private boolean running = false;
private long globalElapsedMs = 0, phaseElapsedMs = 0, lastTick = 0;
private int currentPhase = 0;
private Session playingSession;
private TextView globalTimer, phaseTimer, phaseName, nextPhase, guideText, totalDurationView, phaseIndexView;
private Button playPause;
private ProgressBar globalProgress, phaseProgress;
private RainstickView rainstickView;
static class Phase {
String name, text;
int minutes;
Phase(String n, int m, String t) { name = n; minutes = m; text = t; }
JSONObject toJson() throws JSONException {
JSONObject o = new JSONObject();
o.put("name", name);
o.put("minutes", minutes);
o.put("text", text);
return o;
}
static Phase fromJson(JSONObject o) {
return new Phase(o.optString("name", "Phase"), o.optInt("minutes", 5), o.optString("text", ""));
}
}
static class Session {
String title;
ArrayList<Phase> phases = new ArrayList<>();
Session(String t) { title = t; }
JSONObject toJson() throws JSONException {
JSONObject o = new JSONObject();
o.put("title", title);
JSONArray a = new JSONArray();
for (Phase p : phases) a.put(p.toJson());
o.put("phases", a);
return o;
}
static Session fromJson(JSONObject o) {
Session s = new Session(o.optString("title", "Séance"));
JSONArray a = o.optJSONArray("phases");
if (a != null) for (int i = 0; i < a.length(); i++) s.phases.add(Phase.fromJson(a.optJSONObject(i)));
return s;
}
int totalMinutes() {
int x = 0;
for (Phase p : phases) x += p.minutes;
return x;
}
}
@Override
public void onCreate(Bundle b) {
super.onCreate(b);
getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
prefs = getSharedPreferences("meditations", MODE_PRIVATE);
load();
showHome();
}
private int dp(int x) { return (int) (x * getResources().getDisplayMetrics().density + .5f); }
private GradientDrawable rounded(int fill, int stroke, int radiusDp) {
GradientDrawable d = new GradientDrawable();
d.setColor(fill);
d.setCornerRadius(dp(radiusDp));
if (stroke != Color.TRANSPARENT) d.setStroke(dp(1), stroke);
return d;
}
private TextView tv(String text, int sp, boolean bold) {
TextView v = new TextView(this);
v.setText(text);
v.setTextSize(sp);
v.setTextColor(TEXT);
if (bold) v.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
return v;
}
private TextView chip(String text, int fill, int txtColor) {
TextView v = tv(text, 12, true);
v.setTextColor(txtColor);
v.setPadding(dp(12), dp(7), dp(12), dp(7));
v.setBackground(rounded(fill, Color.TRANSPARENT, 18));
return v;
}
private Button btn(String text) {
Button b = new Button(this);
b.setText(text);
b.setAllCaps(false);
b.setTextSize(15);
b.setMinHeight(dp(46));
return b;
}
private void stylePrimary(Button b) {
b.setTextColor(Color.WHITE);
b.setBackground(rounded(TURQ, Color.TRANSPARENT, 16));
b.setPadding(dp(12), dp(10), dp(12), dp(10));
}
private void styleSecondary(Button b) {
b.setTextColor(BROWN);
b.setBackground(rounded(Color.WHITE, Color.rgb(225, 217, 207), 16));
b.setPadding(dp(12), dp(10), dp(12), dp(10));
}
private void styleGhost(Button b) {
b.setTextColor(VIOLET);
b.setBackground(rounded(SOFT, Color.TRANSPARENT, 16));
b.setPadding(dp(12), dp(10), dp(12), dp(10));
}
private LinearLayout card() {
LinearLayout box = new LinearLayout(this);
box.setOrientation(LinearLayout.VERTICAL);
box.setPadding(dp(16), dp(16), dp(16), dp(16));
box.setBackground(rounded(CARD, Color.rgb(232, 226, 219), 22));
if (Build.VERSION.SDK_INT >= 21) box.setElevation(dp(2));
return box;
}
private EditText input(String hint, boolean multiLine) {
EditText e = new EditText(this);
e.setHint(hint);
e.setTextColor(TEXT);
e.setHintTextColor(Color.rgb(150, 147, 152));
e.setTextSize(16);
e.setBackground(rounded(Color.WHITE, Color.rgb(224, 218, 211), 16));
e.setPadding(dp(14), dp(12), dp(14), dp(12));
if (multiLine) {
e.setMinLines(5);
e.setGravity(Gravity.TOP | Gravity.START);
e.setInputType(InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_FLAG_MULTI_LINE | InputType.TYPE_TEXT_FLAG_CAP_SENTENCES);
} else {
e.setSingleLine(true);
e.setInputType(InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_FLAG_CAP_SENTENCES);
}
return e;
}
private void base() {
root = new LinearLayout(this);
root.setOrientation(LinearLayout.VERTICAL);
root.setBackgroundColor(BG);
root.setPadding(dp(14), dp(16), dp(14), dp(16));
setContentView(root);
}
private void addSpacer(ViewGroup parent, int hDp) {
Space s = new Space(this);
parent.addView(s, new LinearLayout.LayoutParams(1, dp(hDp)));
}
private void showHome() {
running = false;
if (tick != null) handler.removeCallbacks(tick);
base();
ScrollView scroll = new ScrollView(this);
LinearLayout content = new LinearLayout(this);
content.setOrientation(LinearLayout.VERTICAL);
scroll.addView(content);
root.addView(scroll, new LinearLayout.LayoutParams(MATCH, 0, 1));
LinearLayout hero = card();
hero.setBackground(rounded(CARD, Color.TRANSPARENT, 24));
TextView brand = tv("Prendre soin de son Hêtre", 14, true);
brand.setTextColor(BROWN);
hero.addView(brand);
addSpacer(hero, 6);
TextView title = tv("Mes Méditations", 30, true);
title.setTextColor(VIOLET);
hero.addView(title);
addSpacer(hero, 8);
TextView sub = tv("Un espace doux pour préparer tes séances, suivre ton rythme et garder près de toi les mots qui accompagnent chaque moment.", 16, false);
sub.setTextColor(SUBTEXT);
hero.addView(sub);
addSpacer(hero, 12);
LinearLayout chips = new LinearLayout(this);
chips.setOrientation(LinearLayout.HORIZONTAL);
chips.setGravity(Gravity.START);
chips.addView(chip(sessions.size() + " séance" + (sessions.size() > 1 ? "s" : ""), SOFT_TURQ, TURQ));
TextView c2 = chip("Textes modifiables", SOFT, VIOLET);
LinearLayout.LayoutParams c2lp = new LinearLayout.LayoutParams(WRAP, WRAP);
c2lp.leftMargin = dp(8);
chips.addView(c2, c2lp);
hero.addView(chips);
content.addView(hero);
addSpacer(content, 14);
for (int i = 0; i < sessions.size(); i++) {
final int idx = i;
Session s = sessions.get(i);
LinearLayout sessionCard = card();
LinearLayout headRow = new LinearLayout(this);
headRow.setOrientation(LinearLayout.HORIZONTAL);
headRow.setGravity(Gravity.CENTER_VERTICAL);
TextView name = tv(s.title, 20, true);
name.setTextColor(TEXT);
headRow.addView(name, new LinearLayout.LayoutParams(0, WRAP, 1));
headRow.addView(chip(s.totalMinutes() + " min", SOFT_TURQ, TURQ));
sessionCard.addView(headRow);
addSpacer(sessionCard, 8);
TextView meta = tv(s.phases.size() + " phases • chrono global • texte visible", 14, false);
meta.setTextColor(SUBTEXT);
sessionCard.addView(meta);
addSpacer(sessionCard, 14);
LinearLayout row = new LinearLayout(this);
row.setOrientation(LinearLayout.HORIZONTAL);
Button start = btn("Lancer");
Button edit = btn("Modifier");
Button dup = btn("Dupliquer");
stylePrimary(start);
styleSecondary(edit);
styleGhost(dup);
row.addView(start, new LinearLayout.LayoutParams(0, WRAP, 1));
LinearLayout.LayoutParams lp2 = new LinearLayout.LayoutParams(0, WRAP, 1); lp2.leftMargin = dp(8);
row.addView(edit, lp2);
LinearLayout.LayoutParams lp3 = new LinearLayout.LayoutParams(0, WRAP, 1); lp3.leftMargin = dp(8);
row.addView(dup, lp3);
sessionCard.addView(row);
start.setOnClickListener(v -> startSession(s));
edit.setOnClickListener(v -> editSession(idx));
dup.setOnClickListener(v -> {
Session cp = cloneSession(s);
cp.title = s.title + " - copie";
sessions.add(cp);
save();
showHome();
});
content.addView(sessionCard);
addSpacer(content, 12);
}
Button add = btn("+ Nouvelle séance");
stylePrimary(add);
add.setOnClickListener(v -> {
sessions.add(new Session("Nouvelle séance"));
editSession(sessions.size() - 1);
});
root.addView(add);
}
private void editSession(int index) {
base();
Session s = sessions.get(index);
LinearLayout top = new LinearLayout(this);
top.setOrientation(LinearLayout.HORIZONTAL);
Button back = btn("‹ Retour");
styleGhost(back);
back.setOnClickListener(v -> { save(); showHome(); });
top.addView(back);
root.addView(top);
addSpacer(root, 12);
ScrollView sc = new ScrollView(this);
LinearLayout content = new LinearLayout(this);
content.setOrientation(LinearLayout.VERTICAL);
sc.addView(content);
root.addView(sc, new LinearLayout.LayoutParams(MATCH, 0, 1));
LinearLayout intro = card();
TextView title2 = tv("Construire la séance", 28, true);
title2.setTextColor(VIOLET);
intro.addView(title2);
addSpacer(intro, 6);
TextView helper = tv("Crée les temps de ta séance, ajuste les durées et garde sous les yeux les mots que tu veux offrir pendant l’atelier.", 15, false);
helper.setTextColor(SUBTEXT);
intro.addView(helper);
addSpacer(intro, 14);
EditText titleInput = input("Titre de la séance", false);
titleInput.setText(s.title);
intro.addView(titleInput);
content.addView(intro);
addSpacer(content, 14);
LinearLayout phasesBox = new LinearLayout(this);
phasesBox.setOrientation(LinearLayout.VERTICAL);
content.addView(phasesBox);
ArrayList<PhaseEditors> editors = new ArrayList<>();
Runnable rebuild = new Runnable() {
@Override public void run() {
phasesBox.removeAllViews();
editors.clear();
for (int i = 0; i < s.phases.size(); i++) {
int idx = i;
Phase p = s.phases.get(i);
LinearLayout phaseCard = card();
LinearLayout hdrRow = new LinearLayout(MainActivity.this);
hdrRow.setOrientation(LinearLayout.HORIZONTAL);
hdrRow.setGravity(Gravity.CENTER_VERTICAL);
TextView hdr = tv("Phase " + (i + 1), 17, true);
hdr.setTextColor(VIOLET);
hdrRow.addView(hdr, new LinearLayout.LayoutParams(0, WRAP, 1));
hdrRow.addView(chip(p.minutes + " min", SOFT_TURQ, TURQ));
phaseCard.addView(hdrRow);
addSpacer(phaseCard, 10);
EditText name2 = input("Nom de la phase", false);
name2.setText(p.name);
phaseCard.addView(name2);
addSpacer(phaseCard, 10);
EditText mins = input("Durée en minutes", false);
mins.setInputType(InputType.TYPE_CLASS_NUMBER);
mins.setText(String.valueOf(p.minutes));
phaseCard.addView(mins);
addSpacer(phaseCard, 10);
EditText text = input("Texte de guidance", true);
text.setText(p.text);
phaseCard.addView(text);
addSpacer(phaseCard, 10);
Button del = btn("Supprimer cette phase");
styleSecondary(del);
del.setOnClickListener(v -> {
syncEditors(s, editors);
if (idx < s.phases.size()) s.phases.remove(idx);
this.run();
});
phaseCard.addView(del);
editors.add(new PhaseEditors(name2, mins, text));
phasesBox.addView(phaseCard);
addSpacer(phasesBox, 12);
}
}
};
rebuild.run();
LinearLayout actions = new LinearLayout(this);
actions.setOrientation(LinearLayout.HORIZONTAL);
Button add2 = btn("+ Phase");
Button saveB = btn("Enregistrer");
styleGhost(add2);
stylePrimary(saveB);
actions.addView(add2, new LinearLayout.LayoutParams(0, WRAP, 1));
LinearLayout.LayoutParams saveLp = new LinearLayout.LayoutParams(0, WRAP, 1); saveLp.leftMargin = dp(8);
actions.addView(saveB, saveLp);
root.addView(actions);
add2.setOnClickListener(v -> {
syncEditors(s, editors);
s.phases.add(new Phase("Nouvelle phase", 5, ""));
rebuild.run();
});
saveB.setOnClickListener(v -> {
s.title = titleInput.getText().toString().trim();
syncEditors(s, editors);
save();
Toast.makeText(this, "Séance enregistrée", Toast.LENGTH_SHORT).show();
showHome();
});
}
static class PhaseEditors {
EditText n, m, t;
PhaseEditors(EditText a, EditText b, EditText c) { n = a; m = b; t = c; }
}
private void syncEditors(Session s, ArrayList<PhaseEditors> es) {
for (int i = 0; i < es.size() && i < s.phases.size(); i++) {
PhaseEditors e = es.get(i);
Phase p = s.phases.get(i);
p.name = e.n.getText().toString();
try {
p.minutes = Math.max(1, Integer.parseInt(e.m.getText().toString()));
} catch (Exception ex) {
p.minutes = 5;
}
p.text = e.t.getText().toString();
}
}
private void startSession(Session s) {
if (s.phases.isEmpty()) {
Toast.makeText(this, "Ajoute au moins une phase.", Toast.LENGTH_SHORT).show();
return;
}
playingSession = s;
currentPhase = 0;
globalElapsedMs = 0;
phaseElapsedMs = 0;
running = false;
showPlayer();
}
private void showPlayer() {
base();
LinearLayout topCard = card();
TextView small = tv("Prendre soin de son Hêtre • En séance", 13, true);
small.setTextColor(BROWN);
topCard.addView(small);
addSpacer(topCard, 4);
TextView sessionTitle = tv(playingSession.title, 22, true);
sessionTitle.setTextColor(VIOLET);
topCard.addView(sessionTitle);
addSpacer(topCard, 8);
LinearLayout chipRow = new LinearLayout(this);
chipRow.setOrientation(LinearLayout.HORIZONTAL);
totalDurationView = chip("Total : " + playingSession.totalMinutes() + " min", SOFT_TURQ, TURQ);
phaseIndexView = chip("Phase 1 / " + playingSession.phases.size(), SOFT, VIOLET);
chipRow.addView(totalDurationView);
LinearLayout.LayoutParams piLp = new LinearLayout.LayoutParams(WRAP, WRAP);
piLp.leftMargin = dp(8);
chipRow.addView(phaseIndexView, piLp);
topCard.addView(chipRow);
root.addView(topCard);
addSpacer(root, 10);
LinearLayout chronoCard = card();
phaseName = tv("", 22, true);
phaseName.setTextColor(TEXT);
phaseName.setGravity(Gravity.CENTER);
chronoCard.addView(phaseName);
addSpacer(chronoCard, 6);
globalTimer = tv("00:00", 46, true);
globalTimer.setTextColor(TURQ);
globalTimer.setGravity(Gravity.CENTER);
chronoCard.addView(globalTimer);
TextView globalLabel = tv("Temps global", 12, false);
globalLabel.setTextColor(SUBTEXT);
globalLabel.setGravity(Gravity.CENTER);
chronoCard.addView(globalLabel);
addSpacer(chronoCard, 7);
globalProgress = new ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal);
globalProgress.setMax(Math.max(1, (int) (playingSession.totalMinutes() * 60000L)));
globalProgress.setProgress(0);
globalProgress.setProgressTintList(android.content.res.ColorStateList.valueOf(TURQ));
globalProgress.setProgressBackgroundTintList(android.content.res.ColorStateList.valueOf(Color.rgb(229, 238, 236)));
chronoCard.addView(globalProgress, new LinearLayout.LayoutParams(MATCH, dp(6)));
addSpacer(chronoCard, 8);
phaseTimer = tv("", 17, true);
phaseTimer.setTextColor(BROWN);
phaseTimer.setGravity(Gravity.CENTER);
chronoCard.addView(phaseTimer);
nextPhase = tv("", 13, false);
nextPhase.setTextColor(SUBTEXT);
nextPhase.setGravity(Gravity.CENTER);
chronoCard.addView(nextPhase);
addSpacer(chronoCard, 7);
phaseProgress = new ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal);
phaseProgress.setMax(1);
phaseProgress.setProgress(0);
phaseProgress.setProgressTintList(android.content.res.ColorStateList.valueOf(VIOLET));
phaseProgress.setProgressBackgroundTintList(android.content.res.ColorStateList.valueOf(Color.rgb(237, 231, 242)));
chronoCard.addView(phaseProgress, new LinearLayout.LayoutParams(MATCH, dp(6)));
root.addView(chronoCard);
addSpacer(root, 10);
rainstickView = new RainstickView(this, TURQ, SKY, VIOLET, BROWN);
LinearLayout visualCard = card();
TextView visualTitle = tv("Bâton de pluie", 14, true);
visualTitle.setTextColor(BROWN);
visualTitle.setGravity(Gravity.CENTER);
visualCard.addView(visualTitle);
addSpacer(visualCard, 4);
visualCard.addView(rainstickView, new LinearLayout.LayoutParams(MATCH, dp(82)));
visualCard.setVisibility(View.GONE);
rainstickView.setTag(visualCard);
root.addView(visualCard);
addSpacer(root, 8);
LinearLayout textCard = card();
TextView textTitle = tv("Tes mots pour ce moment", 15, true);
textTitle.setTextColor(VIOLET);
textCard.addView(textTitle);
addSpacer(textCard, 5);
ScrollView guideScroll = new ScrollView(this);
guideText = tv("", 18, false);
guideText.setLineSpacing(0, 1.18f);
guideText.setTextColor(TEXT);
guideScroll.addView(guideText);
textCard.addView(guideScroll, new LinearLayout.LayoutParams(MATCH, 0, 1));
root.addView(textCard, new LinearLayout.LayoutParams(MATCH, 0, 1));
addSpacer(root, 8);
LinearLayout row1 = new LinearLayout(this);
row1.setOrientation(LinearLayout.HORIZONTAL);
Button prev = btn("‹ Précédente");
playPause = btn("Démarrer");
Button next = btn("Suivante ›");
styleSecondary(prev);
stylePrimary(playPause);
styleGhost(next);
row1.addView(prev, new LinearLayout.LayoutParams(0, WRAP, 1));
LinearLayout.LayoutParams midLp = new LinearLayout.LayoutParams(0, WRAP, 1);
midLp.leftMargin = dp(8);
row1.addView(playPause, midLp);
LinearLayout.LayoutParams nxtLp = new LinearLayout.LayoutParams(0, WRAP, 1);
nxtLp.leftMargin = dp(8);
row1.addView(next, nxtLp);
root.addView(row1);
addSpacer(root, 6);
Button stop = btn("Quitter la séance");
styleGhost(stop);
root.addView(stop);
prev.setOnClickListener(v -> changePhase(-1));
next.setOnClickListener(v -> changePhase(1));
playPause.setOnClickListener(v -> { if (running) pauseTimer(); else resumeTimer(); });
stop.setOnClickListener(v -> {
pauseTimer();
new AlertDialog.Builder(this)
.setMessage("Quitter cette séance ?")
.setNegativeButton("Continuer", null)
.setPositiveButton("Quitter", (d, w) -> showHome())
.show();
});
updatePlayer();
tick = new Runnable() {
@Override public void run() {
if (running) {
long now = SystemClock.elapsedRealtime();
long d = now - lastTick;
lastTick = now;
globalElapsedMs += d;
phaseElapsedMs += d;
long phaseDur = playingSession.phases.get(currentPhase).minutes * 60000L;
if (phaseElapsedMs >= phaseDur) {
if (currentPhase < playingSession.phases.size() - 1) {
vibrate();
currentPhase++;
phaseElapsedMs = 0;
} else {
pauseTimer();
vibrate();
Toast.makeText(MainActivity.this, "Fin de la séance", Toast.LENGTH_LONG).show();
}
}
updatePlayer();
}
handler.postDelayed(this, 250);
}
};
handler.post(tick);
}
private void changePhase(int delta) {
int n = currentPhase + delta;
if (n >= 0 && n < playingSession.phases.size()) {
currentPhase = n;
phaseElapsedMs = 0;
vibrate();
updatePlayer();
}
}
private void resumeTimer() {
running = true;
lastTick = SystemClock.elapsedRealtime();
playPause.setText("Pause");
}
private void pauseTimer() {
running = false;
if (playPause != null) playPause.setText(globalElapsedMs == 0 ? "Démarrer" : "Reprendre");
}
private void vibrate() {
try {
Vibrator v = (Vibrator) getSystemService(VIBRATOR_SERVICE);
if (v == null) return;
if (Build.VERSION.SDK_INT >= 26) v.vibrate(VibrationEffect.createOneShot(35, VibrationEffect.DEFAULT_AMPLITUDE));
else v.vibrate(35);
} catch (Exception ignored) {}
}
private void updatePlayer() {
Phase p = playingSession.phases.get(currentPhase);
phaseName.setText(p.name);
globalTimer.setText(format(globalElapsedMs));
long remain = Math.max(0, p.minutes * 60000L - phaseElapsedMs);
phaseTimer.setText("Temps restant pour cette phase · " + format(remain));
nextPhase.setText(currentPhase + 1 < playingSession.phases.size() ? "Ensuite : " + playingSession.phases.get(currentPhase + 1).name : "Dernier temps de la séance");
guideText.setText(p.text.isEmpty() ? "Aucun texte pour cette phase." : p.text);
phaseIndexView.setText("Phase " + (currentPhase + 1) + " / " + playingSession.phases.size());
globalProgress.setMax(Math.max(1, (int) (playingSession.totalMinutes() * 60000L)));
globalProgress.setProgress((int) Math.min(globalElapsedMs, playingSession.totalMinutes() * 60000L));
int phaseMax = Math.max(1, (int) (p.minutes * 60000L));
phaseProgress.setMax(phaseMax);
phaseProgress.setProgress((int) Math.min(phaseElapsedMs, phaseMax));
boolean showRainstick = containsIgnoreAccents(p.name, "baton") || containsIgnoreAccents(p.text, "baton de pluie");
LinearLayout visualCard = (LinearLayout) rainstickView.getTag();
visualCard.setVisibility(showRainstick ? View.VISIBLE : View.GONE);
rainstickView.setVisibility(showRainstick ? View.VISIBLE : View.GONE);
}
private boolean containsIgnoreAccents(String source, String query) {
if (source == null) return false;
String s = java.text.Normalizer.normalize(source.toLowerCase(Locale.ROOT), java.text.Normalizer.Form.NFD).replaceAll("\\p{M}+", "");
String q = java.text.Normalizer.normalize(query.toLowerCase(Locale.ROOT), java.text.Normalizer.Form.NFD).replaceAll("\\p{M}+", "");
return s.contains(q);
}
private String format(long ms) {
long sec = ms / 1000;
long min = sec / 60;
long rem = sec % 60;
return String.format(Locale.FRANCE, "%02d:%02d", min, rem);
}
private Session cloneSession(Session s) {
Session c = new Session(s.title);
for (Phase p : s.phases) c.phases.add(new Phase(p.name, p.minutes, p.text));
return c;
}
private void save() {
try {
JSONArray a = new JSONArray();
for (Session s : sessions) a.put(s.toJson());
prefs.edit().putString("sessions", a.toString()).apply();
} catch (Exception ignored) {}
}
private void load() {
sessions.clear();
String raw = prefs.getString("sessions", "");
try {
if (!raw.isEmpty()) {
JSONArray a = new JSONArray(raw);
for (int i = 0; i < a.length(); i++) sessions.add(Session.fromJson(a.getJSONObject(i)));
}
} catch (Exception ignored) {}
if (sessions.isEmpty()) {
sessions.add(defaultSession());
save();
}
}
private Session defaultSession() {
Session s = new Session("Séance d’automne — Laisser de la place");
s.phases.add(new Phase("Accueil & état des lieux", 10,
"Prenez le temps de vous installer, de prendre votre place.\n\n" +
"Pourquoi suis-je venu ici ce soir ? Quelle est mon intention en venant prendre ce temps avec moi-même ?\n\n" +
"Plus rien n’a besoin de tenir. Les jambes, les bras, les mains, les épaules, la mâchoire peuvent se relâcher. Laissez le support porter votre poids.\n\n" +
"Sans rien modifier, observez simplement : comment est votre corps aujourd’hui ? Comment vous sentez-vous ? Voilà où j’en suis aujourd’hui."));
s.phases.add(new Phase("Respiration consciente", 3,
"Portez doucement votre attention vers votre respiration, sans la modifier.\n\n" +
"La respiration peut être volontaire, mais lorsque nous cessons de nous en occuper, le corps continue naturellement à respirer.\n\n" +
"Observez où vous respirez aujourd’hui : poitrine, ventre, côtes…\n\n" +
"Puis laissez progressivement la respiration descendre vers le ventre. À l’inspiration le ventre se soulève, à l’expiration il redescend. C’est une respiration très instinctive, que l’on observe naturellement chez le nourrisson."));
s.phases.add(new Phase("Bâton de pluie — cohérence cardiaque", 5,
"Pour ceux qui le souhaitent, laissez le bâton de pluie accompagner votre souffle.\n\n" +
"Environ cinq secondes à l’inspiration et cinq secondes à l’expiration, sans forcer. Si ce rythme n’est pas confortable, laissez votre corps trouver le sien.\n\n" +
"Après quelques cycles, ne plus parler et laisser uniquement le son guider la respiration."));
s.phases.add(new Phase("Tambour océan — le rivage", 7,
"Laissez votre respiration retrouver son rythme naturel.\n\n" +
"Faites apparaître doucement le tambour océan et laissez d’abord quelques vagues sans parler.\n\n" +
"Pour ceux qui le souhaitent, imaginez un endroit au bord de la mer où vous vous sentez bien et pleinement en sécurité. Peut-être un souvenir, peut-être un lieu imaginé.\n\n" +
"L’automne approche. La nature change, les choses bougent et se transforment. L’arbre laisse progressivement partir certaines de ses feuilles.\n\n" +
"S’il existe quelque chose que vous n’avez plus besoin de retenir avec autant de force, vous pouvez simplement le déposer sur le rivage. À chaque vague, laissez partir seulement ce qui est prêt à partir. Ce qui a encore besoin de rester peut rester.\n\n" +
"Puis ne plus parler. Espacer progressivement les vagues jusqu’au silence."));
s.phases.add(new Phase("Musique — laisser de la place", 5,
"Quand le tambour océan s’est complètement éteint, laisser quelques secondes de silence.\n\n" +
"Vous n’avez plus rien à laisser partir, plus rien à chercher. Simplement rester là. Peut-être qu’un peu d’espace est apparu.\n\n" +
"Laissez de la place à ce qui bouge, à ce qui évolue, à ce qui change, sans chercher à savoir où cela vous emmène.\n\n" +
"Lancer la musique puis ne plus parler. À la fin : quelques secondes de silence, puis un coup de bol."));
s.phases.add(new Phase("Transition vers l’assise", 3,
"Reprenez doucement conscience du corps et de la respiration. Remettez un peu de mouvement dans les doigts et les pieds.\n\n" +
"Puis venez avec douceur vous placer sur un côté. Prenez quelques instants dans cette position, sans urgence.\n\n" +
"À votre rythme, revenez ensuite vous installer en position assise."));
s.phases.add(new Phase("Trois espaces d’observation", 5,
"Avant le silence, retrouver les trois espaces :\n\n" +
"Émotionnel et respiratoire : observer ce qui est présent et retrouver un souffle complètement naturel.\n\n" +
"Physique : sentir l’assise, les points d’appui, la verticalité, les tensions et les zones relâchées.\n\n" +
"Mental : observer les pensées qui apparaissent et passent, sans chercher à faire le vide.\n\n" +
"Puis : Je vais maintenant vous laisser dans cette rencontre avec vous-même. Je n’interviendrai plus. Le silence vous appartient. Le son du bol viendra simplement en marquer la fin."));
s.phases.add(new Phase("Méditation silencieuse", 20,
"Silence complet. Ne pas intervenir.\n\nÀ la fin : un coup de bol et laisser entièrement résonner."));
s.phases.add(new Phase("Transition douce", 3,
"Prenez votre temps. Retrouvez doucement la respiration et le corps. Remettez du mouvement.\n\nPuis venez doucement vous placer sur un côté. Restez-y quelques instants avant de revenir à votre rythme."));
s.phases.add(new Phase("Troisième temps — musique", 25,
"Installez-vous confortablement. Laissez le corps reprendre sa place et relâcher ce qui peut l’être.\n\n" +
"Relancer la même musique que dans le premier temps, sans expliquer le rappel.\n\n" +
"Vous n’avez rien à chercher, rien à comprendre, rien à modifier. Simplement écouter et observer ce que la musique vient rencontrer en vous.\n\n" +
"Laisser ensuite la musique accompagner ce dernier temps avec le moins de paroles possible."));
s.phases.add(new Phase("Retour final", 4,
"Faire disparaître progressivement la musique.\n\n" +
"Retrouver le contact du corps, la respiration et les sons de la pièce. Remettre doucement du mouvement.\n\n" +
"Venir avec douceur se placer sur un côté, prendre le temps, puis revenir s’asseoir.\n\n" +
"Observer simplement comment vous êtes maintenant, sans comparer avec le début."));
return s;
}
public static class RainstickView extends View {
private final Paint fillPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
private final Paint strokePaint = new Paint(Paint.ANTI_ALIAS_FLAG);
private final Paint seedPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
private final Paint pinPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
private final Paint glowPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
private final int turq, sky, violet, brown;
public RainstickView(Context c, int turq, int sky, int violet, int brown) {
super(c);
this.turq = turq;
this.sky = sky;
this.violet = violet;
this.brown = brown;
strokePaint.setStyle(Paint.Style.STROKE);
strokePaint.setStrokeWidth(4f);
strokePaint.setColor(brown);
seedPaint.setStyle(Paint.Style.FILL);
pinPaint.setStyle(Paint.Style.STROKE);
pinPaint.setStrokeWidth(3f);
pinPaint.setColor(Color.argb(110, 138, 113, 91));
glowPaint.setStyle(Paint.Style.FILL);
}
@Override protected void onDraw(Canvas canvas) {
super.onDraw(canvas);
float w = getWidth();
float h = getHeight();
if (w <= 0 || h <= 0) return;
RectF outer = new RectF(dp(8f), h * 0.22f, w - dp(8f), h * 0.78f);
LinearGradient shader = new LinearGradient(outer.left, outer.top, outer.right, outer.bottom,
new int[]{Color.argb(35, 74, 180, 176), Color.argb(25, 130, 188, 224), Color.argb(25, 145, 121, 171)},
null, Shader.TileMode.CLAMP);
fillPaint.setShader(shader);
glowPaint.setColor(Color.argb(70, 255, 255, 255));
canvas.drawRoundRect(outer, outer.height() / 2f, outer.height() / 2f, fillPaint);
canvas.drawRoundRect(outer, outer.height() / 2f, outer.height() / 2f, strokePaint);
float cap = outer.height() * 0.26f;
RectF leftCap = new RectF(outer.left, outer.top, outer.left + cap, outer.bottom);
RectF rightCap = new RectF(outer.right - cap, outer.top, outer.right, outer.bottom);
Paint endPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
endPaint.setColor(Color.argb(45, 138, 113, 91));
canvas.drawRoundRect(leftCap, leftCap.height() / 2f, leftCap.height() / 2f, endPaint);
canvas.drawRoundRect(rightCap, rightCap.height() / 2f, rightCap.height() / 2f, endPaint);
for (int i = 0; i < 10; i++) {
float x = outer.left + (outer.width() / 11f) * (i + 1);
float y1 = outer.top + dp(8f) + (i % 2 == 0 ? dp(4f) : dp(12f));
float y2 = outer.bottom - dp(8f) - (i % 2 == 0 ? dp(12f) : dp(4f));
canvas.drawLine(x - dp(12f), y1, x + dp(12f), y2, pinPaint);
}
int[] cols = new int[]{turq, sky, violet, brown, sky, turq, violet};
for (int i = 0; i < 26; i++) {
seedPaint.setColor(cols[i % cols.length]);
float cx = outer.left + dp(22f) + (i * (outer.width() - dp(44f)) / 25f);
float cyBase = (i % 2 == 0) ? outer.top + outer.height() * 0.38f : outer.top + outer.height() * 0.62f;
float cy = cyBase + (i % 3 - 1) * dp(3f);
canvas.drawCircle(cx, cy, dp(3.5f), seedPaint);
}
Paint labelPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
labelPaint.setColor(brown);
labelPaint.setTextAlign(Paint.Align.CENTER);
labelPaint.setTextSize(dp(13f));
labelPaint.setFakeBoldText(true);
canvas.drawText("Bâton de pluie", w / 2f, h - dp(10f), labelPaint);
}
private float dp(float v) {
return v * getResources().getDisplayMetrics().density;
}
}
}
