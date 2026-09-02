from pathlib import Path
import sys

p = Path(sys.argv[1] if len(sys.argv) > 1 else 'pwa-dist/regie-v14/index.html')
s = p.read_text(encoding='utf-8')

# Final visual pass: dense professional desk on desktop, comfortable touch targets on mobile,
# and the Prendre soin de son Hêtre palette throughout the application.
style = r'''
/* VISUAL_HARMONY_HETRE — Prendre soin de son Hêtre */
:root{
  --bg:#f7f4f0;
  --paper:#fffdf9;
  --line:#ddd7d2;
  --clay:#9f8574;
  --teal:#5c8f93;
  --teal-deep:#497b80;
  --sky:#9bcbd6;
  --sky-soft:#eaf4f6;
  --mauve:#998aa5;
  --violet:#a99bc0;
  --violet-soft:#f0ecf6;
  --muted:#746c68;
  --sand:#eee8e3;
  --ink:#403a38;
  --soft:#f3eeea;
  --danger:#b87572;
  --ok:#668b88;
}
html,body{background:
  radial-gradient(circle at 7% 2%,rgba(155,203,214,.12),transparent 24rem),
  radial-gradient(circle at 96% 12%,rgba(169,155,192,.10),transparent 25rem),
  var(--bg)}
body{color:var(--ink)}
h1,h2,.session-title{font-family:Georgia,"Times New Roman",serif;font-weight:500;letter-spacing:-.012em}
h1{font-size:30px;line-height:1.08}h2{font-size:23px}.session-title{font-size:21px}
.brand,.space-brand{color:var(--teal-deep)}
.card{border-radius:17px;padding:13px;border-color:var(--line);box-shadow:0 5px 18px rgba(85,70,63,.04)}

/* REAL desktop hierarchy: ordinary controls are intentionally compact. */
.btn{min-height:34px;padding:6px 11px;border-radius:10px;font-size:13px;line-height:1.1;border-color:var(--line);box-shadow:none;width:auto}
.btn.primary{min-height:36px;background:var(--teal);border-color:var(--teal);font-weight:750;box-shadow:0 3px 10px rgba(92,143,147,.13)}
.btn.primary:hover{background:var(--teal-deep);border-color:var(--teal-deep)}
.btn.soft{background:var(--sky-soft);border-color:#d7e8ec;color:var(--teal-deep)}
.btn.small{min-height:29px;padding:4px 9px;border-radius:9px;font-size:12px}
.btn.danger{background:#f6eceb;border-color:#ead4d2;color:#8c5552}
.account-btn{min-height:30px;padding:4px 9px;border-color:var(--line);color:var(--teal-deep)}
.auth-tab{min-height:34px}.space-back{min-height:28px;font-size:12.5px}

/* COMPACT_SESSION_LIBRARY_V2 — no more full-width command bars. */
.session-list{gap:10px!important}
.session-card{padding:13px 15px!important}
.session-title{margin:5px 0 8px!important}
.session-actions,.session-more{
  display:flex!important;
  grid-template-columns:none!important;
  flex-wrap:wrap!important;
  align-items:center!important;
  justify-content:flex-start!important;
  gap:6px!important;
  margin-top:6px!important;
}
.session-actions .btn,.session-more .btn{
  width:auto!important;
  min-width:0!important;
  flex:0 0 auto!important;
  min-height:31px!important;
  height:31px!important;
  padding:5px 11px!important;
  border-radius:9px!important;
  font-size:12.5px!important;
}
.session-actions .btn.primary{min-height:33px!important;height:33px!important;padding:5px 14px!important}
#createSessionBtn{
  width:auto!important;
  min-height:35px!important;
  height:35px!important;
  padding:6px 15px!important;
  margin-top:8px!important;
  display:inline-flex!important;
  align-items:center!important;
  justify-content:center!important;
}
.type-pill{padding:4px 8px!important;font-size:10px!important;background:var(--sky-soft);color:var(--teal-deep);border-color:#d8e8eb}
.type-pill.hypnose{background:var(--violet-soft);color:#766883;border-color:#e2dbea}

/* The TEXTE / TEMPS / RYTHME / MIX strip is informative, not four giant buttons. */
.feature-grid{display:flex!important;grid-template-columns:none!important;gap:7px!important;flex-wrap:wrap!important}
.feature{width:auto!important;min-width:82px!important;flex:0 0 auto!important;padding:7px 13px!important;border-radius:999px!important;font-size:10.5px!important}

/* Construction desk: tiny technical controls, generous writing areas. */
.editor-toolbar{padding:6px;border-radius:13px;gap:6px}.editor-toolbar .btn{min-height:35px}
.phase-editor{padding:12px!important;border-radius:15px}
.phase-actions{grid-template-columns:30px 30px auto auto!important;gap:5px!important;justify-content:start!important}
.phase-actions .btn{min-height:30px!important;height:30px;padding:4px 7px!important;border-radius:8px!important;font-size:11.5px!important;width:auto!important}
.instrument-controls{grid-template-columns:minmax(0,1fr) 34px 34px!important;gap:5px!important}
.instrument-controls .btn{min-height:31px!important;height:31px;padding:4px!important;border-radius:8px!important;font-size:12px!important}
.timing-grid,.pro-grid{gap:6px}
.phase-pro{border-radius:12px}.phase-pro summary{padding:8px 10px}
.phase-duration-badge{background:var(--sky-soft)!important;color:var(--teal-deep)!important}
.builder-summary{border-radius:14px!important;background:linear-gradient(135deg,rgba(155,203,214,.12),rgba(169,155,192,.08))!important}
.builder-total{color:var(--teal-deep)!important}
input[type=text],input[type=password],input[type=url],input[type=number],textarea,select{border-radius:10px;padding:9px 11px;border-color:var(--line);background:rgba(255,253,249,.96)}
input:focus,textarea:focus,select:focus{border-color:var(--teal);box-shadow:0 0 0 3px rgba(155,203,214,.23)}
.field{margin:9px 0}.field span{margin-bottom:4px}

/* Automatic mockup importer. */
.maquette-launch{padding:11px 12px!important;border-radius:14px!important;background:linear-gradient(135deg,rgba(155,203,214,.15),rgba(169,155,192,.10))!important}
.maquette-launch .btn{min-height:31px!important;height:31px!important;padding:5px 10px!important}
.maquette-drop,.maquette-phase,.maquette-summary{border-radius:12px!important}
.maquette-tag.instrument{background:var(--sky-soft)!important;color:var(--teal-deep)!important}
.maquette-tag.review{background:var(--violet-soft)!important;color:#776885!important}
.maquette-actions{gap:6px!important}.maquette-actions .btn{min-height:34px!important}

/* Two-space entrance: calm, balanced, not oversized. */
.space-chooser{padding-top:10px!important}
.space-logo{width:48px!important;height:48px!important;font-size:20px!important;border-color:#cfe1e4!important;background:linear-gradient(145deg,rgba(155,203,214,.22),rgba(169,155,192,.13),rgba(255,253,249,.9))!important}
.space-title{color:var(--ink)!important;font-size:clamp(33px,5vw,46px)!important}
.space-subtitle{font-size:14.5px!important;margin-bottom:21px!important}
.space-grid{gap:12px!important}
.space-card{min-height:250px!important;padding:26px 22px 20px!important;border-radius:19px!important;border-color:#ded8d3!important;box-shadow:0 8px 24px rgba(80,68,60,.06)!important}
.space-card:before{content:"";position:absolute;left:0;top:0;bottom:0;width:4px;background:linear-gradient(var(--sky),var(--teal));opacity:.8}
.space-card.hypnose:before{background:linear-gradient(var(--violet),var(--mauve))}
.space-card:after{background:rgba(155,203,214,.17)!important}.space-card.hypnose:after{background:rgba(169,155,192,.16)!important}
.space-symbol{font-size:25px!important;margin-bottom:20px!important;color:var(--teal-deep)}
.space-card.hypnose .space-symbol{color:#7c6f88}
.space-name{font-size:25px!important;margin-bottom:9px!important}.space-desc{font-size:14px!important;line-height:1.48!important;margin-bottom:16px!important}

/* Live régie: only transport controls stay easy to hit. */
.player-head{padding:12px 14px}.global-time{color:var(--teal-deep)}
.music-card{padding:10px 12px}.music-title{color:var(--teal-deep)}
.music-controls .btn{min-height:32px;padding:5px 7px}
.auto-row{gap:5px}.auto-row .btn{min-height:32px;padding:5px 7px}.auto-value{font-size:11.5px}
.control-row{gap:6px}.control-row .btn{min-height:40px;padding:7px 10px}.control-row .btn.primary{min-height:42px}
.phase-auto{min-height:28px;border-radius:9px;background:var(--sky-soft);border-color:#d8e8eb;color:var(--teal-deep)}
.cue-card{padding:12px 14px}.guide-label{color:var(--mauve)}
.read-progress>i{background:linear-gradient(var(--sky),var(--teal),var(--violet))}
.fader-edge i{background:linear-gradient(var(--violet),var(--sky),var(--teal))}
.syncdot.busy{background:var(--mauve)}

/* Touch devices get larger hit areas without making the desktop interface huge. */
@media(max-width:620px),(pointer:coarse){
  h1{font-size:28px}h2{font-size:21px}
  .card{padding:12px;border-radius:16px}
  .btn{min-height:40px;padding:8px 11px;font-size:13px}.btn.primary{min-height:42px}.btn.small{min-height:36px;padding:6px 9px;font-size:12px}
  .session-actions .btn,.session-more .btn{min-height:38px!important;height:38px!important;padding:7px 11px!important;font-size:12.5px!important}
  .session-actions .btn.primary{min-height:40px!important;height:40px!important}
  #createSessionBtn{min-height:40px!important;height:40px!important}
  .feature{padding:8px 12px!important}
  .space-card{min-height:215px!important;padding:22px 19px 18px!important}.space-symbol{margin-bottom:15px!important}.space-name{font-size:24px!important}.space-desc{font-size:13.5px!important}
  .phase-actions{grid-template-columns:38px 38px auto auto!important}.phase-actions .btn{height:38px!important;min-height:38px!important}
  .instrument-controls{grid-template-columns:minmax(0,1fr) 40px 40px!important}.instrument-controls .btn{height:38px!important;min-height:38px!important}
  .control-row .btn{min-height:44px}.control-row .btn.primary{min-height:46px}
}
'''

if 'VISUAL_HARMONY_HETRE' in s:
    raise SystemExit('visual harmony already installed')
if '</style>' not in s:
    raise SystemExit('style closing tag missing')
s = s.replace('</style>', style + '\n</style>', 1)
p.write_text(s, encoding='utf-8')
print('visual harmony installed', len(s))
