from pathlib import Path
import re
import sys

p = Path(sys.argv[1] if len(sys.argv) > 1 else 'pwa-dist/regie-v14/index.html')
s = p.read_text(encoding='utf-8')

replacements = [
    ('const exact=Number(p.sideSeconds)||Number(state.prefs.rainSeconds)||5;', 'const exact=Math.max(1,Math.round(Number(p.sideSeconds)||Number(state.prefs.rainSeconds)||5));'),
    ('<input data-i="${i}" data-k="sideSeconds" type="text" inputmode="decimal" autocomplete="off" value="${String(exact).replace(".",",")}" placeholder="ex. 4,75">', '<input data-i="${i}" data-k="sideSeconds" type="number" min="1" max="60" step="1" value="${exact}">'),
    ('<small>Réglage précis : tu peux écrire 4,75 ; 5,12 ; 6,03… La valeur n’est pas arrondie à la seconde.</small>', '<small>Réglage simple à la seconde : 4 s, 5 s, 6 s…</small>'),
    ('function formatExactSeconds(v){return Number(v).toLocaleString("fr-FR",{maximumFractionDigits:3})}', 'function formatExactSeconds(v){return String(Math.max(1,Math.round(Number(v)||1)))}'),
    ('function phaseSideSeconds(p){const v=Number(p?.sideSeconds);return Number.isFinite(v)&&v>=.01?v:(Number(state.prefs.rainSeconds)||5)}', 'function phaseSideSeconds(p){const v=Number(p?.sideSeconds);return Number.isFinite(v)&&v>=1?Math.round(v):Math.max(1,Math.round(Number(state.prefs.rainSeconds)||5))}'),
    ('function adjustPhaseSideSeconds(p,delta){p.sideSeconds=clamp(Math.round((phaseSideSeconds(p)+delta)*100)/100,.01,60);persistLocal();if($("rainLabel"))$("rainLabel").textContent="• "+formatExactSeconds(p.sideSeconds)+" s"}', 'function adjustPhaseSideSeconds(p,delta){p.sideSeconds=clamp(Math.round(phaseSideSeconds(p)+delta),1,60);persistLocal();if($("rainLabel"))$("rainLabel").textContent="• "+formatExactSeconds(p.sideSeconds)+" s"}'),
    ('title="− 0,1 seconde"', 'title="− 1 seconde"'),
    ('title="+ 0,1 seconde"', 'title="+ 1 seconde"'),
    ('$("rainMinus").onclick=()=>adjustPhaseSideSeconds(p,-.1);', '$("rainMinus").onclick=()=>adjustPhaseSideSeconds(p,-1);'),
    ('$("rainPlus").onclick=()=>adjustPhaseSideSeconds(p,.1);', '$("rainPlus").onclick=()=>adjustPhaseSideSeconds(p,1);'),
]
for old, new in replacements:
    if old not in s:
        raise SystemExit(f'missing expected fragment: {old[:80]}')
    s = s.replace(old, new, 1)

old_handler = 'else if(k==="sideSeconds"){const raw=String(el.value||"").trim().replace(",",".");const v=Number(raw);if(Number.isFinite(v)&&v>=.01&&v<=60)p.sideSeconds=v}'
new_handler = 'else if(k==="sideSeconds"){const v=Math.round(Number(el.value));if(Number.isFinite(v)&&v>=1&&v<=60){p.sideSeconds=v;el.value=String(v)}}'
if old_handler not in s:
    raise SystemExit('sideSeconds input handler fragment missing')
s = s.replace(old_handler, new_handler, 1)

p.write_text(s, encoding='utf-8')
print('whole-second rain-stick timing applied', len(s))
