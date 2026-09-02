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

  /* Grande plage réellement exploitée par le moteur prompteur. */
  speed.max='500';
  speed.step='1';

  const wrap=document.createElement('div');
  wrap.style.cssText='position:relative;display:inline-flex;align-items:center;';
  const toggle=document.createElement('button');
  toggle.type='button';
  toggle.className='pill wheel-mode active';
  toggle.title='Choisir ce que contrôle la molette de la souris';
  toggle.setAttribute('aria-haspopup','menu');
  toggle.setAttribute('aria-expanded','false');

  const menu=document.createElement('div');
  menu.setAttribute('role','menu');
  menu.style.cssText='display:none;position:absolute;right:0;top:calc(100% + 7px);z-index:6000;min-width:220px;padding:6px;border:1px solid rgba(120,110,105,.22);border-radius:13px;background:#fffdf9;box-shadow:0 12px 34px rgba(64,58,55,.16);';

  const closeMenu=()=>{menu.style.display='none';toggle.setAttribute('aria-expanded','false')};
  const renderToggle=()=>{toggle.textContent=wheelMode==='sound'?'🖱 Molette : Son ▾':'🖱 Molette : Vitesse ▾'};
  const selectMode=(mode)=>{
    wheelMode=mode;
    localStorage.setItem(modeKey,wheelMode);
    renderToggle();
    [...menu.children].forEach((b)=>{b.style.background=b.dataset.mode===wheelMode?'rgba(96,140,137,.11)':'transparent';b.style.color=b.dataset.mode===wheelMode?'#3f706d':'#493f39'});
    closeMenu();
  };
  const makeChoice=(mode,title,detail)=>{
    const b=document.createElement('button');
    b.type='button';b.dataset.mode=mode;b.setAttribute('role','menuitem');
    b.style.cssText='display:block;width:100%;border:0;border-radius:9px;background:transparent;padding:9px 10px;text-align:left;cursor:pointer;';
    b.innerHTML=`<strong style="display:block;font-size:12px">${title}</strong><span style="display:block;margin-top:2px;font-size:10px;color:#80736b">${detail}</span>`;
    b.addEventListener('click',(e)=>{e.stopPropagation();selectMode(mode)});
    return b;
  };
  menu.appendChild(makeChoice('speed','Défilement','Molette haut = plus vite · bas = moins vite'));
  menu.appendChild(makeChoice('sound','Son','Molette haut = plus fort · bas = moins fort'));
  toggle.addEventListener('click',(e)=>{
    e.stopPropagation();
    const open=menu.style.display==='block';
    if(open)closeMenu();else{menu.style.display='block';toggle.setAttribute('aria-expanded','true')}
  });
  document.addEventListener('click',(e)=>{if(!wrap.contains(e.target))closeMenu()});
  wrap.append(toggle,menu);controls.appendChild(wrap);renderToggle();selectMode(wheelMode);

  const toast=document.createElement('div');
  toast.className='wheel-toast';
  toast.style.cssText='position:fixed;left:50%;bottom:84px;transform:translateX(-50%) translateY(6px);z-index:5000;padding:9px 14px;border-radius:999px;background:rgba(64,58,55,.90);color:#fff;font:800 12px/1.1 system-ui,sans-serif;letter-spacing:.05em;box-shadow:0 8px 28px rgba(0,0,0,.16);opacity:0;pointer-events:none;transition:opacity .12s ease,transform .12s ease;';
  document.body.appendChild(toast);
  let toastTimer=0;
  const showToast=(text)=>{
    toast.textContent=text;toast.style.opacity='1';toast.style.transform='translateX(-50%) translateY(0)';
    clearTimeout(toastTimer);toastTimer=setTimeout(()=>{toast.style.opacity='0';toast.style.transform='translateX(-50%) translateY(6px)'},650);
  };

  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  let wheelAccumulator=0;
  document.addEventListener('wheel',(e)=>{
    if(!app.contains(e.target))return;
    if(e.ctrlKey||e.metaKey)return;
    if(e.target.closest('input,select,textarea,[contenteditable="true"]'))return;
    e.preventDefault();e.stopPropagation();

    let delta=e.deltaY;
    if(e.deltaMode===1)delta*=16;else if(e.deltaMode===2)delta*=Math.max(500,window.innerHeight*.8);
    wheelAccumulator+=delta;
    const threshold=38;
    const steps=Math.trunc(wheelAccumulator/threshold);
    if(!steps)return;
    wheelAccumulator-=steps*threshold;
    const direction=-steps;

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
    const magnitude=Math.max(8,Math.round(current*.07));
    const next=clamp(current+direction*magnitude,1,500);
    speed.value=String(next);
    speed.dispatchEvent(new Event('input',{bubbles:true}));
    showToast(`VITESSE ${Math.round(next)}`);
  },{capture:true,passive:false});
})();
