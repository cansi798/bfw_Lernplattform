# BFW Lernplattform

Kurs- und Materialorganisation für **Modul M-064 "Beschaffung im Büromanagement"**.

## Aktueller Kurs

**Zeitraum:** 11.05.2026 – 22.05.2026 (9 Kurstage, 81 UE)
**Quelle Lehrplan:** Ausbilder-Vorlage in `Inhaltsplanung und kursplanung/`
**Quelle Literatur:** Lehrwerk Kapitel 4 (Buchseiten 224–393) — _aus Urheberrechtsgründen nicht im Repo_

## Struktur

```
.
├── docs/superpowers/specs/         Design-Dokumente
├── Kurs 11.05.2026 bis 22.05.2026/
│   ├── Inhaltsplanung und kursplanung/  Ausbilder-Vorlage
│   ├── GrundlagenLiteratur/             Original-PDF (lokal, nicht im Repo)
│   └── Tag-N_DD.MM._Thema/              Pro Kurstag ein Ordner mit Tagesplan + PDF-Auszug
└── README.md
```

## Aktuelle Spec

Siehe `docs/superpowers/specs/2026-05-10-tagesordner-pdf-split-design.md`.

## Hinweise

- Verlagsmaterial (PDFs des Lehrwerks) wird über `.gitignore` ausgeschlossen.
- Gesplittete PDFs (`Grundlagen_*.pdf`) werden lokal generiert, nicht versioniert.
