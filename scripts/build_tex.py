"""Kompiliert ein oder alle LaTeX-Dokumente im Repo zu PDF.

Nutzt xelatex (wegen fontspec/Source Sans 3) und setzt TEXINPUTS so, dass
templates/bfw-style.tex aufgelöst wird.

Aufruf:
  python scripts/build_tex.py                 # baut alle .tex unter Kurs ...
  python scripts/build_tex.py path/to/file.tex   # baut nur diese Datei
"""

import os, sys, shutil, subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TEMPLATES = ROOT / "templates"
KURS_DIR = ROOT / "Kurs 11.05.2026 bis 22.05.2026"


def build(tex_file: Path, engine: str = "xelatex") -> bool:
    tex_file = tex_file.resolve()
    workdir = tex_file.parent
    print(f"  bauen: {tex_file.relative_to(ROOT)}")

    env = os.environ.copy()
    # Windows: TEXINPUTS-Trenner ist ;
    sep = ";" if os.name == "nt" else ":"
    env["TEXINPUTS"] = f".{sep}{TEMPLATES}{sep}{env.get('TEXINPUTS','')}"

    # Zwei Läufe für Inhaltsverzeichnis/Refs
    for run in (1, 2):
        result = subprocess.run(
            [engine, "-interaction=nonstopmode", "-halt-on-error", tex_file.name],
            cwd=str(workdir), env=env, capture_output=True, text=True
        )
        if result.returncode != 0:
            print(f"  FEHLER (run {run}):")
            # letzte 30 Zeilen der Ausgabe
            for line in result.stdout.splitlines()[-30:]:
                print("   ", line)
            return False
    # Aufräumen
    base = tex_file.stem
    for ext in (".aux", ".log", ".out", ".toc"):
        p = workdir / (base + ext)
        if p.exists():
            p.unlink()
    print(f"  -> {workdir.name}/{base}.pdf")
    return True


def main():
    if len(sys.argv) > 1:
        f = Path(sys.argv[1])
        if not f.is_absolute():
            f = ROOT / f
        ok = build(f)
        sys.exit(0 if ok else 1)

    # Alle .tex unter Kurs ... bauen
    tex_files = sorted(KURS_DIR.rglob("*.tex"))
    if not tex_files:
        print("Keine .tex gefunden.")
        return
    failures = 0
    for f in tex_files:
        if not build(f):
            failures += 1
    if failures:
        print(f"\n{failures} Fehler.")
        sys.exit(1)
    print(f"\n{len(tex_files)} Dokumente gebaut.")


if __name__ == "__main__":
    main()
