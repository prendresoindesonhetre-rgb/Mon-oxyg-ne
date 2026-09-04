from pathlib import Path

ROOT = Path(__file__).resolve().parent
JAVA = ROOT / 'app/src/main/java/fr/prendresoindesonhetre/chronomeditation/MainActivity.java'
GRADLE = ROOT / 'app/build.gradle'
MANIFEST = ROOT / 'app/src/main/AndroidManifest.xml'

JAVA.parent.mkdir(parents=True, exist_ok=True)

JAVA.write_text(r'''package fr.prendresoindesonhetre.chronomeditation;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.webkit.CookieManager;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class MainActivity extends Activity {
    private static final String APP_URL = "https://prendresoindesonhetre-rgb.github.io/Mon-oxyg-ne/regie-v14/";
    private static final int FILE_CHOOSER_REQUEST = 7401;

    private WebView webView;
    private ValueCallback<Uri[]> filePathCallback;

    @Override
    @SuppressLint("SetJavaScriptEnabled")
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        getWindow().setStatusBarColor(Color.rgb(244, 240, 234));
        getWindow().setNavigationBarColor(Color.rgb(244, 240, 234));

        webView = new WebView(this);
        webView.setBackgroundColor(Color.rgb(244, 240, 234));
        webView.setOverScrollMode(View.OVER_SCROLL_NEVER);
        setContentView(webView);

        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setAllowContentAccess(true);
        s.setAllowFileAccess(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setLoadWithOverviewMode(true);
        s.setUseWideViewPort(true);
        s.setBuiltInZoomControls(false);
        s.setDisplayZoomControls(false);

        CookieManager cookies = CookieManager.getInstance();
        cookies.setAcceptCookie(true);
        cookies.setAcceptThirdPartyCookies(webView, true);

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (request.isForMainFrame()) showOfflinePage();
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (filePathCallback != null) filePathCallback.onReceiveValue(null);
                filePathCallback = callback;
                try {
                    Intent intent = params.createIntent();
                    startActivityForResult(intent, FILE_CHOOSER_REQUEST);
                } catch (Exception e) {
                    Intent intent = new Intent(Intent.ACTION_GET_CONTENT);
                    intent.addCategory(Intent.CATEGORY_OPENABLE);
                    intent.setType("audio/*");
                    startActivityForResult(Intent.createChooser(intent, "Choisir un fichier audio"), FILE_CHOOSER_REQUEST);
                }
                return true;
            }
        });

        if (savedInstanceState != null) webView.restoreState(savedInstanceState);
        else webView.loadUrl(APP_URL);
    }

    private void showOfflinePage() {
        String html = "<!doctype html><html lang='fr'><meta name='viewport' content='width=device-width,initial-scale=1'>" +
                "<body style='margin:0;background:#f4f0ea;color:#354846;font-family:system-ui;display:grid;place-items:center;min-height:100vh'>" +
                "<div style='max-width:420px;padding:30px;text-align:center'><h2>Régie de mon Hêtre</h2>" +
                "<p>La connexion est indisponible pour le moment. Tes données déjà enregistrées sur cet appareil restent dans son espace privé.</p>" +
                "<button style='border:0;border-radius:18px;padding:14px 22px;background:#789895;color:white;font-size:16px' onclick=\"location.href='" + APP_URL + "'\">Réessayer</button></div></body></html>";
        webView.loadDataWithBaseURL(APP_URL, html, "text/html", "UTF-8", null);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == FILE_CHOOSER_REQUEST && filePathCallback != null) {
            Uri[] results = WebChromeClient.FileChooserParams.parseResult(resultCode, data);
            filePathCallback.onReceiveValue(results);
            filePathCallback = null;
        }
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        webView.saveState(outState);
        super.onSaveInstanceState(outState);
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) webView.goBack();
        else super.onBackPressed();
    }

    @Override
    protected void onDestroy() {
        if (webView != null) {
            webView.stopLoading();
            webView.setWebChromeClient(null);
            webView.setWebViewClient(null);
            webView.destroy();
        }
        super.onDestroy();
    }
}
''', encoding='utf-8')

GRADLE.write_text('''plugins { id 'com.android.application' }\n\nandroid {\n    namespace 'fr.prendresoindesonhetre.chronomeditation'\n    compileSdk 35\n\n    defaultConfig {\n        applicationId 'fr.prendresoindesonhetre.meditationshetre.v14'\n        minSdk 26\n        targetSdk 35\n        versionCode 142\n        versionName '14.2-locked'\n    }\n\n    compileOptions {\n        sourceCompatibility JavaVersion.VERSION_17\n        targetCompatibility JavaVersion.VERSION_17\n    }\n}\n''', encoding='utf-8')

MANIFEST.write_text('''<manifest xmlns:android="http://schemas.android.com/apk/res/android">\n    <uses-permission android:name="android.permission.INTERNET" />\n    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />\n    <uses-permission android:name="android.permission.VIBRATE" />\n    <application\n        android:allowBackup="false"\n        android:label="Régie de mon Hêtre"\n        android:theme="@style/AppTheme"\n        android:usesCleartextTraffic="false">\n        <activity android:name=".MainActivity" android:screenOrientation="portrait" android:exported="true">\n            <intent-filter>\n                <action android:name="android.intent.action.MAIN" />\n                <category android:name="android.intent.category.LAUNCHER" />\n            </intent-filter>\n        </activity>\n    </application>\n</manifest>\n''', encoding='utf-8')

print('V14.2 locked secure wrapper applied')