from pathlib import Path

color_java = '''package fr.prendresoindesonhetre.chronomeditation;

final class Color {
    static final int WHITE = android.graphics.Color.WHITE;
    static final int TRANSPARENT = android.graphics.Color.TRANSPARENT;

    private Color() {}

    static int rgb(int r, int g, int b) {
        return android.graphics.Color.rgb(r, g, b);
    }

    static int argb(int a, int r, int g, int b) {
        return android.graphics.Color.argb(a, r, g, b);
    }

    static int argb(int a, int color) {
        return android.graphics.Color.argb(
                a,
                android.graphics.Color.red(color),
                android.graphics.Color.green(color),
                android.graphics.Color.blue(color)
        );
    }
}
'''

color_path = Path('app/src/main/java/fr/prendresoindesonhetre/chronomeditation/Color.java')
color_path.parent.mkdir(parents=True, exist_ok=True)
color_path.write_text(color_java)

main = Path('app/src/main/java/fr/prendresoindesonhetre/chronomeditation/MainActivity.java')
s = main.read_text()
s = s.replace('s.phases.add(new Phase("Troisième temps — musique", 20,', 's.phases.add(new Phase("Troisième temps — musique", 15,')
main.write_text(s)

print('V4 compile fix applied; workshop total reset to 90 minutes')
