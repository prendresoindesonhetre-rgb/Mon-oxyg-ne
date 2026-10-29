package fr.prendresoindesonhetre.monoxygene;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

/**
 * Mon Oxygène pour le Play Store : affiche en plein écran la version web v83 validée,
 * rangée dans l'appli (assets/web, copiée depuis pwa/www à la construction).
 * L'écran reste allumé pendant une séance, un lien vers l'extérieur s'ouvre dans le navigateur,
 * et les achats Mon Oxygène Plus passent par Google Play (voir Achats).
 */
public class MainActivity extends Activity {
    private static final String DOSSIER_WEB = "file:///android_asset/web/";

    private WebView webView;
    private Achats achats;
    private boolean dejaAffichee;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            WindowManager.LayoutParams lp = getWindow().getAttributes();
            lp.layoutInDisplayCutoutMode = Build.VERSION.SDK_INT >= Build.VERSION_CODES.R
                    ? WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_ALWAYS
                    : WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
            getWindow().setAttributes(lp);
        }

        webView = new WebView(this);
        webView.setBackgroundColor(Color.TRANSPARENT);
        webView.addJavascriptInterface(new Ecran(), "MonOxygeneEcran");
        achats = new Achats(this, webView);
        webView.addJavascriptInterface(achats, "MonOxygeneAchats");
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                if (url.startsWith(DOSSIER_WEB)) return false;
                try {
                    startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url)));
                } catch (Exception e) {
                    // Aucune appli pour ouvrir ce lien : on reste dans Mon Oxygène.
                }
                return true;
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                // La WebView d'Android ne connaît pas navigator.wakeLock, que la séance demande
                // pour garder l'écran allumé : l'appli le fournit elle-même.
                view.evaluateJavascript(
                        "if(!('wakeLock' in navigator)&&window.MonOxygeneEcran){Object.defineProperty(navigator,'wakeLock',{value:{request:function(){"
                                + "MonOxygeneEcran.garderAllume(true);return Promise.resolve({released:false,type:'screen',"
                                + "release:function(){this.released=true;MonOxygeneEcran.garderAllume(false);return Promise.resolve();},"
                                + "addEventListener:function(){},removeEventListener:function(){}});}}});}",
                        null);
            }
        });

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        // Les fichiers de l'appli (file:///android_asset) restent lisibles ; le reste du téléphone, non.
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(false);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setSupportZoom(false);
        settings.setTextZoom(100);

        setContentView(webView);
        enterImmersiveMode();
        webView.loadUrl(DOSSIER_WEB + "index.html");
    }

    /** Appelé par la page (navigator.wakeLock) au début et à la fin d'une séance. */
    private class Ecran {
        @JavascriptInterface
        public void garderAllume(final boolean allume) {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    if (allume) getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
                    else getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
                }
            });
        }
    }

    private void enterImmersiveMode() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            // À partir d'Android 15, l'appli occupe déjà tout l'écran d'office.
            if (Build.VERSION.SDK_INT < Build.VERSION_CODES.VANILLA_ICE_CREAM) {
                getWindow().setDecorFitsSystemWindows(false);
            }
            WindowInsetsController controller = getWindow().getInsetsController();
            if (controller != null) {
                controller.hide(WindowInsets.Type.systemBars());
                controller.setSystemBarsBehavior(WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
            }
        } else {
            getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN,
                    WindowManager.LayoutParams.FLAG_FULLSCREEN);
            getWindow().getDecorView().setSystemUiVisibility(
                    View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                            | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                            | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                            | View.SYSTEM_UI_FLAG_FULLSCREEN
                            | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                            | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY);
        }
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) enterImmersiveMode();
    }

    @Override
    protected void onResume() {
        super.onResume();
        enterImmersiveMode();
        if (webView != null) webView.onResume();
        // De retour dans l'appli (après Google Play par exemple) : on relit les achats.
        if (dejaAffichee && achats != null) achats.actualiser();
        dejaAffichee = true;
    }

    @Override
    protected void onPause() {
        if (webView != null) webView.onPause();
        super.onPause();
    }

    @Override
    protected void onDestroy() {
        if (achats != null) achats.fermer();
        if (webView != null) {
            webView.loadUrl("about:blank");
            webView.stopLoading();
            webView.destroy();
            webView = null;
        }
        super.onDestroy();
    }
}
