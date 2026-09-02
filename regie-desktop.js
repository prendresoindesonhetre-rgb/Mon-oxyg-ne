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

  /* Défilement : une seule boucle dédiée, sans lecture de scrollHeight à chaque image.
     La ponctuation reste pilotée par readingMap, mais la position est interpolée entre deux caractères. */
  let geometryKey='',maxScroll=0,lastFrame=performance.now(),lastPercent=-1,manualRaf=0;
  function phaseKey(){
    try{const p=phase();return `${typeof sessionKey!=='undefined'?sessionKey:'med'}|${phaseIndex}|${(p&&p.say||'').length}|${document.body.classList.contains('session-fullscreen')?'fs':'win'}`}catch(_){return String(Date.now())}
  }
  function invalidateReaderGeometry(){geometryKey=''}
  function ensureGeometry(){
    const key=phaseKey();
    if(key!==geometryKey){geometryKey=key;maxScroll=Math.max(0,reader.scrollHeight-reader.clientHeight)}
  }
  function mapIndexAt(sec){
    let lo=0,hi=Math.max(0,readingMap.length-1);
    while(lo<hi){const mid=Math.ceil((lo+hi)/2);if(readingMap[mid]<=sec)lo=mid;else hi=mid-1}
    return lo;
  }
  function renderReadingPosition(){
    ensureGeometry();
    const total=Math.max(1,readingMap.length-1);
    readingIndex=mapIndexAt(readingElapsed);
    const next=Math.min(total,readingIndex+1);
    const t0=readingMap[readingIndex]||0,t1=readingMap[next]??t0;
    const frac=(next>readingIndex&&t1>t0)?Math.max(0,Math.min(1,(readingElapsed-t0)/(t1-t0))):0;
    const pos=Math.min(total,readingIndex+frac);
    const ratio=Math.max(0,Math.min(1,pos/total));
    reader.scrollTop=maxScroll*ratio;
    progressFill.style.transform=`scaleY(${ratio})`;
    const pct=Math.round(ratio*100);
    if(pct!==lastPercent){lastPercent=pct;if(readStatus)readStatus.textContent=pct>=100?'Lecture terminée — passage prêt':`Lecture ${pct} %`}
  }
  function renderManualProgress(){
    ensureGeometry();
    const ratio=maxScroll>0?Math.max(0,Math.min(1,reader.scrollTop/maxScroll)):0;
    progressFill.style.transform=`scaleY(${ratio})`;
  }
  function smoothLoop(now){
    const dt=Math.min(.10,Math.max(0,(now-lastFrame)/1000));lastFrame=now;
    try{
      const p=phase();
      const silent=p&&p.type==='silence';
      if(autoScroll&&running&&!silent){readingElapsed+=dt;renderReadingPosition()}
      else if(!autoScroll){renderManualProgress()}
    }catch(_){ }
    requestAnimationFrame(smoothLoop);
  }

  /* Neutralise l'ancien moteur de scroll : il provoquait un effet de rattrapage et des saccades. */
  try{updateReading=function(){}}catch(_){ }
  reader.addEventListener('scroll',()=>{
    if(manualRaf)return;
    manualRaf=requestAnimationFrame(()=>{manualRaf=0;try{if(!autoScroll)renderManualProgress()}catch(_){}});
  },{passive:true});
  window.addEventListener('resize',invalidateReaderGeometry,{passive:true});
  if(window.ResizeObserver){const ro=new ResizeObserver(invalidateReaderGeometry);ro.observe(reader);const script=byId('scriptText');if(script)ro.observe(script)}

  /* Un clic sur Défilement auto recalcule tout de suite la géométrie, sans attente perceptible. */
  const autoBtn=byId('autoScrollBtn');
  if(autoBtn)autoBtn.addEventListener('click',()=>requestAnimationFrame(()=>{invalidateReaderGeometry();try{if(autoScroll&&running)renderReadingPosition()}catch(_){}}));

  progressFill.style.height='100%';progressFill.style.transform='scaleY(0)';
  requestAnimationFrame(smoothLoop);
})();
