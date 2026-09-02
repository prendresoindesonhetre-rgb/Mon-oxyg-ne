(()=>{
  'use strict';
  const byId=(id)=>document.getElementById(id);
  const reader=byId('reader');
  const progressFill=byId('readerProgressFill');
  const readStatus=byId('readStatus');
  if(!reader||!progressFill)return;

  /* Plein écran : vrai Fullscreen API + mode compact de la régie. */
  const nav=document.querySelector('.mode-nav');
  const enter=document.createElement('button');
  enter.type='button';enter.className='fullscreen-enter';enter.textContent='⛶ Plein écran';enter.title='Afficher la régie sur tout l’écran';
  if(nav){const badge=nav.querySelector('.mode-badge');nav.insertBefore(enter,badge||null)}
  else document.body.prepend(enter);
  const exit=document.createElement('button');
  exit.type='button';exit.className='fullscreen-exit';exit.textContent='⤢ Quitter';exit.title='Quitter le plein écran (Échap fonctionne aussi)';document.body.appendChild(exit);

  let focusFallback=false;
  const applyFullscreenState=()=>{
    const active=!!document.fullscreenElement||focusFallback;
    document.body.classList.toggle('session-fullscreen',active);
    enter.textContent=active?'⤢ Quitter':'⛶ Plein écran';
    invalidateReaderGeometry();
    updateGuideCompact();
  };
  const enterFullscreen=async()=>{
    if(document.fullscreenElement){await document.exitFullscreen();return}
    if(focusFallback){focusFallback=false;applyFullscreenState();return}
    try{
      if(document.documentElement.requestFullscreen){await document.documentElement.requestFullscreen({navigationUI:'hide'});}
      else{focusFallback=true;applyFullscreenState();}
    }catch(_){focusFallback=true;applyFullscreenState();}
  };
  enter.addEventListener('click',enterFullscreen);exit.addEventListener('click',enterFullscreen);
  document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement)focusFallback=false;applyFullscreenState()});

  /* Le guide ne prend de hauteur en plein écran que lorsqu'il sert réellement. */
  const instrument=byId('instrumentCard'),rain=byId('rainGuide'),ocean=byId('oceanGuide');
  function updateGuideCompact(){
    if(!instrument)return;
    let empty=(!rain||rain.classList.contains('hidden'))&&(!ocean||ocean.classList.contains('hidden'));
    try{if(typeof sessionKey!=='undefined'&&sessionKey==='free')empty=false}catch(_){ }
    instrument.classList.toggle('fullscreen-guide-empty',empty);
  }
  if(instrument){new MutationObserver(updateGuideCompact).observe(instrument,{subtree:true,attributes:true,attributeFilter:['class']});updateGuideCompact()}

  /*
    Le lecteur est déplacé sur une couche GPU. Le mouvement visuel n'est plus
    basé sur le nombre de caractères parcourus : les retours à la ligne ne
    peuvent donc plus créer de palier. La ponctuation module seulement la
    vitesse (elle ralentit), sans jamais arrêter le déplacement.
  */
  const stage=document.createElement('div');
  stage.className='reader-gpu-stage';
  while(reader.firstChild)stage.appendChild(reader.firstChild);
  reader.appendChild(stage);

  let geometryKey='',maxScroll=0,lastPercent=-1,manualRaf=0;
  let gpuActive=false,visualOffset=0;
  let motionKey='',motionMap=[0],motionFactors=[],motionTotal=1;

  function phaseKey(){
    try{
      const p=phase();
      return `${typeof sessionKey!=='undefined'?sessionKey:'med'}|${phaseIndex}|${(p&&p.say||'').length}|${reader.clientHeight}|${stage.scrollHeight}|${document.body.classList.contains('session-fullscreen')?'fs':'win'}`;
    }catch(_){return `${reader.clientHeight}|${stage.scrollHeight}`}
  }
  function invalidateReaderGeometry(){geometryKey=''}
  function ensureGeometry(){
    const key=phaseKey();
    if(key!==geometryKey){
      geometryKey=key;
      maxScroll=Math.max(0,reader.scrollHeight-reader.clientHeight);
    }
  }
  function currentText(){try{return (phase()&&phase().say)||''}catch(_){return ''}}
  function factorForChar(text,i){
    const c=text[i]||'';
    if(c==='\n'||c==='\r')return .96;
    if(c===',')return .82;
    if(c===';'||c===':')return .76;
    if(c==='.'||c==='?'||c==='!')return .68;
    if(c===']'){
      const before=text.slice(Math.max(0,i-22),i+1).toLowerCase();
      if(before.endsWith('[pause longue]'))return .48;
      if(before.endsWith('[pause]'))return .58;
      if(before.endsWith('[silence]'))return .58;
    }
    return 1;
  }
  function ensureMotionMap(){
    const text=currentText();
    const duration=readingMap.length?Number(readingMap[readingMap.length-1]||0):0;
    const key=`${phaseKey()}|${readingMap.length}|${duration.toFixed(4)}`;
    if(key===motionKey)return;
    motionKey=key;
    const n=Math.max(0,readingMap.length-1);
    motionMap=new Array(n+1);motionFactors=new Array(n);motionMap[0]=0;
    let total=0;
    for(let i=0;i<n;i++){
      const dt=Math.max(.0001,(readingMap[i+1]||0)-(readingMap[i]||0));
      const factor=factorForChar(text,i);
      motionFactors[i]=factor;
      total+=dt*factor;
      motionMap[i+1]=total;
    }
    motionTotal=Math.max(.0001,total);
  }
  function mapIndexAt(sec){
    let lo=0,hi=Math.max(0,readingMap.length-1);
    while(lo<hi){const mid=Math.ceil((lo+hi)/2);if(readingMap[mid]<=sec)lo=mid;else hi=mid-1}
    return lo;
  }
  function motionRatioAt(sec){
    ensureMotionMap();
    const n=Math.max(0,readingMap.length-1);
    if(!n)return 1;
    const end=Number(readingMap[n]||0);
    if(sec<=0){readingIndex=0;return 0}
    if(sec>=end){readingIndex=n;return 1}
    const i=Math.min(n-1,mapIndexAt(sec));
    readingIndex=i;
    const t0=Number(readingMap[i]||0);
    const partial=Math.max(0,sec-t0)*(motionFactors[i]||1);
    return Math.max(0,Math.min(1,((motionMap[i]||0)+partial)/motionTotal));
  }
  function setReadingElapsedFromMotionRatio(ratio){
    ensureMotionMap();
    const target=Math.max(0,Math.min(1,ratio))*motionTotal;
    let lo=0,hi=Math.max(0,motionMap.length-1);
    while(lo<hi){const mid=Math.ceil((lo+hi)/2);if(motionMap[mid]<=target)lo=mid;else hi=mid-1}
    const i=Math.min(Math.max(0,motionMap.length-2),lo);
    const factor=Math.max(.01,motionFactors[i]||1);
    readingElapsed=(readingMap[i]||0)+(target-(motionMap[i]||0))/factor;
    readingIndex=i;
  }
  function renderProgress(ratio){
    progressFill.style.transform=`scaleY(${ratio})`;
    const pct=Math.round(ratio*100);
    if(pct!==lastPercent){
      lastPercent=pct;
      if(readStatus)readStatus.textContent=pct>=100?'Lecture terminée — passage prêt':`Lecture ${pct} %`;
    }
  }
  function renderGpuPosition(){
    ensureGeometry();
    const ratio=motionRatioAt(readingElapsed);
    visualOffset=maxScroll*ratio;
    stage.style.transform=`translate3d(0,${(-visualOffset).toFixed(3)}px,0)`;
    renderProgress(ratio);
  }
  function activateGpu(){
    if(gpuActive)return;
    ensureGeometry();ensureMotionMap();
    const manualOffset=Math.max(0,reader.scrollTop);
    if(manualOffset>1&&maxScroll>0)setReadingElapsedFromMotionRatio(manualOffset/maxScroll);
    reader.scrollTop=0;
    reader.classList.add('gpu-autoscroll');
    gpuActive=true;
    renderGpuPosition();
  }
  function deactivateGpu(){
    if(!gpuActive)return;
    const offset=visualOffset;
    stage.style.transform='translate3d(0,0,0)';
    reader.classList.remove('gpu-autoscroll');
    gpuActive=false;
    reader.scrollTop=offset;
  }
  function renderManualProgress(){
    ensureGeometry();
    const ratio=maxScroll>0?Math.max(0,Math.min(1,reader.scrollTop/maxScroll)):0;
    renderProgress(ratio);
  }

  const gpuUpdateReading=(dt)=>{
    try{
      const p=phase();
      const silent=p&&p.type==='silence';
      if(autoScroll&&running&&!silent){
        activateGpu();
        const end=readingMap.length?Number(readingMap[readingMap.length-1]||0):0;
        readingElapsed=Math.min(end,readingElapsed+Math.max(0,Number(dt)||0));
        renderGpuPosition();
      }else{
        if(gpuActive&&(!autoScroll||silent))deactivateGpu();
        if(!autoScroll)renderManualProgress();
      }
    }catch(_){ }
  };
  try{updateReading=gpuUpdateReading}catch(_){ }
  try{readingFinished=()=>{
    try{
      const p=phase();
      if(!p||!p.say||p.type==='silence')return true;
      const end=readingMap.length?Number(readingMap[readingMap.length-1]||0):0;
      return readingElapsed>=Math.max(0,end-.05);
    }catch(_){return false}
  }}catch(_){ }

  const script=byId('scriptText');
  if(script){
    new MutationObserver(()=>{
      visualOffset=0;
      stage.style.transform='translate3d(0,0,0)';
      reader.scrollTop=0;
      invalidateReaderGeometry();
      motionKey='';
      lastPercent=-1;
    }).observe(script,{childList:true,subtree:true,characterData:true});
  }

  reader.addEventListener('scroll',()=>{
    if(gpuActive){if(reader.scrollTop!==0)reader.scrollTop=0;return}
    if(manualRaf)return;
    manualRaf=requestAnimationFrame(()=>{manualRaf=0;try{if(!autoScroll)renderManualProgress()}catch(_){}});
  },{passive:true});

  window.addEventListener('resize',()=>{invalidateReaderGeometry();motionKey=''},{passive:true});
  if(window.ResizeObserver){
    const ro=new ResizeObserver(()=>{invalidateReaderGeometry();motionKey=''});
    ro.observe(reader);ro.observe(stage);
  }

  const autoBtn=byId('autoScrollBtn');
  if(autoBtn)autoBtn.addEventListener('click',()=>requestAnimationFrame(()=>{
    invalidateReaderGeometry();motionKey='';
    try{
      const p=phase(),silent=p&&p.type==='silence';
      if(autoScroll&&!silent){activateGpu();renderGpuPosition()}
      else{deactivateGpu();renderManualProgress()}
    }catch(_){ }
  }));

  const speed=byId('scrollSpeed');
  if(speed)speed.addEventListener('input',()=>{motionKey='';requestAnimationFrame(()=>{try{if(gpuActive)renderGpuPosition()}catch(_){}})});

  progressFill.style.height='100%';
  progressFill.style.transform='scaleY(0)';
})();
