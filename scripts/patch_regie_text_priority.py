from pathlib import Path
import sys

p = Path(sys.argv[1] if len(sys.argv) > 1 else 'pwa-dist/regie-v14/index.html')
s = p.read_text(encoding='utf-8')

css = r'''
/* TEXT_PRIORITY_V1 — le texte à dire est la zone principale de la régie */
#playerView .guide-card{
  margin:7px 0!important;
  min-height:0!important;
}
#playerView .guide-scroll{
  height:clamp(340px,56vh,560px)!important;
  min-height:340px!important;
  max-height:none!important;
  padding:10px 24px 130px 24px!important;
}
#playerView .guide-text{
  font-size:18px!important;
  line-height:1.5!important;
}

/* Le reste reste volontairement secondaire et compact. */
#playerView .player-head{padding:8px 10px!important}
#playerView .music-card{padding:7px 9px!important;margin:6px 0!important}
#playerView .music-body{margin-top:4px!important}
#playerView .auto-row{margin:5px 0!important}
#playerView .cue-card{padding:7px 9px!important;margin:6px 0!important}

@media (max-width:700px){
  #playerView .guide-scroll{
    height:clamp(300px,52vh,480px)!important;
    min-height:300px!important;
    padding:9px 19px 110px 19px!important;
  }
  #playerView .guide-text{font-size:17px!important;line-height:1.48!important}
}

@media (min-width:701px) and (max-height:700px){
  #playerView .guide-scroll{
    height:clamp(340px,56vh,420px)!important;
    min-height:340px!important;
  }
}
'''

if 'TEXT_PRIORITY_V1' in s:
    raise SystemExit('text priority patch already installed')
if '</style>' not in s:
    raise SystemExit('style closing tag missing')
s = s.replace('</style>', css + '\n</style>', 1)
p.write_text(s, encoding='utf-8')
print('text priority V1 installed', len(s))
