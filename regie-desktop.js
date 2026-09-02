(()=>{
  'use strict';
  const byId=(id)=>document.getElementById(id);
  const reader=byId('reader');
  const progressFill=byId('readerProgressFill');
  const readStatus=byId('readStatus');
  const readingLine=document.querySelector('.reading-line');
  const script=byId('scriptText');
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
    requestAnimationFrame(()=>{updateLeadIn(true);invalidateReaderGeometry(true);updateGuideCompact()});
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
    PROMPTEUR CONTINU
    -----------------
    Le contenu est déplacé avec translate3d pour garder un mouvement sous-pixel.
    La vitesse est maintenant directement pilotée en pixels/seconde : les valeurs
    élevées sont réellement rapides. Les retours à la ligne ne ralentissent jamais.
  */
  const stage=document.createElement('div');
  stage.className='reader-gpu-stage';
  while(reader.firstChild)stage.appendChild(reader.firstChild);
  reader.appendChild(stage);

  /* Le haut du lecteur est désormais calculé pour poser la 1re ligne sur « ici ». */
  reader.style.paddingTop='0px';

  let geometryKey='',maxScroll=0,lastPercent=-1,manualRaf=0;
  let gpuActive=false,visualOffset=0,lastRatio=0,leadIn=0;
  let lastTrackedIndex=0,slowTimer=0,slowFactor=1;
  let dragging=false,dragStartY=0,dragStartOffset=0;

  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  function currentText(){
    try{return String((phase()&&phase().say)||'')}catch(_){return ''}
  }
  function updateLeadIn(force=false){
    if(!script)return;
    const rr=reader.getBoundingClientRect();
    const lr=readingLine&&readingLine.getBoundingClientRect();
    const style=getComputedStyle(script);
    const font=parseFloat(style.fontSize)||24;
    const lineHeight=parseFloat(style.lineHeight)||font*1.65;
    const markerY=lr?lr.top-rr.top:reader.clientHeight*.45;
    /* Centre visuellement la première ligne sur le repère horizontal. */
    const next=Math.max(0,markerY-lineHeight*.48);
    if(force||Math.abs(next-leadIn)>.5){
      leadIn=next;
      stage.style.paddingTop=`${leadIn.toFixed(2)}px`;
      geometryKey='';
    }
  }
  function phaseKey(){
    try{
      const p=phase();
      return `${typeof sessionKey!=='undefined'?sessionKey:'med'}|${phaseIndex}|${(p&&p.say||'').length}|${reader.clientHeight}|${stage.scrollHeight}|${leadIn.toFixed(1)}|${document.body.classList.contains('session-fullscreen')?'fs':'win'}`;
    }catch(_){return `${reader.clientHeight}|${stage.scrollHeight}|${leadIn.toFixed(1)}`}
  }
  function invalidateReaderGeometry(preserve=true){
    if(preserve&&maxScroll>0)lastRatio=clamp(visualOffset/maxScroll,0,1);
    geometryKey='';
  }
  function ensureGeometry(){
    updateLeadIn(false);
    const key=phaseKey();
    if(key!==geometryKey){
      const oldMax=maxScroll;
      const ratio=oldMax>0?clamp(visualOffset/oldMax,0,1):lastRatio;
      geometryKey=key;
      maxScroll=Math.max(0,reader.scrollHeight-reader.clientHeight);
      visualOffset=maxScroll*ratio;
    }
  }

  /* 1 → très lent ; 100 → lecture soutenue ; 500 → déplacement très rapide. */
  function basePixelsPerSecond(){
    ensureGeometry();
    let s=32;
    try{s=clamp(Number(scrollSpeed)||32,1,500)}catch(_){ }
    return 4+(s*.58)+(s*s*.0016);
  }
  function readingDurationHint(){
    try{
      const n=readingMap&&readingMap.length?readingMap.length:0;
      const t=n?Number(readingMap[n-1]):0;
      if(Number.isFinite(t)&&t>0)return t;
    }catch(_){ }
    return 1;
  }
  function renderProgress(ratio){
    ratio=clamp(ratio,0,1);
    progressFill.style.transform=`scaleY(${ratio})`;
    const pct=Math.round(ratio*100);
    if(pct!==lastPercent){
      lastPercent=pct;
      if(readStatus)readStatus.textContent=pct>=100?'Lecture terminée — passage prêt':`Lecture ${pct} %`;
    }
  }
  function syncReadingState(ratio){
    ratio=clamp(ratio,0,1);
    const text=currentText();
    const maxIndex=Math.max(0,text.length-1);
    const idx=Math.min(maxIndex,Math.floor(ratio*Math.max(1,text.length)));

    /* La ponctuation ralentit légèrement, sans jamais créer d'arrêt. */
    if(idx>lastTrackedIndex){
      const crossed=text.slice(Math.max(0,lastTrackedIndex),Math.min(text.length,idx+1));
      if(/\[pause longue\]/i.test(crossed)){slowTimer=Math.max(slowTimer,.65);slowFactor=Math.min(slowFactor,.70)}
      else if(/\[pause\]/i.test(crossed)){slowTimer=Math.max(slowTimer,.42);slowFactor=Math.min(slowFactor,.78)}
      else if(/[.!?]/.test(crossed)){slowTimer=Math.max(slowTimer,.22);slowFactor=Math.min(slowFactor,.84)}
      else if(/[;:]/.test(crossed)){slowTimer=Math.max(slowTimer,.15);slowFactor=Math.min(slowFactor,.90)}
      else if(/,/.test(crossed)){slowTimer=Math.max(slowTimer,.10);slowFactor=Math.min(slowFactor,.94)}
    }
    lastTrackedIndex=idx;
    try{
      readingIndex=Math.min(Math.max(0,text.length-1),idx);
      readingElapsed=readingDurationHint()*ratio;
    }catch(_){ }
  }
  function renderGpuPosition(){
    ensureGeometry();
    const ratio=maxScroll>0?clamp(visualOffset/maxScroll,0,1):1;
    stage.style.transform=`translate3d(0,${(-visualOffset).toFixed(3)}px,0)`;
    renderProgress(ratio);syncReadingState(ratio);lastRatio=ratio;
  }
  function activateGpu(){
    if(gpuActive)return;
    ensureGeometry();
    const manualOffset=Math.max(0,reader.scrollTop);
    if(manualOffset>1&&maxScroll>0){visualOffset=manualOffset;lastRatio=manualOffset/maxScroll}
    reader.scrollTop=0;
    reader.classList.add('gpu-autoscroll');gpuActive=true;
    lastTrackedIndex=Math.floor(lastRatio*Math.max(1,currentText().length));slowTimer=0;slowFactor=1;
    renderGpuPosition();
  }
  function deactivateGpu(){
    if(!gpuActive)return;
    const offset=visualOffset;
    stage.style.transform='translate3d(0,0,0)';reader.classList.remove('gpu-autoscroll');gpuActive=false;
    reader.scrollTop=offset;
  }
  function renderManualProgress(){
    ensureGeometry();
    const ratio=maxScroll>0?clamp(reader.scrollTop/maxScroll,0,1):0;
    lastRatio=ratio;visualOffset=reader.scrollTop;renderProgress(ratio);syncReadingState(ratio);
  }

  /* Remplace le moteur appelé par la boucle principale. */
  const pixelUpdateReading=(dt)=>{
    try{
      const p=phase();const silent=p&&p.type==='silence';
      if(autoScroll&&running&&!silent){
        activateGpu();
        if(!dragging){
          const delta=clamp(Number(dt)||0,0,.12);
          if(slowTimer>0){slowTimer=Math.max(0,slowTimer-delta);if(slowTimer===0)slowFactor=1}
          const factor=clamp(slowFactor,.68,1);
          visualOffset=Math.min(maxScroll,visualOffset+basePixelsPerSecond()*factor*delta);
        }
        renderGpuPosition();
      }else{
        if(gpuActive&&(!autoScroll||silent))deactivateGpu();
        if(!autoScroll&&!dragging)renderManualProgress();
      }
    }catch(_){ }
  };
  try{updateReading=pixelUpdateReading}catch(_){ }

  /*
    ATTRAPER LE TEXTE À LA SOURIS
    Clic maintenu + déplacement vertical = déplacement direct du prompteur.
    Le défilement automatique reprend ensuite exactement à cette position.
  */
  const dragMove=(clientY)=>{
    ensureGeometry();
    const next=clamp(dragStartOffset+(dragStartY-clientY),0,maxScroll);
    if(gpuActive){visualOffset=next;renderGpuPosition()}
    else{reader.scrollTop=next;visualOffset=next;renderManualProgress()}
  };
  reader.addEventListener('pointerdown',(e)=>{
    if(e.pointerType==='mouse'&&e.button!==0)return;
    if(e.target.closest('button,input,select,textarea,a'))return;
    ensureGeometry();dragging=true;dragStartY=e.clientY;dragStartOffset=gpuActive?visualOffset:reader.scrollTop;
    reader.classList.add('reader-dragging');
    try{reader.setPointerCapture(e.pointerId)}catch(_){ }
    e.preventDefault();
  });
  reader.addEventListener('pointermove',(e)=>{if(dragging){dragMove(e.clientY);e.preventDefault()}});
  const endDrag=(e)=>{
    if(!dragging)return;dragging=false;reader.classList.remove('reader-dragging');
    try{reader.releasePointerCapture(e.pointerId)}catch(_){ }
    if(!gpuActive)renderManualProgress();
  };
  reader.addEventListener('pointerup',endDrag);reader.addEventListener('pointercancel',endDrag);

  /* Changement de phase : la 1re ligne revient exactement sur le repère. */
  if(script){
    new MutationObserver(()=>{
      visualOffset=0;lastRatio=0;lastTrackedIndex=0;slowTimer=0;slowFactor=1;
      stage.style.transform='translate3d(0,0,0)';reader.scrollTop=0;geometryKey='';lastPercent=-1;
      try{readingIndex=0;readingElapsed=0}catch(_){ }
      requestAnimationFrame(()=>{updateLeadIn(true);geometryKey='';renderGpuPosition()});
    }).observe(script,{childList:true,subtree:true,characterData:true});
  }

  reader.addEventListener('scroll',()=>{
    if(dragging)return;
    if(gpuActive){if(reader.scrollTop!==0)reader.scrollTop=0;return}
    if(manualRaf)return;
    manualRaf=requestAnimationFrame(()=>{manualRaf=0;try{if(!autoScroll)renderManualProgress()}catch(_){}});
  },{passive:true});

  window.addEventListener('resize',()=>requestAnimationFrame(()=>{updateLeadIn(true);invalidateReaderGeometry(true)}),{passive:true});
  if(window.ResizeObserver){
    const ro=new ResizeObserver(()=>{updateLeadIn(false);invalidateReaderGeometry(true)});
    ro.observe(reader);ro.observe(stage);
  }

  const autoBtn=byId('autoScrollBtn');
  if(autoBtn)autoBtn.addEventListener('click',()=>requestAnimationFrame(()=>{
    updateLeadIn(true);invalidateReaderGeometry(true);
    try{
      const p=phase(),silent=p&&p.type==='silence';
      if(autoScroll&&!silent){activateGpu();renderGpuPosition()}
      else{deactivateGpu();renderManualProgress()}
    }catch(_){ }
  }));

  progressFill.style.height='100%';progressFill.style.transform='scaleY(0)';
  requestAnimationFrame(()=>{updateLeadIn(true);geometryKey='';renderGpuPosition()});
})();
