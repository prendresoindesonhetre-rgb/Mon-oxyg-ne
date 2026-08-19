from pathlib import Path

path = Path('app/src/main/java/fr/prendresoindesonhetre/monoxygene/MainActivity.java')
s = path.read_text(encoding='utf-8')

# Donner un peu plus d'amplitude à la sinusoïde sans la remonter.
s = s.replace(
    'float top=h*.340f,bottom=h*.820f,mid=(top+bottom)/2f,amp=(bottom-top)*.42f;',
    'float top=h*.340f,bottom=h*.820f,mid=(top+bottom)/2f,amp=(bottom-top)*.46f;'
)

# Première slide : remplacer la formulation validée précédemment.
s = s.replace(
    'Respirer c’est bien… en conscience et en y mettant du sens, c’est mieux.\\n\\nMon Oxygène est une application de respiration guidée pensée comme un espace intérieur. Un moment pour accueillir ce qui est là, et laisser un peu plus de place à ce que l’on ressent.',
    'Respirer est un besoin vital.\\nMais lorsqu’on y met de la conscience et du sens, chaque souffle devient un retour à soi.\\n\\nMon Oxygène est une application de respiration guidée pensée comme un espace intérieur. Un moment pour accueillir ce qui est là, et laisser un peu plus de place à ce que l’on ressent.'
)

path.write_text(s, encoding='utf-8')
