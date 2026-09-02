from pathlib import Path
import re
import sys

p = Path(sys.argv[1] if len(sys.argv) > 1 else 'pwa-dist/regie-v14/index.html')
s = p.read_text(encoding='utf-8')

css = r'''
/* BALANCED_LIVE_V1 — ne plus compresser : organiser.
   Les outils restent au-dessus, le texte reste la grande zone de travail. */
#playerView:not(.hidden){
  display:grid!important;
  grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important;
  grid-auto-rows:auto!important;
  column-gap:12px!important;
  row-gap:9px!important;
  width:min(980px,100%)!important;
  min-height:calc(100dvh - 70px)!important;
  padding-bottom:76px!important;
  align-content:start!important;
}

/* Titre de régie : discret mais respirant. */
#playerView>.brand,#playerView>.player-topline{grid-column:1/-1!important;margin:2px 2px 0!important}
#playerView>.brand,#playerView .player-topline .brand{font-size:9px!important;line-height:1.2!important;letter-spacing:.15em!important}

/* En-tête phase + temps : compact, pas minuscule. */
#playerView .player-head{
  grid-column:1/-1!important;
  display:grid!important;
  grid-template-columns:minmax(0,1fr) auto!important;
  gap:6px 18px!important;
  align-items:center!important;
  padding:11px 14px!important;
  margin:0!important;
  border-radius:14px!important;
}
#playerView .phase-headline{grid-column:1!important;grid-row:1!important;align-items:center!important}
#playerView .phase-name{font-size:18px!important;line-height:1.18!important;white-space:normal!important;overflow:visible!important;text-overflow:clip!important}
#playerView .phase-count{font-size:10.5px!important}
#playerView .timer-row{grid-column:2!important;grid-row:1!important;display:flex!important;gap:12px!important;align-items:baseline!important;margin:0!important}
#playerView .global-time{font-size:26px!important;line-height:1!important}
#playerView .phase-remain{font-size:11.5px!important}
#playerView .nextline{grid-column:1/-1!important;grid-row:2!important;font-size:10.5px!important;line-height:1.35!important;padding-top:6px!important;margin-top:2px!important}

/* Instrument et musique partagent une ligne sur ordinateur : présents sans écraser le texte. */
#playerView #instrumentHost{grid-column:1!important;margin:0!important;min-width:0!important}
#playerView #instrumentHost:empty{display:none!important}
#playerView .instrument{padding:9px 11px!important;margin:0!important;border-radius:13px!important;min-height:0!important}
#playerView .instrument-title{font-size:9.5px!important;letter-spacing:.1em!important;margin-bottom:5px!important}
#playerView .instrument-hint{display:block!important;font-size:9px!important;line-height:1.3!important;margin-top:4px!important}
#playerView .simple-rain-stage{height:72px!important;min-height:72px!important;padding:8px 12px!important;margin:4px 0!important}
#playerView .simple-rain-tube{height:34px!important}
#playerView .simple-ocean-wrap{height:122px!important;min-height:122px!important;padding:5px!important;margin:3px 0!important}
#playerView .simple-ocean-drum{width:112px!important;border-width:5px!important}
#playerView .instrument-controls{grid-template-columns:minmax(0,1fr) 30px 30px!important;gap:6px!important;margin-top:5px!important}
#playerView .instrument-controls .btn{width:30px!important;min-width:30px!important;height:28px!important;min-height:28px!important;padding:2px!important;font-size:11px!important}
#playerView .instrument-controls .note{font-size:10px!important;line-height:1.3!important}

#playerView #musicCard{grid-column:2!important;padding:9px 11px!important;margin:0!important;border-radius:13px!important;align-self:start!important}
#playerView .music-head{min-height:28px!important;gap:8px!important}
#playerView .music-title{font-size:10.5px!important}
#playerView #musicMini{font-size:9.5px!important;line-height:1.3!important;margin-top:3px!important}
#playerView #musicCollapseBtn{height:27px!important;min-height:27px!important;padding:3px 8px!important;font-size:10px!important}
#playerView .music-body{margin-top:7px!important}
#playerView .music-body .field{margin:6px 0!important}
#playerView .music-body select{height:31px!important;min-height:31px!important;padding:5px 8px!important;font-size:11.5px!important}
#playerView .music-controls{gap:5px!important;margin:6px 0!important}
#playerView .music-controls .btn{height:29px!important;min-height:29px!important;padding:3px 7px!important;font-size:10.5px!important}
#playerView .audio-time,#playerView .music-body .note{font-size:9.5px!important}
#playerView .music-body input[type=range]{height:18px!important}

/* Défilement et molette : deux petites barres distinctes, mais lisibles. */
#playerView #autoRow{grid-column:1!important;display:flex!important;align-items:center!important;gap:6px!important;margin:0!important;min-height:32px!important}
#playerView .auto-row .btn{height:29px!important;min-height:29px!important;padding:4px 9px!important;font-size:10px!important}
#playerView .auto-value{font-size:10px!important;min-width:36px!important}
#playerView #wheelModeRow{grid-column:2!important;min-height:32px!important;margin:0!important;padding:4px 7px!important;gap:5px!important;border-radius:10px!important;align-self:center!important}
#playerView .wheel-mode-label{font-size:8.5px!important}
#playerView .wheel-mode-row .btn{height:27px!important;min-height:27px!important;padding:3px 8px!important;font-size:9.5px!important}
#playerView .wheel-mode-help{font-size:8.5px!important}

/* Le repère reste juste AU-DESSUS du texte. */
#playerView .cue-card{grid-column:1/-1!important;max-height:92px!important;overflow:auto!important;padding:8px 11px!important;margin:0!important;border-radius:12px!important}
#playerView .cue-card .kicker{font-size:8.5px!important;margin-bottom:4px!important}
#playerView .cue-text{font-size:11px!important;line-height:1.42!important}

/* LE TEXTE EST LA ZONE PRINCIPALE. */
#playerView #guideCard{
  grid-column:1/-1!important;
  min-height:clamp(480px,58dvh,760px)!important;
  height:clamp(480px,58dvh,760px)!important;
  display:flex!important;
  flex-direction:column!important;
  margin:0!important;
  border-radius:15px!important;
  overflow:hidden!important;
  box-shadow:0 7px 22px rgba(64,58,55,.06)!important;
}
#playerView .guide-toolbar{flex:0 0 auto!important;min-height:38px!important;padding:8px 11px 5px 14px!important}
#playerView .guide-label{font-size:9.5px!important;padding:0!important}
#playerView #guideFullscreenBtn{height:28px!important;min-height:28px!important;padding:4px 9px!important;font-size:10px!important}
#playerView .guide-scroll{flex:1 1 auto!important;height:auto!important;min-height:0!important;max-height:none!important;padding:16px 36px 36vh 34px!important}
#playerView .guide-text{font-size:19px!important;line-height:1.62!important}
#playerView .read-progress{top:42px!important;bottom:18px!important}
#playerView .read-marker{left:30px!important;right:26px!important}

/* Transport : petit et séparé du contenu. */
.bottom-controls{width:min(980px,100%)!important;padding:7px 12px calc(7px + env(safe-area-inset-bottom))!important}
.control-row{grid-template-columns:38px minmax(145px,190px) 38px!important;gap:7px!important;justify-content:center!important}
.control-row .btn{height:34px!important;min-height:34px!important;padding:4px 8px!important;font-size:11px!important}
.control-row .btn.primary{height:36px!important;min-height:36px!important;font-size:11.5px!important}
.phase-auto{width:auto!important;min-width:145px!important;height:25px!important;min-height:25px!important;padding:3px 9px!important;margin:4px auto 0!important;font-size:8.5px!important;display:block!important}

/* Plein écran = régie de conduite complète, pas texte isolé. */
html:fullscreen,html:-webkit-full-screen{background:var(--bg)!important}
html:fullscreen body,html:-webkit-full-screen body{overflow:auto!important;background:var(--bg)!important}
html:fullscreen #authScreen,html:-webkit-full-screen #authScreen,
html:fullscreen #appScreen>.syncbar,html:-webkit-full-screen #appScreen>.syncbar,
html:fullscreen #spaceChooserView,html:-webkit-full-screen #spaceChooserView,
html:fullscreen #homeView,html:-webkit-full-screen #homeView,
html:fullscreen #musicSettingsView,html:-webkit-full-screen #musicSettingsView,
html:fullscreen #editView,html:-webkit-full-screen #editView{display:none!important}
html:fullscreen #appScreen,html:-webkit-full-screen #appScreen{display:block!important;width:100%!important;max-width:none!important;padding:12px 24px 82px!important}
html:fullscreen #playerView,html:-webkit-full-screen #playerView{display:grid!important;width:min(1180px,100%)!important;margin:0 auto!important;min-height:calc(100vh - 24px)!important}
html:fullscreen #playerView #guideCard,html:-webkit-full-screen #playerView #guideCard{height:clamp(520px,62vh,900px)!important;min-height:520px!important}
html:fullscreen .bottom-controls,html:-webkit-full-screen .bottom-controls{display:block!important;width:min(1180px,100%)!important}

@media(max-width:700px){
  #playerView:not(.hidden){grid-template-columns:1fr!important;row-gap:7px!important;width:100%!important;padding-bottom:72px!important}
  #playerView .player-head,#playerView #instrumentHost,#playerView #musicCard,#playerView #autoRow,#playerView #wheelModeRow,#playerView .cue-card,#playerView #guideCard{grid-column:1!important}
  #playerView .player-head{padding:9px 10px!important;gap:5px 9px!important}
  #playerView .phase-name{font-size:16px!important}
  #playerView .global-time{font-size:22px!important}
  #playerView .phase-remain{font-size:10px!important}
  #playerView .simple-rain-stage{height:62px!important;min-height:62px!important}
  #playerView .simple-ocean-wrap{height:102px!important;min-height:102px!important}
  #playerView .simple-ocean-drum{width:92px!important}
  #playerView .instrument-hint{display:none!important}
  #playerView #autoRow,#playerView #wheelModeRow{min-height:30px!important}
  #playerView .wheel-mode-help{display:none!important}
  #playerView .cue-card{max-height:78px!important}
  #playerView #guideCard{height:clamp(410px,56dvh,650px)!important;min-height:410px!important}
  #playerView .guide-scroll{padding:14px 22px 34vh 22px!important}
  #playerView .guide-text{font-size:18px!important;line-height:1.58!important}
  html:fullscreen #appScreen,html:-webkit-full-screen #appScreen{padding:8px 8px 76px!important}
}
'''

if 'BALANCED_LIVE_V1' in s:
    raise SystemExit('balanced live patch already installed')
if '</style>' not in s:
    raise SystemExit('style closing tag missing')
s = s.replace('</style>', css + '\n</style>', 1)

# Le bouton plein écran ouvre toute la régie afin de conserver musique, instruments et commandes.
fs_pattern = re.compile(r'function syncFullscreenButton\(\)\{.*?document\.addEventListener\("webkitfullscreenchange",syncFullscreenButton\);', re.S)
fs_replacement = r'''function syncFullscreenButton(){
  const active=document.fullscreenElement||document.webkitFullscreenElement;
  const on=!!active;
  const b=$("guideFullscreenBtn");if(b)b.textContent=on?"⛶ Quitter le plein écran":"⛶ Plein écran";
  const legacy=$("fullscreenBtn");if(legacy)legacy.textContent=on?"⛶ Quitter":"⛶ Plein écran"
}
async function toggleFullscreen(){
  try{
    const active=document.fullscreenElement||document.webkitFullscreenElement;
    if(!active){const el=document.documentElement,fn=el.requestFullscreen||el.webkitRequestFullscreen;if(fn)await fn.call(el)}
    else{const fn=document.exitFullscreen||document.webkitExitFullscreen;if(fn)await fn.call(document)}
  }catch(e){}
  syncFullscreenButton()
}
if($("fullscreenBtn"))$("fullscreenBtn").onclick=toggleFullscreen;
if($("guideFullscreenBtn"))$("guideFullscreenBtn").onclick=toggleFullscreen;
document.addEventListener("fullscreenchange",syncFullscreenButton);document.addEventListener("webkitfullscreenchange",syncFullscreenButton);'''
if not fs_pattern.search(s):
    raise SystemExit('fullscreen handler block missing')
s = fs_pattern.sub(fs_replacement, s, count=1)

p.write_text(s, encoding='utf-8')
print('balanced live V1 installed', len(s))
