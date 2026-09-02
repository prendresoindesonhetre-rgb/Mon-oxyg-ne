from pathlib import Path
import sys

p = Path(sys.argv[1] if len(sys.argv) > 1 else 'pwa-dist/regie-v14/index.html')
s = p.read_text(encoding='utf-8')

css = r'''
/* LIVE_LAYOUT_V3 — le texte occupe l'espace principal de la régie.
   Tout le reste reste AU-DESSUS, mais sous forme de commandes compactes. */

#playerView:not(.hidden){
  display:flex!important;
  flex-direction:column!important;
  width:min(980px,100%)!important;
  min-height:calc(100vh - 56px)!important;
  padding-bottom:62px!important;
}

/* Ordre de conduite explicite. */
#playerView .player-topline{order:1!important}
#playerView .player-head{order:2!important}
#playerView #instrumentHost{order:3!important}
#playerView #musicCard{order:4!important}
#playerView #autoRow{order:5!important}
#playerView #wheelModeRow{order:6!important}
#playerView .cue-card{order:7!important}
#playerView #guideCard{order:8!important}

/* En-tête : une ligne de régie, pas un gros panneau. */
#playerView .player-topline{
  min-height:16px!important;
  margin:0 0 3px!important;
  padding:0 2px!important;
}
#playerView .player-topline .brand{
  font-size:8px!important;
  letter-spacing:.13em!important;
  margin:0!important;
  line-height:1.15!important;
}
#playerView .player-head{
  display:grid!important;
  grid-template-columns:minmax(0,1fr) auto!important;
  column-gap:14px!important;
  row-gap:2px!important;
  align-items:center!important;
  padding:5px 9px!important;
  margin:0 0 4px!important;
  border-radius:9px!important;
}
#playerView .phase-headline{
  grid-column:1!important;
  grid-row:1!important;
  min-width:0!important;
  align-items:center!important;
}
#playerView .phase-name{
  font-size:15px!important;
  line-height:1.12!important;
  white-space:nowrap!important;
  overflow:hidden!important;
  text-overflow:ellipsis!important;
}
#playerView .phase-count{font-size:9px!important}
#playerView .timer-row{
  grid-column:2!important;
  grid-row:1!important;
  display:flex!important;
  align-items:center!important;
  justify-content:flex-end!important;
  gap:8px!important;
  margin:0!important;
}
#playerView .global-time{font-size:18px!important;line-height:1!important}
#playerView .phase-remain{font-size:9.5px!important;white-space:nowrap!important}
#playerView .nextline{
  grid-column:1 / -1!important;
  grid-row:2!important;
  font-size:9px!important;
  line-height:1.2!important;
  padding-top:3px!important;
  margin-top:1px!important;
}

/* Instrument : visible au-dessus du texte, mais jamais envahissant. */
#playerView #instrumentHost:empty{display:none!important}
#playerView .instrument{
  padding:5px 8px!important;
  margin:0 0 4px!important;
  border-radius:9px!important;
}
#playerView .instrument-title{
  font-size:8px!important;
  margin-bottom:2px!important;
  letter-spacing:.09em!important;
}
#playerView .instrument-hint{display:none!important}
#playerView .simple-rain-stage{
  height:54px!important;
  min-height:54px!important;
  padding:5px 8px!important;
  margin:2px 0!important;
}
#playerView .simple-rain-tube{height:27px!important}
#playerView .rain-beads i{transform-origin:center!important}
#playerView .simple-ocean-wrap{
  height:88px!important;
  min-height:88px!important;
  padding:2px!important;
  margin:2px 0!important;
}
#playerView .simple-ocean-drum{width:82px!important;border-width:4px!important}
#playerView .instrument-controls{
  grid-template-columns:minmax(0,1fr) 23px 23px!important;
  gap:3px!important;
  margin-top:2px!important;
}
#playerView .instrument-controls .btn{
  width:23px!important;min-width:23px!important;height:22px!important;min-height:22px!important;
  padding:0!important;font-size:9px!important
}
#playerView .instrument-controls .note{font-size:9px!important;line-height:1.2!important}

/* Musique : fermée par défaut. Sa barre reste disponible au-dessus du texte. */
#playerView .music-card{
  padding:4px 7px!important;
  margin:0 0 4px!important;
  border-radius:9px!important;
}
#playerView .music-head{min-height:22px!important;gap:6px!important}
#playerView .music-title{font-size:9.5px!important}
#playerView #musicMini{font-size:8.5px!important;line-height:1.2!important;margin-top:0!important}
#playerView #musicCollapseBtn{height:21px!important;min-height:21px!important;padding:1px 6px!important;font-size:8.5px!important}
#playerView .music-body{margin-top:4px!important}
#playerView .music-body .field{margin:3px 0!important}
#playerView .music-controls{margin:3px 0!important}
#playerView .music-controls .btn{height:22px!important;min-height:22px!important;padding:1px 5px!important;font-size:8.5px!important}
#playerView .audio-time,#playerView .music-body .note{font-size:8px!important}
#playerView .music-body input[type=range]{height:14px!important;margin:0!important}
#playerView .music-body select{min-height:26px!important;height:26px!important;padding:3px 6px!important;font-size:10px!important}

/* Tempo / molette : deux micro-barres de conduite. */
#playerView .auto-row{
  display:flex!important;
  align-items:center!important;
  flex-wrap:nowrap!important;
  gap:3px!important;
  min-height:24px!important;
  margin:0 0 3px!important;
}
#playerView .auto-row .btn{
  height:22px!important;min-height:22px!important;padding:1px 6px!important;font-size:8.5px!important
}
#playerView .auto-value{font-size:8.5px!important;white-space:nowrap!important}
#playerView .wheel-mode-row{
  min-height:24px!important;
  margin:0 0 3px!important;
  padding:2px 5px!important;
  gap:3px!important;
  border-radius:7px!important;
}
#playerView .wheel-mode-label{font-size:7.5px!important}
#playerView .wheel-mode-row .btn{height:20px!important;min-height:20px!important;padding:1px 5px!important;font-size:8px!important}
#playerView .wheel-mode-help{font-size:7.5px!important}

/* Repère de conduite : TOUJOURS juste au-dessus du texte, hauteur limitée. */
#playerView .cue-card{
  flex:0 0 auto!important;
  max-height:68px!important;
  overflow:auto!important;
  padding:4px 8px!important;
  margin:0 0 4px!important;
  border-radius:8px!important;
}
#playerView .cue-card .kicker{font-size:7.5px!important;margin-bottom:1px!important}
#playerView .cue-text{font-size:9.5px!important;line-height:1.28!important}

/* LE TEXTE : il récupère tout l'espace restant de l'écran. */
#playerView #guideCard{
  flex:1 1 420px!important;
  min-height:390px!important;
  display:flex!important;
  flex-direction:column!important;
  margin:0!important;
  border-radius:11px!important;
  overflow:hidden!important;
}
#playerView .guide-toolbar{
  flex:0 0 auto!important;
  min-height:27px!important;
  padding:4px 7px 3px 10px!important;
}
#playerView .guide-label{font-size:8px!important}
#playerView #guideFullscreenBtn{height:21px!important;min-height:21px!important;padding:1px 6px!important;font-size:8.5px!important}
#playerView .guide-scroll{
  flex:1 1 auto!important;
  height:auto!important;
  min-height:0!important;
  max-height:none!important;
  padding:12px 30px 34vh 30px!important;
}
#playerView .guide-text{
  font-size:18px!important;
  line-height:1.58!important;
}

/* Transport fixe : discret, ne vole pas la place au texte. */
.bottom-controls{padding-top:3px!important;padding-bottom:calc(3px + env(safe-area-inset-bottom))!important}
#playerView .control-row{grid-template-columns:32px minmax(120px,165px) 32px!important;gap:4px!important}
#playerView .control-row .btn{height:27px!important;min-height:27px!important;font-size:9px!important}
#playerView .control-row .btn.primary{height:29px!important;min-height:29px!important}
#playerView .phase-auto{height:20px!important;min-height:20px!important;font-size:7.5px!important;margin-top:2px!important}

@media(max-width:700px){
  #playerView:not(.hidden){min-height:calc(100vh - 34px)!important;padding-bottom:60px!important}
  #playerView .player-head{grid-template-columns:minmax(0,1fr) auto!important;padding:5px 7px!important}
  #playerView .phase-name{font-size:14px!important}
  #playerView .global-time{font-size:17px!important}
  #playerView .phase-remain{font-size:8.5px!important}
  #playerView .simple-rain-stage{height:48px!important;min-height:48px!important}
  #playerView .simple-ocean-wrap{height:76px!important;min-height:76px!important}
  #playerView .simple-ocean-drum{width:70px!important}
  #playerView .wheel-mode-help{display:none!important}
  #playerView .cue-card{max-height:58px!important}
  #playerView #guideCard{flex-basis:360px!important;min-height:330px!important}
  #playerView .guide-scroll{padding:10px 20px 32vh 20px!important}
  #playerView .guide-text{font-size:17px!important;line-height:1.52!important}
}
'''

if 'LIVE_LAYOUT_V3' in s:
    raise SystemExit('live layout already installed')
if '</style>' not in s:
    raise SystemExit('style closing tag missing')
s = s.replace('</style>', css + '\n</style>', 1)

# La musique ne doit pas monopoliser le haut de la régie à chaque ouverture.
old = 'showView("player");buildMusicSelect();updateMusicVolume();updatePlayer();$("playPauseBtn").textContent="Démarrer";startTicker();'
new = 'showView("player");buildMusicSelect();updateMusicVolume();musicCollapsed=true;if($("musicBody"))$("musicBody").classList.add("hidden");if($("musicCollapseBtn"))$("musicCollapseBtn").textContent="Source";updatePlayer();$("playPauseBtn").textContent="Démarrer";startTicker();'
if old not in s:
    raise SystemExit('startPlayer anchor missing')
s = s.replace(old, new, 1)

p.write_text(s, encoding='utf-8')
print('live layout V3 installed', len(s))
