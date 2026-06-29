"""Extrahiert je Kurstag ein themenspezifisches Grundlagen-PDF aus der
Grundlagenliteratur (061-163.pdf, Buchseiten 59-161) des Kurses M-067
"Büroprozesse gestalten und Arbeitsvorgänge organisieren".

Nutzt Ghostscript (gs) statt pypdf — funktioniert ohne Python-PDF-Bibliothek.
Seitenangaben sind 1-basierte PDF-Seiten (Buchseite = PDF-Seite + 58).

Aufruf: python scripts/split_pdf_bueroprozesse.py
"""

import subprocess
from pathlib import Path

KURS_DIR = Path(__file__).resolve().parent.parent / "Kurs 29.06.2026 bis 17.07.2026"
QUELL_PDF = KURS_DIR / "Grundlagenliteratur" / "061-163.pdf"

# Mapping: Tagesordner -> (Grundlagen-PDF-Name, [Seitenbereiche (start, end) 1-basiert])
TAGE = [
    ("Tag-1_29.06._Bueroraumplanung-und-Bueroformen",
     "Grundlagen_Bueroraumplanung-und-Bueroformen.pdf", [(1, 9)]),
    ("Tag-2_30.06._Bueroausstattung-und-Bildschirmarbeitsplatz",
     "Grundlagen_Bueroausstattung-und-Bildschirmarbeitsplatz.pdf", [(6, 12), (26, 26)]),
    ("Tag-3_01.07._Arbeitsumgebung-und-Umweltfaktoren",
     "Grundlagen_Arbeitsumgebung-und-Umweltfaktoren.pdf", [(13, 18)]),
    ("Tag-4_02.07._Arbeitsschutz-und-Gesundheit",
     "Grundlagen_Arbeitsschutz-und-Gesundheit.pdf", [(19, 25), (33, 46)]),
    ("Tag-5_03.07._Zeitmanagement-und-Aufgabenplanung",
     "Grundlagen_Zeitmanagement-und-Aufgabenplanung.pdf", [(78, 85)]),
    ("Tag-6_06.07._Terminplanung-und-Terminmanagement",
     "Grundlagen_Terminplanung-und-Terminmanagement.pdf", [(86, 92)]),
    ("Tag-7_07.07._Besprechungen-vorbereiten-und-durchfuehren",
     "Grundlagen_Besprechungen-vorbereiten-und-durchfuehren.pdf", [(92, 96)]),
    ("Tag-8_08.07._Besprechungen-nachbereiten-und-Protokoll",
     "Grundlagen_Besprechungen-nachbereiten-und-Protokoll.pdf", [(96, 103)]),
    ("Tag-9_09.07._Kommunikationsformen-und-Teamarbeit",
     "Grundlagen_Kommunikationsformen-und-Teamarbeit.pdf", [(62, 64)]),
    ("Tag-10_10.07._Postbearbeitung-Posteingang",
     "Grundlagen_Postbearbeitung-Posteingang.pdf", [(54, 57)]),
    ("Tag-11_13.07._Postbearbeitung-Postausgang",
     "Grundlagen_Postbearbeitung-Postausgang.pdf", [(57, 63)]),
    ("Tag-12_14.07._Dokumentenmanagement-Aufbewahrung-und-Fristen",
     "Grundlagen_Dokumentenmanagement-Aufbewahrung-und-Fristen.pdf", [(63, 67)]),
    ("Tag-13_15.07._Ablage-und-Ablagesysteme",
     "Grundlagen_Ablage-und-Ablagesysteme.pdf", [(67, 73)]),
    ("Tag-14_16.07._Digitales-DMS-Datenschutz-und-Umweltschutz",
     "Grundlagen_Digitales-DMS-Datenschutz-und-Umweltschutz.pdf", [(47, 53), (73, 77)]),
    # Tag 15 (Vertiefung/Reflektion) erhält keinen eigenen Grundlagen-Auszug.
]


def extract(src, dst, ranges):
    """Extrahiert die angegebenen Seitenbereiche per gs in eine PDF.

    Mehrere Bereiche werden einzeln extrahiert und anschließend zusammengeführt.
    """
    parts = []
    for i, (start, end) in enumerate(ranges):
        part = dst.parent / f".part_{i}_{dst.name}"
        subprocess.run([
            "gs", "-q", "-dNOPAUSE", "-dBATCH", "-sDEVICE=pdfwrite",
            f"-dFirstPage={start}", f"-dLastPage={end}",
            f"-sOutputFile={part}", str(src),
        ], check=True)
        parts.append(part)

    if len(parts) == 1:
        parts[0].rename(dst)
    else:
        subprocess.run([
            "gs", "-q", "-dNOPAUSE", "-dBATCH", "-sDEVICE=pdfwrite",
            f"-sOutputFile={dst}", *[str(p) for p in parts],
        ], check=True)
        for p in parts:
            if p.exists():
                p.unlink()


def main():
    if not QUELL_PDF.exists():
        raise SystemExit(f"Quell-PDF nicht gefunden: {QUELL_PDF}")
    print(f"Quell-PDF: {QUELL_PDF.name}")
    for ordner, outname, ranges in TAGE:
        ziel_dir = KURS_DIR / ordner
        ziel_dir.mkdir(parents=True, exist_ok=True)
        ziel_pdf = ziel_dir / outname
        extract(QUELL_PDF, ziel_pdf, ranges)
        bereiche = ", ".join(f"{s}-{e}" for s, e in ranges)
        print(f"  -> {ordner}/{outname} (Seiten {bereiche})")
    print("Fertig.")


if __name__ == "__main__":
    main()
