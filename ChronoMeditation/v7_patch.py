from pathlib import Path
import gzip, base64

root = Path('.')
chunks = ''.join((root / f'v7_chunk_{i}.txt').read_text().strip() for i in range(1, 6))
java = gzip.decompress(base64.b64decode(chunks))
java_dir = root / 'app/src/main/java/fr/prendresoindesonhetre/chronomeditation'
java_dir.mkdir(parents=True, exist_ok=True)
(java_dir / 'MainActivity.java').write_bytes(java)

(root / 'app/build.gradle').write_text("""plugins { id 'com.android.application' }

android {
    namespace 'fr.prendresoindesonhetre.chronomeditation'
    compileSdk 35

    defaultConfig {
        applicationId 'fr.prendresoindesonhetre.meditationshetre.v7'
        minSdk 26
        targetSdk 35
        versionCode 70
        versionName '7.0'
    }

    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }
}
""")

(root / 'app/src/main/AndroidManifest.xml').write_text("""<manifest xmlns:android=\"http://schemas.android.com/apk/res/android\">
    <uses-permission android:name=\"android.permission.VIBRATE\" />
    <application
        android:allowBackup=\"true\"
        android:label=\"Mes Méditations Hêtre V7\"
        android:theme=\"@style/AppTheme\">
        <activity
            android:name=\"fr.prendresoindesonhetre.chronomeditation.MainActivity\"
            android:screenOrientation=\"portrait\"
            android:exported=\"true\">
            <intent-filter>
                <action android:name=\"android.intent.action.MAIN\" />
                <category android:name=\"android.intent.category.LAUNCHER\" />
            </intent-filter>
        </activity>
    </application>
</manifest>
""")

(root / 'app/src/main/res/values/styles.xml').write_text("""<resources>
    <style name=\"AppTheme\" parent=\"android:style/Theme.Material.Light.NoActionBar\">
        <item name=\"android:fontFamily\">sans</item>
        <item name=\"android:windowActionModeOverlay\">true</item>
        <item name=\"android:colorAccent\">#3F7C7E</item>
        <item name=\"android:navigationBarColor\">#F4F0EA</item>
        <item name=\"android:statusBarColor\">#F4F0EA</item>
        <item name=\"android:windowLightStatusBar\">true</item>
        <item name=\"android:windowLightNavigationBar\">true</item>
    </style>
</resources>
""")

print('V7 source applied', len(java))
