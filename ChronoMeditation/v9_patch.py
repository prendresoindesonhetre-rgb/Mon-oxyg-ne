from pathlib import Path
import runpy, re

# Repartir exactement de la V8 validée, puis ne corriger que navigation + musique.
runpy.run_path('v8_patch.py', run_name='__main__')

src = Path('app/src/main/java/fr/prendresoindesonhetre/chronomeditation/MainActivity.java')
s = src.read_text(encoding='utf-8')

# Imports nécessaires à une WebView YouTube correctement contextualisée.
s = s.replace('import android.webkit.WebChromeClient;\n',
              'import android.webkit.CookieManager;\nimport android.webkit.JavascriptInterface;\nimport android.webkit.WebChromeClient;\n')

# Etat de navigation + références du panneau musique.
needle = '    private boolean localMode = false;\n'
insert = '''    private boolean localMode = false;\n    private String loadedYoutubeUrl = "";\n    private TextView youtubeStatus;\n    private LinearLayout musicBody;\n    private Button musicToggle;\n\n    private static final int SCREEN_HOME = 0;\n    private static final int SCREEN_MUSIC_SETTINGS = 1;\n    private static final int SCREEN_SESSION = 2;\n    private int screenMode = SCREEN_HOME;\n'''
assert needle in s, 'music fields anchor missing'
s = s.replace(needle, insert, 1)

# Gestion système du bouton Retour : jamais de fermeture accidentelle.
oncreate = '''    @Override\n    protected void onCreate(Bundle savedInstanceState) {\n        super.onCreate(savedInstanceState);\n        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);\n        buildPhases();\n        showHome();\n    }\n'''
back_impl = oncreate + '''\n    @Override\n    public void onBackPressed() {\n        if (screenMode == SCREEN_SESSION) {\n            // Premier retour : simplement refermer la musique si elle est ouverte.\n            if (musicExpanded && musicBody != null) {\n                musicExpanded = false;\n                musicBody.setVisibility(View.GONE);\n                if (musicToggle != null) musicToggle.setText("Ouvrir");\n                return;\n            }\n            // Sinon revenir à l'accueil de l'application, sans la quitter.\n            stopTicker();\n            pauseMusic();\n            destroyYoutubeWeb();\n            showHome();\n            return;\n        }\n        if (screenMode == SCREEN_MUSIC_SETTINGS) {\n            showHome();\n            return;\n        }\n        // Sur l'accueil, Retour ne ferme pas l'application.\n        Toast.makeText(this, "Vous êtes déjà à l’accueil", Toast.LENGTH_SHORT).show();\n    }\n\n    private void destroyYoutubeWeb() {\n        if (youtubeWeb != null) {\n            try { youtubeWeb.stopLoading(); } catch (Exception ignored) {}\n            try { youtubeWeb.loadUrl("about:blank"); } catch (Exception ignored) {}\n            try { youtubeWeb.destroy(); } catch (Exception ignored) {}\n            youtubeWeb = null;\n        }\n    }\n\n    public class YouTubeBridge {\n        @JavascriptInterface\n        public void onYoutubeError(final int code) {\n            runOnUiThread(() -> {\n                if (youtubeStatus != null) {\n                    youtubeStatus.setText("YouTube refuse la lecture intégrée de ce morceau (" + code + "). Essaie un autre lien ou ouvre-le dans YouTube.");\n                    youtubeStatus.setTextColor(CLAYER());\n                }\n            });\n        }\n\n        @JavascriptInterface\n        public void onYoutubeReady() {\n            runOnUiThread(() -> {\n                if (youtubeStatus != null) {\n                    youtubeStatus.setText("Lecteur YouTube prêt");\n                    youtubeStatus.setTextColor(CLAYER());\n                }\n            });\n        }\n    }\n'''
assert oncreate in s, 'onCreate anchor missing'
s = s.replace(oncreate, back_impl, 1)

# Etat d'écran.
for signature, line in [
    ('    private void showHome() {\n', '        screenMode = SCREEN_HOME;\n'),
    ('    private void showMusicSettings() {\n', '        screenMode = SCREEN_MUSIC_SETTINGS;\n'),
    ('    private void startSession() {\n', '        screenMode = SCREEN_SESSION;\n')]:
    assert signature in s, f'{signature.strip()} missing'
    s = s.replace(signature, signature + line, 1)

# Garder les références du corps et du bouton pour que Retour replie d'abord la musique.
assert '        Button toggle = button("Ouvrir");\n' in s
s = s.replace('        Button toggle = button("Ouvrir");\n',
              '        musicToggle = button("Ouvrir");\n        Button toggle = musicToggle;\n', 1)
assert '        LinearLayout body = new LinearLayout(this);\n' in s
s = s.replace('        LinearLayout body = new LinearLayout(this);\n',
              '        musicBody = new LinearLayout(this);\n        LinearLayout body = musicBody;\n', 1)

# WebView : origine HTTPS stable, cookies tiers, lecture déclenchable via les boutons de l'app.
old_web = '''        youtubeWeb = new WebView(this);\n        WebSettings ws = youtubeWeb.getSettings();\n        ws.setJavaScriptEnabled(true);\n        ws.setDomStorageEnabled(true);\n        ws.setMediaPlaybackRequiresUserGesture(true);\n        youtubeWeb.setWebChromeClient(new WebChromeClient());\n        youtubeWeb.setWebViewClient(new WebViewClient());\n        youtubeWeb.setBackgroundColor(PAPER);\n        youtubeWeb.loadDataWithBaseURL("https://www.youtube.com", youtubeHtml(), "text/html", "UTF-8", null);\n        body.addView(youtubeWeb, new LinearLayout.LayoutParams(MATCH, dp(82)));\n        gap(body, 6);\n'''
new_web = '''        youtubeWeb = new WebView(this);\n        WebSettings ws = youtubeWeb.getSettings();\n        ws.setJavaScriptEnabled(true);\n        ws.setDomStorageEnabled(true);\n        ws.setMediaPlaybackRequiresUserGesture(false);\n        ws.setAllowFileAccess(false);\n        ws.setAllowContentAccess(true);\n        youtubeWeb.setWebChromeClient(new WebChromeClient());\n        youtubeWeb.setWebViewClient(new WebViewClient());\n        youtubeWeb.addJavascriptInterface(new YouTubeBridge(), "AndroidBridge");\n        CookieManager.getInstance().setAcceptCookie(true);\n        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {\n            CookieManager.getInstance().setAcceptThirdPartyCookies(youtubeWeb, true);\n        }\n        youtubeWeb.setBackgroundColor(PAPER);\n        // appassets.androidplatform.net donne au lecteur un vrai contexte HTTPS/origin au lieu d'une page sans identité.\n        youtubeWeb.loadDataWithBaseURL("https://appassets.androidplatform.net/", youtubeHtml(), "text/html", "UTF-8", null);\n        body.addView(youtubeWeb, new LinearLayout.LayoutParams(MATCH, dp(96)));\n        youtubeStatus = tv("Choisis un morceau", 11, false);\n        youtubeStatus.setTextColor(MUTED);\n        body.addView(youtubeStatus);\n        gap(body, 6);\n'''
assert old_web in s, 'webview block missing'
s = s.replace(old_web, new_web, 1)

# Ajouter un bouton de secours sans supprimer les contrôles intégrés.
old_controls = '''        Button play = button("▶"); Button pause = button("Ⅱ"); Button stop = button("■"); Button local = button("Fichier");\n        soft(play); soft(pause); soft(stop); secondary(local);\n        controls.addView(play, new LinearLayout.LayoutParams(0, WRAP, 1f));\n        controls.addView(pause, new LinearLayout.LayoutParams(0, WRAP, 1f));\n        controls.addView(stop, new LinearLayout.LayoutParams(0, WRAP, 1f));\n        controls.addView(local, new LinearLayout.LayoutParams(0, WRAP, 1.5f));\n        body.addView(controls);\n'''
new_controls = '''        Button play = button("▶"); Button pause = button("Ⅱ"); Button stop = button("■"); Button local = button("Fichier");\n        soft(play); soft(pause); soft(stop); secondary(local);\n        controls.addView(play, new LinearLayout.LayoutParams(0, WRAP, 1f));\n        controls.addView(pause, new LinearLayout.LayoutParams(0, WRAP, 1f));\n        controls.addView(stop, new LinearLayout.LayoutParams(0, WRAP, 1f));\n        controls.addView(local, new LinearLayout.LayoutParams(0, WRAP, 1.5f));\n        body.addView(controls);\n        Button openYoutube = button("Ouvrir dans YouTube si la vidéo est bloquée");\n        soft(openYoutube);\n        openYoutube.setMinHeight(dp(34));\n        openYoutube.setOnClickListener(v -> openYoutubeExternally());\n        body.addView(openYoutube);\n'''
assert old_controls in s, 'controls block missing'
s = s.replace(old_controls, new_controls, 1)

# Remplacer le HTML du lecteur par une version conforme : origin + referrer + retour d'erreur vers Android.
pattern = re.compile(r'    private String youtubeHtml\(\) \{.*?\n    \}\n\n    private void loadYoutube', re.S)
new_html = '''    private String youtubeHtml() {\n        return "<!doctype html><html><head>" +\n                "<meta name='viewport' content='width=device-width,initial-scale=1'>" +\n                "<meta name='referrer' content='strict-origin-when-cross-origin'>" +\n                "<style>html,body,#player{margin:0;padding:0;width:100%;height:100%;background:#FFFCF7;overflow:hidden}</style>" +\n                "</head><body><div id='player'></div><script src='https://www.youtube.com/iframe_api'></script><script>" +\n                "var player=null,pending='';" +\n                "function onYouTubeIframeAPIReady(){player=new YT.Player('player',{width:'100%',height:'100%',videoId:'',playerVars:{enablejsapi:1,playsinline:1,controls:1,rel:0,origin:'https://appassets.androidplatform.net',widget_referrer:'https://appassets.androidplatform.net/'},events:{" +\n                "onReady:function(e){try{AndroidBridge.onYoutubeReady();}catch(x){} if(pending){player.cueVideoById(pending);pending='';}}," +\n                "onError:function(e){try{AndroidBridge.onYoutubeError(e.data||0);}catch(x){}}" +\n                "}});}" +\n                "function loadId(id){if(player&&player.cueVideoById){player.cueVideoById(id);}else{pending=id;}}" +\n                "function playY(){if(player)player.playVideo();}function pauseY(){if(player)player.pauseVideo();}function stopY(){if(player)player.stopVideo();}function volY(v){if(player)player.setVolume(v);}" +\n                "</script></body></html>";\n    }\n\n    private void loadYoutube'''
s, count = pattern.subn(new_html, s, count=1)
assert count == 1, 'youtubeHtml method replacement failed'

# Mémoriser aussi l'URL originale et donner un état clair.
old_load = '''        localMode = false;\n        releaseLocalPlayer();\n        loadedYoutubeId = id;\n        youtubeWeb.evaluateJavascript("loadId('" + id + "');volY(" + musicVolume + ");", null);\n'''
new_load = '''        localMode = false;\n        releaseLocalPlayer();\n        loadedYoutubeId = id;\n        loadedYoutubeUrl = url;\n        if (youtubeStatus != null) {\n            youtubeStatus.setText("Chargement du morceau…");\n            youtubeStatus.setTextColor(MUTED);\n        }\n        youtubeWeb.evaluateJavascript("loadId('" + id + "');volY(" + musicVolume + ");", null);\n'''
assert old_load in s, 'loadYoutube anchor missing'
s = s.replace(old_load, new_load, 1)

# Fallback explicite vers l'application YouTube / navigateur si les droits de la vidéo interdisent l'embed.
anchor = '    private String youtubeId(String url) {\n'
external = '''    private void openYoutubeExternally() {\n        if (loadedYoutubeUrl == null || loadedYoutubeUrl.trim().isEmpty()) {\n            Toast.makeText(this, "Choisis d’abord une musique YouTube", Toast.LENGTH_SHORT).show();\n            return;\n        }\n        try {\n            Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(loadedYoutubeUrl));\n            startActivity(intent);\n        } catch (Exception e) {\n            Toast.makeText(this, "Impossible d’ouvrir YouTube", Toast.LENGTH_SHORT).show();\n        }\n    }\n\n'''
assert anchor in s, 'youtubeId anchor missing'
s = s.replace(anchor, external + anchor, 1)

src.write_text(s, encoding='utf-8')

# V9 distincte pour ne pas risquer de mélanger les APK précédents.
gradle = Path('app/build.gradle')
g = gradle.read_text(encoding='utf-8')
g = re.sub(r"applicationId '[^']+'", "applicationId 'fr.prendresoindesonhetre.meditationshetre.v9'", g)
g = re.sub(r'versionCode\s+\d+', 'versionCode 90', g)
g = re.sub(r"versionName '[^']+'", "versionName '9.0'", g)
gradle.write_text(g, encoding='utf-8')

manifest = Path('app/src/main/AndroidManifest.xml')
m = manifest.read_text(encoding='utf-8')
m = m.replace('Mes Méditations Hêtre V8', 'Mes Méditations Hêtre V9')
# Désactive le callback prédictif Android 13+ afin que notre onBackPressed contrôlé soit utilisé.
if 'android:enableOnBackInvokedCallback=' not in m:
    m = m.replace('android:allowBackup="true"', 'android:allowBackup="true"\n        android:enableOnBackInvokedCallback="false"')
manifest.write_text(m, encoding='utf-8')

print('V9 navigation + YouTube fixes applied', len(s))
