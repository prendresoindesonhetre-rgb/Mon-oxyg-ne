from pathlib import Path
import sys

if len(sys.argv) != 2:
    raise SystemExit('usage: web_v142_locked_patch.py <index.html>')

p = Path(sys.argv[1])
s = p.read_text(encoding='utf-8')

# Version marker. The permanent public URL stays the same.
cache_meta = '''<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
<meta http-equiv="Pragma" content="no-cache">
<meta http-equiv="Expires" content="0">
<meta name="regie-build" content="14.5">'''
import re
s = re.sub(r'<meta http-equiv="Cache-Control"[^>]*>\s*<meta http-equiv="Pragma"[^>]*>\s*<meta http-equiv="Expires"[^>]*>\s*<meta name="regie-build"[^>]*>', cache_meta, s, count=1)
if 'name="regie-build" content="14.5"' not in s:
    s = s.replace('<meta name="theme-color" content="#f7f5f1">', '<meta name="theme-color" content="#f7f5f1">\n' + cache_meta, 1)

# Keep the mobile speed controls visible above the permanent bottom controls.
mobile_css = '''<style id="mobile-player-v145">
@media(max-width:600px){
  #playerView.player{padding-top:62px;padding-bottom:calc(190px + env(safe-area-inset-bottom))}
  #autoRow.auto-row{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(84px + env(safe-area-inset-bottom));width:min(calc(100% - 22px),738px);z-index:24;margin:0;padding:7px;border:1px solid var(--line);border-radius:18px;background:rgba(247,245,241,.97);box-shadow:0 -4px 18px rgba(64,58,55,.08);backdrop-filter:blur(10px)}
  #bottomControls{z-index:25}
  #guideCard{margin-bottom:110px}
  #guideScroll{height:50dvh;min-height:320px;max-height:560px}
  .screen{padding-bottom:calc(190px + env(safe-area-inset-bottom))}
  #playerNav{position:fixed;left:11px;right:11px;top:calc(8px + env(safe-area-inset-top));z-index:70;margin:0;pointer-events:none}
  #playerBackBtn,#playerTypePill{pointer-events:auto}
}
</style>'''
# Remove older mobile override before inserting this one.
for old_id in ['mobile-player-v141','mobile-player-v145']:
    marker = '<style id="' + old_id + '">'
    if marker in s:
        start = s.index(marker)
        end = s.index('</style>', start) + len('</style>')
        s = s[:start] + s[end:]
s = s.replace('</head>', mobile_css + '\n</head>', 1)

# Visible Meditation / Hypnosis tabs on the first app screen and a permanent back button in the player.
type_css = '''<style id="locked-session-type-v145">
.session-type-picker{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:6px}
.session-type-picker .btn.active{background:var(--teal);border-color:var(--teal);color:#fff;font-weight:800}
.session-type-badge{display:inline-flex;align-items:center;margin:0 0 8px;border:1px solid var(--line);border-radius:999px;padding:6px 10px;font-size:12px;font-weight:800;color:var(--teal);background:var(--paper)}
.session-type-home{margin:8px 0 16px;padding:12px;background:rgba(255,253,249,.99);border:2px solid rgba(92,133,134,.24)}
.session-type-home .kicker{margin:2px 4px 8px}
.session-type-home .session-type-picker{margin-top:0}
.session-type-home .btn{min-height:60px;font-size:17px;font-weight:850;border-radius:18px}
.player-nav{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:0 0 10px;position:sticky;top:calc(6px + env(safe-area-inset-top));z-index:40}
.player-back{background:rgba(255,253,249,.98);box-shadow:0 4px 14px rgba(64,58,55,.12);font-weight:800;border-color:rgba(92,133,134,.35)}
.type-modal-title{margin-bottom:8px}
</style>'''
for old_id in ['locked-session-type-v142','locked-session-type-v144','locked-session-type-v145']:
    marker = '<style id="' + old_id + '">'
    if marker in s:
        start = s.index(marker)
        end = s.index('</style>', start) + len('</style>')
        s = s[:start] + s[end:]
s = s.replace('</head>', type_css + '\n</head>', 1)

# The two tabs must be visible immediately after opening the user's space.
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

player_anchor = '''  <div id="playerView" class="hidden player">
    <div class="brand">RÉGIE DE MON HÊTRE</div>'''
player_block = '''  <div id="playerView" class="hidden player">
    <div class="player-nav" id="playerNav"><button class="btn small player-back" id="playerBackBtn" type="button">‹ Retour aux séances</button><span class="pill" id="playerTypePill"></span></div>
    <div class="brand">RÉGIE DE MON HÊTRE</div>'''
if 'id="playerBackBtn"' not in s:
    if player_anchor not in s:
        raise SystemExit('player anchor missing')
    s = s.replace(player_anchor, player_block, 1)

# Make entering the app explicitly request the session type when it has not been chosen yet.
enter_old = '''function enterApp(){
  $("authScreen").classList.add("hidden");$("appScreen").classList.remove("hidden");
  $("accountBtn").textContent=profile?.displayName||"Mon espace";
  renderHome();startPullLoop();syncPull().catch(()=>{});
}'''
enter_new = '''function enterApp(){
  $("authScreen").classList.add("hidden");$("appScreen").classList.remove("hidden");
  $("accountBtn").textContent=profile?.displayName||"Mon espace";
  renderHome();startPullLoop();syncPull().catch(()=>{});
  setTimeout(()=>window.ensureRegieTypeChoice?.(),120);
}'''
if enter_old in s:
    s = s.replace(enter_old, enter_new, 1)
elif 'ensureRegieTypeChoice' not in s:
    raise SystemExit('enterApp anchor missing')

script = '''<script id="locked-session-type-script-v145">
(()=>{
  const norm=t=>t==="hypnose"?"hypnose":t==="meditation"?"meditation":"";
  const label=t=>t==="hypnose"?"Hypnose":t==="meditation"?"Méditation":"Type à choisir";
  const current=()=>{try{return norm(state&&state.sessionType)}catch(e){return ""}};
  const paint=()=>{
    const t=current();
    document.querySelectorAll("[data-session-type]").forEach(b=>b.classList.toggle("active",b.dataset.sessionType===t));
    const badge=document.getElementById("homeSessionType");if(badge)badge.textContent=label(t);
    const pill=document.getElementById("playerTypePill");if(pill)pill.textContent=t?label(t):"";
  };
  window.setRegieSessionType=t=>{
    try{state.sessionType=norm(t);paint();if(typeof persistLocal==="function")persistLocal();return true}catch(e){return false}
  };

  const showChooser=()=>{
    if(current())return false;
    if(document.getElementById("chooseMeditation"))return true;
    if(typeof showModal!=="function")return false;
    showModal(`<div class="kicker">MES SÉANCES</div><h2 class="type-modal-title">Méditation ou hypnose ?</h2><p class="note">Choisis l’espace dans lequel tu veux travailler.</p><div class="session-type-picker"><button class="btn" id="chooseMeditation">Méditation</button><button class="btn" id="chooseHypnose">Hypnose</button></div>`);
    const m=document.getElementById("chooseMeditation"),h=document.getElementById("chooseHypnose");
    if(m)m.onclick=()=>{window.setRegieSessionType("meditation");closeModal();paint()};
    if(h)h.onclick=()=>{window.setRegieSessionType("hypnose");closeModal();paint()};
    return true;
  };
  window.ensureRegieTypeChoice=showChooser;

  document.addEventListener("click",e=>{
    const b=e.target.closest&&e.target.closest("[data-session-type]");
    if(b){e.preventDefault();window.setRegieSessionType(b.dataset.sessionType);return;}
    if(e.target.closest&&e.target.closest("#editSessionBtn"))setTimeout(paint,0);
  });

  const open=document.getElementById("openRegieBtn");
  if(open)open.addEventListener("click",e=>{
    if(current())return;
    e.preventDefault();e.stopImmediatePropagation();
    showChooser();
  },true);

  const goHome=()=>{
    try{
      if(typeof stopPlayer==="function" && typeof view!=="undefined" && view==="player")stopPlayer();
      else if(typeof renderHome==="function")renderHome();
      paint();
      try{history.replaceState({regieView:"home"},"")}catch(e){}
      return true;
    }catch(e){return false}
  };
  window.regieBack=()=>{
    try{
      if(typeof view!=="undefined" && ["player","edit","music"].includes(view))return goHome();
    }catch(e){}
    return false;
  };
  const back=document.getElementById("playerBackBtn");if(back)back.onclick=goHome;

  // Browser back must return from a session instead of leaving the app.
  const markView=()=>{
    try{
      if(typeof view!=="undefined" && ["player","edit","music"].includes(view) && history.state?.regieView!==view)history.pushState({regieView:view},"");
    }catch(e){}
  };
  document.addEventListener("click",()=>setTimeout(()=>{paint();markView()},0));
  window.addEventListener("popstate",()=>{try{if(typeof view!=="undefined" && ["player","edit","music"].includes(view))goHome()}catch(e){}});

  const save=document.getElementById("saveSessionBtn");if(save)save.addEventListener("click",()=>setTimeout(paint,0));
  const reset=document.getElementById("resetSessionBtn");if(reset)reset.addEventListener("click",()=>setTimeout(paint,0));
  paint();
  setTimeout(()=>{
    paint();
    const app=document.getElementById("appScreen");
    if(app && !app.classList.contains("hidden"))showChooser();
  },180);
})();
</script>'''
for old_id in ['locked-session-type-script-v142','locked-session-type-script-v144','locked-session-type-script-v145']:
    marker = '<script id="' + old_id + '">'
    if marker in s:
        start = s.index(marker)
        end = s.index('</script>', start) + len('</script>')
        s = s[:start] + s[end:]
s = s.replace('</body>', script + '\n</body>', 1)

required = [
    'name="regie-build" content="14.5"', 'locked-session-type-script-v145',
    'Méditation', 'Hypnose', 'id="homeSessionTypePicker"', 'id="sessionTypePicker"',
    'id="playerBackBtn"', 'window.ensureRegieTypeChoice', 'window.regieBack',
    'mobile-player-v145', 'id="autoRow"', 'id="guideScroll"', 'id="playPauseBtn"',
    'id="musicCard"', 'id="phaseAutoBtn"', 'id="accountBtn"', 'regie-sync',
    'manualScrollUntil', 'function toggleRun', 'faderEdge'
]
missing = [x for x in required if x not in s]
if missing:
    raise SystemExit('missing validated features: ' + ', '.join(missing))

p.write_text(s, encoding='utf-8')
print('V14.5: chooser visible, back button permanent, validated functions preserved')
