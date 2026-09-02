'use strict';
const $=(id)=>document.getElementById(id);
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const fmt=(s)=>{s=Math.max(0,Math.floor(s));return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`};

const freePhases=[
 {title:'Accueil & cadre',minutes:3,say:`Prenez le temps de vous installer.\n\nDe trouver la position la plus juste pour vous.\n\nIci, il n’y a rien à réussir.\n\nRien à prouver.\n\nEt pendant quelques instants seulement…\n\nvous pouvez simplement laisser davantage de place à ce qui est là, maintenant.`,action:'Poser le cadre et laisser un premier temps de silence.'},
 {title:'Installation',minutes:5,say:`Peut-être pouvez-vous déjà remarquer les endroits de votre corps qui sont en contact avec ce qui vous soutient.\n\nLe poids du corps.\n\nLes jambes.\n\nLe bassin.\n\nLe dos.\n\nLes épaules.\n\nEt laisser progressivement ce support porter un peu plus de votre poids.`,action:'Voix lente. Garder de l’espace entre les phrases.'},
 {title:'Induction',minutes:10,say:`Et à mesure que vous restez simplement ici…\n\nvous pouvez laisser votre attention se déplacer comme elle en a besoin.\n\nVers un son.\n\nUne sensation.\n\nUne image peut-être.\n\nOu simplement vers votre respiration.\n\nSans chercher à fabriquer quoi que ce soit.\n\nSeulement laisser venir ce qui vient…\n\net laisser repartir ce qui repart.`,action:'Tu peux activer librement le bâton de pluie ou la vague depuis le guide au-dessus.'},
 {title:'Approfondissement',minutes:8,say:`Et peut-être qu’une partie de vous peut continuer à écouter les mots…\n\ntandis qu’une autre partie peut déjà commencer à voyager autrement.\n\nÀ son rythme.\n\nSans avoir besoin de comprendre chaque chose.\n\nSimplement en laissant l’expérience prendre la forme qui lui convient.`,action:'Ralentir encore la voix. Utiliser le défilement comme fil, pas comme obligation.'},
 {title:'Travail hypnotique',minutes:20,say:`Ici commence le cœur de la séance.\n\nGarde sous les yeux les formulations importantes que tu souhaites utiliser.\n\nPrends le temps de laisser les réponses apparaître.\n\nLes silences font partie du travail.\n\nNe laisse pas le texte t’obliger à avancer plus vite que la personne.`,action:'Cette phase reste un espace libre pour tes autres scripts d’hypnose.'},
 {title:'Intégration',minutes:8,say:`Et maintenant…\n\nlaissez ce qui a besoin de se déposer trouver tranquillement sa place.\n\nIl n’y a rien à organiser consciemment.\n\nRien à retenir absolument.\n\nSimplement laisser cette expérience continuer son chemin, à sa manière.`,action:'La musique peut entrer très progressivement avec le fader.'},
 {title:'Retour',minutes:6,say:`Puis progressivement…\n\nvous pouvez retrouver davantage les sensations de votre corps.\n\nLes points d’appui.\n\nLes sons autour de vous.\n\nPeut-être bouger doucement les doigts.\n\nLes pieds.\n\nEt prendre tout le temps nécessaire avant de revenir pleinement ici.`,action:'Ne pas précipiter le retour. Garder le temps visible jusqu’à la fin.'}
];

const sessions={
 gign:{title:'Traverser l’inconfort en gardant ses capacités',hint:'Script importé · bâton 5–5 automatique sur la partie concernée',phases:(window.HYPNOSE_GIGN||[])},
 free:{title:'Séance libre / modèle',hint:'Structure libre pour construire une autre séance',phases:freePhases}
};
let sessionKey=localStorage.getItem('hypnose.session')||'gign';
if(!sessions[sessionKey]||!sessions[sessionKey].phases.length) sessionKey='free';
let phases=sessions[sessionKey].phases;
let phaseIndex=0,running=false,lastTick=performance.now(),sessionElapsed=0,phaseElapsed=0;
let autoScroll=localStorage.getItem('hypnose.autoscroll')==='1';
let autoPhase=localStorage.getItem('hypnose.autophase')!=='0';
let scrollSpeed=Number(localStorage.getItem('hypnose.scrollSpeed')||32);
let readingElapsed=0,readingMap=[0],readingIndex=0,renderedPhase=-1,autoAdvanceLatched=false;
let inhale=Number(localStorage.getItem('hypnose.inhale')||5),exhale=Number(localStorage.getItem('hypnose.exhale')||5),rainReverse=false;
let waveDuration=Number(localStorage.getItem('hypnose.wave')||8);
let guideMode=localStorage.getItem('hypnose.guide')||'none';
let targetVolume=Number(localStorage.getItem('hypnose.volume')||0),smoothVolume=targetVolume,lastYtVolumeSent=-1,lastYtVolumeAt=0;
let activeSource='youtube',ytPlayer=null,ytReady=false,pendingVideoId='',wantedPlay=false;
let localObjectUrl=null,draggingTimeline=false;
const audio=$('localAudio');
let tracks=JSON.parse(localStorage.getItem('hypnose.tracks')||'[{"title":"","url":""},{"title":"","url":""},{"title":"","url":""}]');

function phase(){return phases[phaseIndex]}
function switchSession(key){
 if(!sessions[key]||!sessions[key].phases.length)return;
 sessionKey=key; phases=sessions[key].phases; localStorage.setItem('hypnose.session',key);
 phaseIndex=0;sessionElapsed=0;phaseElapsed=0;readingElapsed=0;readingIndex=0;renderedPhase=-1;autoAdvanceLatched=false;running=false;
 $('sessionPlay').textContent='▶ Démarrer';
 $('hypnosisSessionSelect').value=key;$('hypnosisSessionHint').textContent=sessions[key].hint;
 if(key==='free') guideMode=localStorage.getItem('hypnose.guide')||'none';
 renderPhase();updateTimers();renderButtons();
}
function setPhase(i){
 phaseIndex=clamp(i,0,phases.length-1);phaseElapsed=0;readingElapsed=0;readingIndex=0;autoAdvanceLatched=false;renderedPhase=-1;
 renderPhase();updateTimers();
}
function renderPhase(){
 const p=phase();if(!p)return;
 $('phaseCounter').textContent=`PHASE ${phaseIndex+1} / ${phases.length}`;$('phaseTitle').textContent=p.title;
 if(renderedPhase!==phaseIndex){$('scriptText').textContent=p.say||'';$('actionText').textContent=p.action||'';$('actionText').classList.toggle('hidden',!(p.action||'').trim());$('reader').scrollTop=0;buildReadingMap();renderedPhase=phaseIndex;}
 if(sessionKey!=='free'){
   guideMode=p.guide||'none';
   if(p.guide==='rain'){inhale=p.inhale||5;exhale=p.exhale||5;$('inhaleValue').textContent=inhale;$('exhaleValue').textContent=exhale;}
 }
 renderGuide();
}
function updateTimers(){
 const p=phase();if(!p)return;const planned=p.minutes*60;$('sessionTime').textContent=fmt(sessionElapsed);$('phaseTime').textContent=fmt(phaseElapsed);const rem=planned-phaseElapsed;
 if(rem>=0){$('remainingCaption').textContent='RESTANT';$('remainingTime').textContent=fmt(rem)}else{$('remainingCaption').textContent='DÉPASSÉ';$('remainingTime').textContent='+'+fmt(-rem)}
}
function buildReadingMap(){
 const text=phase().say||'';const wpm=58+(scrollSpeed/100)*150;const charSec=60/(wpm*5.05);let t=0;readingMap=new Array(text.length+1);readingMap[0]=0;
 for(let i=0;i<text.length;i++){
   const c=text[i],n=text[i+1]||'';let cost=charSec;
   if(c===' ')cost*=.34;else if(c==='\n')cost=.38;else if(c===',')cost=.58;else if(c===';'||c===':')cost=.72;else if(c==='.'||c==='?'||c==='!')cost=1.1;
   if(c==='.'&&n==='.')cost=.34;
   if(c===']'){
     const before=text.slice(Math.max(0,i-18),i+1).toLowerCase();
     if(before.endsWith('[pause longue]'))cost+=5.0;else if(before.endsWith('[pause]'))cost+=2.6;
   }
   t+=cost;readingMap[i+1]=t;
 }
}
function updateReading(dt){
 if(!autoScroll)return;readingElapsed+=dt;while(readingIndex+1<readingMap.length&&readingMap[readingIndex+1]<=readingElapsed)readingIndex++;
 const max=Math.max(1,readingMap.length-1),ratio=clamp(readingIndex/max,0,1);$('readerProgressFill').style.height=`${ratio*100}%`;
 const reader=$('reader'),maxScroll=Math.max(0,reader.scrollHeight-reader.clientHeight),target=ratio*maxScroll;reader.scrollTop+=(target-reader.scrollTop)*.085;
 $('readStatus').textContent=ratio>=.995?'Lecture terminée':`Lecture ${Math.round(ratio*100)} %`;
}
function readingFinished(){return readingIndex>=Math.max(0,readingMap.length-2)}
function tick(now){
 const dt=Math.min(.15,(now-lastTick)/1000);lastTick=now;
 if(running){sessionElapsed+=dt;phaseElapsed+=dt;updateReading(dt);const planned=phase().minutes*60;if(autoPhase&&!autoAdvanceLatched&&phaseElapsed>=planned&&readingFinished()&&phaseIndex<phases.length-1){autoAdvanceLatched=true;setTimeout(()=>setPhase(phaseIndex+1),900)}}
 updateTimers();animateGuide(phaseElapsed);requestAnimationFrame(tick);
}

function renderGuide(){
 const rain=guideMode==='rain',ocean=guideMode==='ocean';$('rainGuide').classList.toggle('hidden',!rain);$('oceanGuide').classList.toggle('hidden',!ocean);$('guideNone').classList.toggle('active',guideMode==='none');$('guideRain').classList.toggle('active',rain);$('guideOcean').classList.toggle('active',ocean);
 $('instrumentName').textContent=rain?'BÂTON DE PLUIE · 5–5':ocean?'GUIDE DE VAGUE':'GUIDE LIBRE';$('instrumentHint').textContent=rain?'5 secondes dans un sens, 5 secondes dans l’autre.':ocean?'Suis le mouvement de la vague.':'Choisis un repère seulement quand tu en as besoin.';
 if(sessionKey==='free')localStorage.setItem('hypnose.guide',guideMode);
}
function animateGuide(t){
 if(guideMode==='rain'){
   const cycle=inhale+exhale,pos=(t%cycle),inInhale=pos<inhale,local=inInhale?pos/inhale:(pos-inhale)/exhale,eased=.5-.5*Math.cos(local*Math.PI);let angle=inInhale?(-25+50*eased):(25-50*eased);if(rainReverse)angle=-angle;
   $('rainStick').style.transform=`rotate(${angle}deg)`;$('breathLabel').textContent=inInhale?'INSPIRE':'EXPIRE';$('breathCountdown').textContent=`${(inInhale?inhale-pos:exhale-(pos-inhale)).toFixed(1)} s`;
 }
 if(guideMode==='ocean')drawWave(t);
}
function drawWave(t){
 const c=$('waveCanvas'),ctx=c.getContext('2d'),w=c.width,h=c.height;ctx.clearRect(0,0,w,h);ctx.strokeStyle='#91afc0';ctx.lineWidth=5;ctx.beginPath();for(let x=0;x<=w;x++){const y=h/2+Math.sin((x/w)*Math.PI*2-Math.PI/2)*h*.27;x?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.stroke();const r=(t%waveDuration)/waveDuration,x=r*w,y=h/2+Math.sin((x/w)*Math.PI*2-Math.PI/2)*h*.27;ctx.fillStyle='#608c89';ctx.beginPath();ctx.arc(x,y,8,0,Math.PI*2);ctx.fill();$('waveLabel').textContent=r<.45?'La vague monte doucement':r<.55?'Sommet de la vague':'La vague redescend';
}

function setTargetVolume(v){targetVolume=clamp(Number(v)||0,0,100);localStorage.setItem('hypnose.volume',String(targetVolume));$('fader').setAttribute('aria-valuenow',String(Math.round(targetVolume)));renderFader()}
function renderFader(){$('volumeValue').textContent=`${Math.round(targetVolume)}%`;$('faderFill').style.height=`${targetVolume}%`;$('faderKnob').style.bottom=`${targetVolume}%`}
function applySmoothVolume(ts=0){
 smoothVolume+=(targetVolume-smoothVolume)*.11;if(Math.abs(smoothVolume-targetVolume)<.04)smoothVolume=targetVolume;audio.volume=clamp(smoothVolume/100,0,1);
 if(ytReady&&ytPlayer&&ts-lastYtVolumeAt>80){const v=Math.round(smoothVolume);if(v!==lastYtVolumeSent){try{ytPlayer.setVolume(v);lastYtVolumeSent=v}catch(e){}}lastYtVolumeAt=ts}
 requestAnimationFrame(applySmoothVolume);
}
function faderFromPointer(e){const r=$('fader').getBoundingClientRect();setTargetVolume((1-clamp((e.clientY-r.top)/r.height,0,1))*100)}
let faderDragging=false;$('fader').addEventListener('pointerdown',e=>{faderDragging=true;$('fader').setPointerCapture(e.pointerId);faderFromPointer(e)});$('fader').addEventListener('pointermove',e=>{if(faderDragging)faderFromPointer(e)});$('fader').addEventListener('pointerup',()=>faderDragging=false);$('fader').addEventListener('pointercancel',()=>faderDragging=false);$('fader').addEventListener('keydown',e=>{if(e.key==='ArrowUp'){e.preventDefault();setTargetVolume(targetVolume+2)}if(e.key==='ArrowDown'){e.preventDefault();setTargetVolume(targetVolume-2)}});

function youtubeId(url){const m=String(url||'').match(/(?:youtu\.be\/|v=|shorts\/|embed\/)([A-Za-z0-9_-]{11})/);return m?m[1]:''}
window.onYouTubeIframeAPIReady=function(){ytPlayer=new YT.Player('youtubePlayer',{height:'126',width:'240',videoId:'',playerVars:{playsinline:1,controls:0,rel:0},events:{onReady:()=>{ytReady=true;if(pendingVideoId){ytPlayer.cueVideoById(pendingVideoId);pendingVideoId=''}if(wantedPlay){wantedPlay=false;ytPlayer.playVideo()}},onStateChange:updateMusicUi,onError:()=>{$('sourceStatus').textContent='Cette vidéo refuse la lecture intégrée. Essaie un autre lien ou un fichier audio.'}}})};
function prepareTrack(slot){const tr=tracks[slot]||{title:'',url:''};$('trackTitleInput').value=tr.title||'';$('youtubeUrlInput').value=tr.url||'';$('trackName').textContent=tr.title||'Aucune piste';const id=youtubeId(tr.url);activeSource='youtube';if(id){pendingVideoId=id;if(ytReady&&ytPlayer){pendingVideoId='';ytPlayer.cueVideoById(id)}$('sourceStatus').textContent='Piste préparée à volume 0.'}else $('sourceStatus').textContent='Ajoute un lien YouTube ou choisis un fichier audio.';setTargetVolume(0)}
function playMusic(){if(activeSource==='local'){audio.play().then(()=>{$('musicState').textContent='LECTURE'}).catch(()=>{$('musicState').textContent='APPUIE À NOUVEAU'});return}if(ytReady&&ytPlayer){try{ytPlayer.playVideo();$('musicState').textContent='LECTURE'}catch(e){wantedPlay=true}}else{wantedPlay=true;$('musicState').textContent='PRÉPARATION…'}}
function pauseMusic(){wantedPlay=false;if(activeSource==='local')audio.pause();else if(ytReady&&ytPlayer)try{ytPlayer.pauseVideo()}catch(e){};$('musicState').textContent='PAUSE'}
function stopMusic(){wantedPlay=false;if(activeSource==='local'){audio.pause();audio.currentTime=0}else if(ytReady&&ytPlayer)try{ytPlayer.stopVideo()}catch(e){};$('musicState').textContent='PRÊT'}
function updateMusicUi(){if(draggingTimeline)return;let cur=0,dur=0;if(activeSource==='local'){cur=audio.currentTime||0;dur=audio.duration||0}else if(ytReady&&ytPlayer){try{cur=ytPlayer.getCurrentTime()||0;dur=ytPlayer.getDuration()||0}catch(e){}}$('musicTime').textContent=`${fmt(cur)} / ${fmt(dur)}`;if(dur>0)$('musicTimeline').value=String(Math.round(cur/dur*1000))}
setInterval(updateMusicUi,400);

$('sourceToggle').onclick=()=>$('sourceDrawer').classList.toggle('hidden');$('trackSlot').onchange=()=>prepareTrack(Number($('trackSlot').value));$('saveTrackBtn').onclick=()=>{const i=Number($('trackSlot').value);tracks[i]={title:$('trackTitleInput').value.trim(),url:$('youtubeUrlInput').value.trim()};localStorage.setItem('hypnose.tracks',JSON.stringify(tracks));prepareTrack(i)};$('localFile').onchange=e=>{const f=e.target.files&&e.target.files[0];if(!f)return;if(localObjectUrl)URL.revokeObjectURL(localObjectUrl);localObjectUrl=URL.createObjectURL(f);audio.src=localObjectUrl;audio.load();activeSource='local';$('trackName').textContent=f.name;$('sourceStatus').textContent='Fichier audio prêt à volume 0.';setTargetVolume(0)};
$('musicPlay').onclick=playMusic;$('musicPause').onclick=pauseMusic;$('musicStop').onclick=stopMusic;
$('musicTimeline').onpointerdown=()=>draggingTimeline=true;$('musicTimeline').oninput=()=>{const r=Number($('musicTimeline').value)/1000;let d=0;if(activeSource==='local')d=audio.duration||0;else if(ytReady&&ytPlayer)try{d=ytPlayer.getDuration()||0}catch(e){};$('musicTime').textContent=`${fmt(d*r)} / ${fmt(d)}`};$('musicTimeline').onchange=()=>{const r=Number($('musicTimeline').value)/1000;if(activeSource==='local'&&audio.duration)audio.currentTime=audio.duration*r;else if(ytReady&&ytPlayer)try{const d=ytPlayer.getDuration()||0;if(d)ytPlayer.seekTo(d*r,true)}catch(e){}draggingTimeline=false};

$('sessionPlay').onclick=()=>{running=!running;lastTick=performance.now();$('sessionPlay').textContent=running?'Ⅱ Pause':'▶ Démarrer'};$('prevPhase').onclick=()=>setPhase(phaseIndex-1);$('nextPhase').onclick=()=>setPhase(phaseIndex+1);$('autoScrollBtn').onclick=()=>{autoScroll=!autoScroll;localStorage.setItem('hypnose.autoscroll',autoScroll?'1':'0');renderButtons()};$('autoPhaseBtn').onclick=()=>{autoPhase=!autoPhase;localStorage.setItem('hypnose.autophase',autoPhase?'1':'0');renderButtons()};$('scrollSpeed').oninput=()=>{scrollSpeed=Number($('scrollSpeed').value);$('speedValue').textContent=scrollSpeed;localStorage.setItem('hypnose.scrollSpeed',String(scrollSpeed));const ratio=readingMap.length>1?readingIndex/(readingMap.length-1):0;buildReadingMap();readingIndex=Math.round(ratio*Math.max(0,readingMap.length-1));readingElapsed=readingMap[readingIndex]||0};
$('guideNone').onclick=()=>{guideMode='none';renderGuide()};$('guideRain').onclick=()=>{guideMode='rain';renderGuide()};$('guideOcean').onclick=()=>{guideMode='ocean';renderGuide()};
function saveBreath(){localStorage.setItem('hypnose.inhale',String(inhale));localStorage.setItem('hypnose.exhale',String(exhale));$('inhaleValue').textContent=inhale;$('exhaleValue').textContent=exhale}
$('inhaleMinus').onclick=()=>{inhale=clamp(inhale-1,2,12);saveBreath()};$('inhalePlus').onclick=()=>{inhale=clamp(inhale+1,2,12);saveBreath()};$('exhaleMinus').onclick=()=>{exhale=clamp(exhale-1,2,12);saveBreath()};$('exhalePlus').onclick=()=>{exhale=clamp(exhale+1,2,12);saveBreath()};$('rainReverse').onclick=()=>rainReverse=!rainReverse;$('waveMinus').onclick=()=>{waveDuration=clamp(waveDuration-1,4,20);$('waveSeconds').textContent=waveDuration;localStorage.setItem('hypnose.wave',String(waveDuration))};$('wavePlus').onclick=()=>{waveDuration=clamp(waveDuration+1,4,20);$('waveSeconds').textContent=waveDuration;localStorage.setItem('hypnose.wave',String(waveDuration))};
$('hypnosisSessionSelect').onchange=()=>switchSession($('hypnosisSessionSelect').value);
function renderButtons(){$('autoScrollBtn').classList.toggle('active',autoScroll);$('autoScrollBtn').textContent=autoScroll?'Défilement auto ✓':'Défilement auto';$('autoPhaseBtn').classList.toggle('active',autoPhase);$('autoPhaseBtn').textContent=autoPhase?'PHASES AUTO ✓':'PHASES MANUELLES'}

$('scrollSpeed').value=String(scrollSpeed);$('speedValue').textContent=scrollSpeed;$('inhaleValue').textContent=inhale;$('exhaleValue').textContent=exhale;$('waveSeconds').textContent=waveDuration;$('hypnosisSessionSelect').value=sessionKey;$('hypnosisSessionHint').textContent=sessions[sessionKey].hint;prepareTrack(0);renderFader();renderButtons();renderPhase();updateTimers();requestAnimationFrame(tick);requestAnimationFrame(applySmoothVolume);
