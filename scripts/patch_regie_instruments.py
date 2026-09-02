from pathlib import Path
import sys

p = Path(sys.argv[1] if len(sys.argv) > 1 else 'pwa-dist/regie-v14/index.html')
s = p.read_text(encoding='utf-8')

css_marker = '.instrument{padding:12px 15px}\n'
css = r'''.instrument{padding:12px 15px}
.instrument-visual{position:relative;overflow:hidden;border:1px solid var(--line);border-radius:22px;background:linear-gradient(145deg,#fffdf9,#f6f0e8);margin:8px 0 10px;box-shadow:inset 0 0 0 1px rgba(255,255,255,.55)}
.instrument-hint{font-size:12px;color:var(--muted);text-align:center;margin-top:5px}
.simple-rain-stage{height:clamp(150px,23vw,190px);display:grid;place-items:center;padding:22px 18px}
.simple-rain-tube{position:relative;width:min(92%,560px);height:54px;border:2px solid rgba(92,133,134,.58);border-radius:999px;background:linear-gradient(180deg,rgba(255,255,255,.78),rgba(219,233,231,.24));box-shadow:inset 0 5px 13px rgba(255,255,255,.9),0 7px 18px rgba(64,58,55,.08);overflow:hidden;transform-origin:center;will-change:transform}
.simple-rain-tube:before,.simple-rain-tube:after{content:"";position:absolute;top:6px;bottom:6px;width:13px;border-radius:999px;background:rgba(92,133,134,.15);border:1px solid rgba(92,133,134,.22);z-index:2}
.simple-rain-tube:before{left:6px}.simple-rain-tube:after{right:6px}
.rain-beads{position:absolute;inset:4px 18px;overflow:hidden;border-radius:999px}
.rain-beads i{position:absolute;width:8px;height:8px;margin:-4px 0 0 -4px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(75,65,56,.34),inset 0 0 0 1px rgba(211,201,189,.75);will-change:left,top}
.rain-breath-line{position:absolute;left:10%;right:10%;bottom:10px;height:4px;border-radius:99px;background:rgba(92,133,134,.12);overflow:hidden}
.rain-breath-line i{display:block;height:100%;width:0;border-radius:99px;background:linear-gradient(90deg,var(--teal),var(--mauve));will-change:width}
.simple-ocean-wrap{height:clamp(245px,42vw,360px);display:grid;place-items:center;padding:12px}
.simple-ocean-drum{position:relative;width:min(92%,330px);aspect-ratio:1;border-radius:50%;border:10px solid rgba(92,133,134,.28);background:radial-gradient(circle at 50% 43%,rgba(255,255,255,.92),rgba(238,231,222,.75));box-shadow:inset 0 0 0 2px rgba(92,133,134,.22),0 10px 24px rgba(64,58,55,.09);overflow:hidden;will-change:transform;transform-origin:center}
.simple-ocean-drum:after{content:"";position:absolute;inset:15%;border-radius:50%;border:1px solid rgba(92,133,134,.12);pointer-events:none}
.ocean-beads-simple{position:absolute;inset:7%;border-radius:50%;overflow:hidden}
.ocean-beads-simple i{position:absolute;width:9px;height:9px;margin:-4.5px 0 0 -4.5px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(75,65,56,.36),inset 0 0 0 1px rgba(211,201,189,.8);will-change:left,top}
@media(max-width:520px){.simple-rain-stage{height:145px;padding:18px 10px}.simple-rain-tube{height:48px}.rain-beads i{width:7px;height:7px;margin:-3.5px 0 0 -3.5px}.simple-ocean-wrap{height:265px}.simple-ocean-drum{width:min(94%,245px)}.ocean-beads-simple i{width:8px;height:8px;margin:-4px 0 0 -4px}}
'''
if css_marker not in s:
    raise SystemExit('CSS instrument marker not found')
s = s.replace(css_marker, css, 1)

start = s.index('function updateInstrument(p){')
end = s.index('function animateInstruments(){', start)
update_fn = r'''function updateInstrument(p){
  let host=$("instrumentHost"),current=host.dataset.phase;
  if(current===String(phaseIndex))return;host.dataset.phase=String(phaseIndex);host.innerHTML="";
  if(p.instrument===1){
    host.innerHTML=`<div class="card instrument"><div class="instrument-title">COHÉRENCE CARDIAQUE — BÂTON DE PLUIE</div>
      <div class="instrument-visual simple-rain-stage"><div id="simpleRainTube" class="simple-rain-tube"><div id="rainBeads" class="rain-beads"></div></div><div class="rain-breath-line"><i id="rainBreathFill"></i></div></div>
      <div class="instrument-controls"><div class="note" id="rainLabel">INSPIRE</div><button class="btn small" id="rainMinus">−</button><button class="btn small" id="rainPlus">+</button></div>
      <div class="instrument-hint">Les billes glissent doucement avec la bascule du bâton.</div></div>`;
    const layer=$("rainBeads");for(let i=0;i<28;i++){let b=document.createElement("i");layer.appendChild(b)}
    $("rainMinus").onclick=()=>{state.prefs.rainSeconds=clamp((state.prefs.rainSeconds||5)-1,3,10);persistLocal()};
    $("rainPlus").onclick=()=>{state.prefs.rainSeconds=clamp((state.prefs.rainSeconds||5)+1,3,10);persistLocal()};
  }else if(p.instrument===2){
    host.innerHTML=`<div class="card instrument"><div class="instrument-title">TAMBOUR OCÉAN — RYTHME DE LA VAGUE</div><div class="note">Monte • sommet • redescend</div>
      <div class="instrument-visual simple-ocean-wrap"><div id="simpleOceanDrum" class="simple-ocean-drum"><div id="oceanBeads" class="ocean-beads-simple"></div></div></div>
      <div class="instrument-controls"><div class="note" id="waveLabel">1 vague • ${state.prefs.waveSeconds||8} s</div><button class="btn small" id="waveMinus">−</button><button class="btn small" id="wavePlus">+</button></div>
      <div class="instrument-hint">Les billes roulent d’un côté à l’autre avec le mouvement du tambour.</div></div>`;
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
    const sec=state.prefs.rainSeconds||5,cycle=(t%(sec*2))/(sec*2),flow=Math.sin(cycle*Math.PI*2),tilt=flow*8;
    $("simpleRainTube").style.transform=`rotate(${tilt.toFixed(2)}deg)`;
    const beads=$("rainBeads").querySelectorAll("i"),n=Math.max(1,beads.length);
    beads.forEach((b,i)=>{
      const col=(i%7)-3,row=Math.floor(i/7)-1.5;
      let x=50+flow*30+col*5.2+Math.sin(t*2+i*.8)*1.4;
      let y=50+row*8+Math.cos(t*1.7+i*.9)*2.2;
      x=clamp(x,7,93);y=clamp(y,17,83);b.style.left=x.toFixed(2)+"%";b.style.top=y.toFixed(2)+"%";
    });
    const progress=cycle<.5?cycle*2:(1-cycle)*2;if($("rainBreathFill"))$("rainBreathFill").style.width=(progress*100).toFixed(1)+"%";
    $("rainLabel").textContent=(cycle<.5?"INSPIRE":"EXPIRE")+" • "+sec+" s";
  }
  if(p.instrument===2&&$("oceanBeads")){
    const sec=state.prefs.waveSeconds||8,q=(t%sec)/sec,side=Math.sin(q*Math.PI*2),lift=Math.cos(q*Math.PI*2);
    if($("simpleOceanDrum"))$("simpleOceanDrum").style.transform=`rotate(${(side*2.2).toFixed(2)}deg)`;
    const beads=$("oceanBeads").querySelectorAll("i"),n=Math.max(1,beads.length);
    beads.forEach((b,i)=>{
      const row=Math.floor(i/8),col=(i%8)-3.5;
      const spread=4.6+(row%2)*.5;
      let x=50+side*25+col*spread+Math.sin(t*1.8+i*.55)*1.7;
      let y=63+row*3.8+lift*(3+(i%3)) + Math.cos(t*1.35+i*.47)*1.3;
      x=clamp(x,9,91);y=clamp(y,18,91);b.style.left=x.toFixed(2)+"%";b.style.top=y.toFixed(2)+"%";
    });
    if($("waveLabel"))$("waveLabel").textContent="1 vague • "+sec+" s";
  }
  requestAnimationFrame(animateInstruments);
}
requestAnimationFrame(animateInstruments);

'''
s = s[:start] + animate_fn + s[end:]

p.write_text(s, encoding='utf-8')
print('simple instrument visuals patched', len(s))
