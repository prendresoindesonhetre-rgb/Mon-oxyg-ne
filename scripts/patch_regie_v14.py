from pathlib import Path
import sys
p=Path(sys.argv[1] if len(sys.argv)>1 else 'pwa/www/regie-v14/index.html')
s=p.read_text(encoding='utf-8')
# CSS
needle='.session-title{font-size:23px;font-weight:800;margin:7px 0}\n'
add='''.session-title{font-size:23px;font-weight:800;margin:7px 0}\n.session-list{display:grid;gap:12px;margin:12px 0}\n.session-card{position:relative}\n.session-meta{display:flex;gap:7px;align-items:center;flex-wrap:wrap;margin-bottom:5px}\n.type-pill{display:inline-flex;align-items:center;border-radius:999px;padding:6px 10px;font-size:11px;letter-spacing:.08em;font-weight:850;border:1px solid var(--line);background:var(--soft);color:var(--mauve)}\n.type-pill.hypnose{background:#edf3f2;color:var(--teal)}\n.session-actions{display:grid;grid-template-columns:1.3fr 1fr;gap:8px;margin-top:12px}\n.session-more{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-top:7px}\n.create-choice{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:14px 0}\n.phase-actions{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:8px}\n.phase-actions .btn{min-height:40px;padding:8px 6px;font-size:13px}\n'''
assert needle in s
s=s.replace(needle,add,1)
# home
start=s.index('  <div id="homeView">')
end=s.index('  <div id="musicSettingsView"', start)
home='''  <div id="homeView">\n    <div class="brand">PRENDRE SOIN DE SON HÊTRE</div>\n    <h1>Ma régie de séance</h1>\n    <p class="subtitle">Crée autant de méditations et de séances d’hypnose que tu le souhaites. Chacune garde son texte, ses temps, son rythme et ses musiques.</p>\n    <div class="feature-grid"><div class="feature">TEXTE</div><div class="feature">TEMPS</div><div class="feature">RYTHME</div><div class="feature">MIX</div></div>\n    <div class="kicker" style="margin-top:18px">MES SÉANCES</div>\n    <div id="sessionList" class="session-list"></div>\n    <button class="btn primary" style="width:100%;margin-top:8px" id="createSessionBtn">+ Créer une séance</button>\n    <div class="card">\n      <div class="kicker">PENDANT LA SÉANCE</div>\n      <p class="summary" style="margin-bottom:0">Le texte reste directement défilable au doigt. La molette agit sur la vitesse ou le son uniquement après « Démarrer » ; dès que tu mets en pause, elle redevient une molette normale.</p>\n    </div>\n  </div>\n\n'''
s=s[:start]+home+s[end:]
# editor
start=s.index('  <div id="editView"')
end=s.index('  <div id="playerView"', start)
editor='''  <div id="editView" class="hidden">\n    <button class="btn small" id="editBackBtn">‹ Retour</button>\n    <h2 style="margin-top:16px">Ma séance</h2>\n    <label class="field"><span>Type de séance</span><select id="editType"><option value="meditation">Méditation</option><option value="hypnose">Hypnose</option></select></label>\n    <label class="field"><span>Titre</span><input type="text" id="editTitle"></label>\n    <div id="phaseEditors"></div>\n    <div class="editor-toolbar row"><button class="btn grow" id="addPhaseBtn">+ Ajouter une phase</button><button class="btn primary grow" id="saveSessionBtn">Enregistrer</button></div>\n  </div>\n\n'''
s=s[:start]+editor+s[end:]
# JS helpers after totalMinutes existing
needle='function totalMinutes(){return state.phases.reduce((a,p)=>a+(Number(p.minutes)||0),0)}\n'
helper=r'''function totalMinutes(phases=state.phases){return (phases||[]).reduce((a,p)=>a+(Number(p.minutes)||0),0)}
function uid(){return "s_"+Date.now().toString(36)+"_"+Math.random().toString(36).slice(2,9)}
function defaultPrefs(){return {autoWpm:90,autoScroll:false,autoPhase:true,waveSeconds:8,rainSeconds:5,musicVolume:50}}
function normalizeSession(x,type="meditation"){
  x=x||{};const t=x.type||type;return {id:x.id||uid(),type:t,title:x.title||(t==="hypnose"?"Nouvelle séance d’hypnose":"Nouvelle méditation"),phases:Array.isArray(x.phases)?x.phases:[],musicSlots:Array.isArray(x.musicSlots)?x.musicSlots:[{name:"",url:""},{name:"",url:""},{name:"",url:""}],prefs:{...defaultPrefs(),...(x.prefs||{})}}
}
function blankSession(type){return normalizeSession({type,title:type==="hypnose"?"Nouvelle séance d’hypnose":"Nouvelle méditation",phases:[{name:type==="hypnose"?"Induction":"Accueil",minutes:5,text:"",cue:"",instrument:0}]},type)}
function ensureLibrary(){
  if(!Array.isArray(state.sessions)){
    const first=normalizeSession({type:state.type||"meditation",title:state.title,phases:clone(state.phases||[]),musicSlots:clone(state.musicSlots||[]),prefs:clone(state.prefs||{})});state.sessions=[first];state.activeSessionId=first.id;
  }
  state.sessions=state.sessions.map(x=>normalizeSession(x));if(!state.sessions.length)state.sessions=[blankSession("meditation")];
  if(!state.activeSessionId||!state.sessions.some(x=>x.id===state.activeSessionId))state.activeSessionId=state.sessions[0].id;
  const a=state.sessions.find(x=>x.id===state.activeSessionId)||state.sessions[0];
  if(!Array.isArray(state.phases)||!state.title)loadSessionIntoTop(a,false);
}
function snapshotActive(){return normalizeSession({id:state.activeSessionId,type:state.type||"meditation",title:state.title,phases:clone(state.phases||[]),musicSlots:clone(state.musicSlots||[]),prefs:clone(state.prefs||{})},state.type||"meditation")}
function saveActiveIntoLibrary(){if(!Array.isArray(state.sessions))return;const i=state.sessions.findIndex(x=>x.id===state.activeSessionId);if(i>=0)state.sessions[i]=snapshotActive()}
function loadSessionIntoTop(sess,saveFirst=true){if(saveFirst)saveActiveIntoLibrary();sess=normalizeSession(sess);state.activeSessionId=sess.id;state.type=sess.type;state.title=sess.title;state.phases=clone(sess.phases);state.musicSlots=clone(sess.musicSlots);state.prefs=clone(sess.prefs)}
function sessionById(id){ensureLibrary();return state.sessions.find(x=>x.id===id)}
function selectSession(id){const x=sessionById(id);if(!x)return;loadSessionIntoTop(x);state.updatedAt=now();localStorage.setItem(LS_STATE,JSON.stringify(state))}
'''
assert needle in s
s=s.replace(needle,helper,1)
# persistLocal
old='''function persistLocal(){\n  state.updatedAt=now();\n  localStorage.setItem(LS_STATE,JSON.stringify(state));\n  dirty=true;\n  scheduleSync();\n}\n'''
new='''function persistLocal(){\n  ensureLibrary();saveActiveIntoLibrary();state.updatedAt=now();\n  localStorage.setItem(LS_STATE,JSON.stringify(state));\n  dirty=true;\n  scheduleSync();\n}\n'''
assert old in s
s=s.replace(old,new,1)
# loadLocal
old='''function loadLocal(){\n  try{let s=JSON.parse(localStorage.getItem(LS_STATE)||"null");if(s&&s.schema===1)state=s}catch{}\n  state.prefs={...DEFAULT_STATE.prefs,...(state.prefs||{})};\n  if(!Array.isArray(state.musicSlots))state.musicSlots=clone(DEFAULT_STATE.musicSlots);\n  if(!Array.isArray(state.phases)||!state.phases.length)state.phases=clone(DEFAULT_STATE.phases);\n}\n'''
new='''function loadLocal(){\n  try{let s=JSON.parse(localStorage.getItem(LS_STATE)||"null");if(s&&s.schema===1)state=s}catch{}\n  state.prefs={...DEFAULT_STATE.prefs,...(state.prefs||{})};\n  if(!Array.isArray(state.musicSlots))state.musicSlots=clone(DEFAULT_STATE.musicSlots);\n  if(!Array.isArray(state.phases)||!state.phases.length)state.phases=clone(DEFAULT_STATE.phases);ensureLibrary();\n}\n'''
assert old in s
s=s.replace(old,new,1)
# ensure library after remote/decrypt/account state
s=s.replace('state=clone(DEFAULT_STATE);state.updatedAt=now();', 'state=clone(DEFAULT_STATE);ensureLibrary();state.updatedAt=now();',1)
s=s.replace('state=await decryptState({iv:r.dataIv,ciphertext:r.dataCiphertext});\n      localStorage.setItem', 'state=await decryptState({iv:r.dataIv,ciphertext:r.dataCiphertext});ensureLibrary();\n      localStorage.setItem')
s=s.replace('if(r.dataCiphertext)state=await decryptState({iv:r.dataIv,ciphertext:r.dataCiphertext});else state=clone(DEFAULT_STATE);', 'if(r.dataCiphertext){state=await decryptState({iv:r.dataIv,ciphertext:r.dataCiphertext});ensureLibrary()}else{state=clone(DEFAULT_STATE);ensureLibrary()}')
s=s.replace('state=remote;remoteVersion=rv;dirty=false;', 'state=remote;ensureLibrary();remoteVersion=rv;dirty=false;')
s=s.replace('state=remote;remoteVersion=v;', 'state=remote;ensureLibrary();remoteVersion=v;')
s=s.replace('profile=null;state=clone(DEFAULT_STATE);closeModal();', 'profile=null;state=clone(DEFAULT_STATE);ensureLibrary();closeModal();')
# replace home/music/editor functions
start=s.index('function renderHome(){')
end=s.index('function startPlayer(){', start)
block=r'''function renderHome(){
  ensureLibrary();saveActiveIntoLibrary();showView("home");let box=$("sessionList");box.innerHTML="";
  state.sessions.forEach(sess=>{let d=document.createElement("div");d.className="card session-card";const typ=sess.type==="hypnose"?"HYPNOSE":"MÉDITATION";
    d.innerHTML=`<div class="session-meta"><span class="type-pill ${sess.type==="hypnose"?"hypnose":""}">${typ}</span><span class="summary">${totalMinutes(sess.phases)} min • ${sess.phases.length} phase${sess.phases.length>1?"s":""}</span></div><div class="session-title">${esc(sess.title)}</div><div class="session-actions"><button class="btn primary" data-a="open">Ouvrir ma régie</button><button class="btn" data-a="edit">Modifier</button></div><div class="session-more"><button class="btn small" data-a="music">Musiques</button><button class="btn small" data-a="dup">Dupliquer</button><button class="btn small danger" data-a="del">Supprimer</button></div>`;
    d.querySelector('[data-a="open"]').onclick=()=>{selectSession(sess.id);startPlayer()};d.querySelector('[data-a="edit"]').onclick=()=>{selectSession(sess.id);renderEditor()};d.querySelector('[data-a="music"]').onclick=()=>{selectSession(sess.id);renderMusicSettings()};d.querySelector('[data-a="dup"]').onclick=()=>duplicateSession(sess.id);d.querySelector('[data-a="del"]').onclick=()=>deleteSession(sess.id);box.appendChild(d)});
}
function createSessionPrompt(){showModal(`<div class="kicker">NOUVELLE SÉANCE</div><h2>Que veux-tu créer ?</h2><p class="note">Tu pourras tout modifier ensuite : titre, phases, durées, textes, repères, instruments et musiques.</p><div class="create-choice"><button class="btn primary" id="newMeditation">Méditation</button><button class="btn" id="newHypnose">Hypnose</button></div><button class="btn small" style="width:100%" id="newCancel">Annuler</button>`);$("newMeditation").onclick=()=>createNewSession("meditation");$("newHypnose").onclick=()=>createNewSession("hypnose");$("newCancel").onclick=closeModal}
function createNewSession(type){ensureLibrary();saveActiveIntoLibrary();const x=blankSession(type);state.sessions.push(x);loadSessionIntoTop(x,false);closeModal();persistLocal();renderEditor();toast(type==="hypnose"?"Séance d’hypnose créée":"Méditation créée")}
function duplicateSession(id){ensureLibrary();saveActiveIntoLibrary();const src=sessionById(id);if(!src)return;const x=clone(src);x.id=uid();x.title=(x.title||"Séance")+" — copie";state.sessions.push(normalizeSession(x));persistLocal();renderHome();toast("Séance dupliquée")}
function deleteSession(id){const x=sessionById(id);if(!x)return;if(!confirm(`Supprimer « ${x.title} » ?`))return;state.sessions=state.sessions.filter(s=>s.id!==id);if(!state.sessions.length)state.sessions=[blankSession("meditation")];if(state.activeSessionId===id)loadSessionIntoTop(state.sessions[0],false);persistLocal();renderHome();toast("Séance supprimée")}
function renderMusicSettings(){showView("music");let box=$("musicSlots");box.innerHTML="";state.musicSlots.forEach((m,i)=>{let d=document.createElement("div");d.className="card";d.innerHTML=`<div class="kicker">MUSIQUE ${i+1}</div><label class="field"><span>Nom du morceau</span><input data-i="${i}" data-k="name" type="text" value="${esc(m.name||"")}"></label><label class="field"><span>Lien YouTube</span><input data-i="${i}" data-k="url" type="url" value="${esc(m.url||"")}" placeholder="https://youtu.be/..."></label>`;box.appendChild(d)});box.querySelectorAll("input").forEach(el=>el.oninput=()=>{state.musicSlots[+el.dataset.i][el.dataset.k]=el.value})}
function renderEditor(){showView("edit");$("editType").value=state.type||"meditation";$("editTitle").value=state.title||"";let box=$("phaseEditors");box.innerHTML="";state.phases.forEach((p,i)=>{let d=document.createElement("div");d.className="card phase-editor";d.innerHTML=`<div class="kicker">PHASE ${i+1}</div><label class="field"><span>Nom</span><input data-i="${i}" data-k="name" type="text" value="${esc(p.name||"")}"></label><div class="row"><label class="field grow"><span>Durée en minutes</span><input data-i="${i}" data-k="minutes" type="number" min="1" max="120" value="${Number(p.minutes)||1}"></label><label class="field grow"><span>Repère / instrument</span><select data-i="${i}" data-k="instrument"><option value="0">Aucun</option><option value="1">Bâton de pluie</option><option value="2">Tambour océan</option><option value="3">Musique</option><option value="4">Silence</option></select></label></div><label class="field"><span>Texte à dire</span><textarea data-i="${i}" data-k="text">${esc(p.text||"")}</textarea></label><label class="field"><span>Repère de conduite</span><textarea data-i="${i}" data-k="cue" style="min-height:90px">${esc(p.cue||"")}</textarea></label><div class="phase-actions"><button class="btn" data-m="up">↑</button><button class="btn" data-m="down">↓</button><button class="btn" data-m="dup">Dupliquer</button><button class="btn danger" data-m="del">Supprimer</button></div>`;const sel=d.querySelector('select[data-k="instrument"]');sel.value=String(Number(p.instrument)||0);d.querySelector('[data-m="up"]').onclick=()=>movePhaseEdit(i,-1);d.querySelector('[data-m="down"]').onclick=()=>movePhaseEdit(i,1);d.querySelector('[data-m="dup"]').onclick=()=>duplicatePhaseEdit(i);d.querySelector('[data-m="del"]').onclick=()=>deletePhaseEdit(i);box.appendChild(d)});box.querySelectorAll("input,textarea,select[data-k]").forEach(el=>el.oninput=()=>{let p=state.phases[+el.dataset.i];if(!p)return;if(el.dataset.k==="minutes")p.minutes=clamp(+el.value||1,1,120);else if(el.dataset.k==="instrument")p.instrument=+el.value||0;else p[el.dataset.k]=el.value})}
function addPhaseEdit(){state.phases.push({name:"Nouvelle phase",minutes:5,text:"",cue:"",instrument:0});renderEditor()}
function movePhaseEdit(i,d){const n=i+d;if(n<0||n>=state.phases.length)return;const [x]=state.phases.splice(i,1);state.phases.splice(n,0,x);renderEditor()}
function duplicatePhaseEdit(i){const x=clone(state.phases[i]);x.name=(x.name||"Phase")+" — copie";state.phases.splice(i+1,0,x);renderEditor()}
function deletePhaseEdit(i){if(state.phases.length<=1)return toast("Garde au moins une phase");state.phases.splice(i,1);renderEditor()}
function saveEditor(){state.type=$("editType").value||"meditation";state.title=$("editTitle").value.trim()||(state.type==="hypnose"?"Séance d’hypnose":"Méditation");persistLocal();renderHome();toast("Séance enregistrée")}
function saveMusic(){persistLocal();renderHome();toast("Musiques enregistrées")}

'''
s=s[:start]+block+s[end:]
# start player guard and stopPlayer home render
s=s.replace('function startPlayer(){\n  playing=true;', 'function startPlayer(){\n  if(!state.phases||!state.phases.length){toast("Ajoute au moins une phase");return}\n  playing=true;',1)
s=s.replace('pauseMusic();showView("home");\n}', 'pauseMusic();renderHome();\n}',1)
# event bindings
old='''$("openRegieBtn").onclick=startPlayer;$("musicSettingsBtn").onclick=renderMusicSettings;$("musicBackBtn").onclick=renderHome;\n$("editSessionBtn").onclick=renderEditor;$("editBackBtn").onclick=renderHome;$("saveSessionBtn").onclick=saveEditor;\n$("resetSessionBtn").onclick=()=>{if(confirm("Remettre la séance d’origine ?")){state.phases=clone(DEFAULT_STATE.phases);state.title=DEFAULT_STATE.title;persistLocal();renderEditor();toast("Séance d’origine restaurée")}};\n'''
new='''$("createSessionBtn").onclick=createSessionPrompt;$("musicBackBtn").onclick=renderHome;\n$("editBackBtn").onclick=renderHome;$("saveSessionBtn").onclick=saveEditor;$("addPhaseBtn").onclick=addPhaseEdit;\n'''
assert old in s
s=s.replace(old,new,1)
p.write_text(s,encoding='utf-8')
print('patched',len(s))
