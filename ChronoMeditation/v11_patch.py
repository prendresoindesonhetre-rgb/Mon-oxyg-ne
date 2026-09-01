from pathlib import Path
import runpy, re

# Repartir exactement de la V10 testée.
runpy.run_path('v10_patch.py', run_name='__main__')

src = Path('app/src/main/java/fr/prendresoindesonhetre/chronomeditation/MainActivity.java')
s = src.read_text(encoding='utf-8')

# Etat de la barre de lecture compacte.
anchor = '    private Button musicToggle;\n'
fields = '''    private Button musicToggle;\n    private SeekBar musicTimeline;\n    private TextView musicTime;\n    private boolean musicSeeking = false;\n    private Button youtubeFallback;\n    private final android.os.Handler musicUiHandler = new android.os.Handler(android.os.Looper.getMainLooper());\n    private final Runnable musicProgressRunnable = new Runnable() {\n        @Override public void run() {\n            if (musicTimeline == null) return;\n            if (localMode && localPlayer != null && !musicSeeking) {\n                try {\n                    int duration = localPlayer.getDuration();\n                    int current = localPlayer.getCurrentPosition();\n                    updateMusicTimeline(current / 1000.0, duration / 1000.0);\n                } catch (Exception ignored) {}\n            }\n            musicUiHandler.postDelayed(this, 500);\n        }\n    };\n'''
assert anchor in s, 'musicToggle field anchor missing'
s = s.replace(anchor, fields, 1)

# Le lecteur YouTube reste visible mais devient un petit carré, au minimum prévu par YouTube.
old_video = '        body.addView(youtubeWeb, new LinearLayout.LayoutParams(MATCH, dp(220)));\n'
new_video = '''        LinearLayout.LayoutParams videoLp = new LinearLayout.LayoutParams(dp(200), dp(200));\n        videoLp.gravity = android.view.Gravity.CENTER_HORIZONTAL;\n        body.addView(youtubeWeb, videoLp);\n'''
assert old_video in s, 'V10 video size anchor missing'
s = s.replace(old_video, new_video, 1)

# Le statut n'occupe plus de place sauf en cas de problème.
old_status = '''        youtubeStatus = tv("Choisis un morceau", 11, false);\n        youtubeStatus.setTextColor(MUTED);\n        body.addView(youtubeStatus);\n        gap(body, 6);\n'''
new_status = '''        youtubeStatus = tv("", 10, false);\n        youtubeStatus.setTextColor(MUTED);\n        youtubeStatus.setVisibility(View.GONE);\n        body.addView(youtubeStatus);\n        gap(body, 4);\n'''
assert old_status in s, 'youtube status anchor missing'
s = s.replace(old_status, new_status, 1)

# Remplacer les gros contrôles par une barre compacte + ligne de temps déplaçable.
old_controls = '''        Button play = button("▶"); Button pause = button("Ⅱ"); Button stop = button("■"); Button local = button("Fichier");\n        soft(play); soft(pause); soft(stop); secondary(local);\n        controls.addView(play, new LinearLayout.LayoutParams(0, WRAP, 1f));\n        controls.addView(pause, new LinearLayout.LayoutParams(0, WRAP, 1f));\n        controls.addView(stop, new LinearLayout.LayoutParams(0, WRAP, 1f));\n        controls.addView(local, new LinearLayout.LayoutParams(0, WRAP, 1.5f));\n        body.addView(controls);\n        Button openYoutube = button("Ouvrir dans YouTube si la vidéo est bloquée");\n        soft(openYoutube);\n        openYoutube.setMinHeight(dp(34));\n        openYoutube.setOnClickListener(v -> openYoutubeExternally());\n        body.addView(openYoutube);\n'''
new_controls = '''        LinearLayout scrubRow = new LinearLayout(this);\n        scrubRow.setOrientation(LinearLayout.HORIZONTAL);\n        scrubRow.setGravity(android.view.Gravity.CENTER_VERTICAL);\n        musicTimeline = new SeekBar(this);\n        musicTimeline.setMax(1000);\n        musicTimeline.setProgress(0);\n        musicTime = tv("00:00 / 00:00", 10, false);\n        musicTime.setTextColor(MUTED);\n        scrubRow.addView(musicTimeline, new LinearLayout.LayoutParams(0, dp(34), 1f));\n        LinearLayout.LayoutParams timeLp = new LinearLayout.LayoutParams(WRAP, WRAP);\n        timeLp.leftMargin = dp(6);\n        scrubRow.addView(musicTime, timeLp);\n        body.addView(scrubRow);\n\n        Button play = button("▶"); Button pause = button("Ⅱ"); Button stop = button("■"); Button local = button("Fichier");\n        soft(play); soft(pause); soft(stop); secondary(local);\n        play.setMinHeight(dp(34)); pause.setMinHeight(dp(34)); stop.setMinHeight(dp(34)); local.setMinHeight(dp(34));\n        controls.addView(play, new LinearLayout.LayoutParams(0, dp(40), 1f));\n        controls.addView(pause, new LinearLayout.LayoutParams(0, dp(40), 1f));\n        controls.addView(stop, new LinearLayout.LayoutParams(0, dp(40), 1f));\n        controls.addView(local, new LinearLayout.LayoutParams(0, dp(40), 1.45f));\n        body.addView(controls);\n\n        youtubeFallback = button("Ouvrir dans YouTube");\n        soft(youtubeFallback);\n        youtubeFallback.setMinHeight(dp(32));\n        youtubeFallback.setVisibility(View.GONE);\n        youtubeFallback.setOnClickListener(v -> openYoutubeExternally());\n        body.addView(youtubeFallback);\n\n        musicTimeline.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener() {\n            @Override public void onProgressChanged(SeekBar seekBar, int progress, boolean fromUser) {}\n            @Override public void onStartTrackingTouch(SeekBar seekBar) { musicSeeking = true; }\n            @Override public void onStopTrackingTouch(SeekBar seekBar) {\n                double ratio = seekBar.getProgress() / 1000.0;\n                if (localMode && localPlayer != null) {\n                    try {\n                        int duration = localPlayer.getDuration();\n                        localPlayer.seekTo((int) Math.round(duration * ratio));\n                    } catch (Exception ignored) {}\n                } else if (youtubeWeb != null) {\n                    youtubeWeb.evaluateJavascript("seekY(" + ratio + ");", null);\n                }\n                musicSeeking = false;\n            }\n        });\n        startMusicProgressLoop();\n'''
assert old_controls in s, 'V9 controls block missing'
s = s.replace(old_controls, new_controls, 1)

# Bridge : progression, erreur et état du lecteur.
old_error_tail = '''                    youtubeStatus.setText("YouTube refuse la lecture intégrée de ce morceau (" + code + "). Essaie un autre lien ou ouvre-le dans YouTube.");\n                    youtubeStatus.setTextColor(CLAYER());\n'''
new_error_tail = '''                    youtubeStatus.setText("Cette vidéo refuse la lecture intégrée (" + code + ").");\n                    youtubeStatus.setTextColor(CLAYER());\n                    youtubeStatus.setVisibility(View.VISIBLE);\n                    if (youtubeFallback != null) youtubeFallback.setVisibility(View.VISIBLE);\n'''
assert old_error_tail in s, 'youtube error bridge anchor missing'
s = s.replace(old_error_tail, new_error_tail, 1)

old_ready = '''        public void onYoutubeReady() {\n            runOnUiThread(() -> {\n                if (youtubeStatus != null) {\n                    youtubeStatus.setText("Lecteur YouTube prêt");\n                    youtubeStatus.setTextColor(CLAYER());\n                }\n            });\n        }\n'''
new_ready = '''        public void onYoutubeReady() {\n            runOnUiThread(() -> {\n                if (youtubeStatus != null) youtubeStatus.setVisibility(View.GONE);\n                if (youtubeFallback != null) youtubeFallback.setVisibility(View.GONE);\n            });\n        }\n\n        @JavascriptInterface\n        public void onYoutubeProgress(final double current, final double duration) {\n            runOnUiThread(() -> updateMusicTimeline(current, duration));\n        }\n'''
assert old_ready in s, 'youtube ready bridge anchor missing'
s = s.replace(old_ready, new_ready, 1)

# Méthodes de progression et formatage.
html_anchor = '    private String youtubeHtml() {\n'
helpers = '''    private void startMusicProgressLoop() {\n        musicUiHandler.removeCallbacks(musicProgressRunnable);\n        musicUiHandler.post(musicProgressRunnable);\n    }\n\n    private void stopMusicProgressLoop() {\n        musicUiHandler.removeCallbacks(musicProgressRunnable);\n    }\n\n    private void updateMusicTimeline(double current, double duration) {\n        if (musicTimeline == null || musicSeeking) return;\n        if (duration > 0) {\n            int progress = (int) Math.round(Math.max(0.0, Math.min(1.0, current / duration)) * 1000.0);\n            musicTimeline.setProgress(progress);\n        } else {\n            musicTimeline.setProgress(0);\n        }\n        if (musicTime != null) musicTime.setText(formatMusicTime(current) + " / " + formatMusicTime(duration));\n    }\n\n    private String formatMusicTime(double seconds) {\n        int total = (int) Math.max(0, Math.floor(seconds));\n        int minutes = total / 60;\n        int secs = total % 60;\n        return String.format("%02d:%02d", minutes, secs);\n    }\n\n'''
assert html_anchor in s, 'youtubeHtml anchor missing'
s = s.replace(html_anchor, helpers + html_anchor, 1)

# Le HTML conserve un lecteur conforme, sans commandes YouTube redondantes, piloté par notre barre.
pattern = re.compile(r'    private String youtubeHtml\(\) \{.*?\n    \}\n\n    private void loadYoutube', re.S)
new_html = '''    private String youtubeHtml() {\n        return "<!doctype html><html><head>" +\n                "<meta name='viewport' content='width=device-width,initial-scale=1,maximum-scale=1'>" +\n                "<meta name='referrer' content='strict-origin-when-cross-origin'>" +\n                "<style>html,body,#player{margin:0;padding:0;width:100%;height:100%;background:#000;overflow:hidden} iframe{width:100%!important;height:100%!important}</style>" +\n                "</head><body><div id='player'></div><script src='https://www.youtube.com/iframe_api'></script><script>" +\n                "var player=null,ready=false,pendingId='',pendingCommands=[];" +\n                "function queueCommand(name,args){if(ready&&player&&typeof player[name]==='function'){try{player[name].apply(player,args||[]);}catch(e){}}else{pendingCommands.push([name,args||[]]);}}" +\n                "function flushCommands(){var q=pendingCommands.slice();pendingCommands=[];for(var i=0;i<q.length;i++){queueCommand(q[i][0],q[i][1]);}}" +\n                "function reportY(){if(ready&&player){try{AndroidBridge.onYoutubeProgress(player.getCurrentTime()||0,player.getDuration()||0);}catch(e){}}}" +\n                "function onYouTubeIframeAPIReady(){player=new YT.Player('player',{width:'200',height:'200',videoId:'',playerVars:{enablejsapi:1,playsinline:1,controls:0,fs:0,rel:0,autoplay:0,origin:'https://appassets.androidplatform.net',widget_referrer:'https://appassets.androidplatform.net/'},events:{" +\n                "onReady:function(e){ready=true;try{AndroidBridge.onYoutubeReady();}catch(x){} if(pendingId){var id=pendingId;pendingId='';player.cueVideoById(id);} flushCommands();reportY();}," +\n                "onStateChange:function(e){reportY();}," +\n                "onError:function(e){try{AndroidBridge.onYoutubeError(e.data||0);}catch(x){}}" +\n                "}});setInterval(reportY,500);}" +\n                "function loadId(id){pendingId=id;if(ready&&player&&player.cueVideoById){pendingId='';player.cueVideoById(id);setTimeout(reportY,300);}}" +\n                "function playY(){queueCommand('playVideo',[]);}" +\n                "function pauseY(){queueCommand('pauseVideo',[]);}" +\n                "function stopY(){queueCommand('stopVideo',[]);setTimeout(reportY,100);}" +\n                "function volY(v){queueCommand('setVolume',[v]);}" +\n                "function seekY(r){if(ready&&player){var d=player.getDuration()||0;if(d>0){player.seekTo(d*Math.max(0,Math.min(1,r)),true);setTimeout(reportY,100);}}}" +\n                "</script></body></html>";\n    }\n\n    private void loadYoutube'''
s, count = pattern.subn(new_html, s, count=1)
assert count == 1, 'youtubeHtml V11 replacement failed'

# Quand on détruit l'écran, arrêter aussi la boucle locale de progression.
destroy_anchor = '    private void destroyYoutubeWeb() {\n'
assert destroy_anchor in s, 'destroyYoutubeWeb anchor missing'
s = s.replace(destroy_anchor, destroy_anchor + '        stopMusicProgressLoop();\n', 1)

src.write_text(s, encoding='utf-8')

# V11 distincte.
gradle = Path('app/build.gradle')
g = gradle.read_text(encoding='utf-8')
g = re.sub(r"applicationId '[^']+'", "applicationId 'fr.prendresoindesonhetre.meditationshetre.v11'", g)
g = re.sub(r'versionCode\s+\d+', 'versionCode 110', g)
g = re.sub(r"versionName '[^']+'", "versionName '11.0'", g)
gradle.write_text(g, encoding='utf-8')

manifest = Path('app/src/main/AndroidManifest.xml')
m = manifest.read_text(encoding='utf-8')
m = m.replace('Mes Méditations Hêtre V10', 'Mes Méditations Hêtre V11')
manifest.write_text(m, encoding='utf-8')

print('V11 compact square player + seek timeline + transition volume applied', len(s))
