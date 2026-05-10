"""Splittet das Quell-PDF (Buchseiten 224-393, Kapitel 4 "Beschaffung")
in 8 themenspezifische Tages-PDFs entsprechend dem Mapping in der Spec
docs/superpowers/specs/2026-05-10-tagesordner-pdf-split-design.md.

Voraussetzung: pypdf (pip install pypdf)
Aufruf: python scripts/split_pdf.py
"""

from pathlib import Path
from pypdf import PdfReader, PdfWriter

KURS_DIR = Path(__file__).resolve().parent.parent / "Kurs 11.05.2026 bis 22.05.2026"
QUELL_PDF = KURS_DIR / "GrundlagenLiteratur" / "226-395.pdf"

# Mapping: Tagesordnername -> (output_pdf_name, [page_ranges])
# page_ranges sind 1-basierte PDF-Seiten (inklusiv).
TAGE = [
    ("Tag-1_11.05._Beschaffungsprozess",
     "Grundlagen_Beschaffungsprozess.pdf",
     [(3, 15), (56, 57)]),
    ("Tag-2_12.05._Bezugsquellen-Anfragen-Angebotsvergleich",
     "Grundlagen_Bezugsquellen-Anfragen-Angebotsvergleich.pdf",
     [(16, 22), (45, 53)]),
    ("Tag-3_13.05._Bestellungen-und-Kaufvertraege",
     "Grundlagen_Bestellungen-und-Kaufvertraege.pdf",
     [(58, 101)]),
    ("Tag-4_15.05._Ausfuehren-von-Bestellungen",
     "Grundlagen_Ausfuehren-von-Bestellungen.pdf",
     [(35, 44), (54, 55)]),
    ("Tag-5_18.05._Annahme-und-Lagerung-der-Waren",
     "Grundlagen_Annahme-und-Lagerung-der-Waren.pdf",
     [(23, 34)]),
    ("Tag-6_19.05._Kaufvertragsstoerungen",
     "Grundlagen_Kaufvertragsstoerungen.pdf",
     [(141, 170)]),
    ("Tag-7_20.05._Eingangsrechnungen",
     "Grundlagen_Eingangsrechnungen.pdf",
     [(102, 116)]),
    ("Tag-8_21.05._Bezahlung-von-Rechnungen",
     "Grundlagen_Bezahlung-von-Rechnungen.pdf",
     [(117, 140)]),
]


def main():
    if not QUELL_PDF.exists():
        raise SystemExit(f"Quell-PDF nicht gefunden: {QUELL_PDF}")

    reader = PdfReader(str(QUELL_PDF))
    total = len(reader.pages)
    print(f"Quell-PDF: {QUELL_PDF.name} ({total} Seiten)")

    for ordner, outname, ranges in TAGE:
        ziel_dir = KURS_DIR / ordner
        ziel_dir.mkdir(parents=True, exist_ok=True)
        ziel_pdf = ziel_dir / outname

        writer = PdfWriter()
        seiten_anzahl = 0
        for start, end in ranges:
            for p in range(start, end + 1):
                if p < 1 or p > total:
                    raise SystemExit(f"Seite {p} ausserhalb 1-{total} fuer {ordner}")
                writer.add_page(reader.pages[p - 1])
                seiten_anzahl += 1

        with open(ziel_pdf, "wb") as f:
            writer.write(f)

        bereiche = ", ".join(f"{s}-{e}" for s, e in ranges)
        print(f"  -> {ordner}/{outname} ({seiten_anzahl} Seiten, Quelle: {bereiche})")

    print("Fertig.")


if __name__ == "__main__":
    main()
