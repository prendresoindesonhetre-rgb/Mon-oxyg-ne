from pathlib import Path
import sys

p = Path(sys.argv[1] if len(sys.argv) > 1 else 'pwa-dist/regie-v14/index.html')
s = p.read_text(encoding='utf-8')

css_marker = '.instrument{padding:12px 15px}\n'
css = r'''.instrument{padding:12px 15px}
.instrument-visual{position:relative;overflow:hidden;border:1px solid var(--line);border-radius:22px;background:#faf5ec;margin:8px 0 10px;box-shadow:inset 0 0 0 1px rgba(255,255,255,.5)}
.rain-photo-wrap{height:clamp(170px,28vw,235px);display:grid;place-items:center;background:linear-gradient(145deg,#fffaf1,#f6ecdc)}
.rain-instrument-img{display:block;width:min(96%,620px);height:100%;object-fit:contain;transform-origin:center center;will-change:transform;filter:saturate(.92) contrast(.98)}
.rain-breath-line{position:absolute;left:8%;right:8%;bottom:10px;height:5px;border-radius:99px;background:rgba(92,133,134,.13);overflow:hidden}
.rain-breath-line i{display:block;height:100%;width:0;border-radius:99px;background:linear-gradient(90deg,var(--teal),var(--mauve));will-change:width}
.ocean-drum-stage{position:relative;width:min(100%,430px);aspect-ratio:1;margin:4px auto 8px;border-radius:26px;overflow:hidden;background:#fbf5e9;box-shadow:0 10px 28px rgba(64,58,55,.08)}
.ocean-drum-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;will-change:transform;transform-origin:center center}
.ocean-beads{position:absolute;inset:11%;border-radius:50%;pointer-events:none;overflow:hidden}
.ocean-beads i{position:absolute;width:8px;height:8px;margin:-4px 0 0 -4px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(82,67,54,.38),inset 0 0 0 1px rgba(220,210,196,.65);will-change:left,top}
.instrument-hint{font-size:12px;color:var(--muted);text-align:center;margin-top:5px}
@media(max-width:520px){.rain-photo-wrap{height:165px}.ocean-drum-stage{width:min(100%,330px)}.ocean-beads i{width:7px;height:7px;margin:-3.5px 0 0 -3.5px}}
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
      <div class="instrument-visual rain-photo-wrap"><img id="rainInstrumentImg" class="rain-instrument-img" src="assets/rain-stick.jpg" alt="Bâton de pluie"><div class="rain-breath-line"><i id="rainBreathFill"></i></div></div>
      <div class="instrument-controls"><div class="note" id="rainLabel">INSPIRE</div><button class="btn small" id="rainMinus">−</button><button class="btn small" id="rainPlus">+</button></div>
      <div class="instrument-hint">Le visuel suit doucement la bascule de ton vrai bâton.</div></div>`;
    $("rainMinus").onclick=()=>{state.prefs.rainSeconds=clamp((state.prefs.rainSeconds||5)-1,3,10);persistLocal()};
    $("rainPlus").onclick=()=>{state.prefs.rainSeconds=clamp((state.prefs.rainSeconds||5)+1,3,10);persistLocal()};
  }else if(p.instrument===2){
    host.innerHTML=`<div class="card instrument"><div class="instrument-title">TAMBOUR OCÉAN — RYTHME DE LA VAGUE</div><div class="note">Monte • sommet • redescend</div>
      <div class="instrument-visual ocean-drum-stage" id="oceanDrumStage"><img id="oceanDrumImg" class="ocean-drum-img" src="assets/ocean-drum.jpg" alt="Tambour océan"><div id="oceanBeads" class="ocean-beads"></div></div>
      <div class="instrument-controls"><div class="note" id="waveLabel">1 vague • ${state.prefs.waveSeconds||8} s</div><button class="btn small" id="waveMinus">−</button><button class="btn small" id="wavePlus">+</button></div>
      <div class="instrument-hint">Les billes suivent l’inclinaison du tambour.</div></div>`;
    const layer=$("oceanBeads");
    for(let i=0;i<42;i++){let b=document.createElement("i");b.dataset.b=String(i);layer.appendChild(b)}
    $("waveMinus").onclick=()=>{state.prefs.waveSeconds=clamp((state.prefs.waveSeconds||8)-1,4,20);persistLocal();host.dataset.phase="";updateInstrument(p)};
    $("wavePlus").onclick=()=>{state.prefs.waveSeconds=clamp((state.prefs.waveSeconds||8)+1,4,20);persistLocal();host.dataset.phase="";updateInstrument(p)};
  }else if(p.instrument===4){
    host.innerHTML=`<div class="card instrument"><div class="instrument-title">SILENCE</div><div class="note">Silence complet. Le temps continue, sans intervention.</div></div>`;
  }
}
'''
s = s[:start] + update_fn + s[end:]

start = s.index('function animateInstruments(){')
end = s.index('requestAnimationFrame(animateInstruments);', start)
animate_fn = r'''function animateInstruments(){
  if(!playing){requestAnimationFrame(animateInstruments);return}
  const p=state.phases[phaseIndex],t=performance.now()/1000;
  if(p.instrument===1&&$("rainInstrumentImg")){
    const sec=state.prefs.rainSeconds||5,cycle=(t%(sec*2))/(sec*2),x=cycle<.5?cycle*2:(1-cycle)*2;
    const tilt=cycle<.5?(x*16-8):((1-x)*16-8);
    $("rainInstrumentImg").style.transform=`rotate(${tilt.toFixed(2)}deg) scale(1.035)`;
    if($("rainBreathFill"))$("rainBreathFill").style.width=(x*100).toFixed(1)+"%";
    $("rainLabel").textContent=(cycle<.5?"INSPIRE":"EXPIRE")+" • "+sec+" s";
  }
  if(p.instrument===2&&$("oceanBeads")){
    const sec=state.prefs.waveSeconds||8,q=(t%sec)/sec,tilt=Math.sin(q*Math.PI*2);
    if($("oceanDrumImg"))$("oceanDrumImg").style.transform=`rotate(${(tilt*2.4).toFixed(2)}deg) scale(1.018)`;
    const beads=$("oceanBeads").querySelectorAll("i"),n=Math.max(1,beads.length);
    beads.forEach((b,i)=>{
      const a=i*2.3999632297;
      const r=8+Math.sqrt((i+1)/n)*28;
      const ripple=Math.sin(t*1.65+i*.73)*2.2;
      let x=50+Math.cos(a)*(r+ripple)+tilt*(13+(i%4)*1.8);
      let y=50+Math.sin(a)*(r*.72+ripple*.5)+Math.cos(q*Math.PI*2)*(2+(i%3));
      x=clamp(x,8,92);y=clamp(y,11,89);
      b.style.left=x.toFixed(2)+"%";b.style.top=y.toFixed(2)+"%";
    });
    if($("waveLabel"))$("waveLabel").textContent="1 vague • "+sec+" s";
  }
  requestAnimationFrame(animateInstruments);
}
'''
s = s[:start] + animate_fn + s[end:]

p.write_text(s, encoding='utf-8')
print('instrument visuals patched', len(s))
