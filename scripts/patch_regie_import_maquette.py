from pathlib import Path
import sys

p = Path(sys.argv[1] if len(sys.argv) > 1 else 'pwa-dist/regie-v14/index.html')
s = p.read_text(encoding='utf-8')

# Word parsing happens in the browser. Mammoth only parses the local ArrayBuffer;
# the document itself is not uploaded to a third-party service.
main_script = '<script>\n"use strict";'
external = '<script src="https://cdn.jsdelivr.net/npm/mammoth@1.8.0/mammoth.browser.min.js"></script>\n'
if main_script not in s:
    raise SystemExit('main script anchor missing')
if 'mammoth.browser.min.js' not in s:
    s = s.replace(main_script, external + main_script, 1)

style = r'''
/* Automatic session mockup importer */
.maquette-launch{margin:12px 0 4px;padding:14px 15px;border:1px solid var(--line);border-radius:18px;background:linear-gradient(135deg,rgba(92,133,134,.07),rgba(156,140,166,.055))}
.maquette-launch-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.maquette-launch strong{display:block;font-size:14px;margin-bottom:3px}.maquette-launch .btn{white-space:nowrap}
.maquette-source{min-height:300px!important;font-family:Georgia,"Times New Roman",serif;line-height:1.65}
.maquette-drop{border:1px dashed var(--line);border-radius:17px;padding:12px;margin:10px 0;background:rgba(255,255,255,.45)}
.maquette-file-name{font-size:12px;color:var(--muted);margin-top:7px;word-break:break-word}
.maquette-preview{display:grid;gap:8px;margin:13px 0}.maquette-phase{border:1px solid var(--line);border-radius:15px;padding:10px 12px;background:rgba(255,255,255,.55)}
.maquette-phase-top{display:flex;justify-content:space-between;align-items:center;gap:10px}.maquette-phase-name{font-weight:850}.maquette-phase-time{font-size:12px;font-weight:800;color:var(--teal);white-space:nowrap}
.maquette-tags{display:flex;gap:5px;flex-wrap:wrap;margin-top:6px}.maquette-tag{font-size:10px;border-radius:999px;padding:4px 7px;background:var(--soft);color:var(--muted)}.maquette-tag.review{background:#f4eadc;color:#8a684b}.maquette-tag.instrument{background:#e8f0ef;color:var(--teal)}
.maquette-summary{display:flex;justify-content:space-between;gap:10px;align-items:center;padding:10px 12px;border-radius:15px;background:var(--soft);margin:10px 0}.maquette-summary b{color:var(--teal)}
.maquette-actions{display:grid;grid-template-columns:1fr 1.35fr;gap:8px;margin-top:12px}
@media(max-width:620px){.maquette-launch-head{display:block}.maquette-launch .btn{width:100%;margin-top:10px}.maquette-actions{grid-template-columns:1fr}.maquette-source{min-height:240px!important}}
'''
if '</style>' not in s:
    raise SystemExit('style closing tag missing')
s = s.replace('</style>', style + '\n</style>', 1)

# Add one clear entry point to the construction screen.
anchor = '    <label class="field"><span>Titre</span><input type="text" id="editTitle"></label>\n    <div id="phaseEditors"></div>'
replacement = '''    <label class="field"><span>Titre</span><input type="text" id="editTitle"></label>\n    <div class="maquette-launch">\n      <div class="maquette-launch-head"><div><strong>Créer une première maquette automatiquement</strong><div class="pro-help">Importe un Word ou colle ton texte. La régie prépare les phases, les durées et les repères sans réécrire ton contenu.</div></div><button class="btn small" id="openMaquetteImportBtn">✦ Importer / Coller</button></div>\n    </div>\n    <div id="phaseEditors"></div>'''
if anchor not in s:
    raise SystemExit('edit view anchor missing')
s = s.replace(anchor, replacement, 1)

# Automatic local analysis. It deliberately creates a draft, never an opaque final result.
js_anchor = 'function renderEditor(){\n'
if js_anchor not in s:
    raise SystemExit('renderEditor anchor missing')
helpers = r'''let maquetteDraft=null,maquetteSourceCache="";
const MAQUETTE_INSTRUMENT_NAMES={0:"Aucun",1:"Bâton de pluie",2:"Tambour océan",3:"Musique",4:"Silence"};
function maquetteCleanText(text){return String(text||"").replace(/\r\n?/g,"\n").replace(/\u00a0/g," ").trim()}
function maquetteIsHeading(line){
  const x=String(line||"").trim();if(!x||x.length>90)return false;const words=x.split(/\s+/).length;
  if(/^(?:phase|partie|temps|étape|etape|chapitre)\s*\d*\s*[:.\-–—]?/i.test(x))return true;
  if(/^\d{1,2}\s*[.)\-–—:]\s+\S+/.test(x))return true;
  if(/^(?:accueil|intention|installation|respiration|souffle|cohérence|coherence|induction|approfondissement|visualisation|ancrage|silence|méditation|meditation|musique|tambour|bâton|baton|transition|retour|réveil|reveil|conclusion)\b/i.test(x)&&words<=10)return true;
  if(words<=8&&x.length>=4&&x===x.toLocaleUpperCase("fr-FR")&&/[A-ZÀ-ÖØ-Þ]/.test(x))return true;
  return false
}
function maquetteInstrument(text){
  const x=String(text||"").toLocaleLowerCase("fr-FR");
  if(/b[âa]ton\s+de\s+pluie/.test(x))return 1;
  if(/tambour\s+(?:oc[ée]an|ocean)/.test(x))return 2;
  if(/\b(musique|morceau|playlist|piste audio|lancer le son)\b/.test(x))return 3;
  const words=x.trim().split(/\s+/).filter(Boolean).length;if(words<45&&/\b(silence|silencieuse|sans parole)\b/.test(x))return 4;
  return 0
}
function maquetteInferName(text,index,heading=""){
  const h=String(heading||"").replace(/^\d{1,2}\s*[.)\-–—:]\s*/,"").replace(/^(?:phase|partie|temps|étape|etape)\s*\d*\s*[:.\-–—]?\s*/i,"").trim();if(h)return h.slice(0,72);
  const x=String(text||"").toLocaleLowerCase("fr-FR");
  if(/accueil|intention|bienvenue/.test(x))return "Accueil & intention";
  if(/installer|installation|prendre place|points? d.appui/.test(x))return "Installation";
  if(/coh[ée]rence cardiaque|b[âa]ton de pluie/.test(x))return "Bâton de pluie & respiration";
  if(/respiration|souffle|inspir|expir/.test(x))return "Respiration";
  if(/tambour\s+(?:oc[ée]an|ocean)|\bvague|\bmer\b|rivage/.test(x))return "Tambour océan";
  if(/\binduction\b|paupi[èe]res|fermer les yeux/.test(x))return "Induction";
  if(/approfond|descendre|escalier/.test(x))return "Approfondissement";
  if(/ancrage|geste|emporter avec/.test(x))return "Ancrage";
  if(/musique|morceau|playlist/.test(x))return "Musique";
  if(/silence|silencieuse|sans parole/.test(x))return "Temps de silence";
  if(/revenir|retour|r[ée]veil|doigts|orteils|ouvrir les yeux/.test(x))return "Retour";
  return `Phase ${index+1}`
}
function maquetteExplicitSeconds(text){
  const x=String(text||"");let m=x.match(/(?:dur[ée]e\s*[:=]?\s*|\[\s*)?(\d{1,3})\s*(?:min(?:ute)?s?|mn)\b/i);
  if(m){const n=Number(m[1]);if(n>=1&&n<=180)return n*60}
  m=x.match(/(?:dur[ée]e\s*[:=]?\s*|\[\s*)?(\d{1,4})\s*(?:sec(?:onde)?s?|s)\b/i);if(m){const n=Number(m[1]);if(n>=10&&n<=10800)return n}
  return 0
}
function maquetteEstimateSeconds(text,type){
  const explicit=maquetteExplicitSeconds(text);if(explicit)return {seconds:explicit,estimated:false};
  const x=String(text||""),words=(x.match(/[\p{L}\p{N}'’\-]+/gu)||[]).length,wpm=type==="hypnose"?76:88;
  const pauses=(x.match(/\[(?:pause|respiration|souffle)\]/gi)||[]).length*4;
  const silences=(x.match(/\[(?:silence|long silence)\]/gi)||[]).length*10;
  const breaks=Math.max(0,(x.match(/\n\s*\n/g)||[]).length)*1.5;
  let sec=Math.max(30,words/wpm*60+pauses+silences+breaks);sec=Math.max(15,Math.round(sec/15)*15);return {seconds:sec,estimated:true}
}
function maquetteCue(text,instrument){
  const x=String(text||""),markers=[...(x.matchAll(/\[([^\]]{1,70})\]/g))].map(m=>m[1].trim()).filter(Boolean);let out=[];
  for(const m of markers){if(!out.some(v=>v.toLocaleLowerCase("fr-FR")===m.toLocaleLowerCase("fr-FR")))out.push(m)}
  if(instrument===1&&!out.some(v=>/b[âa]ton/i.test(v)))out.push("Bâton de pluie repéré dans le texte — vérifier le moment exact");
  if(instrument===2&&!out.some(v=>/tambour/i.test(v)))out.push("Tambour océan repéré dans le texte — vérifier le moment exact");
  if(instrument===3&&!out.some(v=>/musique/i.test(v)))out.push("Musique repérée dans le texte — choisir la piste et vérifier le départ");
  if(instrument===4&&!out.some(v=>/silence/i.test(v)))out.push("Temps de silence repéré — vérifier la durée");
  return out.slice(0,6).join(" • ")
}
function maquetteSplitSections(source){
  const text=maquetteCleanText(source),lines=text.split("\n");let sections=[],current=[],heading="";
  const flush=()=>{const body=current.join("\n").trim();if(body)sections.push({heading,text:body});current=[];heading=""};
  for(let i=0;i<lines.length;i++){
    const line=lines[i],trim=line.trim();
    if(maquetteIsHeading(trim)&&current.join(" ").trim().split(/\s+/).filter(Boolean).length>=35){flush();heading=trim;current.push(line);continue}
    if(!current.length&&maquetteIsHeading(trim))heading=trim;current.push(line)
  }
  flush();
  if(sections.length>=2)return sections;
  const blocks=text.split(/\n\s*\n+/).map(v=>v.trim()).filter(Boolean);sections=[];current=[];let count=0;
  const push=()=>{if(current.length){sections.push({heading:"",text:current.join("\n\n")});current=[];count=0}};
  for(const block of blocks){const wc=(block.match(/[\p{L}\p{N}'’\-]+/gu)||[]).length;const inst=maquetteInstrument(block);const softBreak=/^(?:et maintenant|maintenant|puis|ensuite|pour terminer|pour finir|doucement|lorsque vous serez pr[êe]t)/i.test(block.trim());if(current.length&&((count>=250&&softBreak)||(count>=430)||(inst&&count>=150))){push()}current.push(block);count+=wc}push();
  return sections.length?sections:[{heading:"",text}]
}
function buildMaquetteDraft(source,type){
  const clean=maquetteCleanText(source);if(clean.length<30)throw new Error("Le texte est trop court pour construire une maquette.");
  const sections=maquetteSplitSections(clean);const phases=sections.map((sec,i)=>{
    const instrument=maquetteInstrument(sec.text),timing=maquetteEstimateSeconds(sec.text,type),name=maquetteInferName(sec.text,i,sec.heading),generic=/^Phase \d+$/.test(name);
    const total=Math.max(1,Math.round(timing.seconds)),minutes=Math.floor(total/60),seconds=total%60;
    return {name,minutes,seconds,text:sec.text,cue:maquetteCue(sec.text,instrument),transition:"",instrument,autoNext:true,alertBefore:0,review:generic||timing.estimated,estimated:timing.estimated}
  });
  return {source:clean,type,phases}
}
function maquetteTotalLabel(phases){return sessionDurationLabel(phases)}
function maquettePreviewHtml(draft){
  const rows=draft.phases.map((p,i)=>`<div class="maquette-phase"><div class="maquette-phase-top"><div class="maquette-phase-name">${i+1}. ${esc(p.name)}</div><div class="maquette-phase-time">${p.estimated?"≈ ":""}${phaseDurationLabel(p)}</div></div><div class="maquette-tags"><span class="maquette-tag ${p.estimated?"review":""}">${p.estimated?"Durée estimée":"Durée repérée"}</span>${p.instrument?`<span class="maquette-tag instrument">${MAQUETTE_INSTRUMENT_NAMES[p.instrument]}</span>`:""}${p.review?'<span class="maquette-tag review">À vérifier</span>':""}</div></div>`).join("");
  return `<div class="kicker">MAQUETTE PROPOSÉE</div><h2>${draft.phases.length} phase${draft.phases.length>1?"s":""} préparée${draft.phases.length>1?"s":""}</h2><p class="note">Le texte original est conservé dans les phases. Les durées marquées ≈ sont des estimations : tu pourras tout reprendre ensuite dans la régie.</p><div class="maquette-summary"><span>Durée totale proposée</span><b>${maquetteTotalLabel(draft.phases)}</b></div><div class="maquette-preview">${rows}</div><p class="note">En validant, les phases actuelles de cette séance seront remplacées par cette maquette.</p><div class="maquette-actions"><button class="btn" id="maquetteBackToText">‹ Revenir au texte</button><button class="btn primary" id="maquetteApplyBtn">Utiliser cette maquette</button></div>`
}
async function readMaquetteFile(file){
  if(!file)return "";const name=(file.name||"").toLocaleLowerCase("fr-FR");
  if(name.endsWith(".doc"))throw new Error("Le format .doc ancien n’est pas pris en charge. Enregistre le fichier en .docx puis réessaie.");
  if(name.endsWith(".docx")){
    if(!window.mammoth)throw new Error("Le lecteur Word n’a pas pu se charger. Vérifie la connexion puis réessaie, ou colle directement le texte.");
    const result=await window.mammoth.extractRawText({arrayBuffer:await file.arrayBuffer()});return maquetteCleanText(result.value)
  }
  return maquetteCleanText(await file.text())
}
function openMaquetteImporter(prefill=maquetteSourceCache){
  showModal(`<div class="kicker">IMPORTER UNE SÉANCE</div><h2>Créer une première maquette</h2><p class="note">Importe un Word (.docx) ou colle ton grand texte. L’analyse se fait dans ton navigateur : le document n’est pas envoyé à un service d’analyse.</p><div class="maquette-drop"><label class="field" style="margin:0"><span>Fichier Word ou texte</span><input id="maquetteFileInput" type="file" accept=".docx,.txt,.md,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document"></label><div class="maquette-file-name" id="maquetteFileName">Aucun fichier choisi</div></div><label class="field"><span>Ou colle ton texte ici</span><textarea class="maquette-source" id="maquetteSourceText" placeholder="Colle ici le texte complet de ta méditation ou de ton hypnose…">${esc(prefill||"")}</textarea></label><div id="maquetteStatus" class="note"></div><div class="maquette-actions"><button class="btn" id="maquetteCancelBtn">Annuler</button><button class="btn primary" id="maquetteAnalyzeBtn">Générer la maquette</button></div>`);
  const fileInput=$("maquetteFileInput"),source=$("maquetteSourceText"),status=$("maquetteStatus");
  fileInput.onchange=async()=>{const file=fileInput.files?.[0];if(!file)return;$("maquetteFileName").textContent=file.name;status.textContent="Lecture du fichier…";try{source.value=await readMaquetteFile(file);maquetteSourceCache=source.value;status.textContent=`Texte chargé : ${source.value.length.toLocaleString("fr-FR")} caractères.`}catch(e){status.textContent=e.message||"Impossible de lire ce fichier."}};
  source.oninput=()=>{maquetteSourceCache=source.value};$("maquetteCancelBtn").onclick=closeModal;
  $("maquetteAnalyzeBtn").onclick=()=>{try{maquetteSourceCache=source.value;maquetteDraft=buildMaquetteDraft(source.value,state.type||currentSpace||"meditation");$("modalRoot").querySelector(".modal").innerHTML=maquettePreviewHtml(maquetteDraft);$("maquetteBackToText").onclick=()=>openMaquetteImporter(maquetteSourceCache);$("maquetteApplyBtn").onclick=applyMaquetteDraft}catch(e){status.textContent=e.message||"Impossible de préparer cette maquette."}}
}
function applyMaquetteDraft(){
  if(!maquetteDraft?.phases?.length)return;state.phases=maquetteDraft.phases.map(p=>{const x={...p};delete x.review;delete x.estimated;return x});closeModal();persistLocal();renderEditor();toast(`Maquette créée : ${state.phases.length} phase${state.phases.length>1?"s":""} à affiner`)
}
'''
s = s.replace(js_anchor, helpers + js_anchor, 1)

# Bind the new button without altering existing construction controls.
bind = '$("editBackBtn").onclick=renderHome;$("saveSessionBtn").onclick=saveEditor;$("addPhaseBtn").onclick=addPhaseEdit;'
if bind not in s:
    raise SystemExit('editor binding anchor missing')
s = s.replace(bind, bind + '$("openMaquetteImportBtn").onclick=()=>openMaquetteImporter();', 1)

p.write_text(s, encoding='utf-8')
print('automatic Word/text mockup importer installed', len(s))
