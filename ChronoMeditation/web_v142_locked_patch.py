from pathlib import Path
import sys

if len(sys.argv) != 2:
    raise SystemExit('usage: web_v142_locked_patch.py <index.html>')

p = Path(sys.argv[1])
s = p.read_text(encoding='utf-8')

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

# Restore the validated Meditation / Hypnosis choice without changing the rest.
type_css = '''<style id="locked-session-type-v142">
.session-type-picker{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:6px}
.session-type-picker .btn.active{background:var(--teal);border-color:var(--teal);color:#fff;font-weight:800}
.session-type-badge{display:inline-flex;align-items:center;margin:0 0 8px;border:1px solid var(--line);border-radius:999px;padding:6px 10px;font-size:12px;font-weight:800;color:var(--teal);background:var(--paper)}
.session-type-home{margin:12px 0 16px;padding:14px 16px}
.session-type-home .kicker{margin-bottom:8px}
.session-type-home .session-type-picker{margin-top:0}
.session-type-home .btn{min-height:54px;font-weight:800}
</style>'''
if 'locked-session-type-v142' not in s:
    s = s.replace('</head>', type_css + '\n</head>', 1)

# The two choices must be visible immediately on the home screen.
home_intro_anchor = '''<p class="subtitle">Ton fil conducteur pour guider une méditation ou une séance d’hypnose sans perdre le texte, le temps, le rythme ni tes transitions.</p>'''
home_intro_block = '''<p class="subtitle">Ton fil conducteur pour guider une méditation ou une séance d’hypnose sans perdre le texte, le temps, le rythme ni tes transitions.</p>
    <div class="card session-type-home" id="homeSessionTypeCard">
      <div class="kicker">TYPE DE SÉANCE</div>
      <div class="session-type-picker" id="homeSessionTypePicker">
        <button class="btn" type="button" data-session-type="meditation">Méditation</button>
        <button class="btn" type="button" data-session-type="hypnose">Hypnose</button>
      </div>
    </div>'''
if 'id="homeSessionTypePicker"' not in s:
    if home_intro_anchor not in s:
        raise SystemExit('home intro anchor missing')
    s = s.replace(home_intro_anchor, home_intro_block, 1)

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

script = '''<script id="locked-session-type-script-v142">
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
    document.getElementById("chooseMeditation").onclick=()=>{window.setRegieSessionType("meditation");closeModal();startPlayer()};
    document.getElementById("chooseHypnose").onclick=()=>{window.setRegieSessionType("hypnose");closeModal();startPlayer()};
    document.getElementById("chooseCancel").onclick=closeModal;
  },true);

  const save=document.getElementById("saveSessionBtn");
  if(save)save.addEventListener("click",()=>setTimeout(paint,0));
  const reset=document.getElementById("resetSessionBtn");
  if(reset)reset.addEventListener("click",()=>setTimeout(paint,0));
  paint();
})();
</script>'''
if 'locked-session-type-script-v142' not in s:
    s = s.replace('</body>', script + '\n</body>', 1)

# Fail rather than silently publish a version that lost a validated feature.
required = [
    'locked-session-type-script-v142', 'Méditation', 'Hypnose',
    'id="homeSessionTypePicker"', 'id="sessionTypePicker"',
    'mobile-player-v141', 'id="autoRow"', 'id="guideScroll"',
    'id="playPauseBtn"', 'id="musicCard"', 'id="phaseAutoBtn"',
    'id="accountBtn"', 'regie-sync', 'manualScrollUntil',
    'function toggleRun', 'faderEdge'
]
missing = [x for x in required if x not in s]
if missing:
    raise SystemExit('missing validated features: ' + ', '.join(missing))

p.write_text(s, encoding='utf-8')
print('V14.2 locked web patch applied and validated with home Meditation/Hypnosis tabs')
