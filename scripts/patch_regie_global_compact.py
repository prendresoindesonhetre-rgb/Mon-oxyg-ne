from pathlib import Path
import sys

p = Path(sys.argv[1] if len(sys.argv) > 1 else 'pwa-dist/regie-v14/index.html')
s = p.read_text(encoding='utf-8')

css = r'''
/* GLOBAL_COMPACT_AUDIT_V4 — vraie régie dense, typographies et blocs réduits partout */

/* Échelle générale : l'outil doit ressembler à une régie, pas à une interface surdimensionnée. */
html,body{font-size:14px!important}
.screen{width:min(680px,100%)!important;padding:10px 10px calc(66px + env(safe-area-inset-bottom))!important}
.card{padding:10px 12px!important;margin:8px 0!important;border-radius:14px!important;box-shadow:0 2px 10px rgba(64,58,55,.035)!important}
h1{font-size:26px!important;line-height:1.08!important;margin-bottom:6px!important}
h2{font-size:20px!important;margin-bottom:8px!important}
h3{font-size:16px!important}
.brand{font-size:10px!important;letter-spacing:.14em!important;margin:3px 0 5px!important}
.kicker{font-size:10px!important;letter-spacing:.1em!important}
.subtitle{font-size:13px!important;line-height:1.4!important;margin-bottom:12px!important}
.summary,.note{font-size:12px!important;line-height:1.4!important}
.syncbar{margin:0 1px 6px!important;gap:6px!important}
.syncstatus{font-size:11px!important}
.account-btn{font-size:11.5px!important;padding:4px 9px!important;min-height:28px!important}

/* Boutons : très compacts par défaut. */
.btn,button.btn{width:auto!important;min-width:0!important;min-height:29px!important;height:auto!important;padding:4px 9px!important;border-radius:8px!important;font-size:12px!important;line-height:1.1!important;box-shadow:none!important}
.btn.primary,button.btn.primary{min-height:31px!important;padding:5px 11px!important}
.btn.small,button.btn.small{min-height:26px!important;padding:3px 7px!important;border-radius:7px!important;font-size:11px!important}
button.btn[style*="width:100%"]{width:auto!important}

/* Champs et construction : moins de hauteur, mais zones d'écriture encore pratiques. */
.field{margin:7px 0!important}
.field span{font-size:10.5px!important;margin:0 0 3px 2px!important}
input[type=text],input[type=password],input[type=url],input[type=number],textarea,select{border-radius:9px!important;padding:7px 9px!important;font-size:13px!important;line-height:1.35!important}
input[type=text],input[type=password],input[type=url],input[type=number],select{min-height:34px!important}
textarea{min-height:105px!important}
textarea[data-k="text"]{min-height:120px!important}
textarea[data-k="cue"]{min-height:68px!important}
.row{gap:6px!important}

/* Accueil et bibliothèque des séances. */
#homeView .feature-grid{display:flex!important;grid-template-columns:none!important;flex-wrap:wrap!important;gap:5px!important;margin:7px 0 10px!important}
#homeView .feature{width:auto!important;min-width:0!important;flex:0 0 auto!important;padding:4px 9px!important;border-radius:999px!important;font-size:9.5px!important}
#homeView .session-list{gap:7px!important;margin:8px 0!important}
#homeView .session-card{padding:9px 11px!important;border-radius:13px!important}
#homeView .session-meta{margin-bottom:2px!important;gap:5px!important}
#homeView .session-title{font-size:18px!important;line-height:1.15!important;margin:3px 0 6px!important}
.type-pill{padding:3px 7px!important;font-size:9px!important}
#homeView .session-actions,#homeView .session-more{display:flex!important;grid-template-columns:none!important;flex-wrap:wrap!important;justify-content:flex-start!important;align-items:center!important;gap:4px!important;margin-top:4px!important}
#homeView .session-actions .btn,#homeView .session-more .btn{width:auto!important;min-width:0!important;flex:0 0 auto!important;min-height:26px!important;height:26px!important;padding:3px 8px!important;font-size:11.5px!important}
#homeView .session-actions .btn.primary{height:28px!important;min-height:28px!important;padding:4px 10px!important}
#createSessionBtn{width:auto!important;display:inline-flex!important;min-height:29px!important;height:29px!important;padding:4px 11px!important;margin:5px 0 0!important}

/* Écran de choix Méditation / Hypnose : cartes nettement plus petites. */
.space-chooser{min-height:auto!important;justify-content:flex-start!important;padding:12px 0 24px!important}
.space-logo{width:40px!important;height:40px!important;font-size:17px!important;margin-bottom:10px!important}
.space-brand{font-size:9.5px!important;margin-bottom:5px!important}
.space-title{font-size:32px!important;line-height:1.04!important;margin-bottom:5px!important}
.space-subtitle{font-size:13px!important;margin-bottom:16px!important}
.space-grid{gap:9px!important}
.space-card{min-height:188px!important;padding:16px 16px 14px!important;border-radius:15px!important;box-shadow:0 5px 16px rgba(80,68,60,.045)!important}
.space-symbol{font-size:21px!important;margin-bottom:10px!important}
.space-kicker{font-size:9px!important}
.space-name{font-size:21px!important;margin-bottom:6px!important}
.space-desc{font-size:12px!important;line-height:1.38!important;margin-bottom:9px!important}
.space-enter{font-size:10px!important}
.space-footer{font-size:10.5px!important;margin-top:13px!important}
.space-back{min-height:24px!important;padding:2px 0!important;font-size:11px!important;margin-bottom:6px!important}

/* Construction professionnelle : les cartes de phase ne doivent plus être de gros pavés. */
#editView h2{margin-top:9px!important}
#editView .phase-editor{padding:9px!important;border-radius:12px!important;margin:7px 0!important}
#editView .builder-summary{padding:8px 10px!important;border-radius:12px!important}
#editView .phase-pro{border-radius:10px!important;margin-top:6px!important}
#editView .phase-pro summary{padding:6px 8px!important;font-size:11.5px!important}
#editView .timing-grid,#editView .pro-grid{gap:5px!important}
#editView .phase-actions{display:flex!important;grid-template-columns:none!important;flex-wrap:wrap!important;gap:4px!important;justify-content:flex-start!important;margin-top:5px!important}
#editView .phase-actions .btn{width:auto!important;min-width:26px!important;height:26px!important;min-height:26px!important;padding:3px 6px!important;font-size:10.5px!important}
#editView .editor-toolbar{display:flex!important;flex-wrap:wrap!important;justify-content:flex-start!important;gap:4px!important;padding:4px!important;border-radius:10px!important;margin-top:7px!important}
#editView .editor-toolbar .btn,#editView .editor-toolbar .grow{width:auto!important;flex:0 0 auto!important;min-height:28px!important}
.exact-side-field{margin-top:6px!important;padding:7px 9px!important;border-radius:10px!important}
.exact-side-field small{font-size:10px!important}
.maquette-launch{padding:8px 9px!important;border-radius:11px!important}
.maquette-drop,.maquette-phase,.maquette-summary{padding:8px!important;border-radius:10px!important}
.maquette-actions,.create-choice{display:flex!important;grid-template-columns:none!important;flex-wrap:wrap!important;justify-content:flex-start!important;gap:4px!important}
.maquette-actions .btn,.maquette-launch .btn,.create-choice .btn{width:auto!important;min-height:27px!important;padding:3px 8px!important;font-size:11px!important}

/* Réglages musiques et fenêtres. */
#musicSettingsView .card{padding:9px 11px!important}
#musicSettingsView .btn{min-height:27px!important;padding:3px 8px!important}
.modal{width:min(460px,100%)!important;max-height:88vh!important;border-radius:15px!important;padding:13px!important}
.modal .btn,.modal-card .btn,.auth-tab{min-height:28px!important;padding:4px 8px!important;font-size:11.5px!important}
.auth-wrap{min-height:calc(100vh - 20px)!important}
.auth-card{width:min(460px,100%)!important}
.auth-tabs{gap:5px!important;margin:10px 0!important}
.recovery-key{font-size:13px!important;padding:9px!important;border-radius:10px!important;margin:8px 0!important}

/* ===== RÉGIE EN COURS ===== */
.player{padding-bottom:calc(62px + env(safe-area-inset-bottom))!important}
.player-topline{margin-bottom:4px!important;gap:5px!important}
.fullscreen-btn{min-height:25px!important;padding:3px 7px!important;font-size:10.5px!important}
.player-head{padding:9px 11px!important}
.phase-headline{gap:6px!important}
.phase-name{font-size:20px!important;line-height:1.08!important}
.phase-count{font-size:11.5px!important}
.timer-row{margin-top:5px!important}
.global-time{font-size:28px!important;line-height:1!important}
.phase-remain{font-size:13.5px!important}
.nextline{font-size:12.5px!important;padding-top:6px!important;margin-top:6px!important}

/* Instruments : visuels présents mais pas envahissants. */
.instrument{padding:8px 10px!important}
.instrument-title{font-size:10px!important;margin-bottom:5px!important}
.instrument-visual{margin:4px 0 5px!important;border-radius:12px!important}
.instrument-hint{font-size:9.5px!important;margin-top:2px!important}
.instrument-controls{grid-template-columns:minmax(0,1fr) 28px 28px!important;gap:4px!important;margin-top:4px!important}
.instrument-controls .btn{width:28px!important;min-width:28px!important;height:27px!important;min-height:27px!important;padding:2px!important;font-size:11px!important}
.simple-rain-stage{height:92px!important;padding:10px 9px!important}
.simple-rain-tube{width:min(88%,500px)!important;height:36px!important}
.simple-ocean-wrap{height:180px!important;padding:6px!important}
.simple-ocean-drum{width:min(82%,170px)!important;border-width:6px!important}

/* Mix musical : moins haut, commandes discrètes. */
.music-card{padding:8px 10px!important}
.music-head{gap:5px!important}
.music-title{font-size:13px!important}
.music-body{margin-top:5px!important}
.music-body .field{margin:5px 0!important}
.music-controls{display:flex!important;grid-template-columns:none!important;flex-wrap:wrap!important;gap:4px!important;margin:5px 0!important}
.music-controls .btn{width:auto!important;min-height:27px!important;height:27px!important;padding:3px 7px!important;font-size:11px!important;border-radius:7px!important}
.audio-time{font-size:10.5px!important}
.yt-wrap{margin:5px 0!important;border-radius:9px!important;aspect-ratio:16/5!important}

/* Défilement : petite barre de commandes. */
#playerView .music-controls,#playerView .auto-row,#playerView .control-row{align-items:center!important}
.auto-row{display:flex!important;grid-template-columns:none!important;flex-wrap:wrap!important;gap:4px!important;margin:6px 0!important}
.auto-row .btn{width:auto!important;min-height:27px!important;height:27px!important;padding:3px 7px!important;font-size:11px!important}
.auto-value{font-size:10.5px!important}

/* Texte à dire : typographie volontairement normale, beaucoup plus de contenu visible. */
.guide-card{margin:7px 0!important;border-radius:13px!important}
.guide-label{padding:9px 11px 0!important;font-size:9.5px!important;letter-spacing:.08em!important}
.guide-scroll{height:min(31vh,290px)!important;min-height:180px!important;padding:7px 22px 24vh 22px!important}
.guide-text{font-size:19px!important;line-height:1.52!important}
.read-progress{left:9px!important;top:32px!important;bottom:14px!important;width:3px!important}
.read-marker{left:18px!important;right:15px!important}
.cue-card{padding:8px 10px!important}
.cue-text{font-size:12px!important;line-height:1.38!important}

/* Transport : FIN des énormes flèches / énorme Démarrer / énorme PHASES AUTO. */
.bottom-controls{width:min(680px,100%)!important;padding:5px 10px calc(5px + env(safe-area-inset-bottom))!important}
#playerView .control-row{display:grid!important;grid-template-columns:40px minmax(150px,210px) 40px!important;justify-content:center!important;gap:6px!important;flex-wrap:nowrap!important}
#playerView .control-row .btn{width:100%!important;min-width:0!important;height:32px!important;min-height:32px!important;padding:4px 7px!important;font-size:11.5px!important;border-radius:8px!important}
#playerView .control-row .btn.primary{height:34px!important;min-height:34px!important;padding:5px 9px!important}
.phase-auto{display:block!important;width:auto!important;max-width:250px!important;min-height:25px!important;height:25px!important;padding:3px 10px!important;border-radius:8px!important;margin:4px auto 0!important;font-size:9.5px!important}

/* Téléphone : un peu plus tactile, sans revenir aux pavés géants. */
@media(max-width:700px){
  html,body{font-size:13.5px!important}
  .screen{padding:8px 8px calc(62px + env(safe-area-inset-bottom))!important}
  .card{padding:9px 10px!important;margin:6px 0!important}
  h1{font-size:24px!important}h2{font-size:19px!important}
  .btn,button.btn{min-height:32px!important;padding:5px 9px!important;font-size:11.5px!important}
  .btn.small,button.btn.small{min-height:29px!important}
  .space-title{font-size:29px!important}
  .space-grid{grid-template-columns:1fr!important}
  .space-card{min-height:158px!important;padding:13px 14px!important}
  .space-symbol{margin-bottom:7px!important}
  .space-desc{font-size:11.5px!important}
  .phase-name{font-size:19px!important}.global-time{font-size:27px!important}.phase-remain{font-size:13px!important}
  .guide-scroll{height:38vh!important;min-height:200px!important;padding:7px 19px 26vh 19px!important}
  .guide-text{font-size:18px!important;line-height:1.5!important}
  .simple-rain-stage{height:88px!important}.simple-ocean-wrap{height:160px!important}.simple-ocean-drum{width:min(80%,150px)!important}
  .bottom-controls{padding-left:8px!important;padding-right:8px!important}
  #playerView .control-row{grid-template-columns:38px minmax(130px,185px) 38px!important;gap:5px!important}
  #playerView .control-row .btn{height:34px!important;min-height:34px!important}
  #playerView .control-row .btn.primary{height:36px!important;min-height:36px!important}
  .phase-auto{height:27px!important;min-height:27px!important}
}
'''

if 'GLOBAL_COMPACT_AUDIT_V4' in s:
    raise SystemExit('global compact audit already installed')
if '</style>' not in s:
    raise SystemExit('style closing tag missing')
s = s.replace('</style>', css + '\n</style>', 1)
p.write_text(s, encoding='utf-8')
print('global compact audit V4 installed', len(s))
