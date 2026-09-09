from pathlib import Path
import sys

if len(sys.argv) != 2:
    raise SystemExit('usage: web_v142_locked_patch.py <index.html>')

p = Path(sys.argv[1])
s = p.read_text(encoding='utf-8')

# Ask browsers not to keep an old copy of the single-page app once this version is loaded.
cache_meta = '''<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
<meta http-equiv="Pragma" content="no-cache">
<meta http-equiv="Expires" content="0">
<meta name="regie-build" content="14.4">'''
if 'name="regie-build" content="14.4"' not in s:
    s = s.replace('<meta name="theme-color" content="#f7f5f1">', '<meta name="theme-color" content="#f7f5f1">\n' + cache_meta, 1)

# Keep the mobile speed controls visible above the permanent bottom controls.
mobile_css = '''<style id="mobile-player-v141">
@media(max-width:600px){
  #playerView.player{padding-bottom:calc(190px + env(safe-area-inset-bottom))}
  #autoRow.auto-row{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(84px + env(safe-area-inset-bottom));width:min(calc(100% - 22px),738px);z-index:24;margin:0;padding:7px;border:1px solid var(--line);border-radius:18px;background:rgba(247,245,241,.96);box-shadow:0 -4px 18px rgba(64,58,55,.08);backdrop-filter:blur(10px)}
  #bottomControls{z-index:25}
  #guideCard{margin-bottom:110px}
  #guideScroll{height:50dvh;min-height:320px;max-height:560px}
  .screen{padding-bottom:calc(190px + env(safe-area-inset-bottom))}
}
</style>'''
if 'mobile-player-v141' not in s:
    s = s.replace('</head>', mobile_css + '\n</head>', 1)

# The validated Meditation / Hypnosis tabs are real, obvious tabs on the first app screen.
type_css = '''<style id="locked-session-type-v144">
.session-type-picker{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:6px}
.session-type-picker .btn.active{background:var(--teal);border-color:var(--teal);color:#fff;font-weight:800}
.session-type-badge{display:inline-flex;align-items:center;margin:0 0 8px;border:1px solid var(--line);border-radius:999px;padding:6px 10px;font-size:12px;font-weight:800;color:var(--teal);background:var(--paper)}
.session-type-home{margin:8px 0 16px;padding:10px;background:rgba(255,253,249,.98)}
.session-type-home .kicker{margin:2px 4px 8px}
.session-type-home .session-type-picker{margin-top:0}
.session-type-home .btn{min-height:58px;font-size:17px;font-weight:850;border-radius:18px}
.player-nav{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:0 0 10px;position:sticky;top:calc(6px + env(safe-area-inset-top));z-index:26}
.player-back{background:rgba(255,253,249,.97);box-shadow:0 4px 14px rgba(64,58,55,.08);font-weight:800}
@media(max-width:600px){.player-nav{top:calc(4px + env(safe-area-inset-top))}.player-back{min-height:46px}}
</style>'''
if 'locked-session-type-v144' not in s:
    s = s.replace('</head>', type_css + '\n</head>', 1)

# The two tabs must be visible immediately after opening the user's space, before the session card.
home_title_anchor = '''<div class="brand">PRENDRE SOIN DE SON HÊTRE</div>
    <h1>Ma régie de séance</h1>'''
home_title_block = '''<div class="brand">PRENDRE SOIN DE SON HÊTRE</div>
    <div class="card session-type-home" id="homeSessionTypeCard">
      <div class="kicker">MES SÉANCES</div>
      <div class="session-type-picker" id="homeSessionTypePicker">
        <button class="btn" type="button" data-session-type="meditation">Méditation</button>
        <button class="btn" type="button" data-session-type="hypnose">Hypnose</button>
      </div>
    </div>
    <h1>Ma régie de séance</h1>'''
if 'id="homeSessionTypePicker"' not in s:
    if home_title_anchor not in s:
        raise SystemExit('home title anchor missing')
    s = s.replace(home_title_anchor, home_title_block, 1)
else:
    # Older patch placed the tabs below the subtitle. Move that existing block to the top so it cannot be missed.
    old_home_block = '''    <div class="card session-type-home" id="homeSessionTypeCard">
      <div class="kicker">TYPE DE SÉANCE</div>
      <div class="session-type-picker" id="homeSessionTypePicker">
        <button class="btn" type="button" data-session-type="meditation">Méditation</button>
        <button class="btn" type="button" data-session-type="hypnose">Hypnose</button>
      </div>
    </div>\n'''
    if old_home_block in s:
        s = s.replace(old_home_block, '', 1)
        if home_title_anchor not in s:
            raise SystemExit('home title anchor missing for tab move')
        s = s.replace(home_title_anchor, home_title_block, 1)

edit_anchor = '''<h2 style="margin-top:16px">Ma séance</h2>
    <label class="field"><span>Titre</span><input type="text" id="editTitle"></label>'''
edit_block = '''<h2 style="margin-top:16px">Ma séance</h2>
    <div class="field" id="sessionTypeField"><span>Type de séance</span>
      <div class="session-type-picker" id="sessionTypePicker">
        <button class="btn" type="button" data-session-type="meditation">Méditation</button>
        <button class="btn" type="button" data-session-type="hypnose">Hypnose</button>
      </div>
    </div>
    <label class="field"><span>Titre</span><input type="text" id="editTitle"></label>'''
if 'id="sessionTypePicker"' not in s:
    if edit_anchor not in s:
        raise SystemExit('editor anchor missing')
    s = s.replace(edit_anchor, edit_block, 1)

home_anchor = '''<div class="kicker">MA SÉANCE</div>
      <div class="session-title" id="homeTitle"></div>'''
home_block = '''<div class="kicker">MA SÉANCE</div>
      <div class="session-type-badge" id="homeSessionType">Type à choisir</div>
      <div class="session-title" id="homeTitle"></div>'''
if 'id="homeSessionType"' not in s:
    if home_anchor not in s:
        raise SystemExit('home anchor missing')
    s = s.replace(home_anchor, home_block, 1)

# A running session must always have an explicit way back to the session screen.
player_anchor = '''  <div id="playerView" class="hidden player">
    <div class="brand">RÉGIE DE MON HÊTRE</div>'''
player_block = '''  <div id="playerView" class="hidden player">
    <div class="player-nav" id="playerNav"><button class="btn small player-back" id="playerBackBtn" type="button">‹ Retour aux séances</button><span class="pill" id="playerTypePill"></span></div>
    <div class="brand">RÉGIE DE MON HÊTRE</div>'''
if 'id="playerBackBtn"' not in s:
    if player_anchor not in s:
        raise SystemExit('player anchor missing')
    s = s.replace(player_anchor, player_block, 1)

script = '''<script id="locked-session-type-script-v144">
(()=>{
  const norm=t=>t==="hypnose"?"hypnose":t==="meditation"?"meditation":"";
  const label=t=>t==="hypnose"?"Hypnose":t==="meditation"?"Méditation":"Type à choisir";
  try{DEFAULT_STATE.sessionType=""}catch(e){}
  const current=()=>{try{return norm(state&&state.sessionType)}catch(e){return ""}};
  const paint=()=>{
    const t=current();
    document.querySelectorAll("[data-session-type]").forEach(b=>b.classList.toggle("active",b.dataset.sessionType===t));
    const badge=document.getElementById("homeSessionType");
    if(badge)badge.textContent=label(t);
    const pill=document.getElementById("playerTypePill");
    if(pill)pill.textContent=label(t);
  };
  window.setRegieSessionType=t=>{
    try{
      state.sessionType=norm(t);
      paint();
      if(typeof persistLocal==="function")persistLocal();
    }catch(e){}
  };

  document.addEventListener("click",e=>{
    const b=e.target.closest&&e.target.closest("[data-session-type]");
    if(b){e.preventDefault();window.setRegieSessionType(b.dataset.sessionType);return;}
    if(e.target.closest&&e.target.closest("#editSessionBtn"))setTimeout(paint,0);
  });

  const open=document.getElementById("openRegieBtn");
  if(open)open.addEventListener("click",e=>{
    if(current())return;
    e.preventDefault();
    e.stopImmediatePropagation();
    showModal(`<div class="kicker">TYPE DE SÉANCE</div><h2>Que vas-tu guider ?</h2><p class="note">Choisis le type de cette séance.</p><div class="session-type-picker"><button class="btn" id="chooseMeditation">Méditation</button><button class="btn" id="chooseHypnose">Hypnose</button></div><button class="btn" style="width:100%;margin-top:10px" id="chooseCancel">Annuler</button>`);
    document.getElementById("chooseMeditation").onclick=()=>{window.setRegieSessionType("meditation");closeModal();startPlayer();paint()};
    document.getElementById("chooseHypnose").onclick=()=>{window.setRegieSessionType("hypnose");closeModal();startPlayer();paint()};
    document.getElementById("chooseCancel").onclick=closeModal;
  },true);

  // Reliable back behaviour for the on-screen button, browser back and Android hardware/system back.
  const goHome=()=>{
    try{
      if(typeof stopPlayer==="function" && typeof view!=="undefined" && view==="player")stopPlayer();
      else if(typeof renderHome==="function")renderHome();
      paint();
      return true;
    }catch(e){return false}
  };
  window.regieBack=()=>{
    try{
      if(typeof view!=="undefined" && ["player","edit","music"].includes(view))return goHome();
    }catch(e){}
    return false;
  };
  const back=document.getElementById("playerBackBtn");
  if(back)back.onclick=()=>goHome();

  // Create an in-app history entry whenever the user enters a sub-screen.
  const markView=()=>{
    try{
      if(typeof view!=="undefined" && ["player","edit","music"].includes(view) && history.state?.regieView!==view){
        history.pushState({regieView:view},"");
      }
    }catch(e){}
  };
  document.addEventListener("click",()=>setTimeout(()=>{paint();markView()},0));
  window.addEventListener("popstate",()=>{
    try{if(typeof view!=="undefined" && ["player","edit","music"].includes(view))goHome()}catch(e){}
  });

  const save=document.getElementById("saveSessionBtn");
  if(save)save.addEventListener("click",()=>setTimeout(paint,0));
  const reset=document.getElementById("resetSessionBtn");
  if(reset)reset.addEventListener("click",()=>setTimeout(paint,0));
  paint();
})();
</script>'''
# Remove older injected script before adding the corrected one.
for old_id in ['locked-session-type-script-v142','locked-session-type-script-v144']:
    marker = '<script id="' + old_id + '">'
    if marker in s:
        start = s.index(marker)
        end = s.index('</script>', start) + len('</script>')
        s = s[:start] + s[end:]
s = s.replace('</body>', script + '\n</body>', 1)

# Fail rather than silently publish a version that lost a validated feature.
required = [
    'name="regie-build" content="14.4"',
    'locked-session-type-script-v144', 'Méditation', 'Hypnose',
    'id="homeSessionTypePicker"', 'id="sessionTypePicker"', 'id="playerBackBtn"',
    'mobile-player-v141', 'id="autoRow"', 'id="guideScroll"',
    'id="playPauseBtn"', 'id="musicCard"', 'id="phaseAutoBtn"',
    'id="accountBtn"', 'regie-sync', 'manualScrollUntil',
    'function toggleRun', 'faderEdge', 'window.regieBack'
]
missing = [x for x in required if x not in s]
if missing:
    raise SystemExit('missing validated features: ' + ', '.join(missing))

p.write_text(s, encoding='utf-8')
print('V14.4 web patch: visible Meditation/Hypnosis tabs + reliable back navigation')
