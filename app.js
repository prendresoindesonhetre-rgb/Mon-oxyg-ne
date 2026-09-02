'use strict';
const $ = (id)=>document.getElementById(id);
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const fmt=(s)=>{s=Math.max(0,Math.floor(s));return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`};

const phases=[
 {title:'Accueil & intention',minutes:4,type:'normal',say:`Prenez le temps de vous installer.\n\nDe prendre votre place.\n\nEt avant même de commencer, je vous invite simplement à vous demander :\n\nPourquoi suis-je venu ici ce soir ?\n\nPourquoi ai-je choisi de venir m’asseoir, ou m’allonger, pendant un moment…\n\ndans le silence…\n\navec moi-même ?\n\nIl n’est pas nécessaire de chercher une grande réponse.\n\nPeut-être qu’une intention est déjà présente.\n\nPeut-être simplement une envie.\n\nUn besoin.\n\nOu peut-être juste celui de prendre ce temps pour vous.\n\nGardez simplement cela quelque part avec vous.\n\nSans chercher à en faire quoi que ce soit.\n\n[silence]`,action:'Laisser un vrai silence après la dernière phrase.'},
 {title:'Prendre place',minutes:6,type:'normal',say:`Vous pouvez maintenant vous installer confortablement.\n\nEt progressivement…\n\nlaisser votre corps trouver sa juste place.\n\nPendant quelques instants, plus rien n’a besoin de tenir.\n\nVos jambes n’ont rien à tenir.\n\nVos bras non plus.\n\nVos mains peuvent simplement se déposer.\n\nVos épaules peuvent relâcher ce qu’elles retiennent.\n\nVotre mâchoire peut se desserrer.\n\nVotre visage peut se relâcher.\n\nEt vous pouvez simplement laisser le sol porter votre poids.\n\n[silence]\n\nPuis, sans chercher à modifier quoi que ce soit… faites simplement un état des lieux.\n\nComment vous sentez-vous aujourd’hui ?\n\nY a-t-il des endroits qui semblent plus tendus ?\n\nD’autres plus légers ?\n\nPeut-être une émotion qui prend davantage de place.\n\nPeut-être beaucoup de pensées.\n\nPeut-être au contraire quelque chose de très calme.\n\nIl n’y a rien à réussir ou à changer. Simplement observer.`,action:'Voix lente. Laisser le corps répondre avant de poursuivre.'},
 {title:'Retrouver la respiration',minutes:4,type:'normal',say:`Puis doucement…\n\nportez votre attention sur votre respiration.\n\nSimplement prendre conscience qu’elle est là.\n\nObservez d’abord comment vous respirez aujourd’hui.\n\nOù sentez-vous votre souffle ?\n\nPlutôt dans la poitrine ?\n\nDans le ventre ?\n\nÀ l’inspire, laissez votre ventre se gonfler naturellement.\n\nEt à l’expiration…\n\nlaissez-le redescendre.\n\nSans forcer.`,action:'Préparer le bâton de pluie pendant les dernières phrases.'},
 {title:'Cohérence cardiaque — bâton de pluie',minutes:5,type:'rain',say:`Et maintenant, pour ceux qui le souhaitent…\n\nje vais vous proposer de laisser le son du bâton de pluie accompagner votre respiration.\n\nMais surtout… ne cherchez pas à poursuivre le son.\n\nSi ce rythme ne vous convient pas, laissez votre corps respirer comme il en a besoin.\n\nLe bâton de pluie est simplement là comme un guide.\n\nÀ l’inspiration votre ventre se gonfle.\n\nEt à l’expire il se dégonfle.\n\nInspirez.\n\nEt expirez.\n\nVoilà, comme ceci c’est très bien.\n\nJe vais vous guider quelques instants comme ceci. Si vous perdez le rythme, si vous partez autre part, laissez-vous aller et laissez-vous voyager. Ce temps est d’abord un temps pour vous, pour vous alléger.`,action:'Suivre uniquement le guide visuel. Une fois lancé, aucune interaction n’est nécessaire.'},
 {title:'Revenir au souffle naturel',minutes:2,type:'normal',say:`Puis doucement…\n\nlaissez votre respiration retrouver son rythme naturel.\n\nVous n’avez plus besoin de la contrôler.\n\nPlus besoin de suivre quoi que ce soit.\n\nVotre corps peut reprendre tranquillement sa respiration.\n\nEt pendant quelques instants…\n\nRessentez simplement.`,action:'Déposer le bâton. Garder le silence avant la suite.'},
 {title:'Tambour océan — le bord de la mer',minutes:7,type:'ocean',say:`Et maintenant… pour ceux qui le souhaitent\n\nje vous invite simplement à écouter.\n\nPeut-être pouvez-vous laisser ce son vous emmener quelque part.\n\nAu bord de la mer.\n\nPeut-être un endroit que vous connaissez.\n\nUn lieu qui vous rappelle un souvenir agréable.\n\nOu peut-être simplement un endroit que vous imaginez.\n\nUn lieu qui n’existe que pour vous.\n\nPeu importe.\n\nLaissez simplement apparaître un endroit dans lequel vous vous sentez bien.\n\nUn endroit dans lequel vous vous sentez pleinement en sécurité.\n\nPrenez le temps de sentir cet endroit.\n\nPeut-être la température de l’air.\n\nLe contact du sol.\n\nLe sable.\n\nLe vent.\n\nLa lumière.\n\nEt devant vous… la mer.\n\nUne vague arrive.\n\nPuis elle repart.\n\nUne autre vient jusqu’au rivage.\n\nPuis retourne vers le large.\n\nEt simplement… laissez-vous quelques instants ici.\n\nVous n’avez rien à faire. Rien à produire.\n\nSimplement écouter ce mouvement, l’observer, peut-être même le ressentir.`,action:'Le point sur la vague donne le mouvement du tambour. Laisser plusieurs vagues sans parler.'},
 {title:'Laisser partir',minutes:7,type:'ocean',say:`Et doucement…\n\nnous approchons de l’automne.\n\nUne saison pendant laquelle la nature commence à changer de rythme.\n\nLes choses bougent.\n\nSe transforment.\n\nCertaines restent.\n\nEt d’autres commencent doucement à partir.\n\nLes arbres laissent tomber leurs feuilles une par une.\n\nPetit à petit ils laissent partir ce dont ils n’auront plus besoin pour continuer leur chemin.\n\nEt peut-être qu’aujourd’hui…\n\nil existe en vous quelque chose que vous n’avez plus besoin de retenir avec autant de force.\n\nNe cherchez pas.\n\nVous n’avez rien à trouver absolument.\n\nMais si quelque chose se présente…\n\nune pensée…\n\nune inquiétude…\n\nune attente…\n\nune habitude…\n\nune parole…\n\nune couleur…\n\nune image…\n\nObservez-le.\n\nEt si vous sentez que c’est le moment, vous pouvez finir par le déposer.\n\nLà.\n\nSur la plage.\n\nSans le jeter.\n\nSans essayer de vous en débarrasser.\n\nSimplement le poser.\n\nEt à chaque mouvement de la mer… vous pouvez laisser partir ce qui est prêt à partir.\n\nSeulement ce qui est prêt.\n\nCe qui a encore besoin de rester auprès de vous peut rester.\n\nIl n’y a rien à forcer.`,action:'À la fin, commencer le fondu musical avec le fader, très progressivement.'},
 {title:'Musique douce',minutes:5,type:'music',say:`Laisser la musique prendre sa place.\n\nAucune parole n’est nécessaire.`,action:'Faire entrer la musique avec un glissement vers le haut. À la fin, la faire redescendre et laisser revenir le silence.'},
 {title:'Transition vers l’assise',minutes:3,type:'normal',say:`Doucement…\n\ncommencez à retrouver un peu plus de présence dans votre corps.\n\nPeut-être en bougeant les doigts.\n\nLes pieds.\n\nPuis, quand ce sera juste pour vous, vous pourrez vous tourner tranquillement sur le côté.\n\nPrendre votre temps.\n\nEt seulement lorsque vous serez prêt… retrouver une position assise, à votre rythme.`,action:'Toujours laisser le passage par le côté avant le retour à l’assise.'},
 {title:'Trois espaces d’observation',minutes:5,type:'normal',say:`Avant d’entrer dans ce temps de méditation, je vous propose simplement de retrouver nos trois repères.\n\nD’abord, l’espace émotionnel et respiratoire. Prendre un instant pour sentir comment vous arrivez aujourd’hui. Ce qui est là, sans chercher à le modifier. Puis laisser la respiration retrouver son propre rythme. Observer simplement le souffle tel qu’il se présente.\n\nEnsuite, l’espace physique. Sentir votre corps dans l’assise. Vos points d’appui. Votre verticalité. Les tensions éventuelles. Les zones plus relâchées. Et simplement laisser le corps vous renseigner sur ce qui se passe en vous.\n\nEnfin, l’espace mental. Observer les pensées lorsqu’elles apparaissent. Sans chercher à les arrêter. Sans avoir besoin non plus de les suivre. Les laisser passer, revenir, disparaître. Et retrouver, chaque fois que nécessaire, votre présence. À votre souffle. À votre corps. À vous-même.\n\nPendant les vingt prochaines minutes, je vous invite simplement à rester dans cette rencontre. Sans objectif. Sans chercher à produire un état particulier. Sans chercher à réussir quoi que ce soit. La méditation peut simplement devenir cet espace dans lequel vous venez vous retrouver.\n\nEt à partir de maintenant, je vais vous laisser entièrement dans le silence.`,action:'Après la dernière phrase : plus aucune parole. Un seul coup de bol marque la fin du silence.'},
 {title:'Méditation silencieuse',minutes:20,type:'silence',say:`SILENCE\n\nLaisser entièrement les personnes dans leur méditation.`,action:'Ne pas parler. Le chrono reste le repère principal. Un seul coup de bol à la fin.'},
 {title:'Transition douce',minutes:3,type:'normal',say:`Prenez encore quelques instants.\n\nPuis doucement, retrouvez votre corps.\n\nVos mains.\n\nVos pieds.\n\nEt lorsque ce sera juste, laissez votre corps bouger à nouveau.\n\nPrenez le temps de passer sur le côté avant de changer de position.`,action:'Préparer la musique du troisième temps.'},
 {title:'Troisième temps — musique',minutes:15,type:'music',say:`Laisser la musique accompagner ce temps d’intégration.\n\nPas besoin de parler.`,action:'Utiliser le fader pour une entrée douce. Garder le texte comme simple repère.'},
 {title:'Retour final',minutes:4,type:'normal',say:`Et progressivement…\n\nlaissez revenir les sons autour de vous.\n\nLa pièce.\n\nVotre respiration.\n\nVotre corps.\n\nPrenez le temps dont vous avez besoin.\n\nEt lorsque ce sera juste… vous pourrez ouvrir les yeux.`,action:'Finir sans précipiter. Laisser un temps avant de reprendre la parole normalement.'}
];

let phaseIndex=0, running=false, lastTick=performance.now(), sessionElapsed=0, phaseElapsed=0;
let autoScroll=localStorage.getItem('regie.autoscroll')==='1';
let autoPhase=localStorage.getItem('regie.autophase')!=='0';
let scrollSpeed=Number(localStorage.getItem('regie.scrollSpeed')||38);
let readingElapsed=0, readingMap=[0], readingIndex=0, renderedPhase=-1, autoAdvanceLatched=false;
let inhale=Number(localStorage.getItem('regie.inhale')||5), exhale=Number(localStorage.getItem('regie.exhale')||5), rainReverse=false;
let waveDuration=Number(localStorage.getItem('regie.wave')||8);
let targetVolume=Number(localStorage.getItem('regie.volume')||0), smoothVolume=targetVolume, lastYtVolumeSent=-1;
let activeSource='youtube', ytPlayer=null, ytReady=false, pendingVideoId='', wantedPlay=false, youtubeApiReady=false;
let localObjectUrl=null, draggingTimeline=false;
const audio=$('localAudio');
let tracks=JSON.parse(localStorage.getItem('regie.tracks')||'[{"title":"","url":""},{"title":"","url":""},{"title":"","url":""}]');

function phase(){return phases[phaseIndex]}
function setPhase(i){
 phaseIndex=clamp(i,0,phases.length-1); phaseElapsed=0; readingElapsed=0; readingIndex=0; autoAdvanceLatched=false; renderedPhase=-1;
 renderPhase(); updateTimers();
}
function renderPhase(){
 const p=phase();
 $('phaseCounter').textContent=`PHASE ${phaseIndex+1} / ${phases.length}`; $('phaseTitle').textContent=p.title;
 if(renderedPhase!==phaseIndex){
   $('scriptText').textContent=p.say||''; $('actionText').textContent=p.action||'';
   $('reader').scrollTop=0; buildReadingMap(); renderedPhase=phaseIndex;
 }
 $('rainGuide').classList.toggle('hidden',p.type!=='rain'); $('oceanGuide').classList.toggle('hidden',p.type!=='ocean');
 const labels={rain:['BÂTON DE PLUIE','Suis la bascule. Le téléphone compte pour toi.'],ocean:['TAMBOUR OCÉAN','Suis la vague, sans avoir à compter.'],music:['MUSIQUE','Le fader devient ton geste principal.'],silence:['SILENCE','Le temps reste visible. Aucune parole.'],normal:['FIL DE SÉANCE','Garde seulement les repères dont tu as besoin.']};
 const [name,hint]=labels[p.type]||labels.normal; $('instrumentName').textContent=name; $('instrumentHint').textContent=hint;
 $('instrumentCard').className=`instrument-card ${p.type}`;
}
function updateTimers(){
 const planned=phase().minutes*60; $('sessionTime').textContent=fmt(sessionElapsed); $('phaseTime').textContent=fmt(phaseElapsed);
 const rem=planned-phaseElapsed;
 if(rem>=0){$('remainingCaption').textContent='RESTANT';$('remainingTime').textContent=fmt(rem)}else{$('remainingCaption').textContent='DÉPASSÉ';$('remainingTime').textContent='+'+fmt(-rem)}
}
function buildReadingMap(){
 const text=phase().say||''; const wpm=70+(scrollSpeed/100)*170; const charSec=60/(wpm*5.1); let t=0; readingMap=new Array(text.length+1); readingMap[0]=0;
 for(let i=0;i<text.length;i++){
   const c=text[i], next=text[i+1]||''; let cost=charSec;
   if(c===' ') cost*=.35; else if(c==='\n') cost=.33; else if(c===',') cost=.42; else if(c===';'||c===':') cost=.52; else if(c==='.'||c==='?'||c==='!') cost=.86;
   if(c==='.'&&next==='.') cost=.38;
   t+=cost; readingMap[i+1]=t;
 }
 if(readingElapsed>t) readingElapsed=t;
}
function binaryReadIndex(sec){let lo=0,hi=readingMap.length-1;while(lo<hi){const mid=Math.ceil((lo+hi)/2);if(readingMap[mid]<=sec)lo=mid;else hi=mid-1}return lo}
function readingFinished(){
 if(!phase().say || phase().type==='silence') return true;
 if(autoScroll) return readingIndex>=Math.max(0,phase().say.length-2);
 const r=$('reader'); return r.scrollTop+r.clientHeight>=r.scrollHeight-28;
}
function updateReading(dt){
 if(autoScroll && running && phase().type!=='silence'){
   readingElapsed += dt; readingIndex=binaryReadIndex(readingElapsed);
   const maxScroll=Math.max(0,$('reader').scrollHeight-$('reader').clientHeight);
   const progress=phase().say.length?readingIndex/phase().say.length:1;
   const target=maxScroll*progress;
   $('reader').scrollTop += (target-$('reader').scrollTop)*Math.min(1,dt*8.5);
   $('readStatus').textContent=readingFinished()?'Lecture terminée — passage prêt':`Lecture ${Math.round(progress*100)} %`;
   $('readerProgressFill').style.height=`${clamp(progress*100,0,100)}%`;
 } else {
   const r=$('reader'); const max=Math.max(1,r.scrollHeight-r.clientHeight); const progress=clamp(r.scrollTop/max,0,1);
   $('readerProgressFill').style.height=`${progress*100}%`;
   $('readStatus').textContent=autoScroll?(running?'Défilement actif':'Défilement prêt'):'Défilement manuel';
 }
}
function maybeAutoAdvance(){
 if(!autoPhase || phaseIndex>=phases.length-1 || autoAdvanceLatched) return;
 const planned=phase().minutes*60;
 const canRead=phase().type==='silence' || autoScroll || readingFinished();
 if(phaseElapsed>=planned && canRead && readingFinished()){
   autoAdvanceLatched=true; setTimeout(()=>{if(autoAdvanceLatched&&autoPhase&&phaseIndex<phases.length-1)setPhase(phaseIndex+1)},1400);
 }
}
function updateInstrument(now){
 const p=phase();
 if(p.type==='rain'){
   const cycle=inhale+exhale; const pos=(phaseElapsed%cycle); let inhalePart=pos<inhale; let frac=inhalePart?pos/inhale:(pos-inhale)/exhale;
   if(rainReverse) frac=1-frac; const a=-25+50*frac; $('rainStick').style.transform=`rotate(${a}deg)`;
   $('breathLabel').textContent=inhalePart?'INSPIRE':'EXPIRE'; $('breathCountdown').textContent=`${(inhalePart?inhale-pos:exhale-(pos-inhale)).toFixed(1)} s`;
 }
 if(p.type==='ocean') drawWave(now);
}
function drawWave(now){
 const c=$('waveCanvas'),ctx=c.getContext('2d'),dpr=window.devicePixelRatio||1,w=c.clientWidth,h=c.clientHeight;
 if(c.width!==Math.round(w*dpr)||c.height!==Math.round(h*dpr)){c.width=Math.round(w*dpr);c.height=Math.round(h*dpr)}ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
 ctx.strokeStyle='rgba(96,140,137,.42)';ctx.lineWidth=2;ctx.beginPath();for(let x=0;x<=w;x++){const y=h*.5-Math.sin((x/w)*Math.PI*2)*h*.28;(x?ctx.lineTo(x,y):ctx.moveTo(x,y))}ctx.stroke();
 const f=((phaseElapsed%waveDuration)/waveDuration),x=f*w,y=h*.5-Math.sin(f*Math.PI*2)*h*.28;ctx.fillStyle='#608c89';ctx.beginPath();ctx.arc(x,y,6,0,Math.PI*2);ctx.fill();
 $('waveLabel').textContent=f<.25?'La vague monte doucement':f<.5?'Sommet de la vague':f<.75?'La vague redescend':'La vague revient';
}
function loop(now){
 const dt=Math.min(.12,(now-lastTick)/1000);lastTick=now;
 if(running){sessionElapsed+=dt;phaseElapsed+=dt}
 updateTimers();updateReading(dt);updateInstrument(now);maybeAutoAdvance();smoothMusic(dt);updateMusicTimeline();requestAnimationFrame(loop);
}

function setAutoScroll(v){autoScroll=v;localStorage.setItem('regie.autoscroll',v?'1':'0');$('autoScrollBtn').classList.toggle('active',v);$('autoScrollBtn').textContent=v?'Défilement auto ✓':'Défilement auto';if(v){const max=Math.max(1,$('reader').scrollHeight-$('reader').clientHeight);const p=clamp($('reader').scrollTop/max,0,1);readingIndex=Math.round(p*phase().say.length);readingElapsed=readingMap[readingIndex]||0;lastTick=performance.now()}}
function setAutoPhase(v){autoPhase=v;localStorage.setItem('regie.autophase',v?'1':'0');$('autoPhaseBtn').classList.toggle('active',v);$('autoPhaseBtn').textContent=v?'PHASES AUTO ✓':'PHASES AUTO'}

function videoId(url){try{const u=new URL(url);if(u.hostname.includes('youtu.be'))return u.pathname.split('/').filter(Boolean)[0]||'';if(u.searchParams.get('v'))return u.searchParams.get('v');const m=u.pathname.match(/\/(embed|shorts)\/([^/?]+)/);return m?m[2]:''}catch(e){return ''}}
window.onYouTubeIframeAPIReady=function(){youtubeApiReady=true;createYoutubePlayer()};
function createYoutubePlayer(){if(ytPlayer||!window.YT||!YT.Player)return;ytPlayer=new YT.Player('youtubePlayer',{height:'126',width:'250',videoId:'',playerVars:{playsinline:1,controls:0,rel:0,fs:0,origin:location.origin},events:{onReady:()=>{ytReady=true;setSourceStatus('Lecteur YouTube prêt.');if(pendingVideoId){ytPlayer.cueVideoById(pendingVideoId);pendingVideoId=''}applyVolume(true);if(wantedPlay)try{ytPlayer.playVideo()}catch(e){}},onStateChange:(e)=>{if(e.data===YT.PlayerState.PLAYING){$('musicState').textContent='LECTURE';wantedPlay=false}else if(e.data===YT.PlayerState.PAUSED)$('musicState').textContent='PAUSE';else if(e.data===YT.PlayerState.CUED){$('musicState').textContent='PRÊT';if(wantedPlay)try{ytPlayer.playVideo()}catch(err){}}},onError:(e)=>setSourceStatus(`YouTube refuse cette lecture intégrée (${e.data}). Essaie un fichier audio local.`)}})}
function prepareYoutube(url,title){const id=videoId(url);if(!id){setSourceStatus('Lien YouTube non reconnu.');return}activeSource='youtube';pendingVideoId=id;$('trackName').textContent=title||'YouTube';targetVolume=0;smoothVolume=0;renderVolume();if(!ytPlayer)createYoutubePlayer();if(ytReady){try{ytPlayer.cueVideoById(id);ytPlayer.setVolume(0)}catch(e){}}setSourceStatus('Piste préparée à volume 0. Tu peux lancer puis faire entrer le son avec le fader.')}
function setSourceStatus(s){$('sourceStatus').textContent=s}
function playMusic(){wantedPlay=true;if(activeSource==='local'){if(!audio.src){setSourceStatus('Choisis d’abord un fichier audio.');return}audio.play().then(()=>{$('musicState').textContent='LECTURE';wantedPlay=false}).catch(()=>{$('musicState').textContent='APPUYER À NOUVEAU'})}else{if(!ytPlayer||!ytReady){createYoutubePlayer();$('musicState').textContent='PRÉPARATION';setSourceStatus('Le lecteur se prépare. La commande Lecture est mémorisée.');return}try{ytPlayer.playVideo()}catch(e){$('musicState').textContent='PRÉPARATION'}}}
function pauseMusic(){wantedPlay=false;if(activeSource==='local')audio.pause();else if(ytReady)try{ytPlayer.pauseVideo()}catch(e){}$('musicState').textContent='PAUSE'}
function stopMusic(){wantedPlay=false;if(activeSource==='local'){audio.pause();audio.currentTime=0}else if(ytReady)try{ytPlayer.stopVideo()}catch(e){}$('musicState').textContent='ARRÊT'}
function musicDuration(){if(activeSource==='local')return Number.isFinite(audio.duration)?audio.duration:0;if(ytReady)try{return ytPlayer.getDuration()||0}catch(e){}return 0}
function musicCurrent(){if(activeSource==='local')return audio.currentTime||0;if(ytReady)try{return ytPlayer.getCurrentTime()||0}catch(e){}return 0}
function seekMusic(ratio){ratio=clamp(ratio,0,1);const d=musicDuration();if(!d)return;if(activeSource==='local')audio.currentTime=d*ratio;else if(ytReady)try{ytPlayer.seekTo(d*ratio,true)}catch(e){}}
function updateMusicTimeline(){if(draggingTimeline)return;const d=musicDuration(),c=musicCurrent();$('musicTimeline').value=d?Math.round(c/d*1000):0;$('musicTime').textContent=`${fmt(c)} / ${fmt(d)}`}
function targetVolumeSet(v){targetVolume=clamp(v,0,100);localStorage.setItem('regie.volume',String(Math.round(targetVolume)));renderVolume()}
function renderVolume(){const v=clamp(targetVolume,0,100);$('volumeValue').textContent=`${Math.round(v)}%`;$('faderFill').style.height=`${v}%`;$('faderKnob').style.bottom=`${v}%`;$('fader').setAttribute('aria-valuenow',String(Math.round(v)))}
function smoothMusic(dt){const diff=targetVolume-smoothVolume;if(Math.abs(diff)<.05)smoothVolume=targetVolume;else smoothVolume+=diff*Math.min(1,dt*8.5);applyVolume(false)}
function applyVolume(force){const n=clamp(smoothVolume/100,0,1),shaped=Math.pow(n,1.35);if(activeSource==='local'){audio.volume=shaped}else if(ytReady&&ytPlayer){const val=Math.round(n*100);if(force||Math.abs(val-lastYtVolumeSent)>=1){lastYtVolumeSent=val;try{ytPlayer.setVolume(val)}catch(e){}}}}
function loadLocal(file){if(!file)return;if(localObjectUrl)URL.revokeObjectURL(localObjectUrl);localObjectUrl=URL.createObjectURL(file);audio.src=localObjectUrl;activeSource='local';targetVolume=0;smoothVolume=0;renderVolume();$('trackName').textContent=file.name.replace(/\.[^.]+$/,'');setSourceStatus('Fichier audio local prêt à volume 0. Qualité audio directe du navigateur.');$('musicState').textContent='PRÊT'}

function initTracks(){const slot=Number($('trackSlot').value),t=tracks[slot]||{title:'',url:''};$('trackTitleInput').value=t.title||'';$('youtubeUrlInput').value=t.url||''}
function saveTrack(){const slot=Number($('trackSlot').value);tracks[slot]={title:$('trackTitleInput').value.trim(),url:$('youtubeUrlInput').value.trim()};localStorage.setItem('regie.tracks',JSON.stringify(tracks));prepareYoutube(tracks[slot].url,tracks[slot].title)}

$('sessionPlay').addEventListener('click',()=>{running=!running;$('sessionPlay').textContent=running?'Ⅱ Pause':'▶ Reprendre';lastTick=performance.now()});
$('prevPhase').addEventListener('click',()=>setPhase(phaseIndex-1));$('nextPhase').addEventListener('click',()=>setPhase(phaseIndex+1));
$('autoScrollBtn').addEventListener('click',()=>setAutoScroll(!autoScroll));$('autoPhaseBtn').addEventListener('click',()=>setAutoPhase(!autoPhase));
$('scrollSpeed').value=scrollSpeed;$('speedValue').textContent=scrollSpeed;$('scrollSpeed').addEventListener('input',(e)=>{const oldIdx=readingIndex;scrollSpeed=Number(e.target.value);$('speedValue').textContent=scrollSpeed;localStorage.setItem('regie.scrollSpeed',String(scrollSpeed));buildReadingMap();readingElapsed=readingMap[Math.min(oldIdx,readingMap.length-1)]||0});
$('reader').addEventListener('wheel',()=>{if(autoScroll)setAutoScroll(false)},{passive:true});$('reader').addEventListener('touchmove',()=>{if(autoScroll)setAutoScroll(false)},{passive:true});
$('inhaleMinus').onclick=()=>{inhale=clamp(inhale-1,2,12);$('inhaleValue').textContent=inhale;localStorage.setItem('regie.inhale',inhale)};$('inhalePlus').onclick=()=>{inhale=clamp(inhale+1,2,12);$('inhaleValue').textContent=inhale;localStorage.setItem('regie.inhale',inhale)};
$('exhaleMinus').onclick=()=>{exhale=clamp(exhale-1,2,12);$('exhaleValue').textContent=exhale;localStorage.setItem('regie.exhale',exhale)};$('exhalePlus').onclick=()=>{exhale=clamp(exhale+1,2,12);$('exhaleValue').textContent=exhale;localStorage.setItem('regie.exhale',exhale)};$('rainReverse').onclick=()=>rainReverse=!rainReverse;
$('waveMinus').onclick=()=>{waveDuration=clamp(waveDuration-1,4,20);$('waveSeconds').textContent=waveDuration;localStorage.setItem('regie.wave',waveDuration)};$('wavePlus').onclick=()=>{waveDuration=clamp(waveDuration+1,4,20);$('waveSeconds').textContent=waveDuration;localStorage.setItem('regie.wave',waveDuration)};
$('sourceToggle').onclick=()=>{$('sourceDrawer').classList.toggle('hidden');if(!$('sourceDrawer').classList.contains('hidden'))createYoutubePlayer()};$('trackSlot').onchange=initTracks;$('saveTrackBtn').onclick=saveTrack;$('localFile').onchange=e=>loadLocal(e.target.files?.[0]);
$('musicPlay').onclick=playMusic;$('musicPause').onclick=pauseMusic;$('musicStop').onclick=stopMusic;
$('musicTimeline').addEventListener('pointerdown',()=>draggingTimeline=true);$('musicTimeline').addEventListener('input',e=>{draggingTimeline=true;const r=Number(e.target.value)/1000;const d=musicDuration();$('musicTime').textContent=`${fmt(d*r)} / ${fmt(d)}`});$('musicTimeline').addEventListener('change',e=>{seekMusic(Number(e.target.value)/1000);draggingTimeline=false});

const fader=$('fader');let faderDrag=null;
fader.addEventListener('pointerdown',(e)=>{fader.setPointerCapture(e.pointerId);faderDrag={y:e.clientY,v:targetVolume,h:fader.clientHeight};e.preventDefault()});
fader.addEventListener('pointermove',(e)=>{if(!faderDrag)return;const delta=(faderDrag.y-e.clientY)/(faderDrag.h*.72)*100;targetVolumeSet(faderDrag.v+delta);e.preventDefault()});
fader.addEventListener('pointerup',()=>faderDrag=null);fader.addEventListener('pointercancel',()=>faderDrag=null);
fader.addEventListener('keydown',(e)=>{if(e.key==='ArrowUp'){targetVolumeSet(targetVolume+2);e.preventDefault()}if(e.key==='ArrowDown'){targetVolumeSet(targetVolume-2);e.preventDefault()}if(e.key==='Home'){targetVolumeSet(0);e.preventDefault()}if(e.key==='End'){targetVolumeSet(100);e.preventDefault()}});

audio.addEventListener('play',()=>$('musicState').textContent='LECTURE');audio.addEventListener('pause',()=>{if(audio.currentTime>0)$('musicState').textContent='PAUSE'});audio.addEventListener('ended',()=>$('musicState').textContent='FIN');

$('inhaleValue').textContent=inhale;$('exhaleValue').textContent=exhale;$('waveSeconds').textContent=waveDuration;setAutoScroll(autoScroll);setAutoPhase(autoPhase);renderVolume();initTracks();renderPhase();updateTimers();requestAnimationFrame((t)=>{lastTick=t;requestAnimationFrame(loop)});
