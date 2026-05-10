# Design: Tagesordner und PDF-Split für Kurs M-064 (11.05.–22.05.2026)

**Datum:** 2026-05-10
**Modul:** M-064 "Beschaffung im Büromanagement"
**Kursdauer:** 11.05.2026 – 22.05.2026 (9 Kurstage, 81 UE gesamt)
**Quelle Lehrplan:** `Inhaltsplanung und kursplanung/M-064_Beschaffung im Büromanagement_001_Ausbilder.docx`
**Quelle Literatur:** `GrundlagenLiteratur/226-395.pdf` (170 Seiten, Buchseiten 224–393, Kapitel 4 "Sachgüter und Dienstleistungen beschaffen und Verträge schließen")

## Ziel

Für jeden Kurstag (außer 14.05. Christi Himmelfahrt) wird im Ordner
`Kurs 11.05.2026 bis 22.05.2026/` ein Tagesordner angelegt. Jeder Tagesordner
enthält **drei Komponenten**:

1. **Gesplittetes PDF** mit der Grundlagenliteratur, die für das Tagesthema relevant ist.
2. **`Tagesplan_<Thema>.md`** — ein inhaltlich ausgearbeiteter Tagesplan
   (Lernziele, Stoffaufbau, UE-Verlauf, Methodik, Aufgabenvorschläge).
3. **`Aufgaben_<Thema>.md`** — Übungs- und Vertiefungsaufgaben für Teilnehmer
   mit Verweisen auf die Buchseiten.

So wissen Ausbilder und Teilnehmer auf einen Blick, **welcher Stoff am welchem
Tag wie vermittelt wird** — nicht nur welche Buchseiten zu lesen sind.

## Kurstage

9 Kurstage, jeweils ~9 UE (1:1-Mapping zu den 9 nummerierten Modulen 3–10
der Ausbilder-Vorlage).

| Tag | Datum | Wochentag | Modul (Ausbilder) | UE |
|---|---|---|---|---|
| 1 | 11.05.2026 | Montag | 3. Beschaffungsprozess | 9 |
| 2 | 12.05.2026 | Dienstag | 4. Bezugsquellen, Anfragen, Angebote | 9 |
| 3 | 13.05.2026 | Mittwoch | 5. Bestellungen und Kaufverträge | 9 |
| – | 14.05.2026 | Donnerstag | _Christi Himmelfahrt — frei_ | – |
| 4 | 15.05.2026 | Freitag | 6. Ausführen von Bestellungen | 9 |
| 5 | 18.05.2026 | Montag | 7. Annahme und Lagerung der Waren | 9 |
| 6 | 19.05.2026 | Dienstag | 8. Kaufvertragsstörungen | 9 |
| 7 | 20.05.2026 | Mittwoch | 9.1 Eingangsrechnungen | 9 |
| 8 | 21.05.2026 | Donnerstag | 9.2 Bezahlung von Rechnungen | 9 |
| 9 | 22.05.2026 | Freitag | 10. Vertiefung/Reflektion | 9 |

## Konvention: Ordner- und Dateinamen

- **Tagesordner:** `Tag-N_DD.MM._Thema/`
  Beispiel: `Tag-1_11.05._Beschaffungsprozess/`
- **Gesplittetes PDF:** `Grundlagen_<Thema>.pdf`
  Beispiel: `Grundlagen_Beschaffungsprozess.pdf`
- **Tagesplan:** `Tagesplan_<Thema>.md`
  Beispiel: `Tagesplan_Beschaffungsprozess.md`
- **Aufgabenblatt:** `Aufgaben_<Thema>.md`
  Beispiel: `Aufgaben_Beschaffungsprozess.md`

## Tagesplan-Vorlage

Jede `Tagesplan_<Thema>.md` folgt diesem Aufbau:

```markdown
# Tagesplan Tag N — DD.MM.YYYY — <Thema>

**Modul:** M-064 Beschaffung im Büromanagement · Modul-Nr. <X>
**UE:** ~9 (à 45 Min, 1 Pausenblock)
**Material:** `Grundlagen_<Thema>.pdf` (Buchseiten <von>–<bis>)

## Lernziele
Die Teilnehmenden können nach diesem Tag:
- ...
- ...

## Stoffaufbau
| Abschnitt | Buchseite | Inhalt |
|---|---|---|
| 4.X.Y | S. NNN | ... |

## UE-Verlauf
| UE | Phase | Inhalt | Methode | Sozialform | Material |
|---|---|---|---|---|---|
| 1 | Einstieg | ... | Lehrgespräch | Plenum | Whiteboard |
| 2 | Erarbeitung | ... | Lesen + Diskussion | Einzelarbeit + Plenum | PDF S. NNN |
| ... | | | | | |

## Methodische Hinweise
- ...

## Aufgabenvorschläge
Siehe `Aufgaben_<Thema>.md`.

## Hausaufgabe / Transfer
- ...
```

## Aufgabenblatt-Vorlage

Jede `Aufgaben_<Thema>.md` folgt diesem Aufbau:

```markdown
# Aufgaben — Tag N — <Thema>

**Buchverweis:** PDF `Grundlagen_<Thema>.pdf`, Buchseiten <von>–<bis>

## Aufgabe 1: <Kurztitel>
**Sozialform:** Einzel/Partner/Gruppe · **Zeit:** ~NN Min

<Aufgabentext>

## Aufgabe 2: ...
```

## Tag-zu-Inhalt-Mapping (semantisch + technisch)

PDF-Seitenangaben beziehen sich auf das Quell-PDF `226-395.pdf`.
**Buchseite = PDF-Seite + 223** (PDF p.1 = Buchseite 224).

### Tag 1 — 11.05.2026 — Beschaffungsprozess
- **Ordner:** `Tag-1_11.05._Beschaffungsprozess/`
- **PDF-Datei:** `Grundlagen_Beschaffungsprozess.pdf`
- **PDF-Abschnitte:**
  - 4.1 Beschaffungsprozesse und Logistik (PDF p. 3–6, Buch p. 226–229)
  - 4.2 Beschaffung als Teil der Wertschöpfungskette (PDF p. 7–15, Buch p. 230–238)
  - 4.10 Beschaffungspolitik aus ökologischer Sicht (PDF p. 56–57, Buch p. 279–280)
- **Quellseiten:** `[3-15, 56-57]` (15 Seiten)

### Tag 2 — 12.05.2026 — Bezugsquellen, Anfragen, Angebotsvergleich
- **Ordner:** `Tag-2_12.05._Bezugsquellen-Anfragen-Angebotsvergleich/`
- **PDF-Datei:** `Grundlagen_Bezugsquellen-Anfragen-Angebotsvergleich.pdf`
- **PDF-Abschnitte:**
  - 4.3 Bedarfsermittlung (PDF p. 16–22, Buch p. 239–245)
  - 4.7 ABC-Analyse (PDF p. 45–48, Buch p. 268–271)
  - 4.8 Bestellprozess (Angebotsvergleich, Bezugskalkulation, Nutzwertanalyse) (PDF p. 49–53, Buch p. 272–276)
- **Quellseiten:** `[16-22, 45-53]` (16 Seiten)

### Tag 3 — 13.05.2026 — Bestellungen und Kaufverträge
- **Ordner:** `Tag-3_13.05._Bestellungen-und-Kaufvertraege/`
- **PDF-Datei:** `Grundlagen_Bestellungen-und-Kaufvertraege.pdf`
- **PDF-Abschnitte:**
  - 4.11 Rechtsgeschäfte und Verträge (PDF p. 58–87, Buch p. 281–310)
  - 4.12.1–4.12.3 Kaufverträge: Zustandekommen, Inhalte, AGB (PDF p. 88–101, Buch p. 311–324)
- **Quellseiten:** `[58-101]` (44 Seiten — fetter Tag wegen Rechtsgrundlagen)
- **Hinweis:** 4.12 wird gesplittet — der Erfüllungsteil (4.12.4–4.12.7) gehört zu Tag 7.

### Tag 4 — 15.05.2026 — Ausführen von Bestellungen
- **Ordner:** `Tag-4_15.05._Ausfuehren-von-Bestellungen/`
- **PDF-Datei:** `Grundlagen_Ausfuehren-von-Bestellungen.pdf`
- **PDF-Abschnitte:**
  - 4.5 Bestellverfahren (PDF p. 35–40, Buch p. 258–263)
  - 4.6 Beschaffungsmenge (PDF p. 41–44, Buch p. 264–267)
  - 4.9 Bestellüberwachung (PDF p. 54–55, Buch p. 277–278)
- **Quellseiten:** `[35-44, 54-55]` (12 Seiten)
- **Hinweis:** 4.11.6 (Nichtige/anfechtbare Rechtsgeschäfte) ist Teil des Komplettkapitels 4.11, das auf Tag 3 liegt — nicht doppelt abgebildet.

### Tag 5 — 18.05.2026 — Annahme und Lagerung der Waren
- **Ordner:** `Tag-5_18.05._Annahme-und-Lagerung-der-Waren/`
- **PDF-Datei:** `Grundlagen_Annahme-und-Lagerung-der-Waren.pdf`
- **PDF-Abschnitte:**
  - 4.4 Lagerhaltung (komplett, inkl. Lagerkennzahlen 4.4.5) (PDF p. 23–34, Buch p. 246–257)
- **Quellseiten:** `[23-34]` (12 Seiten)

### Tag 6 — 19.05.2026 — Kaufvertragsstörungen
- **Ordner:** `Tag-6_19.05._Kaufvertragsstoerungen/`
- **PDF-Datei:** `Grundlagen_Kaufvertragsstoerungen.pdf`
- **PDF-Abschnitte:**
  - 4.14 Kaufverträge — Leistungs-/Erfüllungsstörungen (komplett) (PDF p. 141–170, Buch p. 364–393)
- **Quellseiten:** `[141-170]` (30 Seiten)

### Tag 7 — 20.05.2026 — Eingangsrechnungen
- **Ordner:** `Tag-7_20.05._Eingangsrechnungen/`
- **PDF-Datei:** `Grundlagen_Eingangsrechnungen.pdf`
- **PDF-Abschnitte:**
  - 4.12.4 Erfüllung von Kaufverträgen (PDF p. 102–104, Buch p. 325–327)
  - 4.12.5 Gutgläubiger Eigentumserwerb (PDF p. 105–106, Buch p. 328–329)
  - 4.12.6 Eigentumsvorbehalt (PDF p. 107–108, Buch p. 330–331)
  - 4.12.7 Erfüllungsort, Gefahrübergang, Gerichtsstand (PDF p. 109–116, Buch p. 332–339)
- **Quellseiten:** `[102-116]` (15 Seiten)
- **Hinweis:** Best mögliche Annaeherung im PDF — Rechnungseingangskontrolle als eigener Abschnitt fehlt im Quell-PDF; ergänzendes Material für Rechnungseingangsprozess liefert der Ausbilder separat.

### Tag 8 — 21.05.2026 — Bezahlung von Rechnungen
- **Ordner:** `Tag-8_21.05._Bezahlung-von-Rechnungen/`
- **PDF-Datei:** `Grundlagen_Bezahlung-von-Rechnungen.pdf`
- **PDF-Abschnitte:**
  - 4.13 Erfüllung der Geldschuld — Zahlungsverkehr (komplett) (PDF p. 117–140, Buch p. 340–363)
- **Quellseiten:** `[117-140]` (24 Seiten)

### Tag 9 — 22.05.2026 — Vertiefung/Reflektion
- **Ordner:** `Tag-9_22.05._Vertiefung-und-Reflektion/`
- **Kein gesplittetes PDF.** Stattdessen eine Übersichts-Datei `UEBERSICHT.md` mit
  Liste aller vorherigen Tage als Wiederholungs-Roadmap.
- **Inhalt der Übersichts-Datei:**
  - Tabelle: Tag → Datum → Thema → Pfad zum Tagesordner → Buchseiten

## Splitting-Strategie (Implementierung)

- **Werkzeug:** Python 3.12 mit `pypdf` (oder `PyMuPDF`) — beides bereits lokal installiert.
- **Vorgehen:** Pro Tag werden die im Mapping aufgeführten Quellseiten aus
  `226-395.pdf` extrahiert und in eine neue PDF-Datei zusammengefügt.
  Bei Tagen mit mehreren nicht-zusammenhängenden Bereichen (Tag 1, Tag 2, Tag 4)
  werden die Bereiche in der Reihenfolge der PDF-Seiten zusammengeführt.
- **Originaldatei bleibt unverändert** — Splits werden in die Tagesordner kopiert.

## Verzeichnisstruktur (Endzustand)

Jeder Tagesordner enthält PDF + Tagesplan + Aufgabenblatt (außer Tag 9: Übersicht statt PDF).

```
Kurs 11.05.2026 bis 22.05.2026/
├── GrundlagenLiteratur/
│   └── 226-395.pdf                                        (Original, lokal, .gitignored)
├── Inhaltsplanung und kursplanung/
│   └── M-064_Beschaffung im Büromanagement_001_Ausbilder.docx
├── Tag-1_11.05._Beschaffungsprozess/
│   ├── Grundlagen_Beschaffungsprozess.pdf                 (.gitignored)
│   ├── Tagesplan_Beschaffungsprozess.md
│   └── Aufgaben_Beschaffungsprozess.md
├── Tag-2_12.05._Bezugsquellen-Anfragen-Angebotsvergleich/
│   ├── Grundlagen_Bezugsquellen-Anfragen-Angebotsvergleich.pdf
│   ├── Tagesplan_Bezugsquellen-Anfragen-Angebotsvergleich.md
│   └── Aufgaben_Bezugsquellen-Anfragen-Angebotsvergleich.md
├── Tag-3_13.05._Bestellungen-und-Kaufvertraege/
│   ├── Grundlagen_Bestellungen-und-Kaufvertraege.pdf
│   ├── Tagesplan_Bestellungen-und-Kaufvertraege.md
│   └── Aufgaben_Bestellungen-und-Kaufvertraege.md
├── Tag-4_15.05._Ausfuehren-von-Bestellungen/
│   ├── Grundlagen_Ausfuehren-von-Bestellungen.pdf
│   ├── Tagesplan_Ausfuehren-von-Bestellungen.md
│   └── Aufgaben_Ausfuehren-von-Bestellungen.md
├── Tag-5_18.05._Annahme-und-Lagerung-der-Waren/
│   ├── Grundlagen_Annahme-und-Lagerung-der-Waren.pdf
│   ├── Tagesplan_Annahme-und-Lagerung-der-Waren.md
│   └── Aufgaben_Annahme-und-Lagerung-der-Waren.md
├── Tag-6_19.05._Kaufvertragsstoerungen/
│   ├── Grundlagen_Kaufvertragsstoerungen.pdf
│   ├── Tagesplan_Kaufvertragsstoerungen.md
│   └── Aufgaben_Kaufvertragsstoerungen.md
├── Tag-7_20.05._Eingangsrechnungen/
│   ├── Grundlagen_Eingangsrechnungen.pdf
│   ├── Tagesplan_Eingangsrechnungen.md
│   └── Aufgaben_Eingangsrechnungen.md
├── Tag-8_21.05._Bezahlung-von-Rechnungen/
│   ├── Grundlagen_Bezahlung-von-Rechnungen.pdf
│   ├── Tagesplan_Bezahlung-von-Rechnungen.md
│   └── Aufgaben_Bezahlung-von-Rechnungen.md
└── Tag-9_22.05._Vertiefung-und-Reflektion/
    ├── UEBERSICHT.md                                       (Wiederholungs-Roadmap)
    ├── Tagesplan_Vertiefung-und-Reflektion.md
    └── Aufgaben_Vertiefung-und-Reflektion.md
```

## Nicht-Ziele

- Keine Aufgabenblätter, Übungen oder Tagespläne werden in dieser Iteration erstellt.
- Keine Modifikation der Quelldateien (Original-PDF und Ausbilder-DOCX bleiben unangetastet).
- Kein Inhaltsverzeichnis innerhalb der gesplitteten PDFs (Bookmarks werden nicht neu generiert).
- Keine Übersetzung der Umlaute in Ordner-/Dateinamen außer "ä→ae", "ö→oe", "ü→ue", "ß→ss" (Windows-pfadfreundlich).

## Offene Punkte / Annahmen

- **Annahme:** Die Ordner-/Dateinamen verwenden ASCII-transliterierte Umlaute (`ae`, `oe`, `ue`, `ss`), um OneDrive-Sync- und Sharing-Probleme zu vermeiden.
- **Annahme:** Eine Lernlandkarten-Übersichtsseite (PDF p.7 vor 4.2/4.3, p.35 vor 4.5/4.6/4.7, p.49 vor 4.8/4.9/4.10) wird dem Tag zugeordnet, dessen Abschnitt direkt nach der Lernlandkarte beginnt — und nicht dupliziert. Konkret: p.7 → Tag 1 (4.2 folgt), p.35 → Tag 4 (4.5 folgt), p.49 → Tag 2 (4.8 folgt). Spätere Tage, die andere Sections derselben Lernlandkarte verwenden, sehen die Lernlandkarte nicht in ihrem PDF.
