package fr.prendresoindesonhetre.monoxygene;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;

import com.android.billingclient.api.AcknowledgePurchaseParams;
import com.android.billingclient.api.BillingClient;
import com.android.billingclient.api.BillingClientStateListener;
import com.android.billingclient.api.BillingFlowParams;
import com.android.billingclient.api.BillingResult;
import com.android.billingclient.api.PendingPurchasesParams;
import com.android.billingclient.api.ProductDetails;
import com.android.billingclient.api.Purchase;
import com.android.billingclient.api.PurchasesUpdatedListener;
import com.android.billingclient.api.QueryProductDetailsParams;
import com.android.billingclient.api.QueryPurchasesParams;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Mon Oxygène Plus : achats Google Play, proposés à la page web de l'appli (pont « MonOxygeneAchats »).
 * Abonnement « mon_oxygene_plus » (formules au mois et à l'année, essai gratuit éventuel) et,
 * s'il existe dans la Play Console, l'achat unique « mon_oxygene_plus_a_vie ».
 * Les prix, formules et essais se règlent dans la Play Console : l'appli affiche ce que Google renvoie.
 */
final class Achats implements PurchasesUpdatedListener {
    static final String ABONNEMENT = "mon_oxygene_plus";
    static final String A_VIE = "mon_oxygene_plus_a_vie";

    private final Activity activite;
    private final WebView webView;
    private final BillingClient client;

    private final Map<String, ProductDetails> produits = new HashMap<>();
    /** Formule (base plan) de l'abonnement → jeton de l'offre à utiliser pour l'acheter. */
    private final Map<String, String> jetons = new HashMap<>();
    private final List<Purchase> achatsTrouves = new ArrayList<>();
    private int reponsesAttendues;
    private boolean pret;
    private boolean actif;
    private boolean aVie;
    private boolean enAttente;
    private String erreur;

    Achats(Activity activite, WebView webView) {
        this.activite = activite;
        this.webView = webView;
        client = BillingClient.newBuilder(activite)
                .setListener(this)
                .enablePendingPurchases(PendingPurchasesParams.newBuilder().enableOneTimeProducts().build())
                .enableAutoServiceReconnection()
                .build();
    }

    // ---------- Appels depuis la page web ----------

    @JavascriptInterface
    public void demarrer() {
        activite.runOnUiThread(this::actualiser);
    }

    @JavascriptInterface
    public void restaurer() {
        activite.runOnUiThread(this::actualiser);
    }

    @JavascriptInterface
    public void acheter(final String produit, final String plan) {
        activite.runOnUiThread(() -> lancerAchat(produit, plan));
    }

    @JavascriptInterface
    public void gerer() {
        Uri adresse = Uri.parse("https://play.google.com/store/account/subscriptions?sku=" + ABONNEMENT
                + "&package=" + activite.getPackageName());
        try {
            activite.startActivity(new Intent(Intent.ACTION_VIEW, adresse));
        } catch (Exception e) {
            // Pas de Play Store ni de navigateur : rien à ouvrir.
        }
    }

    @JavascriptInterface
    public boolean verifierCode(String contenu, String signature) {
        return CodesCadeaux.verifier(contenu, signature);
    }

    // ---------- Google Play ----------

    /** Connexion puis lecture des offres et des achats ; le résultat est envoyé à la page. */
    void actualiser() {
        if (client.isReady()) {
            interroger();
            return;
        }
        client.startConnection(new BillingClientStateListener() {
            @Override
            public void onBillingSetupFinished(BillingResult resultat) {
                activite.runOnUiThread(() -> {
                    if (resultat.getResponseCode() == BillingClient.BillingResponseCode.OK) {
                        interroger();
                    } else {
                        pret = false;
                        erreur = "Google Play indisponible (" + resultat.getResponseCode() + ")";
                        envoyer();
                    }
                });
            }

            @Override
            public void onBillingServiceDisconnected() {
                // La reconnexion est automatique au prochain appel.
            }
        });
    }

    private void interroger() {
        if (reponsesAttendues > 0) return; // une lecture est déjà en cours
        produits.clear();
        jetons.clear();
        achatsTrouves.clear();
        reponsesAttendues = 4;
        chercherProduit(ABONNEMENT, BillingClient.ProductType.SUBS);
        chercherProduit(A_VIE, BillingClient.ProductType.INAPP);
        chercherAchats(BillingClient.ProductType.SUBS);
        chercherAchats(BillingClient.ProductType.INAPP);
    }

    private void chercherProduit(String identifiant, String type) {
        QueryProductDetailsParams parametres = QueryProductDetailsParams.newBuilder()
                .setProductList(Collections.singletonList(QueryProductDetailsParams.Product.newBuilder()
                        .setProductId(identifiant)
                        .setProductType(type)
                        .build()))
                .build();
        client.queryProductDetailsAsync(parametres, (resultat, details) -> activite.runOnUiThread(() -> {
            if (resultat.getResponseCode() == BillingClient.BillingResponseCode.OK) {
                for (ProductDetails produit : details.getProductDetailsList()) produits.put(produit.getProductId(), produit);
            }
            reponseRecue();
        }));
    }

    private void chercherAchats(String type) {
        client.queryPurchasesAsync(QueryPurchasesParams.newBuilder().setProductType(type).build(),
                (resultat, achats) -> activite.runOnUiThread(() -> {
                    if (resultat.getResponseCode() == BillingClient.BillingResponseCode.OK) achatsTrouves.addAll(achats);
                    reponseRecue();
                }));
    }

    private void reponseRecue() {
        if (--reponsesAttendues > 0) return;
        actif = false;
        aVie = false;
        enAttente = false;
        traiterAchats(achatsTrouves);
        pret = true;
        erreur = null;
        envoyer();
    }

    private void traiterAchats(List<Purchase> achats) {
        for (Purchase achat : achats) {
            if (achat.getPurchaseState() == Purchase.PurchaseState.PURCHASED) {
                actif = true;
                if (achat.getProducts().contains(A_VIE)) aVie = true;
                // Google rembourse un achat non confirmé sous 3 jours : on le confirme tout de suite.
                if (!achat.isAcknowledged()) {
                    client.acknowledgePurchase(AcknowledgePurchaseParams.newBuilder()
                            .setPurchaseToken(achat.getPurchaseToken())
                            .build(), resultat -> { });
                }
            } else if (achat.getPurchaseState() == Purchase.PurchaseState.PENDING) {
                enAttente = true;
            }
        }
    }

    @Override
    public void onPurchasesUpdated(BillingResult resultat, List<Purchase> achats) {
        activite.runOnUiThread(() -> {
            int code = resultat.getResponseCode();
            if (code == BillingClient.BillingResponseCode.OK && achats != null) {
                traiterAchats(achats);
                envoyer();
            } else if (code == BillingClient.BillingResponseCode.ITEM_ALREADY_OWNED) {
                actualiser();
            }
            // Achat annulé par la personne : rien à faire.
        });
    }

    private void lancerAchat(String identifiant, String plan) {
        ProductDetails produit = produits.get(identifiant);
        if (produit == null) {
            actualiser();
            return;
        }
        BillingFlowParams.ProductDetailsParams.Builder choix = BillingFlowParams.ProductDetailsParams.newBuilder()
                .setProductDetails(produit);
        if (ABONNEMENT.equals(identifiant)) {
            String jeton = jetons.get(plan);
            if (jeton == null) return;
            choix.setOfferToken(jeton);
        }
        client.launchBillingFlow(activite, BillingFlowParams.newBuilder()
                .setProductDetailsParamsList(Collections.singletonList(choix.build()))
                .build());
    }

    // ---------- Vers la page web ----------

    private void envoyer() {
        try {
            JSONObject etat = new JSONObject();
            etat.put("pret", pret);
            etat.put("actif", actif);
            etat.put("aVie", aVie);
            etat.put("enAttente", enAttente);
            etat.put("erreur", erreur == null ? JSONObject.NULL : erreur);
            etat.put("offres", offres());
            final String script = "window.MonOxygenePlusAndroid&&window.MonOxygenePlusAndroid(" + etat + ")";
            webView.post(() -> webView.evaluateJavascript(script, null));
        } catch (Exception e) {
            // Rien d'envoyé : la page garde son dernier état.
        }
    }

    /** Une offre par formule d'abonnement (au mois, puis à l'année), puis l'achat à vie. */
    private JSONArray offres() throws Exception {
        JSONArray liste = new JSONArray();
        ProductDetails abonnement = produits.get(ABONNEMENT);
        if (abonnement != null && abonnement.getSubscriptionOfferDetails() != null) {
            Map<String, ProductDetails.SubscriptionOfferDetails> parFormule = new HashMap<>();
            for (ProductDetails.SubscriptionOfferDetails offre : abonnement.getSubscriptionOfferDetails()) {
                ProductDetails.SubscriptionOfferDetails retenue = parFormule.get(offre.getBasePlanId());
                // Google ne renvoie que les offres auxquelles la personne a droit : on préfère celle avec l'essai gratuit.
                if (retenue == null || (retenue.getOfferId() == null && offre.getOfferId() != null && aUnEssai(offre))) {
                    parFormule.put(offre.getBasePlanId(), offre);
                }
            }
            List<ProductDetails.SubscriptionOfferDetails> formules = new ArrayList<>(parFormule.values());
            Collections.sort(formules, (a, b) -> Integer.compare(ordre(periode(a)), ordre(periode(b))));
            for (ProductDetails.SubscriptionOfferDetails offre : formules) {
                jetons.put(offre.getBasePlanId(), offre.getOfferToken());
                List<ProductDetails.PricingPhase> phases = offre.getPricingPhases().getPricingPhaseList();
                ProductDetails.PricingPhase prix = phases.get(phases.size() - 1);
                JSONObject json = new JSONObject();
                json.put("produit", ABONNEMENT);
                json.put("plan", offre.getBasePlanId());
                json.put("type", "abonnement");
                json.put("prix", prix.getFormattedPrice());
                json.put("periode", prix.getBillingPeriod());
                json.put("essai", aUnEssai(offre) ? phases.get(0).getBillingPeriod() : JSONObject.NULL);
                liste.put(json);
            }
        }
        ProductDetails aVieDetails = produits.get(A_VIE);
        if (aVieDetails != null && aVieDetails.getOneTimePurchaseOfferDetails() != null) {
            JSONObject json = new JSONObject();
            json.put("produit", A_VIE);
            json.put("plan", "");
            json.put("type", "unique");
            json.put("prix", aVieDetails.getOneTimePurchaseOfferDetails().getFormattedPrice());
            json.put("periode", "");
            json.put("essai", JSONObject.NULL);
            liste.put(json);
        }
        return liste;
    }

    private static boolean aUnEssai(ProductDetails.SubscriptionOfferDetails offre) {
        List<ProductDetails.PricingPhase> phases = offre.getPricingPhases().getPricingPhaseList();
        return phases.size() > 1 && phases.get(0).getPriceAmountMicros() == 0;
    }

    private static String periode(ProductDetails.SubscriptionOfferDetails offre) {
        List<ProductDetails.PricingPhase> phases = offre.getPricingPhases().getPricingPhaseList();
        return phases.get(phases.size() - 1).getBillingPeriod();
    }

    private static int ordre(String periode) {
        if ("P1M".equals(periode)) return 0;
        if ("P1Y".equals(periode)) return 2;
        return 1;
    }

    void fermer() {
        client.endConnection();
    }
}
