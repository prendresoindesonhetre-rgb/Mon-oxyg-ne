from pathlib import Path
import re
import sys

p = Path(sys.argv[1] if len(sys.argv) > 1 else 'pwa-dist/regie-v14/index.html')
s = p.read_text(encoding='utf-8')

css = r'''
/* LIVE_PRIORITY_V2 — la séance se conduit autour du texte.
   Ordre: outils audio/instruments/tempo -> repères -> texte. */
#playerView .player-head{margin-bottom:4px!important}
#playerView #instrumentHost{margin:0!important}
#playerView .instrument,#playerView .music-card{margin:4px 0!important}
#playerView .auto-row{margin:4px 0!important}

/* Les repères sont juste avant le texte, comme une consigne de conduite. */
#playerView .cue-card{
  margin:4px 0 5px!important;
  padding:6px 9px!important;
  border-left:3px solid rgba(169,155,192,.55)!important;
  background:linear-gradient(90deg,rgba(169,155,192,.07),rgba(255,253,249,.92))!important;
}
#playerView .cue-card .kicker{font-size:8.5px!important;margin-bottom:2px!important}
#playerView .cue-text{font-size:11px!important;line-height:1.35!important}

/* Choix explicite de ce que pilote la molette. */
.wheel-mode-row{
  display:flex;align-items:center;gap:4px;flex-wrap:wrap;
  margin:4px 0 5px;padding:4px 6px;border:1px solid var(--line);
  border-radius:9px;background:rgba(255,253,249,.72)
}
.wheel-mode-label{font-size:8.5px;font-weight:850;letter-spacing:.09em;color:var(--muted);margin-right:2px}
.wheel-mode-row .btn{height:23px!important;min-height:23px!important;padding:2px 7px!important;font-size:9.5px!important}
.wheel-mode-row .btn.active{background:var(--teal)!important;border-color:var(--teal)!important;color:white!important}
.wheel-mode-help{font-size:9px;color:var(--muted);margin-left:2px}

/* Le plein écran concerne le TEXTE, pas toute l'application. */
#fullscreenBtn{display:none!important}
.guide-toolbar{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:6px 9px 0 11px}
.guide-toolbar .guide-label{padding:0!important}
#guideFullscreenBtn{height:24px!important;min-height:24px!important;padding:2px 7px!important;font-size:9.5px!important}
#playerView .guide-card{margin:5px 0!important}
#playerView .guide-scroll{height:clamp(500px,66vh,780px)!important;min-height:500px!important}

#guideCard:fullscreen,#guideCard:-webkit-full-screen{
  width:100vw!important;height:100vh!important;max-width:none!important;
  margin:0!important;padding:0!important;border:0!important;border-radius:0!important;
  background:var(--paper)!important;display:flex!important;flex-direction:column!important;
}
#guideCard:fullscreen .guide-toolbar,#guideCard:-webkit-full-screen .guide-toolbar{
  flex:0 0 auto;padding:12px 16px 8px!important;border-bottom:1px solid var(--line);background:var(--paper)!important
}
#guideCard:fullscreen .guide-scroll,#guideCard:-webkit-full-screen .guide-scroll{
  flex:1 1 auto!important;height:auto!important;min-height:0!important;max-height:none!important;
  padding:24px clamp(28px,7vw,110px) 38vh clamp(28px,7vw,110px)!important;
}
#guideCard:fullscreen .guide-text,#guideCard:-webkit-full-screen .guide-text{
  font-size:clamp(20px,2.1vw,28px)!important;line-height:1.62!important;max-width:980px;margin:0 auto
}
#guideCard:fullscreen .read-progress,#guideCard:-webkit-full-screen .read-progress{top:52px!important;bottom:18px!important}
#guideCard:fullscreen .read-marker,#guideCard:-webkit-full-screen .read-marker{left:clamp(28px,7vw,110px)!important;right:clamp(28px,7vw,110px)!important}

@media(max-width:700px){
  #playerView .guide-scroll{height:clamp(360px,60vh,610px)!important;min-height:360px!important}
  .wheel-mode-help{display:none}
  #guideCard:fullscreen .guide-scroll,#guideCard:-webkit-full-screen .guide-scroll{padding:18px 22px 35vh 22px!important}
  #guideCard:fullscreen .guide-text,#guideCard:-webkit-full-screen .guide-text{font-size:19px!important;line-height:1.55!important}
}
'''

if 'LIVE_PRIORITY_V2' in s:
    raise SystemExit('live priority patch already installed')
if '</style>' not in s:
    raise SystemExit('style closing tag missing')
s = s.replace('</style>', css + '\n</style>', 1)

# 1) Le bouton plein écran vit désormais DANS le cadre du texte.
old_label = '      <div class="guide-label">À DIRE</div>'
new_label = '      <div class="guide-toolbar"><div class="guide-label">À DIRE</div><button class="btn small fullscreen-btn" id="guideFullscreenBtn" type="button">⛶ Texte plein écran</button></div>'
if old_label not in s:
    raise SystemExit('guide label anchor missing')
s = s.replace(old_label, new_label, 1)

# 2) Restaurer un vrai choix de molette: Défilement ou Son.
auto_block = '''    <div class="auto-row" id="autoRow">\n      <button class="btn soft" id="autoToggle">Défilement auto</button>\n      <button class="btn soft" id="autoMinus">−</button>\n      <div class="auto-value" id="autoValue">OFF</div>\n      <button class="btn soft" id="autoPlus">+</button>\n    </div>'''
wheel_block = auto_block + '''\n\n    <div class="wheel-mode-row" id="wheelModeRow">\n      <span class="wheel-mode-label">MOLETTE</span>\n      <button class="btn small" id="wheelScrollMode" type="button">Défilement</button>\n      <button class="btn small" id="wheelSoundMode" type="button">Son</button>\n      <span class="wheel-mode-help">Défilement = vitesse du texte · Son = volume</span>\n    </div>'''
if auto_block not in s:
    raise SystemExit('auto row anchor missing')
s = s.replace(auto_block, wheel_block, 1)

# 3) Les REPÈRES DE CONDUITE doivent être au-dessus du texte, jamais dessous.
guide_start = s.find('    <div class="card guide-card" id="guideCard">')
cue_start = s.find('    <div class="card cue-card">', guide_start)
if guide_start < 0 or cue_start < 0:
    raise SystemExit('guide/cue blocks missing')
# Fin du bloc cue: structure fixe de la régie, juste avant la fermeture du playerView.
cue_end_marker = '    </div>\n  </div>\n</section>'
cue_end = s.find(cue_end_marker, cue_start)
if cue_end < 0:
    raise SystemExit('cue end anchor missing')
cue_end += len('    </div>\n')
guide_block = s[guide_start:cue_start]
cue_block = s[cue_start:cue_end]
s = s[:guide_start] + cue_block + '\n' + guide_block + s[cue_end:]

# 4) Le plein écran cible guideCard uniquement.
fs_pattern = re.compile(r'function syncFullscreenButton\(\)\{.*?document\.addEventListener\("webkitfullscreenchange",syncFullscreenButton\);', re.S)
fs_replacement = r'''function syncFullscreenButton(){
  const active=document.fullscreenElement||document.webkitFullscreenElement;
  const on=active===$("guideCard");
  const b=$("guideFullscreenBtn");if(b)b.textContent=on?"⛶ Quitter le plein écran":"⛶ Texte plein écran";
  const legacy=$("fullscreenBtn");if(legacy)legacy.textContent=on?"⛶ Quitter":"⛶ Texte plein écran"
}
async function toggleFullscreen(){
  try{
    const active=document.fullscreenElement||document.webkitFullscreenElement;
    if(!active){const el=$("guideCard"),fn=el&&(el.requestFullscreen||el.webkitRequestFullscreen);if(fn)await fn.call(el)}
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

# 5) Remettre la molette comme une commande volontaire et explicite.
wheel_pattern = re.compile(r'function wheelHandler\(e\)\{.*?\n\}\ndocument\.addEventListener\("wheel",wheelHandler,\{passive:false\}\);', re.S)
wheel_replacement = r'''function currentWheelMode(){
  if(!state.prefs)state.prefs={};
  return state.prefs.wheelMode==="sound"?"sound":"scroll"
}
function syncWheelModeUi(){
  const mode=currentWheelMode(),scroll=$("wheelScrollMode"),sound=$("wheelSoundMode");
  if(scroll)scroll.classList.toggle("active",mode==="scroll");
  if(sound)sound.classList.toggle("active",mode==="sound")
}
function setWheelMode(mode){
  if(!state.prefs)state.prefs={};state.prefs.wheelMode=mode==="sound"?"sound":"scroll";
  persistLocal();syncWheelModeUi();toast(state.prefs.wheelMode==="sound"?"Molette : son":"Molette : défilement")
}
function wheelHandler(e){
  // En pause ou avant Démarrer, la molette redevient TOUJOURS une molette normale de page.
  if(!playing||!running)return;
  const inRegie=e.target.closest?.("#playerView")||e.target.closest?.("#bottomControls");
  if(!inRegie)return;
  e.preventDefault();
  if(currentWheelMode()==="sound")setVolume((Number(state.prefs.musicVolume)||0)+(e.deltaY<0?3:-3));
  else adjustAuto(e.deltaY<0?1:-1)
}
document.addEventListener("wheel",wheelHandler,{passive:false});
if($("wheelScrollMode"))$("wheelScrollMode").onclick=()=>setWheelMode("scroll");
if($("wheelSoundMode"))$("wheelSoundMode").onclick=()=>setWheelMode("sound");
syncWheelModeUi();'''
if not wheel_pattern.search(s):
    raise SystemExit('wheel handler block missing')
s = wheel_pattern.sub(wheel_replacement, s, count=1)

p.write_text(s, encoding='utf-8')
print('live priority V2 installed', len(s))
