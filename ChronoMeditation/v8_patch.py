from pathlib import Path
import gzip, base64
parts=[]
for p in sorted(Path('.').glob('v8_part*.txt'), key=lambda x:int(x.stem.replace('v8_part',''))):
    parts.append(p.read_text().strip())
java=gzip.decompress(base64.b64decode(''.join(parts)))
root=Path('.')
(root/'app/src/main/java/fr/prendresoindesonhetre/chronomeditation').mkdir(parents=True, exist_ok=True)
(root/'app/src/main/java/fr/prendresoindesonhetre/chronomeditation/MainActivity.java').write_bytes(java)
(root/'app/build.gradle').write_text("""plugins { id 'com.android.application' }

android {
    namespace 'fr.prendresoindesonhetre.chronomeditation'
    compileSdk 35
    defaultConfig {
        applicationId 'fr.prendresoindesonhetre.meditationshetre.v8'
        minSdk 26
        targetSdk 35
        versionCode 80
        versionName '8.0'
    }
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }
}
""")
(root/'app/src/main/AndroidManifest.xml').write_text("""<manifest xmlns:android=\"http://schemas.android.com/apk/res/android\">
    <uses-permission android:name=\"android.permission.VIBRATE\" />
    <uses-permission android:name=\"android.permission.INTERNET\" />
    <application android:allowBackup=\"true\" android:label=\"Mes Méditations Hêtre V8\" android:theme=\"@style/AppTheme\">
        <activity android:name=\"fr.prendresoindesonhetre.chronomeditation.MainActivity\" android:screenOrientation=\"portrait\" android:exported=\"true\">
            <intent-filter>
                <action android:name=\"android.intent.action.MAIN\" />
                <category android:name=\"android.intent.category.LAUNCHER\" />
            </intent-filter>
        </activity>
    </application>
</manifest>
""")
(root/'app/src/main/res/values/styles.xml').write_text("""<resources>
    <style name=\"AppTheme\" parent=\"android:style/Theme.Material.Light.NoActionBar\">
        <item name=\"android:fontFamily\">sans</item>
        <item name=\"android:colorAccent\">#608C89</item>
        <item name=\"android:navigationBarColor\">#F5F1EA</item>
        <item name=\"android:statusBarColor\">#F5F1EA</item>
        <item name=\"android:windowLightStatusBar\">true</item>
        <item name=\"android:windowLightNavigationBar\">true</item>
    </style>
</resources>
""")
print('V8 applied', len(java))
