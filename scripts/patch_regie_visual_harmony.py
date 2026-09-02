from pathlib import Path
import sys

p = Path(sys.argv[1] if len(sys.argv) > 1 else 'pwa-dist/regie-v14/index.html')
s = p.read_text(encoding='utf-8')

# Final visual pass: keep the professional builder dense, while bringing the whole
# interface back into the Prendre soin de son Hêtre visual universe.
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
h1{font-size:32px;line-height:1.08}h2{font-size:24px}.session-title{font-size:22px}
.brand,.space-brand{color:var(--teal-deep)}
.card{border-radius:19px;padding:15px;border-color:var(--line);box-shadow:0 6px 22px rgba(85,70,63,.045)}

/* Clear button hierarchy: large only for actions that really matter. */
.btn{min-height:42px;padding:9px 13px;border-radius:13px;font-size:14px;line-height:1.15;border-color:var(--line);box-shadow:none}
.btn.primary{min-height:44px;background:var(--teal);border-color:var(--teal);font-weight:750;box-shadow:0 5px 14px rgba(92,143,147,.16)}
.btn.primary:hover{background:var(--teal-deep);border-color:var(--teal-deep)}
.btn.soft{background:var(--sky-soft);border-color:#d7e8ec;color:var(--teal-deep)}
.btn.small{min-height:34px;padding:6px 10px;border-radius:10px;font-size:12.5px}
.btn.danger{background:#f6eceb;border-color:#ead4d2;color:#8c5552}
.account-btn{min-height:34px;padding:6px 10px;border-color:var(--line);color:var(--teal-deep)}
.auth-tab{min-height:40px}.space-back{min-height:30px;font-size:13px}

/* Construction desk: compact controls, generous writing areas. */
.editor-toolbar{padding:7px;border-radius:15px;gap:7px}.editor-toolbar .btn{min-height:42px}
.phase-editor{padding:13px!important;border-radius:17px}
.phase-actions{grid-template-columns:34px 34px 1fr 1fr!important;gap:6px!important}
.phase-actions .btn{min-height:34px!important;height:34px;padding:5px 7px!important;border-radius:10px!important;font-size:12px!important}
.instrument-controls{grid-template-columns:1fr 42px 42px!important;gap:6px!important}
.instrument-controls .btn{min-height:36px!important;height:36px;padding:5px!important;border-radius:10px!important}
.timing-grid,.pro-grid{gap:7px}
.phase-pro{border-radius:13px}.phase-pro summary{padding:9px 11px}
.phase-duration-badge{background:var(--sky-soft)!important;color:var(--teal-deep)!important}
.builder-summary{border-radius:15px!important;background:linear-gradient(135deg,rgba(155,203,214,.12),rgba(169,155,192,.08))!important}
.builder-total{color:var(--teal-deep)!important}
input[type=text],input[type=password],input[type=url],input[type=number],textarea,select{border-radius:12px;padding:10px 12px;border-color:var(--line);background:rgba(255,253,249,.96)}
input:focus,textarea:focus,select:focus{border-color:var(--teal);box-shadow:0 0 0 3px rgba(155,203,214,.23)}
.field{margin:10px 0}.field span{margin-bottom:5px}

/* Session library and automatic mockup importer. */
.type-pill{background:var(--sky-soft);color:var(--teal-deep);border-color:#d8e8eb}
.type-pill.hypnose{background:var(--violet-soft);color:#766883;border-color:#e2dbea}
.session-actions{gap:7px}.session-more{gap:6px}
.maquette-launch{padding:12px 13px!important;border-radius:15px!important;background:linear-gradient(135deg,rgba(155,203,214,.15),rgba(169,155,192,.10))!important}
.maquette-drop,.maquette-phase,.maquette-summary{border-radius:13px!important}
.maquette-tag.instrument{background:var(--sky-soft)!important;color:var(--teal-deep)!important}
.maquette-tag.review{background:var(--violet-soft)!important;color:#776885!important}
.maquette-actions{gap:7px!important}

/* Two-space entrance keeps the calm identity, without oversized cards. */
.space-chooser{padding-top:12px!important}
.space-logo{width:52px!important;height:52px!important;font-size:22px!important;border-color:#cfe1e4!important;background:linear-gradient(145deg,rgba(155,203,214,.22),rgba(169,155,192,.13),rgba(255,253,249,.9))!important}
.space-title{color:var(--ink)!important;font-size:clamp(35px,5.5vw,49px)!important}
.space-subtitle{font-size:15px!important;margin-bottom:24px!important}
.space-grid{gap:14px!important}
.space-card{min-height:278px!important;padding:30px 25px 23px!important;border-radius:21px!important;border-color:#ded8d3!important;box-shadow:0 10px 28px rgba(80,68,60,.065)!important}
.space-card:before{content:"";position:absolute;left:0;top:0;bottom:0;width:4px;background:linear-gradient(var(--sky),var(--teal));opacity:.8}
.space-card.hypnose:before{background:linear-gradient(var(--violet),var(--mauve))}
.space-card:after{background:rgba(155,203,214,.17)!important}.space-card.hypnose:after{background:rgba(169,155,192,.16)!important}
.space-symbol{font-size:28px!important;margin-bottom:25px!important;color:var(--teal-deep)}
.space-card.hypnose .space-symbol{color:#7c6f88}
.space-name{font-size:27px!important;margin-bottom:11px!important}.space-desc{font-size:14.5px!important;line-height:1.52!important;margin-bottom:19px!important}

/* Live régie: operational controls remain easy to hit, but no giant secondary buttons. */
.player-head{padding:14px 16px}.global-time{color:var(--teal-deep)}
.music-card{padding:12px 14px}.music-title{color:var(--teal-deep)}
.music-controls .btn{min-height:39px;padding:7px 8px}
.auto-row{gap:6px}.auto-row .btn{min-height:40px;padding:7px 8px}.auto-value{font-size:12px}
.control-row{gap:7px}.control-row .btn{min-height:48px;padding:9px 11px}.control-row .btn.primary{min-height:50px}
.phase-auto{min-height:31px;border-radius:11px;background:var(--sky-soft);border-color:#d8e8eb;color:var(--teal-deep)}
.cue-card{padding:13px 15px}.guide-label{color:var(--mauve)}
.read-progress>i{background:linear-gradient(var(--sky),var(--teal),var(--violet))}
.fader-edge i{background:linear-gradient(var(--violet),var(--sky),var(--teal))}
.syncdot.busy{background:var(--mauve)}

@media(max-width:620px){
  h1{font-size:29px}h2{font-size:22px}
  .card{padding:13px;border-radius:17px}
  .btn{min-height:40px;padding:8px 11px;font-size:13.5px}.btn.primary{min-height:42px}.btn.small{min-height:33px;padding:5px 9px;font-size:12px}
  .space-card{min-height:220px!important;padding:24px 21px 20px!important}.space-symbol{margin-bottom:17px!important}.space-name{font-size:25px!important}.space-desc{font-size:14px!important}
  .phase-actions{grid-template-columns:32px 32px 1fr 1fr!important}.phase-actions .btn{height:33px;min-height:33px!important}
  .instrument-controls{grid-template-columns:1fr 38px 38px!important}.instrument-controls .btn{height:34px;min-height:34px!important}
  .control-row .btn{min-height:46px}.control-row .btn.primary{min-height:48px}
}
'''

if 'VISUAL_HARMONY_HETRE' in s:
    raise SystemExit('visual harmony already installed')
if '</style>' not in s:
    raise SystemExit('style closing tag missing')
s = s.replace('</style>', style + '\n</style>', 1)
p.write_text(s, encoding='utf-8')
print('visual harmony installed', len(s))
