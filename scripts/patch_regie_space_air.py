from pathlib import Path
import sys

p = Path(sys.argv[1] if len(sys.argv) > 1 else 'pwa-dist/regie-v14/index.html')
s = p.read_text(encoding='utf-8')

css = r'''
/* SPACE_AIR_V1 — aérer la composition sans agrandir les commandes */
#spaceChooserView.space-chooser{
  min-height:calc(100vh - 28px)!important;
  justify-content:center!important;
  padding:48px 0 68px!important;
}
#spaceChooserView .space-logo{
  margin-bottom:18px!important;
}
#spaceChooserView .space-brand{
  margin-bottom:8px!important;
}
#spaceChooserView .space-title{
  margin-bottom:10px!important;
}
#spaceChooserView .space-subtitle{
  margin-bottom:32px!important;
  line-height:1.5!important;
}
#spaceChooserView .space-grid{
  width:100%!important;
  max-width:900px!important;
  margin:0 auto!important;
  gap:22px!important;
}
#spaceChooserView .space-card{
  min-height:215px!important;
  padding:24px 26px 22px!important;
  border-radius:17px!important;
}
#spaceChooserView .space-symbol{
  margin-bottom:20px!important;
}
#spaceChooserView .space-kicker{
  margin-bottom:7px!important;
}
#spaceChooserView .space-name{
  margin-bottom:12px!important;
}
#spaceChooserView .space-desc{
  line-height:1.55!important;
  margin-bottom:24px!important;
  max-width:92%!important;
}
#spaceChooserView .space-enter{
  margin-top:auto!important;
  padding-top:8px!important;
}
#spaceChooserView .space-footer{
  margin-top:28px!important;
}

@media(max-width:700px){
  #spaceChooserView.space-chooser{
    min-height:auto!important;
    justify-content:flex-start!important;
    padding:30px 4px 42px!important;
  }
  #spaceChooserView .space-subtitle{margin-bottom:24px!important}
  #spaceChooserView .space-grid{gap:14px!important}
  #spaceChooserView .space-card{
    min-height:185px!important;
    padding:20px 20px 18px!important;
  }
  #spaceChooserView .space-symbol{margin-bottom:14px!important}
  #spaceChooserView .space-desc{margin-bottom:18px!important;max-width:96%!important}
  #spaceChooserView .space-footer{margin-top:22px!important}
}
'''

if 'SPACE_AIR_V1' in s:
    raise SystemExit('space air patch already installed')
if '</style>' not in s:
    raise SystemExit('style closing tag missing')
s = s.replace('</style>', css + '\n</style>', 1)
p.write_text(s, encoding='utf-8')
print('space chooser air V1 installed', len(s))
