from pathlib import Path

path = Path(__file__).resolve().parents[1] / "MonOxygene" / "ContentView.swift"
s = path.read_text(encoding="utf-8")

s = s.replace("private struct SessionConfig: Equatable {", "private struct SessionConfig: Equatable, Hashable {")
s = s.replace("RhythmCard(title: \"Retrouver l’équilibre\", rhythm: \"5 / 5\", body:", "RhythmCard(title: \"Retrouver l’équilibre\", rhythm: \"5 / 5\", detail:")
s = s.replace("RhythmCard(title: \"Ralentir\", rhythm: \"4 / 6 ou 3 / 5\", body:", "RhythmCard(title: \"Ralentir\", rhythm: \"4 / 6 ou 3 / 5\", detail:")
s = s.replace("RhythmCard(title: \"Dynamiser\", rhythm: \"6 / 4 ou 5 / 3\", body:", "RhythmCard(title: \"Dynamiser\", rhythm: \"6 / 4 ou 5 / 3\", detail:")
s = s.replace("let title: String, rhythm: String, body: String", "let title: String, rhythm: String, detail: String")
s = s.replace("Text(body).font(.system(size: 10.5))", "Text(detail).font(.system(size: 10.5))")

path.write_text(s, encoding="utf-8")
print("Source Swift corrigé")
