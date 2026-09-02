from pathlib import Path
import sys

p = Path(sys.argv[1] if len(sys.argv) > 1 else 'pwa-dist/regie-v14/index.html')
s = p.read_text(encoding='utf-8')

# Professional builder styling: rich construction controls, compact during use.
style = r'''
/* Professional session builder */
.builder-summary{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 14px;margin:12px 0 14px;border:1px solid var(--line);border-radius:17px;background:rgba(92,133,134,.055)}
.builder-summary strong{font-size:15px}.builder-total{font-variant-numeric:tabular-nums;font-weight:850;color:var(--teal);white-space:nowrap}
.phase-editor{padding:15px!important}.phase-editor+.phase-editor{margin-top:12px}
.phase-editor-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:7px}.phase-duration-badge{padding:5px 9px;border-radius:999px;background:var(--soft);font-size:11px;font-weight:800;color:var(--teal);font-variant-numeric:tabular-nums}
.timing-grid{display:grid;grid-template-columns:1fr 1fr 1.35fr;gap:8px}.phase-pro{margin:9px 0 12px;border:1px solid var(--line);border-radius:15px;background:rgba(255,255,255,.42);overflow:hidden}.phase-pro summary{cursor:pointer;padding:10px 12px;font-size:12px;font-weight:850;letter-spacing:.04em;color:var(--teal);user-select:none}.phase-pro-body{padding:0 12px 12px}.pro-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.instrument-settings{margin-top:8px;padding-top:8px;border-top:1px dashed var(--line)}
.phase-actions{grid-template-columns:38px 38px 1fr 1fr!important}.phase-actions .btn{min-width:0!important}
.phase-editor textarea[data-k="text"]{min-height:170px}.phase-editor textarea[data-k="cue"],.phase-editor textarea[data-k="transition"]{min-height:78px}
.pro-help{font-size:11px;line-height:1.4;color:var(--muted);margin-top:5px}
@media(max-width:620px){.timing-grid,.pro-grid{grid-template-columns:1fr 1fr}.timing-grid .instrument-field{grid-column:1/-1}.builder-summary{align-items:flex-start}.phase-editor textarea[data-k="text"]{min-height:145px}}
'''
if '</style>' not in s:
    raise SystemExit('style closing tag missing')
s = s.replace('</style>', style + '\n</style>', 1)

# Helpers for precise phase construction and runtime behavior.
anchor = 'let currentSpace=null;\n'
helpers = r'''function phaseDurationMs(p){
  const m=Math.max(0,Math.round(Number(p?.minutes)||0)),sec=clamp(Math.round(Number(p?.seconds)||0),0,59);
  return Math.max(1000,(m*60+sec)*1000)
}
function phaseDurationLabel(p){
  const total=Math.round(phaseDurationMs(p)/1000),m=Math.floor(total/60),sec=total%60;
  return sec?`${m} min ${String(sec).padStart(2,"0")} s`:`${m} min`
}
function sessionDurationLabel(phases){
  const total=Math.round((phases||[]).reduce((a,p)=>a+phaseDurationMs(p),0)/1000),h=Math.floor(total/3600),m=Math.floor((total%3600)/60),sec=total%60;
  if(h)return `${h} h ${String(m).padStart(2,"0")} min${sec?` ${String(sec).padStart(2,"0")} s`:""}`;
  return `${m} min${sec?` ${String(sec).padStart(2,"0")} s`:""}`
}
function phaseAutoNext(p){return p?.autoNext!==false}
function phaseWaveSeconds(p){const v=Math.round(Number(p?.waveSeconds));return Number.isFinite(v)&&v>=2?clamp(v,2,60):clamp(Math.round(Number(state.prefs.waveSeconds)||8),2,60)}
let phaseAlertKey="",lastPreparedPhase=-1;
function firePhaseAlert(p,dur){
  const before=clamp(Math.round(Number(p?.alertBefore)||0),0,600)*1000;if(!before||phaseElapsed<dur-before||phaseElapsed>=dur)return;
  const key=phaseIndex+"|"+dur+"|"+before;if(phaseAlertKey===key)return;phaseAlertKey=key;
  try{navigator.vibrate?.([70,45,70])}catch{};toast(`${Math.round(before/1000)} s avant la fin — ${p.name||"phase"}`)
}
function preparePhaseMedia(p){
  if(lastPreparedPhase===phaseIndex)return;lastPreparedPhase=phaseIndex;
  if(Number(p?.instrument)!==3)return;
  const slot=Math.round(Number(p.musicSlot));
  if(Number.isInteger(slot)&&slot>=0&&slot<state.musicSlots.length){
    const select=$("playerMusicSelect"),value="slot"+slot;
    if(select&&Array.from(select.options).some(o=>o.value===value)){select.value=value;setMusicMode(value)}
  }
  const vol=Number(p.phaseVolume);if(Number.isFinite(vol))setVolume(clamp(Math.round(vol),0,100),false)
}
'''
if anchor not in s:
    raise SystemExit('selector state anchor missing')
s = s.replace(anchor, helpers + anchor, 1)

# Session list uses the true sum of minutes + seconds.
old_summary = '${totalMinutes(sess.phases)} min • ${sess.phases.length} phase'
new_summary = '${sessionDurationLabel(sess.phases)} • ${sess.phases.length} phase'
if old_summary not in s:
    raise SystemExit('session duration summary anchor missing')
s = s.replace(old_summary, new_summary, 1)

# Replace the editor with a detailed construction desk while keeping the live player simple.
start = s.index('function renderEditor(){')
end = s.index('function addPhaseEdit(){', start)
editor = r'''function renderEditor(){
  showView("edit");$("editType").value=state.type||"meditation";$("editType").disabled=true;$("editTitle").value=state.title||"";
  let box=$("phaseEditors");box.innerHTML=`<div class="builder-summary"><div><strong>Construction de la séance</strong><div class="pro-help">Règle ici les détails. Pendant la séance, la régie reste volontairement simple.</div></div><div class="builder-total" id="builderTotal">${sessionDurationLabel(state.phases)}</div></div>`;
  state.phases.forEach((p,i)=>{
    p.minutes=Math.max(0,Math.round(Number(p.minutes)||0));p.seconds=clamp(Math.round(Number(p.seconds)||0),0,59);if(!p.minutes&&!p.seconds)p.minutes=1;
    if(typeof p.autoNext!=="boolean")p.autoNext=true;if(!Number.isFinite(Number(p.alertBefore)))p.alertBefore=0;
    const exact=Math.max(1,Math.round(Number(p.sideSeconds)||Number(state.prefs.rainSeconds)||5));
    const wave=phaseWaveSeconds(p),vol=clamp(Math.round(Number(p.phaseVolume ?? state.prefs.musicVolume ?? 50)),0,100),slot=Number.isFinite(Number(p.musicSlot))?Math.round(Number(p.musicSlot)):-1;
    const musicOptions=state.musicSlots.map((m,n)=>`<option value="${n}">${esc(m.name||("Musique "+(n+1)))}</option>`).join("");
    let d=document.createElement("div");d.className="card phase-editor";
    d.innerHTML=`<div class="phase-editor-head"><div class="kicker">PHASE ${i+1}</div><div class="phase-duration-badge">${phaseDurationLabel(p)}</div></div>
      <label class="field"><span>Nom de la phase</span><input data-i="${i}" data-k="name" type="text" value="${esc(p.name||"")}"></label>
      <div class="timing-grid">
        <label class="field"><span>Minutes</span><input data-i="${i}" data-k="minutes" type="number" min="0" max="180" step="1" value="${p.minutes}"></label>
        <label class="field"><span>Secondes</span><input data-i="${i}" data-k="seconds" type="number" min="0" max="59" step="1" value="${p.seconds}"></label>
        <label class="field instrument-field"><span>Repère / instrument</span><select data-i="${i}" data-k="instrument"><option value="0">Aucun</option><option value="1">Bâton de pluie</option><option value="2">Tambour océan</option><option value="3">Musique</option><option value="4">Silence</option></select></label>
      </div>
      <details class="phase-pro"><summary>Réglages de conduite de cette phase</summary><div class="phase-pro-body">
        <div class="pro-grid">
          <label class="field"><span>Passage à la phase suivante</span><select data-i="${i}" data-k="autoNext"><option value="1">Automatique</option><option value="0">Manuel</option></select></label>
          <label class="field"><span>M’avertir avant la fin</span><select data-i="${i}" data-k="alertBefore"><option value="0">Aucune alerte</option><option value="10">10 secondes</option><option value="20">20 secondes</option><option value="30">30 secondes</option><option value="60">1 minute</option><option value="120">2 minutes</option></select></label>
        </div>
        <div class="instrument-settings ${Number(p.instrument)===1?"":"hidden"}" data-pro-inst="rain-${i}"><label class="field"><span>Temps d’un côté du bâton de pluie</span><input data-i="${i}" data-k="sideSeconds" type="number" min="1" max="60" step="1" value="${exact}"></label><div class="pro-help">Une seconde entière par pas. Ce rythme est propre à cette phase.</div></div>
        <div class="instrument-settings ${Number(p.instrument)===2?"":"hidden"}" data-pro-inst="ocean-${i}"><label class="field"><span>Durée d’une vague du tambour océan</span><input data-i="${i}" data-k="waveSeconds" type="number" min="2" max="60" step="1" value="${wave}"></label></div>
        <div class="instrument-settings ${Number(p.instrument)===3?"":"hidden"}" data-pro-inst="music-${i}"><div class="pro-grid"><label class="field"><span>Musique à préparer</span><select data-i="${i}" data-k="musicSlot"><option value="-1">Ne rien changer</option>${musicOptions}</select></label><label class="field"><span>Volume de départ</span><input data-i="${i}" data-k="phaseVolume" type="number" min="0" max="100" step="1" value="${vol}"></label></div><div class="pro-help">La régie prépare la piste et son volume au début de la phase ; tu gardes la main sur Lecture / Pause.</div></div>
      </div></details>
      <label class="field"><span>Texte à dire</span><textarea data-i="${i}" data-k="text">${esc(p.text||"")}</textarea></label>
      <label class="field"><span>Repère de conduite</span><textarea data-i="${i}" data-k="cue" placeholder="Ex. ralentir la voix, laisser un silence, prendre le bâton…">${esc(p.cue||"")}</textarea></label>
      <label class="field"><span>Transition vers la phase suivante</span><textarea data-i="${i}" data-k="transition" placeholder="Ex. laisser 20 secondes de silence puis changer de posture…">${esc(p.transition||"")}</textarea></label>
      <div class="phase-actions"><button class="btn" data-m="up" title="Monter">↑</button><button class="btn" data-m="down" title="Descendre">↓</button><button class="btn" data-m="dup">Dupliquer</button><button class="btn danger" data-m="del">Supprimer</button></div>`;
    const inst=d.querySelector('select[data-k="instrument"]'),auto=d.querySelector('select[data-k="autoNext"]'),alert=d.querySelector('select[data-k="alertBefore"]'),music=d.querySelector('select[data-k="musicSlot"]');
    inst.value=String(Number(p.instrument)||0);auto.value=p.autoNext?"1":"0";alert.value=String(Math.round(Number(p.alertBefore)||0));if(music)music.value=String(slot);
    d.querySelector('[data-m="up"]').onclick=()=>movePhaseEdit(i,-1);d.querySelector('[data-m="down"]').onclick=()=>movePhaseEdit(i,1);d.querySelector('[data-m="dup"]').onclick=()=>duplicatePhaseEdit(i);d.querySelector('[data-m="del"]').onclick=()=>deletePhaseEdit(i);box.appendChild(d)
  });
  box.querySelectorAll("input,textarea,select[data-k]").forEach(el=>el.oninput=()=>{
    let p=state.phases[+el.dataset.i];if(!p)return;const k=el.dataset.k;
    if(k==="minutes")p.minutes=clamp(Math.round(Number(el.value)||0),0,180);
    else if(k==="seconds")p.seconds=clamp(Math.round(Number(el.value)||0),0,59);
    else if(k==="instrument"){
      p.instrument=+el.value||0;const i=el.dataset.i;
      box.querySelector(`[data-pro-inst="rain-${i}"]`)?.classList.toggle("hidden",p.instrument!==1);
      box.querySelector(`[data-pro-inst="ocean-${i}"]`)?.classList.toggle("hidden",p.instrument!==2);
      box.querySelector(`[data-pro-inst="music-${i}"]`)?.classList.toggle("hidden",p.instrument!==3)
    }
    else if(k==="sideSeconds"){p.sideSeconds=clamp(Math.round(Number(el.value)||1),1,60);el.value=String(p.sideSeconds)}
    else if(k==="waveSeconds"){p.waveSeconds=clamp(Math.round(Number(el.value)||8),2,60);el.value=String(p.waveSeconds)}
    else if(k==="autoNext")p.autoNext=el.value==="1";
    else if(k==="alertBefore")p.alertBefore=clamp(Math.round(Number(el.value)||0),0,600);
    else if(k==="musicSlot")p.musicSlot=Math.round(Number(el.value));
    else if(k==="phaseVolume"){p.phaseVolume=clamp(Math.round(Number(el.value)||0),0,100);el.value=String(p.phaseVolume)}
    else p[k]=el.value;
    const total=$("builderTotal");if(total)total.textContent=sessionDurationLabel(state.phases);
    const card=el.closest(".phase-editor"),badge=card?.querySelector(".phase-duration-badge");if(badge)badge.textContent=phaseDurationLabel(p)
  })
}
'''
s = s[:start] + editor + s[end:]

old_add = 'function addPhaseEdit(){state.phases.push({name:"Nouvelle phase",minutes:5,text:"",cue:"",instrument:0});renderEditor()}'
new_add = 'function addPhaseEdit(){state.phases.push({name:"Nouvelle phase",minutes:5,seconds:0,text:"",cue:"",transition:"",instrument:0,autoNext:true,alertBefore:0});renderEditor()}'
if old_add not in s:
    raise SystemExit('add phase anchor missing')
s = s.replace(old_add, new_add, 1)

# Normalize a zero duration before save.
old_save = 'function saveEditor(){state.type=$("editType").value||"meditation";state.title=$("editTitle").value.trim()||(state.type==="hypnose"?"Séance d’hypnose":"Méditation");persistLocal();renderHome();toast("Séance enregistrée")}'
new_save = 'function saveEditor(){state.type=$("editType").value||"meditation";state.title=$("editTitle").value.trim()||(state.type==="hypnose"?"Séance d’hypnose":"Méditation");state.phases.forEach(p=>{p.minutes=Math.max(0,Math.round(Number(p.minutes)||0));p.seconds=clamp(Math.round(Number(p.seconds)||0),0,59);if(!p.minutes&&!p.seconds)p.seconds=1});persistLocal();renderHome();toast("Séance enregistrée")}'
if old_save not in s:
    raise SystemExit('save editor anchor missing')
s = s.replace(old_save, new_save, 1)

# Runtime timing uses minutes + seconds, and each phase may decide whether it advances automatically.
old_tick = 'const dur=(Number(state.phases[phaseIndex].minutes)||1)*60000;\n    if(phaseElapsed>=dur&&state.prefs.autoPhase){'
new_tick = 'const p=state.phases[phaseIndex],dur=phaseDurationMs(p);firePhaseAlert(p,dur);\n    if(phaseElapsed>=dur&&state.prefs.autoPhase&&phaseAutoNext(p)){'
if old_tick not in s:
    raise SystemExit('tick duration anchor missing')
s = s.replace(old_tick, new_tick, 1)

s = s.replace('phaseIndex++;phaseElapsed=0;manualScrollUntil=0;try{navigator.vibrate?.(100)}catch{}', 'phaseIndex++;phaseElapsed=0;manualScrollUntil=0;phaseAlertKey="";lastPreparedPhase=-1;try{navigator.vibrate?.(100)}catch{}', 1)
s = s.replace('phaseIndex=n;phaseElapsed=0;manualScrollUntil=0;$("guideScroll").scrollTop=0;', 'phaseIndex=n;phaseElapsed=0;manualScrollUntil=0;phaseAlertKey="";lastPreparedPhase=-1;$("guideScroll").scrollTop=0;', 1)
s = s.replace('playing=true;running=false;phaseIndex=0;globalElapsed=0;phaseElapsed=0;lastTick=performance.now();autoLast=performance.now();', 'playing=true;running=false;phaseIndex=0;globalElapsed=0;phaseElapsed=0;phaseAlertKey="";lastPreparedPhase=-1;lastTick=performance.now();autoLast=performance.now();', 1)

old_remain = 'const remain=(Number(p.minutes)||1)*60000-phaseElapsed;'
if old_remain not in s:
    raise SystemExit('remaining time anchor missing')
s = s.replace(old_remain, 'const remain=phaseDurationMs(p)-phaseElapsed;', 1)

old_cue = '$("cueText").textContent=p.cue||"";\n  updateInstrument(p);updateAutoUi();updateReadProgress();'
new_cue = 'let cue=p.cue||"";if(p.transition)cue+=(cue?"\\n\\n":"")+"TRANSITION → "+p.transition;$("cueText").textContent=cue;\n  preparePhaseMedia(p);updateInstrument(p);updateAutoUi();updateReadProgress();'
if old_cue not in s:
    raise SystemExit('cue/update instrument anchor missing')
s = s.replace(old_cue, new_cue, 1)

# Ocean rhythm is also a per-phase construction setting.
old_wave_label = '${state.prefs.waveSeconds||8} s'
if old_wave_label not in s:
    raise SystemExit('wave label anchor missing')
s = s.replace(old_wave_label, '${phaseWaveSeconds(p)} s', 1)
old_wave_minus = '$("waveMinus").onclick=()=>{state.prefs.waveSeconds=clamp((state.prefs.waveSeconds||8)-1,4,20);persistLocal();host.dataset.phase="";updateInstrument(p)};'
old_wave_plus = '$("wavePlus").onclick=()=>{state.prefs.waveSeconds=clamp((state.prefs.waveSeconds||8)+1,4,20);persistLocal();host.dataset.phase="";updateInstrument(p)};'
if old_wave_minus not in s or old_wave_plus not in s:
    raise SystemExit('wave button anchors missing')
s = s.replace(old_wave_minus, '$("waveMinus").onclick=()=>{p.waveSeconds=clamp(phaseWaveSeconds(p)-1,2,60);persistLocal();host.dataset.phase="";updateInstrument(p)};', 1)
s = s.replace(old_wave_plus, '$("wavePlus").onclick=()=>{p.waveSeconds=clamp(phaseWaveSeconds(p)+1,2,60);persistLocal();host.dataset.phase="";updateInstrument(p)};', 1)
old_wave_anim = 'const sec=state.prefs.waveSeconds||8,q=(t%sec)/sec,side=Math.sin(q*Math.PI*2),lift=Math.cos(q*Math.PI*2);'
if old_wave_anim not in s:
    raise SystemExit('wave animation timing anchor missing')
s = s.replace(old_wave_anim, 'const sec=phaseWaveSeconds(p),q=(t%sec)/sec,side=Math.sin(q*Math.PI*2),lift=Math.cos(q*Math.PI*2);', 1)

p.write_text(s, encoding='utf-8')
print('professional session builder applied', len(s))
