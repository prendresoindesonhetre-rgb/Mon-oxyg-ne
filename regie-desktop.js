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
     Défilement GPU : on ne modifie PLUS scrollTop à chaque image.
     Le contenu est déplacé par translate3d en sous-pixels, donc Chrome peut le
     composer directement sur le GPU sans arrondis ni recalcul de mise en page.
  */
  const stage=document.createElement('div');
  stage.className='reader-gpu-stage';
  while(reader.firstChild)stage.appendChild(reader.firstChild);
  reader.appendChild(stage);

  let geometryKey='',maxScroll=0,lastPercent=-1,manualRaf=0;
  let gpuActive=false,visualOffset=0;

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
  function mapIndexAt(sec){
    let lo=0,hi=Math.max(0,readingMap.length-1);
    while(lo<hi){const mid=Math.ceil((lo+hi)/2);if(readingMap[mid]<=sec)lo=mid;else hi=mid-1}
    return lo;
  }
  function readingRatio(){
    const total=Math.max(1,readingMap.length-1);
    readingIndex=mapIndexAt(readingElapsed);
    const next=Math.min(total,readingIndex+1);
    const t0=readingMap[readingIndex]||0,t1=readingMap[next]??t0;
    const frac=(next>readingIndex&&t1>t0)?Math.max(0,Math.min(1,(readingElapsed-t0)/(t1-t0))):0;
    return Math.max(0,Math.min(1,(Math.min(total,readingIndex+frac))/total));
  }
  function setReadingElapsedFromRatio(ratio){
    const total=Math.max(1,readingMap.length-1);
    const pos=Math.max(0,Math.min(total,ratio*total));
    const i=Math.floor(pos),next=Math.min(total,i+1),frac=pos-i;
    const t0=readingMap[i]||0,t1=readingMap[next]??t0;
    readingElapsed=t0+(t1-t0)*frac;
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
    const ratio=readingRatio();
    visualOffset=maxScroll*ratio;
    stage.style.transform=`translate3d(0,${(-visualOffset).toFixed(3)}px,0)`;
    renderProgress(ratio);
  }
  function activateGpu(){
    if(gpuActive)return;
    ensureGeometry();
    const manualOffset=Math.max(0,reader.scrollTop);
    if(manualOffset>1&&maxScroll>0)setReadingElapsedFromRatio(manualOffset/maxScroll);
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

  /* Remplace directement le moteur appelé par la boucle principale de l'app.
     Il n'y a donc plus une deuxième requestAnimationFrame concurrente. */
  const gpuUpdateReading=(dt)=>{
    try{
      const p=phase();
      const silent=p&&p.type==='silence';
      if(autoScroll&&running&&!silent){
        activateGpu();
        readingElapsed+=Math.max(0,Number(dt)||0);
        renderGpuPosition();
      }else{
        if(gpuActive&&(!autoScroll||silent))deactivateGpu();
        if(!autoScroll)renderManualProgress();
      }
    }catch(_){ }
  };
  try{updateReading=gpuUpdateReading}catch(_){ }

  /* Au changement de phase, aucun ancien décalage ne reste affiché une image. */
  const script=byId('scriptText');
  if(script){
    new MutationObserver(()=>{
      visualOffset=0;
      stage.style.transform='translate3d(0,0,0)';
      reader.scrollTop=0;
      invalidateReaderGeometry();
      lastPercent=-1;
    }).observe(script,{childList:true,subtree:true,characterData:true});
  }

  reader.addEventListener('scroll',()=>{
    if(gpuActive){if(reader.scrollTop!==0)reader.scrollTop=0;return}
    if(manualRaf)return;
    manualRaf=requestAnimationFrame(()=>{manualRaf=0;try{if(!autoScroll)renderManualProgress()}catch(_){}});
  },{passive:true});

  window.addEventListener('resize',invalidateReaderGeometry,{passive:true});
  if(window.ResizeObserver){
    const ro=new ResizeObserver(invalidateReaderGeometry);
    ro.observe(reader);ro.observe(stage);
  }

  /* Le bouton auto bascule proprement entre position physique et position GPU. */
  const autoBtn=byId('autoScrollBtn');
  if(autoBtn)autoBtn.addEventListener('click',()=>requestAnimationFrame(()=>{
    invalidateReaderGeometry();
    try{
      const p=phase(),silent=p&&p.type==='silence';
      if(autoScroll&&!silent){activateGpu();renderGpuPosition()}
      else{deactivateGpu();renderManualProgress()}
    }catch(_){ }
  }));

  progressFill.style.height='100%';
  progressFill.style.transform='scaleY(0)';
})();
