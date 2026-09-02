from pathlib import Path
import sys

p = Path(sys.argv[1] if len(sys.argv) > 1 else 'pwa-dist/regie-v14/index.html')
s = p.read_text(encoding='utf-8')

css_marker = '.instrument{padding:12px 15px}\n'
css = r'''.instrument{padding:12px 15px}
.instrument-visual{position:relative;overflow:hidden;border:1px solid var(--line);border-radius:20px;background:linear-gradient(145deg,#fffdf9,#f6f0e8);margin:7px 0 9px;box-shadow:inset 0 0 0 1px rgba(255,255,255,.55)}
.instrument-hint{font-size:11px;color:var(--muted);text-align:center;margin-top:4px}
.instrument-controls{gap:6px!important;align-items:center}
.instrument-controls .btn,.auto-row .btn{min-height:31px!important;padding:4px 9px!important;border-radius:11px!important;font-size:13px!important;min-width:36px}
.phase-actions .btn{min-height:34px!important;padding:5px 7px!important;font-size:12px!important;border-radius:12px!important}
.player-topline{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:7px}
.player-topline .brand{margin:0}
.fullscreen-btn{min-height:30px!important;padding:4px 9px!important;border-radius:11px!important;font-size:12px!important;white-space:nowrap}
.exact-side-field{margin-top:9px;padding:10px 12px;border:1px dashed rgba(92,133,134,.35);border-radius:15px;background:rgba(92,133,134,.045)}
.exact-side-field small{display:block;margin-top:5px;color:var(--muted);font-size:11px;line-height:1.35}
.simple-rain-stage{height:clamp(140px,21vw,178px);display:grid;place-items:center;padding:19px 16px}
.simple-rain-tube{position:relative;width:min(92%,560px);height:50px;border:2px solid rgba(92,133,134,.53);border-radius:999px;background:linear-gradient(180deg,rgba(255,255,255,.72),rgba(220,234,232,.18));box-shadow:inset 0 4px 11px rgba(255,255,255,.92),0 6px 15px rgba(64,58,55,.07);overflow:hidden;transform-origin:center;will-change:transform}
.simple-rain-tube:before,.simple-rain-tube:after{content:"";position:absolute;top:6px;bottom:6px;width:12px;border-radius:999px;background:rgba(92,133,134,.13);border:1px solid rgba(92,133,134,.20);z-index:2}
.simple-rain-tube:before{left:6px}.simple-rain-tube:after{right:6px}
.rain-beads{position:absolute;inset:5px 18px;overflow:hidden;border-radius:999px}
.rain-beads i{position:absolute;width:7px;height:3.4px;margin:-1.7px 0 0 -3.5px;border-radius:62% 48% 58% 46%;background:linear-gradient(180deg,#fff8e8,#e9dcc2);box-shadow:0 .6px 1.6px rgba(91,73,53,.26),inset 0 0 0 .5px rgba(196,178,148,.55);will-change:left,top,transform}
.rain-breath-line{position:absolute;left:10%;right:10%;bottom:9px;height:3px;border-radius:99px;background:rgba(92,133,134,.11);overflow:hidden}
.rain-breath-line i{display:block;height:100%;width:0;border-radius:99px;background:linear-gradient(90deg,var(--teal),var(--mauve));will-change:width}
.simple-ocean-wrap{height:clamp(225px,38vw,330px);display:grid;place-items:center;padding:10px}
.simple-ocean-drum{position:relative;width:min(90%,300px);aspect-ratio:1;border-radius:50%;border:8px solid rgba(92,133,134,.24);background:radial-gradient(circle at 50% 43%,rgba(255,255,255,.91),rgba(238,231,222,.72));box-shadow:inset 0 0 0 2px rgba(92,133,134,.18),0 8px 20px rgba(64,58,55,.08);overflow:hidden;will-change:transform;transform-origin:center}
.simple-ocean-drum:after{content:"";position:absolute;inset:15%;border-radius:50%;border:1px solid rgba(92,133,134,.10);pointer-events:none}
.ocean-beads-simple{position:absolute;inset:7%;border-radius:50%;overflow:hidden}
.ocean-beads-simple i{position:absolute;width:8px;height:8px;margin:-4px 0 0 -4px;border-radius:50%;background:#fff;box-shadow:0 1px 2.6px rgba(75,65,56,.34),inset 0 0 0 1px rgba(211,201,189,.76);will-change:left,top}
@media(max-width:520px){.simple-rain-stage{height:132px;padding:15px 8px}.simple-rain-tube{height:44px}.rain-beads i{width:6px;height:3px;margin:-1.5px 0 0 -3px}.simple-ocean-wrap{height:238px}.simple-ocean-drum{width:min(92%,220px)}.ocean-beads-simple i{width:7px;height:7px;margin:-3.5px 0 0 -3.5px}.fullscreen-btn{font-size:0}.fullscreen-btn:after{content:"⛶";font-size:16px}}
'''
if css_marker not in s:
    raise SystemExit('CSS instrument marker not found')
s = s.replace(css_marker, css, 1)

player_anchor = '    <div class="brand">RÉGIE DE MON HÊTRE</div>\n    <div class="card player-head">\n'
player_repl = '    <div class="player-topline"><div class="brand">RÉGIE DE MON HÊTRE</div><button class="btn small fullscreen-btn" id="fullscreenBtn" type="button">⛶ Plein écran</button></div>\n    <div class="card player-head">\n'
if player_anchor not in s:
    raise SystemExit('player heading anchor not found')
s = s.replace(player_anchor, player_repl, 1)

editor_start = s.index('function renderEditor(){')
editor_end = s.index('function addPhaseEdit(){', editor_start)
editor_fn = r'''function renderEditor(){showView("edit");$("editType").value=state.type||"meditation";$("editTitle").value=state.title||"";let box=$("phaseEditors");box.innerHTML="";
  state.phases.forEach((p,i)=>{let d=document.createElement("div");d.className="card phase-editor";const exact=Number(p.sideSeconds)||Number(state.prefs.rainSeconds)||5;d.innerHTML=`<div class="kicker">PHASE ${i+1}</div><label class="field"><span>Nom</span><input data-i="${i}" data-k="name" type="text" value="${esc(p.name||"")}"></label><div class="row"><label class="field grow"><span>Durée en minutes</span><input data-i="${i}" data-k="minutes" type="number" min="1" max="120" value="${Number(p.minutes)||1}"></label><label class="field grow"><span>Repère / instrument</span><select data-i="${i}" data-k="instrument"><option value="0">Aucun</option><option value="1">Bâton de pluie</option><option value="2">Tambour océan</option><option value="3">Musique</option><option value="4">Silence</option></select></label></div><label class="field exact-side-field ${Number(p.instrument)===1?"":"hidden"}" data-side-wrap="${i}"><span>Durée d’un côté du bâton — en secondes</span><input data-i="${i}" data-k="sideSeconds" type="text" inputmode="decimal" autocomplete="off" value="${String(exact).replace(".",",")}" placeholder="ex. 4,75"><small>Réglage précis : tu peux écrire 4,75 ; 5,12 ; 6,03… La valeur n’est pas arrondie à la seconde.</small></label><label class="field"><span>Texte à dire</span><textarea data-i="${i}" data-k="text">${esc(p.text||"")}</textarea></label><label class="field"><span>Repère de conduite</span><textarea data-i="${i}" data-k="cue" style="min-height:90px">${esc(p.cue||"")}</textarea></label><div class="phase-actions"><button class="btn" data-m="up">↑</button><button class="btn" data-m="down">↓</button><button class="btn" data-m="dup">Dupliquer</button><button class="btn danger" data-m="del">Supprimer</button></div>`;const sel=d.querySelector('select[data-k="instrument"]');sel.value=String(Number(p.instrument)||0);d.querySelector('[data-m="up"]').onclick=()=>movePhaseEdit(i,-1);d.querySelector('[data-m="down"]').onclick=()=>movePhaseEdit(i,1);d.querySelector('[data-m="dup"]').onclick=()=>duplicatePhaseEdit(i);d.querySelector('[data-m="del"]').onclick=()=>deletePhaseEdit(i);box.appendChild(d)});
  box.querySelectorAll("input,textarea,select[data-k]").forEach(el=>el.oninput=()=>{let p=state.phases[+el.dataset.i];if(!p)return;const k=el.dataset.k;if(k==="minutes")p.minutes=clamp(+el.value||1,1,120);else if(k==="instrument"){p.instrument=+el.value||0;const w=box.querySelector(`[data-side-wrap="${el.dataset.i}"]`);if(w)w.classList.toggle("hidden",p.instrument!==1)}else if(k==="sideSeconds"){const raw=String(el.value||"").trim().replace(",",".");const v=Number(raw);if(Number.isFinite(v)&&v>=.01&&v<=60)p.sideSeconds=v}else p[k]=el.value})
}
'''
s = s[:editor_start] + editor_fn + s[editor_end:]

start = s.index('function updateInstrument(p){')
end = s.index('function animateInstruments(){', start)
update_fn = r'''function formatExactSeconds(v){return Number(v).toLocaleString("fr-FR",{maximumFractionDigits:3})}
function phaseSideSeconds(p){const v=Number(p?.sideSeconds);return Number.isFinite(v)&&v>=.01?v:(Number(state.prefs.rainSeconds)||5)}
function adjustPhaseSideSeconds(p,delta){p.sideSeconds=clamp(Math.round((phaseSideSeconds(p)+delta)*100)/100,.01,60);persistLocal();if($("rainLabel"))$("rainLabel").textContent="• "+formatExactSeconds(p.sideSeconds)+" s"}
function updateInstrument(p){
  let host=$("instrumentHost"),current=host.dataset.phase;
  if(current===String(phaseIndex))return;host.dataset.phase=String(phaseIndex);host.innerHTML="";
  if(p.instrument===1){
    const sec=phaseSideSeconds(p);
    host.innerHTML=`<div class="card instrument"><div class="instrument-title">COHÉRENCE CARDIAQUE — BÂTON DE PLUIE</div>
      <div class="instrument-visual simple-rain-stage"><div id="simpleRainTube" class="simple-rain-tube"><div id="rainBeads" class="rain-beads"></div></div><div class="rain-breath-line"><i id="rainBreathFill"></i></div></div>
      <div class="instrument-controls"><div class="note" id="rainLabel">INSPIRE • ${formatExactSeconds(sec)} s</div><button class="btn small" id="rainMinus" title="− 0,1 seconde">−</button><button class="btn small" id="rainPlus" title="+ 0,1 seconde">+</button></div>
      <div class="instrument-hint">Les petits grains de riz glissent dans le tube. Le temps exact d’un côté se règle dans la création de la séance.</div></div>`;
    const layer=$("rainBeads");for(let i=0;i<38;i++){let b=document.createElement("i");layer.appendChild(b)}
    $("rainMinus").onclick=()=>adjustPhaseSideSeconds(p,-.1);
    $("rainPlus").onclick=()=>adjustPhaseSideSeconds(p,.1);
  }else if(p.instrument===2){
    host.innerHTML=`<div class="card instrument"><div class="instrument-title">TAMBOUR OCÉAN — RYTHME DE LA VAGUE</div><div class="note">Monte • sommet • redescend</div>
      <div class="instrument-visual simple-ocean-wrap"><div id="simpleOceanDrum" class="simple-ocean-drum"><div id="oceanBeads" class="ocean-beads-simple"></div></div></div>
      <div class="instrument-controls"><div class="note" id="waveLabel">1 vague • ${state.prefs.waveSeconds||8} s</div><button class="btn small" id="waveMinus">−</button><button class="btn small" id="wavePlus">+</button></div>
      <div class="instrument-hint">Les billes roulent simplement d’un côté à l’autre avec le mouvement du tambour.</div></div>`;
    const layer=$("oceanBeads");for(let i=0;i<46;i++){let b=document.createElement("i");layer.appendChild(b)}
    $("waveMinus").onclick=()=>{state.prefs.waveSeconds=clamp((state.prefs.waveSeconds||8)-1,4,20);persistLocal();host.dataset.phase="";updateInstrument(p)};
    $("wavePlus").onclick=()=>{state.prefs.waveSeconds=clamp((state.prefs.waveSeconds||8)+1,4,20);persistLocal();host.dataset.phase="";updateInstrument(p)};
  }else if(p.instrument===4){
    host.innerHTML=`<div class="card instrument"><div class="instrument-title">SILENCE</div><div class="note">Silence complet. Le temps continue, sans intervention.</div></div>`;
  }
}
'''
s = s[:start] + update_fn + s[end:]

start = s.index('function animateInstruments(){')
end = s.index('function buildMusicSelect(){', start)
animate_fn = r'''function animateInstruments(){
  if(!playing){requestAnimationFrame(animateInstruments);return}
  const p=state.phases[phaseIndex],t=performance.now()/1000;
  if(p.instrument===1&&$("simpleRainTube")){
    const sec=phaseSideSeconds(p),cycle=(t%(sec*2))/(sec*2),flow=Math.sin(cycle*Math.PI*2),tilt=flow*8;
    $("simpleRainTube").style.transform=`rotate(${tilt.toFixed(2)}deg)`;
    const grains=$("rainBeads").querySelectorAll("i");
    grains.forEach((b,i)=>{
      const row=Math.floor(i/10),col=(i%10)-4.5;
      const pile=31*Math.tanh(flow*2.1);
      let x=50+pile+col*4.0+Math.sin(t*2.15+i*.71)*1.05;
      let y=57+row*6.2+Math.cos(t*1.55+i*.63)*1.35-Math.abs(col)*.22;
      x=clamp(x,7,93);y=clamp(y,23,82);b.style.left=x.toFixed(2)+"%";b.style.top=y.toFixed(2)+"%";b.style.transform=`rotate(${(18*Math.sin(i*1.9+t*.8)+flow*28).toFixed(1)}deg)`;
    });
    const progress=cycle<.5?cycle*2:(1-cycle)*2;if($("rainBreathFill"))$("rainBreathFill").style.width=(progress*100).toFixed(1)+"%";
    $("rainLabel").textContent=(cycle<.5?"INSPIRE":"EXPIRE")+" • "+formatExactSeconds(sec)+" s";
  }
  if(p.instrument===2&&$("oceanBeads")){
    const sec=state.prefs.waveSeconds||8,q=(t%sec)/sec,side=Math.sin(q*Math.PI*2),lift=Math.cos(q*Math.PI*2);
    if($("simpleOceanDrum"))$("simpleOceanDrum").style.transform=`rotate(${(side*2.2).toFixed(2)}deg)`;
    const beads=$("oceanBeads").querySelectorAll("i");
    beads.forEach((b,i)=>{
      const row=Math.floor(i/8),col=(i%8)-3.5;
      const spread=4.6+(row%2)*.5;
      let x=50+side*25+col*spread+Math.sin(t*1.8+i*.55)*1.7;
      let y=63+row*3.8+lift*(3+(i%3))+Math.cos(t*1.35+i*.47)*1.3;
      x=clamp(x,9,91);y=clamp(y,18,91);b.style.left=x.toFixed(2)+"%";b.style.top=y.toFixed(2)+"%";
    });
    if($("waveLabel"))$("waveLabel").textContent="1 vague • "+sec+" s";
  }
  requestAnimationFrame(animateInstruments);
}
requestAnimationFrame(animateInstruments);

function syncFullscreenButton(){const b=$("fullscreenBtn");if(!b)return;const on=!!(document.fullscreenElement||document.webkitFullscreenElement);b.textContent=on?"⛶ Quitter":"⛶ Plein écran"}
async function toggleFullscreen(){
  try{
    const active=document.fullscreenElement||document.webkitFullscreenElement;
    if(!active){const el=document.documentElement,fn=el.requestFullscreen||el.webkitRequestFullscreen;if(fn)await fn.call(el)}
    else{const fn=document.exitFullscreen||document.webkitExitFullscreen;if(fn)await fn.call(document)}
  }catch(e){}
  syncFullscreenButton();
}
$("fullscreenBtn").onclick=toggleFullscreen;
document.addEventListener("fullscreenchange",syncFullscreenButton);document.addEventListener("webkitfullscreenchange",syncFullscreenButton);

'''
s = s[:start] + animate_fn + s[end:]

p.write_text(s, encoding='utf-8')
print('precise instrument controls patched', len(s))
