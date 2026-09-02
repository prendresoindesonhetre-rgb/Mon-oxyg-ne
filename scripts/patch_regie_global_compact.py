from pathlib import Path
import sys

p = Path(sys.argv[1] if len(sys.argv) > 1 else 'pwa-dist/regie-v14/index.html')
s = p.read_text(encoding='utf-8')

css = r'''
/* GLOBAL_COMPACT_AUDIT_V3 — compact professional controls everywhere */
@media (min-width: 701px) and (pointer:fine){
  .btn, button.btn{
    width:auto!important;
    min-width:0!important;
    min-height:30px!important;
    height:auto!important;
    padding:5px 10px!important;
    border-radius:9px!important;
    font-size:12.5px!important;
    line-height:1.1!important;
    flex:0 0 auto!important;
  }
  .btn.primary, button.btn.primary{min-height:32px!important;padding:6px 12px!important}
  .btn.small, button.btn.small{min-height:27px!important;padding:4px 8px!important;font-size:11.5px!important}

  /* Home / session library */
  #homeView .feature-grid{display:flex!important;grid-template-columns:none!important;flex-wrap:wrap!important;gap:6px!important;margin:10px 0 14px!important}
  #homeView .feature{width:auto!important;min-width:0!important;flex:0 0 auto!important;padding:5px 11px!important;border-radius:999px!important;font-size:10px!important}
  #homeView .session-list{gap:9px!important}
  #homeView .session-card{padding:11px 13px!important;border-radius:15px!important}
  #homeView .session-meta{margin-bottom:3px!important;gap:6px!important}
  #homeView .session-title{font-size:20px!important;margin:4px 0 7px!important}
  #homeView .session-actions,#homeView .session-more{
    display:flex!important;grid-template-columns:none!important;flex-wrap:wrap!important;
    justify-content:flex-start!important;align-items:center!important;gap:5px!important;margin-top:5px!important;
  }
  #homeView .session-actions .btn,#homeView .session-more .btn{
    width:auto!important;min-width:0!important;flex:0 0 auto!important;
    min-height:28px!important;height:28px!important;padding:4px 9px!important;font-size:12px!important;
  }
  #homeView .session-actions .btn.primary{height:30px!important;min-height:30px!important;padding:5px 11px!important}
  #createSessionBtn{width:auto!important;display:inline-flex!important;min-height:31px!important;height:31px!important;padding:5px 12px!important;margin:7px 0 0!important}
  #homeView button.btn[style*="width:100%"]{width:auto!important}

  /* Session builder */
  #editView .editor-toolbar{display:flex!important;flex-wrap:wrap!important;justify-content:flex-start!important;gap:5px!important;padding:5px!important}
  #editView .editor-toolbar .btn,#editView .editor-toolbar .grow{width:auto!important;flex:0 0 auto!important;min-height:30px!important}
  #editView .phase-editor{padding:10px!important;border-radius:14px!important}
  #editView .phase-actions{display:flex!important;grid-template-columns:none!important;flex-wrap:wrap!important;gap:4px!important;justify-content:flex-start!important}
  #editView .phase-actions .btn{width:auto!important;min-width:28px!important;height:28px!important;min-height:28px!important;padding:3px 7px!important;font-size:11px!important}
  #editView .instrument-controls{grid-template-columns:minmax(0,1fr) 30px 30px!important;gap:4px!important}
  #editView .instrument-controls .btn{width:30px!important;min-width:30px!important;height:29px!important;min-height:29px!important;padding:3px!important}
  #editView .maquette-actions{display:flex!important;flex-wrap:wrap!important;justify-content:flex-start!important;gap:5px!important}
  #editView .maquette-actions .btn,#editView .maquette-launch .btn{width:auto!important;min-height:29px!important;padding:4px 9px!important}
  #editView button.btn[style*="width:100%"]{width:auto!important}

  /* Music settings */
  #musicSettingsView .btn{width:auto!important;min-height:29px!important;padding:4px 9px!important}
  #musicSettingsView .row{align-items:center!important;gap:5px!important}
  #musicSettingsView button.btn[style*="width:100%"]{width:auto!important}

  /* Live player: operational, but still compact */
  #playerView .music-controls,#playerView .auto-row,#playerView .control-row{
    display:flex!important;grid-template-columns:none!important;flex-wrap:wrap!important;align-items:center!important;gap:5px!important;
  }
  #playerView .music-controls .btn,#playerView .auto-row .btn{width:auto!important;min-height:29px!important;padding:4px 8px!important}
  #playerView .control-row .btn{width:auto!important;min-height:36px!important;padding:6px 10px!important;flex:0 0 auto!important}
  #playerView .control-row .btn.primary{min-height:38px!important;padding:7px 12px!important}
  #playerView button.btn[style*="width:100%"]{width:auto!important}

  /* Modal, account, auth and generated-session preview */
  .modal .btn,.modal-card .btn,.auth-tab,.account-btn{width:auto!important;min-height:29px!important;padding:4px 9px!important;font-size:12px!important}
  .modal button.btn[style*="width:100%"],.modal-card button.btn[style*="width:100%"]{width:auto!important}
  .create-choice,.maquette-actions{display:flex!important;grid-template-columns:none!important;flex-wrap:wrap!important;justify-content:flex-start!important;gap:5px!important}
  .create-choice .btn{width:auto!important;flex:0 0 auto!important}

  /* Navigation and chooser */
  .space-back{width:auto!important;min-height:26px!important;padding:3px 0!important;font-size:12px!important}
  .space-card{min-height:230px!important;padding:23px 20px 18px!important}
  .space-symbol{margin-bottom:17px!important}
  .space-name{font-size:24px!important}
  .space-desc{font-size:13.5px!important;margin-bottom:13px!important}
}

/* Mobile stays touchable, but never turns secondary controls into full-width bars. */
@media (max-width:700px),(pointer:coarse){
  #homeView .session-actions,#homeView .session-more,#editView .phase-actions,.maquette-actions,.create-choice{
    display:flex!important;grid-template-columns:none!important;flex-wrap:wrap!important;justify-content:flex-start!important;gap:6px!important;
  }
  #homeView .session-actions .btn,#homeView .session-more .btn,#editView .phase-actions .btn,.maquette-actions .btn,.create-choice .btn{
    width:auto!important;flex:0 0 auto!important;
  }
  #createSessionBtn{width:auto!important;display:inline-flex!important}
  button.btn[style*="width:100%"]{width:auto!important}
}
'''

if 'GLOBAL_COMPACT_AUDIT_V3' in s:
    raise SystemExit('global compact audit already installed')
if '</style>' not in s:
    raise SystemExit('style closing tag missing')
s = s.replace('</style>', css + '\n</style>', 1)
p.write_text(s, encoding='utf-8')
print('global compact audit installed', len(s))
