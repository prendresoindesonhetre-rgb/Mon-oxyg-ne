from pathlib import Path
import sys

p = Path(sys.argv[1] if len(sys.argv) > 1 else 'pwa-dist/regie-v14/index.html')
s = p.read_text(encoding='utf-8')

# Restore the original two-space landing screen without removing any repaired V14 functionality.
css_needle = '.phase-actions .btn{min-height:40px;padding:8px 6px;font-size:13px}\n'
css_add = '''.phase-actions .btn{min-height:40px;padding:8px 6px;font-size:13px}\n.space-chooser{min-height:calc(100vh - 40px);display:flex;flex-direction:column;justify-content:center;padding:18px 0 50px}\n.space-logo{width:58px;height:58px;border:1px solid #c9d7d4;border-radius:50%;display:grid;place-items:center;margin:0 auto 16px;color:var(--teal);font-size:25px;background:rgba(255,253,249,.72)}\n.space-brand{text-align:center;font-size:11px;letter-spacing:.18em;font-weight:850;color:var(--teal);margin-bottom:8px}\n.space-title{text-align:center;font-family:Georgia,\"Times New Roman\",serif;font-size:clamp(38px,6vw,54px);font-weight:400;line-height:1.05;margin-bottom:8px;color:#49413d}\n.space-subtitle{text-align:center;color:var(--muted);font-size:16px;margin-bottom:30px}\n.space-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px}\n.space-card{position:relative;min-height:320px;border:1px solid #ded3c8;border-radius:27px;background:rgba(255,253,249,.94);padding:42px 30px 28px;overflow:hidden;box-shadow:0 14px 36px rgba(80,68,60,.08);display:flex;flex-direction:column;align-items:flex-start;text-align:left;color:var(--ink)}\n.space-card:after{content:\"\";position:absolute;width:135px;height:135px;border-radius:50%;right:-35px;bottom:-42px;background:rgba(92,133,134,.12)}\n.space-card.hypnose:after{background:rgba(156,140,166,.13)}\n.space-symbol{font-family:Georgia,serif;font-size:31px;line-height:1;margin-bottom:35px}\n.space-kicker{font-size:11px;letter-spacing:.13em;font-weight:850;color:var(--teal);margin-bottom:4px}\n.space-card.hypnose .space-kicker,.space-card.hypnose .space-enter{color:#806f87}\n.space-name{font-family:Georgia,\"Times New Roman\",serif;font-size:30px;font-weight:400;line-height:1.08;margin-bottom:14px}\n.space-desc{font-size:16px;line-height:1.55;color:var(--muted);max-width:95%;margin-bottom:24px}\n.space-enter{margin-top:auto;font-size:12px;letter-spacing:.06em;font-weight:850;color:var(--teal)}\n.space-footer{text-align:center;color:var(--muted);font-size:12px;margin-top:26px}\n.space-back{margin:0 0 12px;background:transparent;border:0;color:var(--muted);padding:5px 0;font-size:14px}\n.space-empty{padding:26px 10px;text-align:center;color:var(--muted);border:1px dashed var(--line);border-radius:20px;margin:10px 0}\n@media(max-width:700px){.space-grid{grid-template-columns:1fr}.space-card{min-height:250px;padding:30px 24px 24px}.space-symbol{margin-bottom:22px}.space-title{font-size:40px}}\n'''
assert css_needle in s, 'CSS anchor missing'
s = s.replace(css_needle, css_add, 1)

# Insert the chooser as a first-class view inside the authenticated app.
home_anchor = '  <div id="homeView">\n'
chooser = '''  <div id="spaceChooserView" class="space-chooser hidden">\n    <div class="space-logo">⌁</div>\n    <div class="space-brand">PRENDRE SOIN DE SON HÊTRE</div>\n    <div class="space-title">Ma régie de séance</div>\n    <div class="space-subtitle">Choisis l’espace que tu vas utiliser aujourd’hui.</div>\n    <div class="space-grid">\n      <button class="space-card" id="chooseMeditationSpace">\n        <div class="space-symbol">◌</div>\n        <div class="space-kicker">ESPACE 1</div>\n        <div class="space-name">Séance de méditation</div>\n        <div class="space-desc">Retrouve la régie de méditation, ses temps, le fil de séance, les guides du bâton de pluie et du tambour océan, ainsi que ton mix musique.</div>\n        <div class="space-enter">ENTRER DANS LA RÉGIE →</div>\n      </button>\n      <button class="space-card hypnose" id="chooseHypnoseSpace">\n        <div class="space-symbol">∿</div>\n        <div class="space-kicker">ESPACE 2</div>\n        <div class="space-name">Séance d’hypnose</div>\n        <div class="space-desc">Un espace distinct pour conduire tes séances d’hypnose avec le texte, les temps, le défilement intelligent, les instruments et les transitions musicales.</div>\n        <div class="space-enter">ENTRER DANS LA RÉGIE →</div>\n      </button>\n    </div>\n    <div class="space-footer">Texte · Temps · Rythme · Mix</div>\n  </div>\n\n'''
assert home_anchor in s, 'home anchor missing'
s = s.replace(home_anchor, chooser + home_anchor, 1)

# Add a visible way back to the chooser from either space.
home_heading = '    <div class="brand">PRENDRE SOIN DE SON HÊTRE</div>\n    <h1>Ma régie de séance</h1>\n'
home_heading_new = '    <button class="space-back" id="changeSpaceBtn">‹ Changer d’espace</button>\n    <div class="brand">PRENDRE SOIN DE SON HÊTRE</div>\n    <h1 id="spaceHomeTitle">Ma régie de séance</h1>\n'
assert home_heading in s, 'home heading missing'
s = s.replace(home_heading, home_heading_new, 1)

# currentSpace is intentionally local UI state: account data remains unchanged and encrypted as before.
js_anchor = 'function renderHome(){\n  ensureLibrary();saveActiveIntoLibrary();showView("home");let box=$("sessionList");box.innerHTML="";\n  state.sessions.forEach(sess=>'
js_repl = '''let currentSpace=null;\nfunction showSpaceChooser(){\n  currentSpace=null;view="chooser";\n  for(const id of ["homeView","musicSettingsView","editView","playerView"])$(id).classList.add("hidden");\n  $("spaceChooserView").classList.remove("hidden");\n  $("bottomControls").classList.add("hidden");$("faderEdge").classList.remove("active");\n  const sb=document.querySelector(".syncbar");if(sb)sb.classList.add("hidden");\n  window.scrollTo({top:0,behavior:"instant"});\n}\nfunction enterSpace(type){\n  currentSpace=type;$("spaceChooserView").classList.add("hidden");const sb=document.querySelector(".syncbar");if(sb)sb.classList.remove("hidden");renderHome();\n}\nfunction renderHome(){\n  if(!currentSpace){showSpaceChooser();return}\n  ensureLibrary();saveActiveIntoLibrary();showView("home");\n  $("spaceChooserView").classList.add("hidden");const sb=document.querySelector(".syncbar");if(sb)sb.classList.remove("hidden");\n  $("spaceHomeTitle").textContent=currentSpace==="hypnose"?"Mes séances d’hypnose":"Mes méditations";\n  let box=$("sessionList");box.innerHTML="";let visible=state.sessions.filter(sess=>sess.type===currentSpace);\n  if(!visible.length)box.innerHTML='<div class="space-empty">Aucune séance dans cet espace pour le moment.</div>';\n  visible.forEach(sess=>'''
assert js_anchor in s, 'renderHome anchor missing'
s = s.replace(js_anchor, js_repl, 1)

# In a chosen space, creating a session creates the correct type directly.
old_prompt = 'function createSessionPrompt(){showModal(`<div class="kicker">NOUVELLE SÉANCE</div><h2>Que veux-tu créer ?</h2><p class="note">Tu pourras tout modifier ensuite : titre, phases, durées, textes, repères, instruments et musiques.</p><div class="create-choice"><button class="btn primary" id="newMeditation">Méditation</button><button class="btn" id="newHypnose">Hypnose</button></div><button class="btn small" style="width:100%" id="newCancel">Annuler</button>`);$("newMeditation").onclick=()=>createNewSession("meditation");$("newHypnose").onclick=()=>createNewSession("hypnose");$("newCancel").onclick=closeModal}'
new_prompt = 'function createSessionPrompt(){createNewSession(currentSpace||"meditation")}'
assert old_prompt in s, 'create prompt anchor missing'
s = s.replace(old_prompt, new_prompt, 1)

# Returning from account opening/login/recovery goes to the two-space chooser first.
old_enter = '  renderHome();startPullLoop();syncPull().catch(()=>{});\n}'
new_enter = '  showSpaceChooser();startPullLoop();syncPull().catch(()=>{});\n}'
assert old_enter in s, 'enterApp anchor missing'
s = s.replace(old_enter, new_enter, 1)

# Remote refreshes should not kick the user out of the chooser.
old_current = 'function renderCurrent(){\n  if(view==="home")renderHome();else if(view==="music")renderMusicSettings();else if(view==="edit")renderEditor();else if(view==="player")updatePlayer();\n}'
new_current = 'function renderCurrent(){\n  if(view==="chooser")showSpaceChooser();else if(view==="home")renderHome();else if(view==="music")renderMusicSettings();else if(view==="edit")renderEditor();else if(view==="player")updatePlayer();\n}'
assert old_current in s, 'renderCurrent anchor missing'
s = s.replace(old_current, new_current, 1)

# showView must hide the chooser when entering any working view.
show_anchor = 'function showView(name){\n  view=name;\n  for(const id of ["homeView","musicSettingsView","editView","playerView"])$(id).classList.add("hidden");'
show_repl = 'function showView(name){\n  view=name;\n  $("spaceChooserView").classList.add("hidden");\n  for(const id of ["homeView","musicSettingsView","editView","playerView"])$(id).classList.add("hidden");'
assert show_anchor in s, 'showView anchor missing'
s = s.replace(show_anchor, show_repl, 1)

# Bind chooser controls and back button after the repaired event bindings exist.
bind_anchor = '$("createSessionBtn").onclick=createSessionPrompt;$("musicBackBtn").onclick=renderHome;\n'
bind_repl = '$("chooseMeditationSpace").onclick=()=>enterSpace("meditation");$("chooseHypnoseSpace").onclick=()=>enterSpace("hypnose");$("changeSpaceBtn").onclick=showSpaceChooser;\n$("createSessionBtn").onclick=createSessionPrompt;$("musicBackBtn").onclick=renderHome;\n'
assert bind_anchor in s, 'binding anchor missing'
s = s.replace(bind_anchor, bind_repl, 1)

p.write_text(s, encoding='utf-8')
print('selector restored', len(s))
