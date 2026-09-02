from pathlib import Path
import sys

p = Path(sys.argv[1] if len(sys.argv) > 1 else 'pwa-dist/regie-v14/index.html')
s = p.read_text(encoding='utf-8')

css = r'''
/* PRO_HIERARCHY_V1 — hiérarchie cohérente sur toute l'application.
   Principe: les zones de travail/contenu sont grandes; les commandes restent compactes. */

:root{--ui-radius:10px;--panel-radius:14px;--ui-gap:6px}
html,body{font-size:13.5px!important}
.screen{width:min(900px,100%)!important;padding:10px 12px calc(60px + env(safe-area-inset-bottom))!important}
.card{padding:10px 12px!important;margin:7px 0!important;border-radius:var(--panel-radius)!important}
h1{font-size:23px!important;line-height:1.1!important;margin:0 0 5px!important}
h2{font-size:19px!important;line-height:1.15!important;margin:0 0 7px!important}
h3{font-size:15px!important;line-height:1.2!important}
.brand,.kicker{font-size:9px!important;letter-spacing:.12em!important}
.subtitle{font-size:12.5px!important;line-height:1.42!important;margin-bottom:10px!important}
.note,.summary,.pro-help{font-size:11px!important;line-height:1.4!important}

.btn,button.btn,.account-btn,.auth-tab{width:auto!important;min-width:0!important;min-height:27px!important;height:auto!important;padding:4px 8px!important;border-radius:8px!important;font-size:11px!important;line-height:1.1!important}
.btn.primary,button.btn.primary{min-height:29px!important;padding:5px 10px!important}
.btn.small,button.btn.small{min-height:24px!important;padding:3px 7px!important;font-size:10.5px!important}
button.btn[style*="width:100%"]{width:auto!important}
.field{margin:6px 0!important}.field span{font-size:10px!important;margin:0 0 3px 1px!important}
input[type=text],input[type=password],input[type=url],input[type=number],select{min-height:31px!important;padding:6px 8px!important;font-size:12.5px!important;border-radius:8px!important}
textarea{padding:8px 10px!important;font-size:13px!important;line-height:1.5!important;border-radius:9px!important}.row{gap:var(--ui-gap)!important}

/* Choix de l'espace */
.space-chooser{padding:8px 0 18px!important;min-height:auto!important}.space-logo{width:36px!important;height:36px!important;font-size:15px!important;margin-bottom:8px!important}.space-brand{font-size:9px!important;margin-bottom:4px!important}.space-title{font-size:30px!important;line-height:1.04!important;margin-bottom:5px!important}.space-subtitle{font-size:12.5px!important;margin-bottom:13px!important}.space-grid{gap:9px!important}.space-card{min-height:165px!important;padding:14px 15px 12px!important;border-radius:14px!important}.space-symbol{font-size:19px!important;margin-bottom:7px!important}.space-kicker{font-size:8.5px!important}.space-name{font-size:19px!important;margin-bottom:5px!important}.space-desc{font-size:11.5px!important;line-height:1.4!important;margin-bottom:7px!important}.space-enter,.space-footer{font-size:9.5px!important}.space-back{font-size:10.5px!important;min-height:23px!important;margin-bottom:4px!important}

/* Accueil / bibliothèque */
#homeView .feature-grid{gap:4px!important;margin:5px 0 8px!important}#homeView .feature{min-width:0!important;padding:3px 8px!important;font-size:9px!important}#homeView .session-list{gap:6px!important;margin:6px 0!important}#homeView .session-card{padding:9px 11px!important;border-radius:12px!important}#homeView .session-title{font-size:17px!important;margin:2px 0 5px!important}#homeView .session-meta{font-size:10.5px!important;gap:4px!important;margin-bottom:1px!important}.type-pill{font-size:8.5px!important;padding:2px 6px!important}
#homeView .session-actions,#homeView .session-more{display:flex!important;grid-template-columns:none!important;flex-wrap:wrap!important;gap:4px!important;margin-top:4px!important}#homeView .session-actions .btn,#homeView .session-more .btn{width:auto!important;height:25px!important;min-height:25px!important;padding:3px 7px!important;font-size:10.5px!important}#homeView .session-actions .btn.primary{height:27px!important;min-height:27px!important;padding:4px 9px!important}#createSessionBtn{height:28px!important;min-height:28px!important;padding:4px 10px!important;margin-top:5px!important}

/* Construction de séance : grandes zones de contenu, petites commandes */
#editView{width:min(940px,100%)!important}#editView .builder-summary{padding:7px 9px!important;margin:7px 0 8px!important;border-radius:10px!important}#editView .builder-summary strong{font-size:12px!important}#editView .builder-total{font-size:12px!important}#editView .phase-editor{padding:9px 10px!important;border-radius:12px!important;margin:7px 0!important}#editView .phase-editor-head{margin-bottom:4px!important}#editView .phase-duration-badge{font-size:9.5px!important;padding:3px 6px!important}#editView .timing-grid,#editView .pro-grid{gap:5px!important}#editView .phase-pro{margin:6px 0 8px!important;border-radius:9px!important}#editView .phase-pro summary{padding:6px 8px!important;font-size:10.5px!important}#editView .phase-pro-body{padding:0 8px 8px!important}
#editView textarea[data-k="text"]{min-height:230px!important;height:clamp(230px,34vh,430px)!important;font-family:Georgia,"Times New Roman",serif!important;font-size:15px!important;line-height:1.55!important}
#editView textarea[data-k="cue"],#editView textarea[data-k="transition"]{min-height:72px!important;height:82px!important;font-size:12.5px!important}
#editView .phase-actions{display:flex!important;grid-template-columns:none!important;gap:3px!important;margin-top:4px!important}#editView .phase-actions .btn{width:auto!important;min-width:25px!important;height:24px!important;min-height:24px!important;padding:2px 6px!important;font-size:10px!important}#editView .editor-toolbar{padding:4px!important;gap:4px!important;margin-top:6px!important;border-radius:9px!important}#editView .editor-toolbar .btn,#editView .editor-toolbar .grow{width:auto!important;flex:0 0 auto!important;min-height:27px!important}.exact-side-field,.instrument-settings{padding-top:5px!important;margin-top:5px!important}

/* Import Word / grand texte */
.maquette-launch{padding:7px 9px!important;margin:7px 0 4px!important;border-radius:10px!important}.maquette-launch strong{font-size:11.5px!important}.maquette-launch-head{gap:7px!important}.maquette-source{min-height:380px!important;height:clamp(380px,58vh,650px)!important;font-size:15px!important;line-height:1.55!important;padding:12px 14px!important}.maquette-drop{padding:7px 8px!important;margin:6px 0!important;border-radius:9px!important}.maquette-preview{gap:5px!important;margin:8px 0!important}.maquette-phase{padding:6px 8px!important;border-radius:9px!important}.maquette-phase-name{font-size:11.5px!important}.maquette-phase-time{font-size:10px!important}.maquette-tag{font-size:8.5px!important;padding:2px 5px!important}.maquette-summary{padding:6px 8px!important;margin:6px 0!important;border-radius:9px!important;font-size:11px!important}.maquette-actions{display:flex!important;grid-template-columns:none!important;gap:4px!important;margin-top:7px!important}.maquette-actions .btn{width:auto!important;min-height:27px!important}

/* Musiques / compte / fenêtres */
#musicSettingsView{width:min(900px,100%)!important}#musicSettingsView .card{padding:9px 10px!important}#musicSettingsView .btn{min-height:26px!important;padding:3px 7px!important}.modal{width:min(520px,calc(100% - 20px))!important;padding:11px!important;border-radius:12px!important;max-height:90vh!important}.modal-card,.auth-card{border-radius:12px!important}.auth-wrap{min-height:calc(100vh - 20px)!important}.auth-tabs{margin:7px 0!important;gap:4px!important}.recovery-key{font-size:12px!important;padding:7px!important;margin:6px 0!important}

/* Régie en cours : le contenu passe avant les commandes */
#playerView{width:min(940px,100%)!important}#playerView .player-topline{margin-bottom:3px!important}#playerView .fullscreen-btn{height:24px!important;min-height:24px!important;padding:3px 6px!important;font-size:9.5px!important}#playerView .player-head{padding:7px 9px!important;margin:5px 0!important;border-radius:11px!important}#playerView .phase-name{font-size:17px!important;line-height:1.08!important}#playerView .phase-count{font-size:10px!important}#playerView .timer-row{margin-top:3px!important}#playerView .global-time{font-size:23px!important;line-height:1!important}#playerView .phase-remain{font-size:11px!important}#playerView .nextline{font-size:10.5px!important;padding-top:4px!important;margin-top:4px!important}

#playerView .music-card,#playerView .instrument{padding:6px 8px!important;margin:5px 0!important;border-radius:10px!important}#playerView .music-title{font-size:11.5px!important}#playerView .music-body{margin-top:3px!important}#playerView .music-body .field{margin:3px 0!important}#playerView .music-controls{gap:3px!important;margin:3px 0!important}#playerView .music-controls .btn{height:24px!important;min-height:24px!important;padding:2px 6px!important;font-size:9.5px!important}#playerView .audio-time{font-size:9.5px!important}#playerView .yt-wrap{aspect-ratio:16/4!important;margin:3px 0!important}#playerView .instrument-title{font-size:9px!important;margin-bottom:3px!important}#playerView .instrument-hint{font-size:8.5px!important}#playerView .simple-rain-stage{height:76px!important}#playerView .simple-ocean-wrap{height:145px!important}#playerView .simple-ocean-drum{width:min(76%,145px)!important}#playerView .instrument-controls{grid-template-columns:minmax(0,1fr) 25px 25px!important;gap:3px!important}#playerView .instrument-controls .btn{width:25px!important;height:24px!important;min-height:24px!important;min-width:25px!important;padding:1px!important}#playerView .auto-row{gap:3px!important;margin:4px 0!important}#playerView .auto-row .btn{height:24px!important;min-height:24px!important;padding:2px 6px!important;font-size:9.5px!important}#playerView .auto-value{font-size:9.5px!important}

/* Le texte est le plus grand cadre de la régie */
#playerView .guide-card{margin:6px 0!important;border-radius:12px!important;min-height:0!important;box-shadow:0 5px 18px rgba(64,58,55,.055)!important}#playerView .guide-label{padding:7px 12px 0!important;font-size:8.5px!important;letter-spacing:.1em!important}#playerView .guide-scroll{height:clamp(460px,64vh,740px)!important;min-height:460px!important;max-height:none!important;padding:10px 28px 150px 28px!important}#playerView .guide-text{font-size:18px!important;line-height:1.55!important}#playerView .read-progress{top:27px!important;bottom:12px!important}#playerView .cue-card{padding:6px 8px!important;margin:5px 0!important;border-radius:9px!important;min-height:0!important}#playerView .cue-text{font-size:10.5px!important;line-height:1.35!important}

.bottom-controls{width:min(940px,100%)!important;padding:4px 10px calc(4px + env(safe-area-inset-bottom))!important}#playerView .control-row{grid-template-columns:34px minmax(130px,190px) 34px!important;gap:5px!important}#playerView .control-row .btn{height:29px!important;min-height:29px!important;padding:3px 6px!important;font-size:10.5px!important}#playerView .control-row .btn.primary{height:31px!important;min-height:31px!important}#playerView .phase-auto{height:22px!important;min-height:22px!important;max-width:210px!important;padding:2px 8px!important;margin:3px auto 0!important;font-size:8.5px!important}
:fullscreen #playerView .guide-scroll,#playerView:fullscreen .guide-scroll{height:clamp(520px,72vh,900px)!important;min-height:520px!important}

@media(max-width:700px){
  html,body{font-size:13px!important}.screen{width:100%!important;padding:7px 7px calc(58px + env(safe-area-inset-bottom))!important}.card{padding:8px 9px!important;margin:5px 0!important;border-radius:11px!important}h1{font-size:21px!important}h2{font-size:17px!important}.btn,button.btn,.account-btn,.auth-tab{min-height:30px!important;padding:4px 8px!important;font-size:10.5px!important}.btn.small,button.btn.small{min-height:28px!important}.space-grid{grid-template-columns:1fr!important}.space-card{min-height:135px!important;padding:11px 12px!important}.space-title{font-size:27px!important}
  #editView textarea[data-k="text"]{min-height:210px!important;height:34vh!important;font-size:14px!important}#editView textarea[data-k="cue"],#editView textarea[data-k="transition"]{height:76px!important}.maquette-source{min-height:320px!important;height:52vh!important;font-size:14px!important}
  #playerView .phase-name{font-size:16px!important}.global-time{font-size:22px!important}#playerView .guide-scroll{height:clamp(330px,58vh,560px)!important;min-height:330px!important;padding:9px 18px 120px 18px!important}#playerView .guide-text{font-size:17px!important;line-height:1.5!important}#playerView .simple-rain-stage{height:70px!important}.simple-ocean-wrap{height:130px!important}#playerView .control-row{grid-template-columns:34px minmax(120px,175px) 34px!important}#playerView .control-row .btn{height:32px!important;min-height:32px!important}#playerView .control-row .btn.primary{height:34px!important;min-height:34px!important}#playerView .phase-auto{height:24px!important;min-height:24px!important}
}
'''

if 'PRO_HIERARCHY_V1' in s:
    raise SystemExit('professional hierarchy already installed')
if '</style>' not in s:
    raise SystemExit('style closing tag missing')
s = s.replace('</style>', css + '\n</style>', 1)
p.write_text(s, encoding='utf-8')
print('professional hierarchy V1 installed', len(s))
