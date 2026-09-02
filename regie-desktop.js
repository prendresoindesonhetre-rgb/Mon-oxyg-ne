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
    invalidateReaderGeometry(true);
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
    PROMPTEUR À VITESSE PIXEL CONSTANTE
    ------------------------------------
    Le mouvement visuel n'est plus calculé depuis les caractères, les lignes,
    les retours à la ligne ou readingMap. La position verticale avance toujours
    en pixels continus. Les signes de ponctuation ne font qu'appliquer un petit
    ralentissement temporaire : ils ne peuvent jamais arrêter le mouvement.
  */
  const stage=document.createElement('div');
  stage.className='reader-gpu-stage';
  while(reader.firstChild)stage.appendChild(reader.firstChild);
  reader.appendChild(stage);

  let geometryKey='',maxScroll=0,lastPercent=-1,manualRaf=0;
  let gpuActive=false,visualOffset=0,lastRatio=0;
  let lastTrackedIndex=0,slowTimer=0,slowFactor=1;

  function currentText(){
    try{return String((phase()&&phase().say)||'')}catch(_){return ''}
  }
  function phaseKey(){
    try{
      const p=phase();
      return `${typeof sessionKey!=='undefined'?sessionKey:'med'}|${phaseIndex}|${(p&&p.say||'').length}|${reader.clientHeight}|${stage.scrollHeight}|${document.body.classList.contains('session-fullscreen')?'fs':'win'}`;
    }catch(_){return `${reader.clientHeight}|${stage.scrollHeight}`}
  }
  function invalidateReaderGeometry(preserve=true){
    if(preserve&&maxScroll>0)lastRatio=Math.max(0,Math.min(1,visualOffset/maxScroll));
    geometryKey='';
  }
  function ensureGeometry(){
    const key=phaseKey();
    if(key!==geometryKey){
      const oldMax=maxScroll;
      const ratio=oldMax>0?Math.max(0,Math.min(1,visualOffset/oldMax)):lastRatio;
      geometryKey=key;
      maxScroll=Math.max(0,reader.scrollHeight-reader.clientHeight);
      visualOffset=maxScroll*ratio;
    }
  }
  function totalReadingSeconds(){
    try{
      const n=readingMap&&readingMap.length?readingMap.length:0;
      const t=n?Number(readingMap[n-1]):0;
      if(Number.isFinite(t)&&t>2)return t;
    }catch(_){ }
    const text=currentText();
    const speed=Math.max(1,Math.min(100,Number(scrollSpeed)||32));
    const words=Math.max(1,text.trim().split(/\s+/).filter(Boolean).length);
    const wpm=58+(speed/100)*150;
    return Math.max(8,(words/wpm)*60);
  }
  function basePixelsPerSecond(){
    ensureGeometry();
    const seconds=totalReadingSeconds();
    return seconds>0?maxScroll/seconds:0;
  }
  function renderProgress(ratio){
    ratio=Math.max(0,Math.min(1,ratio));
    progressFill.style.transform=`scaleY(${ratio})`;
    const pct=Math.round(ratio*100);
    if(pct!==lastPercent){
      lastPercent=pct;
      if(readStatus)readStatus.textContent=pct>=100?'Lecture terminée — passage prêt':`Lecture ${pct} %`;
    }
  }
  function syncReadingState(ratio){
    ratio=Math.max(0,Math.min(1,ratio));
    const text=currentText();
    const maxIndex=Math.max(0,text.length-1);
    const idx=Math.min(maxIndex,Math.floor(ratio*Math.max(1,text.length)));

    /* Détecte seulement la ponctuation réellement franchie. Les \n sont ignorés. */
    if(idx>lastTrackedIndex){
      const from=Math.max(0,lastTrackedIndex);
      const to=Math.min(text.length,idx+1);
      const crossed=text.slice(from,to);
      if(/\[pause longue\]/i.test(crossed)){slowTimer=Math.max(slowTimer,.80);slowFactor=Math.min(slowFactor,.60)}
      else if(/\[pause\]/i.test(crossed)){slowTimer=Math.max(slowTimer,.55);slowFactor=Math.min(slowFactor,.68)}
      else if(/[.!?]/.test(crossed)){slowTimer=Math.max(slowTimer,.30);slowFactor=Math.min(slowFactor,.76)}
      else if(/[;:]/.test(crossed)){slowTimer=Math.max(slowTimer,.22);slowFactor=Math.min(slowFactor,.84)}
      else if(/,/.test(crossed)){slowTimer=Math.max(slowTimer,.14);slowFactor=Math.min(slowFactor,.90)}
    }
    lastTrackedIndex=idx;

    try{
      readingIndex=Math.min(Math.max(0,text.length-1),idx);
      const total=totalReadingSeconds();
      readingElapsed=total*ratio;
    }catch(_){ }
  }
  function renderGpuPosition(){
    ensureGeometry();
    const ratio=maxScroll>0?Math.max(0,Math.min(1,visualOffset/maxScroll)):1;
    stage.style.transform=`translate3d(0,${(-visualOffset).toFixed(3)}px,0)`;
    renderProgress(ratio);
    syncReadingState(ratio);
    lastRatio=ratio;
  }
  function activateGpu(){
    if(gpuActive)return;
    ensureGeometry();
    const manualOffset=Math.max(0,reader.scrollTop);
    if(manualOffset>1&&maxScroll>0){visualOffset=manualOffset;lastRatio=manualOffset/maxScroll}
    reader.scrollTop=0;
    reader.classList.add('gpu-autoscroll');
    gpuActive=true;
    lastTrackedIndex=Math.floor(lastRatio*Math.max(1,currentText().length));
    slowTimer=0;slowFactor=1;
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
    lastRatio=ratio;visualOffset=reader.scrollTop;
    renderProgress(ratio);
    syncReadingState(ratio);
  }

  /* Remplace le moteur de défilement appelé par la boucle principale. */
  const pixelUpdateReading=(dt)=>{
    try{
      const p=phase();
      const silent=p&&p.type==='silence';
      if(autoScroll&&running&&!silent){
        activateGpu();
        const delta=Math.max(0,Math.min(.12,Number(dt)||0));
        if(slowTimer>0){
          slowTimer=Math.max(0,slowTimer-delta);
          if(slowTimer===0)slowFactor=1;
        }
        const pxPerSec=basePixelsPerSecond();
        /* Minimum 55 % de la vitesse : même une pause ne fige jamais le texte. */
        const factor=Math.max(.55,Math.min(1,slowFactor));
        visualOffset=Math.min(maxScroll,visualOffset+pxPerSec*factor*delta);
        renderGpuPosition();
      }else{
        if(gpuActive&&(!autoScroll||silent))deactivateGpu();
        if(!autoScroll)renderManualProgress();
      }
    }catch(_){ }
  };
  try{updateReading=pixelUpdateReading}catch(_){ }

  /* Changement de phase : retour propre en haut sans conserver l'ancien offset. */
  const script=byId('scriptText');
  if(script){
    new MutationObserver(()=>{
      visualOffset=0;lastRatio=0;lastTrackedIndex=0;slowTimer=0;slowFactor=1;
      stage.style.transform='translate3d(0,0,0)';
      reader.scrollTop=0;
      geometryKey='';lastPercent=-1;
      try{readingIndex=0;readingElapsed=0}catch(_){ }
    }).observe(script,{childList:true,subtree:true,characterData:true});
  }

  reader.addEventListener('scroll',()=>{
    if(gpuActive){if(reader.scrollTop!==0)reader.scrollTop=0;return}
    if(manualRaf)return;
    manualRaf=requestAnimationFrame(()=>{manualRaf=0;try{if(!autoScroll)renderManualProgress()}catch(_){}});
  },{passive:true});

  window.addEventListener('resize',()=>invalidateReaderGeometry(true),{passive:true});
  if(window.ResizeObserver){
    const ro=new ResizeObserver(()=>invalidateReaderGeometry(true));
    ro.observe(reader);ro.observe(stage);
  }

  const autoBtn=byId('autoScrollBtn');
  if(autoBtn)autoBtn.addEventListener('click',()=>requestAnimationFrame(()=>{
    invalidateReaderGeometry(true);
    try{
      const p=phase(),silent=p&&p.type==='silence';
      if(autoScroll&&!silent){activateGpu();renderGpuPosition()}
      else{deactivateGpu();renderManualProgress()}
    }catch(_){ }
  }));

  progressFill.style.height='100%';
  progressFill.style.transform='scaleY(0)';
})();
