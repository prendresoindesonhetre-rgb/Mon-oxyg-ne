from pathlib import Path
import runpy, re

# Repartir exactement de la V9 testée, puis ne corriger que le lecteur vidéo/commandes.
runpy.run_path('v9_patch.py', run_name='__main__')

src = Path('app/src/main/java/fr/prendresoindesonhetre/chronomeditation/MainActivity.java')
s = src.read_text(encoding='utf-8')

# WebResourceRequest permet de distinguer la navigation principale des sous-frames YouTube.
if 'import android.webkit.WebResourceRequest;' not in s:
    s = s.replace('import android.webkit.WebViewClient;\n',
                  'import android.webkit.WebResourceRequest;\nimport android.webkit.WebViewClient;\n')

# Ne jamais laisser YouTube remplacer notre page lecteur par la page mobile YouTube.
old_client = '        youtubeWeb.setWebViewClient(new WebViewClient());\n'
new_client = '''        youtubeWeb.setWebViewClient(new WebViewClient() {\n            @Override\n            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {\n                if (request.isForMainFrame()) {\n                    String target = request.getUrl().toString();\n                    // Notre document doit rester la page principale. Les sous-frames YouTube restent autorisées.\n                    if (!target.startsWith("https://appassets.androidplatform.net/")) return true;\n                }\n                return false;\n            }\n        });\n'''
assert old_client in s, 'WebViewClient V9 anchor missing'
s = s.replace(old_client, new_client, 1)

# Vrai format vidéo lisible : environ 16:9 sur un téléphone portrait.
old_height = '        body.addView(youtubeWeb, new LinearLayout.LayoutParams(MATCH, dp(96)));\n'
new_height = '        body.addView(youtubeWeb, new LinearLayout.LayoutParams(MATCH, dp(220)));\n'
assert old_height in s, 'YouTube height V9 anchor missing'
s = s.replace(old_height, new_height, 1)

# Lecteur IFrame officiel avec file de commandes : aucun appui n’est perdu pendant le chargement.
pattern = re.compile(r'    private String youtubeHtml\(\) \{.*?\n    \}\n\n    private void loadYoutube', re.S)
new_html = '''    private String youtubeHtml() {\n        return "<!doctype html><html><head>" +\n                "<meta name='viewport' content='width=device-width,initial-scale=1,maximum-scale=1'>" +\n                "<meta name='referrer' content='strict-origin-when-cross-origin'>" +\n                "<style>html,body,#player{margin:0;padding:0;width:100%;height:100%;background:#000;overflow:hidden} iframe{width:100%!important;height:100%!important}</style>" +\n                "</head><body><div id='player'></div><script src='https://www.youtube.com/iframe_api'></script><script>" +\n                "var player=null,ready=false,pendingId='',pendingCommands=[];" +\n                "function queueCommand(name,args){if(ready&&player&&typeof player[name]==='function'){try{player[name].apply(player,args||[]);}catch(e){}}else{pendingCommands.push([name,args||[]]);}}" +\n                "function flushCommands(){var q=pendingCommands.slice();pendingCommands=[];for(var i=0;i<q.length;i++){queueCommand(q[i][0],q[i][1]);}}" +\n                "function onYouTubeIframeAPIReady(){player=new YT.Player('player',{width:'100%',height:'100%',videoId:'',playerVars:{enablejsapi:1,playsinline:1,controls:1,fs:1,rel:0,autoplay:0,origin:'https://appassets.androidplatform.net',widget_referrer:'https://appassets.androidplatform.net/'},events:{" +\n                "onReady:function(e){ready=true;try{AndroidBridge.onYoutubeReady();}catch(x){} if(pendingId){var id=pendingId;pendingId='';player.cueVideoById(id);} flushCommands();}," +\n                "onError:function(e){try{AndroidBridge.onYoutubeError(e.data||0);}catch(x){}}" +\n                "}});}" +\n                "function loadId(id){pendingId=id;if(ready&&player&&player.cueVideoById){pendingId='';player.cueVideoById(id);}}" +\n                "function playY(){queueCommand('playVideo',[]);}" +\n                "function pauseY(){queueCommand('pauseVideo',[]);}" +\n                "function stopY(){queueCommand('stopVideo',[]);}" +\n                "function volY(v){queueCommand('setVolume',[v]);}" +\n                "</script></body></html>";\n    }\n\n    private void loadYoutube'''
s, count = pattern.subn(new_html, s, count=1)
assert count == 1, 'youtubeHtml V10 replacement failed'

src.write_text(s, encoding='utf-8')

# V10 distincte afin de ne pas mélanger l’APK avec la V9 installée.
gradle = Path('app/build.gradle')
g = gradle.read_text(encoding='utf-8')
g = re.sub(r"applicationId '[^']+'", "applicationId 'fr.prendresoindesonhetre.meditationshetre.v10'", g)
g = re.sub(r'versionCode\s+\d+', 'versionCode 100', g)
g = re.sub(r"versionName '[^']+'", "versionName '10.0'", g)
gradle.write_text(g, encoding='utf-8')

manifest = Path('app/src/main/AndroidManifest.xml')
m = manifest.read_text(encoding='utf-8')
m = m.replace('Mes Méditations Hêtre V9', 'Mes Méditations Hêtre V10')
manifest.write_text(m, encoding='utf-8')

print('V10 large YouTube player + queued controls applied', len(s))
