from pathlib import Path
import sys

p = Path(sys.argv[1] if len(sys.argv) > 1 else 'pwa-dist/regie-v14/index.html')
s = p.read_text(encoding='utf-8')
marker = 'SOFT_AUDIO_TRANSITIONS_20260920'

if marker in s:
    print('Transitions audio douces déjà intégrées.')
    raise SystemExit(0)

old = '''function playMusic(){
  if(currentMusicMode==="local"){localAudio.play().catch(()=>toast("Impossible d’ouvrir ce fichier"))}
  else if(currentMusicMode.startsWith("slot")){try{ytPlayer?.playVideo?.()}catch{}}
  else toast("Choisis d’abord une musique");
}
function pauseMusic(){try{localAudio.pause()}catch{}try{ytPlayer?.pauseVideo?.()}catch{}}
function stopMusic(){try{localAudio.pause();localAudio.currentTime=0}catch{}try{ytPlayer?.stopVideo?.()}catch{}}
'''

new = r'''// SOFT_AUDIO_TRANSITIONS_20260920
const MUSIC_FADE_IN_MS=4200;
const MUSIC_FADE_OUT_MS=3000;
let musicFadeToken=0;

function desiredMusicVolume(){
  return clamp(Number(state?.prefs?.musicVolume)||50,0,100)
}
function playbackVolumeNow(){
  if(currentMusicMode==="local"){
    try{return clamp(Math.round((localAudio.volume||0)*100),0,100)}catch{}
  }
  if(currentMusicMode.startsWith("slot")){
    try{
      const v=Number(ytPlayer?.getVolume?.());
      if(Number.isFinite(v))return clamp(Math.round(v),0,100)
    }catch{}
  }
  return desiredMusicVolume()
}
function setPlaybackVolumeRaw(v){
  const n=clamp(Number(v)||0,0,100);
  try{localAudio.volume=n/100}catch{}
  try{ytPlayer?.setVolume?.(n)}catch{}
}
function cancelMusicFade(){musicFadeToken++}
function fadePlaybackVolume(from,to,duration,onDone){
  const token=++musicFadeToken,start=performance.now(),a=clamp(Number(from)||0,0,100),b=clamp(Number(to)||0,0,100),d=Math.max(250,Number(duration)||0);
  const step=t=>{
    if(token!==musicFadeToken)return;
    const x=clamp((t-start)/d,0,1);
    // Courbe douce : pas d'attaque franche au début, pas de coupure nette à la fin.
    const eased=x*x*(3-2*x);
    setPlaybackVolumeRaw(a+(b-a)*eased);
    if(x<1)requestAnimationFrame(step);
    else if(onDone)onDone();
  };
  requestAnimationFrame(step)
}
function playMusic(){
  if(currentMusicMode==="none")return toast("Choisis d’abord une musique");
  cancelMusicFade();
  const target=desiredMusicVolume();
  setPlaybackVolumeRaw(0);
  if(currentMusicMode==="local"){
    localAudio.play().then(()=>fadePlaybackVolume(0,target,MUSIC_FADE_IN_MS)).catch(()=>toast("Impossible d’ouvrir ce fichier"))
  }else if(currentMusicMode.startsWith("slot")){
    try{
      ytPlayer?.playVideo?.();
      setTimeout(()=>fadePlaybackVolume(0,target,MUSIC_FADE_IN_MS),120)
    }catch{}
  }
}
function pauseMusic(immediate=false){
  cancelMusicFade();
  const finish=()=>{
    try{localAudio.pause()}catch{}
    try{ytPlayer?.pauseVideo?.()}catch{}
    setPlaybackVolumeRaw(desiredMusicVolume())
  };
  if(immediate)return finish();
  fadePlaybackVolume(playbackVolumeNow(),0,MUSIC_FADE_OUT_MS,finish)
}
function stopMusic(){
  cancelMusicFade();
  const finish=()=>{
    try{localAudio.pause();localAudio.currentTime=0}catch{}
    try{ytPlayer?.stopVideo?.()}catch{}
    setPlaybackVolumeRaw(desiredMusicVolume())
  };
  fadePlaybackVolume(playbackVolumeNow(),0,2200,finish)
}
'''

if old not in s:
    raise SystemExit('Fonctions de lecture audio introuvables.')

s = s.replace(old, new, 1)

# Lors d'un changement de source, on coupe l'ancienne immédiatement pour éviter
# que son fondu continue en parallèle de la nouvelle piste.
s = s.replace('async function setMusicMode(v){\n  pauseMusic();', 'async function setMusicMode(v){\n  pauseMusic(true);', 1)

# Les vibrations de changement de phase restent présentes, mais beaucoup plus discrètes.
s = s.replace('navigator.vibrate?.(100)', 'navigator.vibrate?.(25)')
s = s.replace('navigator.vibrate?.([120,80,120])', 'navigator.vibrate?.([35,55,35])')

s = s.replace('<meta name="regie-build" content="14.6">', '<meta name="regie-build" content="14.7">', 1)
p.write_text(s, encoding='utf-8')
print('Transitions audio adoucies : fondu entrée/sortie + vibrations discrètes.')
