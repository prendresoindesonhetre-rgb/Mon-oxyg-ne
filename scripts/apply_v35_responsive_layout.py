from pathlib import Path
import re
import sys

MODE = sys.argv[1] if len(sys.argv) > 1 else "all"


def patch_android():
    path = Path('app/src/main/java/fr/prendresoindesonhetre/monoxygene/MainActivity.java')
    s = path.read_text(encoding='utf-8')

    # Supprimer la bascule téléphone/tablette : le même moteur de mise en page
    # s'adapte désormais de façon continue au rapport largeur/hauteur.
    old_branch = '            if(isTabletLayout()){ drawIntroTablet(c); return; }\n'
    if old_branch not in s:
        raise SystemExit('Branche tablette v22 introuvable')
    s = s.replace(old_branch, '', 1)

    helper_marker = '        boolean isTabletLayout(){\n'
    helpers = '''        float clampf(float v,float lo,float hi){ return Math.max(lo,Math.min(hi,v)); }\n\n        float screenAspect(){\n            return (float)getWidth()/Math.max(1f,(float)getHeight());\n        }\n\n        // 0 = écran large type téléphone 16:9/20:9, 1 = écran plus carré type tablette.\n        // La valeur est continue : aucun saut brutal entre téléphone et tablette.\n        float squareBlend(){\n            return clampf((1.82f-screenAspect())/.49f,0f,1f);\n        }\n\n        float introPanelFraction(){\n            return .453f + (.625f-.453f)*squareBlend();\n        }\n\n        float settingsPanelFraction(){\n            return .443f + (.615f-.443f)*squareBlend();\n        }\n\n'''
    if helper_marker not in s:
        raise SystemExit('Point insertion helpers responsive introuvable')
    s = s.replace(helper_marker, helpers + helper_marker, 1)

    # Intro : largeur du panneau et marges calculées sur la largeur réelle du panneau.
    old_intro_panel = '            float l=w*.505f,t=h*.055f,r=w*.958f,b=h*.945f;'
    new_intro_panel = '''            float introFrac=introPanelFraction();\n            float r=w*.968f,b=h*.955f,t=h*.045f;\n            float l=r-w*introFrac;'''
    if old_intro_panel not in s:
        raise SystemExit('Panneau intro téléphone introuvable')
    s = s.replace(old_intro_panel, new_intro_panel, 1)

    old_intro_padding = '            float left=l+w*.038f, right=r-w*.038f;'
    new_intro_padding = '''            float introPanelW=r-l;\n            float left=l+introPanelW*.084f, right=r-introPanelW*.084f;'''
    if old_intro_padding not in s:
        raise SystemExit('Marges intro introuvables')
    s = s.replace(old_intro_padding, new_intro_padding, 1)

    old_intro_nav = '''            backBtn.set(l+w*.030f,h*.842f,l+w*.150f,h*.925f);\n            nextBtn.set(r-w*.205f,h*.842f,r-w*.030f,h*.925f);'''
    new_intro_nav = '''            backBtn.set(l+introPanelW*.060f,h*.842f,l+introPanelW*.305f,h*.925f);\n            nextBtn.set(r-introPanelW*.390f,h*.842f,r-introPanelW*.060f,h*.925f);'''
    if old_intro_nav not in s:
        raise SystemExit('Navigation intro v8 introuvable')
    s = s.replace(old_intro_nav, new_intro_nav, 1)

    old_skip = '            skipBtn.set(r-w*.115f,t+h*.020f,r-w*.025f,t+h*.063f);'
    new_skip = '            skipBtn.set(r-introPanelW*.255f,t+h*.020f,r-introPanelW*.055f,t+h*.068f);'
    if old_skip not in s:
        raise SystemExit('Bouton Passer introuvable')
    s = s.replace(old_skip, new_skip, 1)

    old_dots = '            float dotY=h*.814f; float spacing=w*.014f; float start=(l+r)/2f-spacing*(introTitles.length-1)/2f;'
    new_dots = '            float dotY=h*.814f; float spacing=Math.min(introPanelW*.032f,h*.030f); float start=(l+r)/2f-spacing*(introTitles.length-1)/2f;'
    if old_dots not in s:
        raise SystemExit('Points intro introuvables')
    s = s.replace(old_dots, new_dots, 1)

    # Réglages : le panneau s'élargit progressivement quand l'écran devient plus carré.
    old_settings_panel = '            float l=w*.525f,t=h*.040f,r=w*.968f,b=h*.960f;'
    new_settings_panel = '''            float settingsFrac=settingsPanelFraction();\n            float r=w*.975f,b=h*.965f,t=h*.035f;\n            float l=r-w*settingsFrac;\n            float settingsPanelW=r-l;'''
    if old_settings_panel not in s:
        raise SystemExit('Panneau réglages introuvable')
    s = s.replace(old_settings_panel, new_settings_panel, 1)

    old_settings_x = '            float x=l+w*.033f;'
    new_settings_x = '            float x=l+settingsPanelW*.074f;'
    if old_settings_x not in s:
        raise SystemExit('Marge réglages introuvable')
    s = s.replace(old_settings_x, new_settings_x, 1)

    old_toggles = '''            inhaleFirstBtn.set(x,h*.620f,x+w*.162f,h*.674f);\n            exhaleFirstBtn.set(x+w*.178f,h*.620f,x+w*.340f,h*.674f);'''
    new_toggles = '''            inhaleFirstBtn.set(x,h*.620f,x+settingsPanelW*.365f,h*.674f);\n            exhaleFirstBtn.set(x+settingsPanelW*.402f,h*.620f,x+settingsPanelW*.767f,h*.674f);'''
    if old_toggles not in s:
        raise SystemExit('Boutons Inspire/Expire introuvables')
    s = s.replace(old_toggles, new_toggles, 1)

    # Les cartes de rythmes utilisent la largeur du panneau plutôt que la largeur totale écran.
    old_chips = '            float chipGap=w*.008f, chipW=(r-l-w*.066f-2*chipGap)/3f;'
    new_chips = '            float chipGap=settingsPanelW*.018f, chipW=(settingsPanelW*.852f-2*chipGap)/3f;'
    if old_chips not in s:
        raise SystemExit('Calcul cartes rythmes introuvable')
    s = s.replace(old_chips, new_chips, 1)
    s = s.replace('r-w*.033f,h*.835f);', 'r-settingsPanelW*.074f,h*.835f);', 1)

    old_start = '            startBtn.set(l+w*.085f,h*.858f,r-w*.085f,h*.925f);'
    new_start = '            startBtn.set(l+settingsPanelW*.192f,h*.858f,r-settingsPanelW*.192f,h*.925f);'
    if old_start not in s:
        raise SystemExit('Bouton démarrage introuvable')
    s = s.replace(old_start, new_start, 1)

    old_info = '            infoBtn.set(r-w*.072f,t+h*.015f,r-w*.022f,t+h*.065f);'
    new_info = '            infoBtn.set(r-settingsPanelW*.163f,t+h*.015f,r-settingsPanelW*.050f,t+h*.065f);'
    if old_info not in s:
        raise SystemExit('Bouton info introuvable')
    s = s.replace(old_info, new_info, 1)

    # Stepper : dimensions relatives au panneau, pas à la largeur totale du terminal.
    stepper_marker = '            int w=getWidth(),h=getHeight();\n            textFace(c,main,x,y,h*.024f,Color.rgb(55,82,101),Paint.Align.LEFT,mediumFace);'
    stepper_new = '''            int w=getWidth(),h=getHeight();\n            float settingsPanelW=w*settingsPanelFraction();\n            textFace(c,main,x,y,h*.024f,Color.rgb(55,82,101),Paint.Align.LEFT,mediumFace);'''
    if stepper_marker not in s:
        raise SystemExit('Début drawStepper introuvable')
    s = s.replace(stepper_marker, stepper_new, 1)
    s = s.replace('x+mainW+w*.007f', 'x+mainW+settingsPanelW*.016f', 1)
    s = s.replace('minus.set(x,cy-h*.025f,x+w*.047f,cy+h*.025f);', 'minus.set(x,cy-h*.025f,x+settingsPanelW*.106f,cy+h*.025f);', 1)
    s = s.replace('plus.set(x+w*.230f,cy-h*.025f,x+w*.277f,cy+h*.025f);', 'plus.set(x+settingsPanelW*.519f,cy-h*.025f,x+settingsPanelW*.625f,cy+h*.025f);', 1)
    s = s.replace('textFace(c,value,x+w*.139f,cy+h*.010f,h*.031f,Color.rgb(48,77,98),Paint.Align.CENTER,mediumFace);', 'textFace(c,value,x+settingsPanelW*.314f,cy+h*.010f,h*.031f,Color.rgb(48,77,98),Paint.Align.CENTER,mediumFace);', 1)

    # Sinusoïde : épaisseur continue selon densité + taille, sans seuil tablette.
    old_line = 'stroke.setStrokeCap(Paint.Cap.ROUND); float sinusoidLineW=isTabletLayout()?Math.max(2.8f,2.05f*getResources().getDisplayMetrics().density):Math.max(2.8f,w*.00235f); stroke.setStrokeWidth(sinusoidLineW);'
    new_line = 'stroke.setStrokeCap(Paint.Cap.ROUND); float density=getResources().getDisplayMetrics().density; float sinusoidLineW=Math.max(2.8f,Math.min(w*.00235f,2.05f*density)); stroke.setStrokeWidth(sinusoidLineW);'
    if old_line not in s:
        raise SystemExit('Trait sinusoïde v33 introuvable')
    s = s.replace(old_line, new_line, 1)

    path.write_text(s, encoding='utf-8')
    print('Android v35 : mise en page responsive continue activée sur téléphone et tablette')


def patch_pwa():
    sw = Path('pwa/www/sw.js')
    s = sw.read_text(encoding='utf-8')
    old_cache = "const CACHE_NAME = 'mon-oxygene-pwa-v14-wide-compat';"
    new_cache = "const CACHE_NAME = 'mon-oxygene-pwa-v15-responsive-auto';"
    if old_cache not in s:
        raise SystemExit('Cache PWA v14 introuvable')
    s = s.replace(old_cache, new_cache, 1)
    marker = "  './legacy.css',\n"
    addition = "  './legacy.css',\n  './responsive.css',\n  './responsive.js',\n"
    if marker not in s:
        raise SystemExit('Liste CORE PWA v34 introuvable')
    s = s.replace(marker, addition, 1)
    sw.write_text(s, encoding='utf-8')
    print('PWA v35 : ressources responsive ajoutées au cache')


if MODE in ('android', 'all'):
    patch_android()
if MODE in ('pwa', 'all'):
    patch_pwa()
if MODE not in ('android', 'pwa', 'all'):
    raise SystemExit('Mode attendu: android, pwa ou all')
