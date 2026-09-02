(()=>{
  'use strict';
  const $=(id)=>document.getElementById(id);
  const app=$('app');
  const speed=$('scrollSpeed');
  const controls=document.querySelector('.scroll-controls');
  if(!app||!speed||!controls)return;

  const isHypnose=/hypnose/i.test(location.pathname);
  const storagePrefix=isHypnose?'hypnose':'regie';
  const modeKey=`${storagePrefix}.wheelMode`;
  let wheelMode=localStorage.getItem(modeKey)||'speed';
  if(wheelMode!=='speed'&&wheelMode!=='sound')wheelMode='speed';

  /* Étend la plage sans modifier les vitesses déjà enregistrées. */
  speed.max='200';
  speed.step='1';

  const toggle=document.createElement('button');
  toggle.type='button';
  toggle.className='pill wheel-mode';
  toggle.title='Choisir ce que contrôle la molette de la souris';
  const renderToggle=()=>{
    toggle.textContent=wheelMode==='sound'?'🖱 Molette : Son':'🖱 Molette : Vitesse';
    toggle.classList.toggle('active',true);
  };
  toggle.addEventListener('click',()=>{
    wheelMode=wheelMode==='speed'?'sound':'speed';
    localStorage.setItem(modeKey,wheelMode);
    renderToggle();
  });
  controls.appendChild(toggle);
  renderToggle();

  const toast=document.createElement('div');
  toast.className='wheel-toast';
  document.body.appendChild(toast);
  let toastTimer=0;
  const showToast=(text)=>{
    toast.textContent=text;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer=setTimeout(()=>toast.classList.remove('show'),650);
  };

  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  let wheelAccumulator=0;
  document.addEventListener('wheel',(e)=>{
    if(!app.contains(e.target))return;
    if(e.ctrlKey||e.metaKey)return;
    if(e.target.closest('input,select,textarea,[contenteditable="true"]'))return;

    /* Empêche l'ancien listener du lecteur de couper le défilement auto. */
    e.preventDefault();
    e.stopPropagation();

    let delta=e.deltaY;
    if(e.deltaMode===1)delta*=16;
    else if(e.deltaMode===2)delta*=Math.max(500,window.innerHeight*.8);
    wheelAccumulator+=delta;

    const threshold=42;
    const steps=Math.trunc(wheelAccumulator/threshold);
    if(!steps)return;
    wheelAccumulator-=steps*threshold;
    const direction=-steps; // molette vers le haut = augmentation

    if(wheelMode==='sound'){
      try{
        const current=Number(typeof targetVolume!=='undefined'?targetVolume:0)||0;
        const next=clamp(current+direction*3,0,100);
        if(typeof setTargetVolume==='function')setTargetVolume(next);
        showToast(`SON ${Math.round(next)} %`);
      }catch(_){ }
      return;
    }

    const current=Number(speed.value)||Number(typeof scrollSpeed!=='undefined'?scrollSpeed:32)||32;
    const next=clamp(current+direction*6,1,200);
    speed.value=String(next);
    speed.dispatchEvent(new Event('input',{bubbles:true}));
    showToast(`VITESSE ${Math.round(next)}`);
  },{capture:true,passive:false});
})();
