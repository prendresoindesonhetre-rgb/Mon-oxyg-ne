from pathlib import Path
import sys

p = Path(sys.argv[1] if len(sys.argv) > 1 else 'pwa-dist/regie-v14/index.html')
s = p.read_text(encoding='utf-8')
marker = 'BULLE_SESSION_20260914'

if marker in s:
    print('La séance Ma bulle est déjà intégrée.')
    raise SystemExit(0)

helper = r'''
// BULLE_SESSION_20260914 — séance créée pour l'atelier du 14/09/2026
function ensureBubbleSession(){
  if(!Array.isArray(state.sessions))return false;
  if(state.sessions.some(x=>x&&x.id==="meditation-bulle-20260914"))return false;

  const firstPart=[
    {
      name:"Préparation — s'installer",
      minutes:4,
      text:"Prenez simplement le temps de vous installer confortablement.\n\nLaissez votre corps trouver sa place.\n\nSentez les endroits où il est en contact avec le sol.\n\nVos jambes peuvent se déposer.\n\nVos bras aussi.\n\nVos épaules peuvent doucement se relâcher.\n\nVotre mâchoire peut se desserrer.\n\nEt pendant quelques instants… vous n'avez rien à faire.\n\nSimplement sentir comment vous êtes là, aujourd'hui.\n\nSans chercher à changer quoi que ce soit.",
      cue:"Préparation légère. Laisser de vrais espaces de silence. L'objectif est seulement de les amener doucement vers la respiration.",
      instrument:0
    },
    {
      name:"Respiration — bâton de pluie",
      minutes:6,
      text:"Puis doucement… portez votre attention sur votre respiration.\n\nPour ceux qui le souhaitent, je vais vous proposer de laisser le bâton de pluie accompagner votre souffle.\n\nNe cherchez pas à poursuivre le son. Si ce rythme ne vous convient pas, laissez votre corps respirer comme il en a besoin.\n\nÀ l'inspiration… laissez votre ventre se gonfler tranquillement.\n\nEt à l'expiration… laissez-le redescendre.\n\nPuis, si vous le souhaitez, imaginez à l'inspiration une jolie couleur.\n\nUne couleur qui vous fait du bien aujourd'hui.\n\nLaissez-la entrer avec l'air… et se diffuser doucement dans votre corps.\n\nEt à l'expiration… laissez simplement sortir ce dont vous n'avez plus besoin maintenant.\n\nVous n'avez pas besoin de savoir ce que c'est.\n\nInspirez ce qui vous fait du bien…\n\nEt expirez ce qui peut partir.\n\nContinuez simplement quelques instants, à votre rythme.",
      cue:"Bâton de pluie. Garder un rythme confortable et ne pas surcharger de paroles. À la fin, poser le bâton et lancer doucement la musique.",
      instrument:1
    },
    {
      name:"Ma bulle — mon espace",
      minutes:4,
      text:"Laissez maintenant votre respiration retrouver tranquillement son rythme naturel…\n\nEt pour ceux qui le souhaitent…\n\nje vais vous inviter à faire un petit voyage.\n\nSi vous préférez simplement rester là, écouter la musique et profiter de cet instant… vous pouvez aussi faire cela.\n\nPour ceux qui souhaitent me suivre…\n\nimaginez que cette jolie couleur que vous avez laissée entrer pendant votre respiration peut maintenant s'étendre doucement autour de vous…\n\njusqu'à former une bulle.\n\nVotre bulle.\n\nUn espace rien qu'à vous…\n\ndans lequel vous pouvez vous sentir bien.\n\nEt cet espace peut être exactement comme vous le souhaitez.\n\nVous pouvez lui donner la taille que vous voulez…\n\nles couleurs que vous voulez…\n\net y mettre tout ce dont vous avez envie.\n\nUn endroit… un objet… une lumière… une odeur… un son…\n\nou simplement ne rien y mettre.\n\nIci, il n'y a rien à réussir.\n\nC'est votre espace.\n\nAlors aménagez-le simplement de la manière qui vous permet de vous y sentir bien.\n\nEt si quelque chose ne vous plaît pas… changez-le.\n\nCette bulle vous appartient.\n\nElle pourra changer autant de fois que vous le souhaitez… aujourd'hui, comme au fil du temps.\n\nEt surtout… rappelez-vous que cet endroit reste accessible.\n\nPetit à petit, vous pourrez apprendre à le retrouver simplement en fermant les yeux…\n\nretrouver ce lieu…\n\nmais aussi les sensations que vous ressentez lorsque vous êtes à l'intérieur.\n\nEt peut-être qu'un jour… avant un moment stressant… lorsque vous aurez besoin de vous retrouver… ou simplement lorsque vous en aurez envie…\n\nvous pourrez fermer les yeux quelques instants…\n\nretrouver votre respiration…\n\net revenir dans votre bulle.\n\nRetrouver votre espace…\n\net les sensations qui vous font du bien ici.\n\nPour maintenant…\n\nje vais simplement vous laisser profiter de votre espace… à votre manière.",
      cue:"La musique est déjà en fond. Parler lentement, sans chercher à remplir tout le temps. À la dernière phrase, ne plus parler.",
      instrument:3
    },
    {
      name:"Musique — profiter de votre espace",
      minutes:4,
      text:"",
      cue:"4 minutes sans parole. Laisser chacun profiter de sa bulle à sa manière. Utiliser la musique choisie pour ce soir et garder un volume doux.",
      instrument:3
    },
    {
      name:"Transition vers l'assise",
      minutes:2,
      text:"Puis doucement… reprenez conscience de votre corps et de votre respiration.\n\nRetrouvez les points de contact avec le sol.\n\nRemettez un peu de mouvement dans les doigts… dans les pieds…\n\nPuis venez avec douceur vous placer sur un côté.\n\nPrenez le temps dont vous avez besoin dans cette position.\n\nEt lorsque ce sera juste pour vous… revenez tranquillement vous installer en position assise.",
      cue:"Toujours passer doucement sur le côté avant de revenir à l'assise. Ne pas presser la transition.",
      instrument:0
    }
  ];

  const existing=Array.isArray(state.phases)?state.phases:[];
  let tailIndex=existing.findIndex(p=>p&&p.name==="Trois espaces d’observation");
  if(tailIndex<0)tailIndex=existing.findIndex(p=>p&&/trois espaces/i.test(p.name||""));
  const tail=tailIndex>=0?clone(existing.slice(tailIndex)):[];

  const bubble=normalizeSession({
    id:"meditation-bulle-20260914",
    type:"meditation",
    title:"Ma bulle — mon espace",
    phases:firstPart.concat(tail),
    musicSlots:clone(Array.isArray(state.musicSlots)?state.musicSlots:[{name:"",url:""},{name:"",url:""},{name:"",url:""}]),
    prefs:{...defaultPrefs(),...(state.prefs||{})}
  },"meditation");

  state.sessions.push(bubble);
  return true;
}
'''

needle = 'function renderHome(){\n  ensureLibrary();saveActiveIntoLibrary();showView("home");'
if needle not in s:
    raise SystemExit('Impossible de trouver le début de renderHome après la réparation de la Régie.')

s = s.replace(needle, helper + '\nfunction renderHome(){\n  ensureLibrary();if(ensureBubbleSession())persistLocal();saveActiveIntoLibrary();showView("home");', 1)
s = s.replace('<meta name="regie-build" content="14.5">', '<meta name="regie-build" content="14.6">', 1)

p.write_text(s, encoding='utf-8')
print('Séance Ma bulle ajoutée à la Régie.')
