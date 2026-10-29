package fr.prendresoindesonhetre.monoxygene;

import android.util.Base64;

import java.security.KeyFactory;
import java.security.PublicKey;
import java.security.Signature;
import java.security.spec.X509EncodedKeySpec;

/**
 * Vérifie la signature d'un code cadeau Mon Oxygène Plus (ECDSA P-256, SHA-256), sans connexion.
 * La clé privée qui signe les codes reste dans le générateur privé ; l'appli n'a que la clé publique.
 */
final class CodesCadeaux {
    /** Clé publique : point non compressé de 65 octets, en base64url (même valeur que dans plus.js). */
    private static final String CLE_PUBLIQUE = "BFp_yLsAnnESeqvvPyzONNNsLEWxbe3S7kv0eOwcL47mkEXNkS9z1uuBoP4w9xV-dtsHqVz0IivmJLhrFnznnPA";
    /** Début fixe d'une clé publique P-256 au format X.509, avant le point lui-même. */
    private static final byte[] ENTETE_X509 = {
            0x30, 0x59, 0x30, 0x13, 0x06, 0x07, 0x2a, (byte) 0x86, 0x48, (byte) 0xce, 0x3d, 0x02, 0x01,
            0x06, 0x08, 0x2a, (byte) 0x86, 0x48, (byte) 0xce, 0x3d, 0x03, 0x01, 0x07, 0x03, 0x42, 0x00
    };
    private static final int OPTIONS = Base64.URL_SAFE | Base64.NO_PADDING | Base64.NO_WRAP;

    private CodesCadeaux() {}

    /** contenu et signature en base64url ; la signature fait 64 octets (r puis s). */
    static boolean verifier(String contenu, String signature) {
        try {
            byte[] brute = Base64.decode(signature, OPTIONS);
            if (brute.length != 64) return false;
            Signature verification = Signature.getInstance("SHA256withECDSA");
            verification.initVerify(clePublique());
            verification.update(Base64.decode(contenu, OPTIONS));
            return verification.verify(versDer(brute));
        } catch (Exception e) {
            return false;
        }
    }

    private static PublicKey clePublique() throws Exception {
        byte[] point = Base64.decode(CLE_PUBLIQUE, OPTIONS);
        byte[] der = new byte[ENTETE_X509.length + point.length];
        System.arraycopy(ENTETE_X509, 0, der, 0, ENTETE_X509.length);
        System.arraycopy(point, 0, der, ENTETE_X509.length, point.length);
        return KeyFactory.getInstance("EC").generatePublic(new X509EncodedKeySpec(der));
    }

    /** Java attend la signature au format DER : SEQUENCE { INTEGER r, INTEGER s }. */
    private static byte[] versDer(byte[] brute) {
        byte[] r = entierDer(brute, 0);
        byte[] s = entierDer(brute, 32);
        byte[] der = new byte[2 + r.length + s.length];
        der[0] = 0x30;
        der[1] = (byte) (r.length + s.length);
        System.arraycopy(r, 0, der, 2, r.length);
        System.arraycopy(s, 0, der, 2 + r.length, s.length);
        return der;
    }

    private static byte[] entierDer(byte[] brute, int debut) {
        int i = debut;
        while (i < debut + 31 && brute[i] == 0) i++;
        boolean zeroDevant = (brute[i] & 0x80) != 0;
        int longueur = debut + 32 - i + (zeroDevant ? 1 : 0);
        byte[] entier = new byte[2 + longueur];
        entier[0] = 0x02;
        entier[1] = (byte) longueur;
        System.arraycopy(brute, i, entier, 2 + (zeroDevant ? 1 : 0), debut + 32 - i);
        return entier;
    }
}
