#!/usr/bin/env node
/*
 * Baut Karteikarten-HTML-Dateien aus Template + Tages-Datendateien.
 * Nutzung:
 *   node scripts/build-karteikarten.js            # alle JSON in scripts/karteikarten-data/
 *   node scripts/build-karteikarten.js tag-3      # nur Tag 3
 * Schreibt Karteikarten_<slug>.html in den jeweiligen Tagesordner.
 */
const fs = require('fs');
const path = require('path');

const ROOT = '/media/sf_BFW';
const COURSE = path.join(ROOT, 'Kurs 29.06.2026 bis 17.07.2026');
const DATA_DIR = path.join(ROOT, 'scripts', 'karteikarten-data');
const TEMPLATE = path.join(ROOT, 'scripts', 'karteikarten-template.html');
const EXPECT = 60;

// Tag-Nummer -> Ordnername
const DAY_FOLDERS = {
  1: 'Tag-1_29.06._Bueroraumplanung-und-Bueroformen',
  2: 'Tag-2_30.06._Bueroausstattung-und-Bildschirmarbeitsplatz',
  3: 'Tag-3_01.07._Arbeitsumgebung-und-Umweltfaktoren',
  4: 'Tag-4_02.07._Arbeitsschutz-und-Gesundheit',
  5: 'Tag-5_03.07._Zeitmanagement-und-Aufgabenplanung',
  6: 'Tag-6_06.07._Terminplanung-und-Terminmanagement',
  7: 'Tag-7_07.07._Besprechungen-vorbereiten-und-durchfuehren',
  8: 'Tag-8_08.07._Besprechungen-nachbereiten-und-Protokoll',
  9: 'Tag-9_09.07._Kommunikationsformen-und-Teamarbeit',
  10: 'Tag-10_10.07._Postbearbeitung-Posteingang',
  11: 'Tag-11_13.07._Postbearbeitung-Postausgang',
  12: 'Tag-12_14.07._Dokumentenmanagement-Aufbewahrung-und-Fristen',
  13: 'Tag-13_15.07._Ablage-und-Ablagesysteme',
  14: 'Tag-14_16.07._Digitales-DMS-Datenschutz-und-Umweltschutz',
  15: 'Tag-15_17.07._Vertiefung-und-Reflektion',
};

const template = fs.readFileSync(TEMPLATE, 'utf8');
const filter = process.argv[2];
let files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
if (filter) files = files.filter(f => f === filter + '.json' || f === filter);
if (!files.length) { console.error('Keine Datendateien gefunden.'); process.exit(1); }

let errors = 0;
for (const file of files.sort()) {
  const data = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8'));
  const { tag, thema, slug, day_id, cards } = data;
  const problems = [];
  if (!Array.isArray(cards)) problems.push('cards ist kein Array');
  else {
    if (cards.length !== EXPECT) problems.push(`${cards.length} Karten (erwartet ${EXPECT})`);
    const seen = new Set();
    cards.forEach((c, i) => {
      if (!c.front || !c.back || !c.topic) problems.push(`Karte ${i}: front/back/topic fehlt`);
      if (c.front && seen.has(c.front.trim().toLowerCase())) problems.push(`Karte ${i}: Dublette „${c.front}"`);
      if (c.front) seen.add(c.front.trim().toLowerCase());
    });
  }
  if (problems.length) { console.error(`✗ ${file}: ${problems.join('; ')}`); errors++; continue; }

  const html = template
    .replaceAll('{{TAG}}', String(tag))
    .replaceAll('{{THEMA}}', thema)
    .replaceAll('{{DAY_ID}}', day_id)
    .replace('{{CARDS_JSON}}', JSON.stringify(cards, null, 0));

  const outFolder = path.join(COURSE, DAY_FOLDERS[tag]);
  const outPath = path.join(outFolder, `Karteikarten_${slug}.html`);
  fs.writeFileSync(outPath, html, 'utf8');
  const topics = [...new Set(cards.map(c => c.topic))];
  console.log(`✓ Tag ${tag}: ${cards.length} Karten -> ${path.basename(outPath)} (${topics.length} Themen)`);
}
console.log(errors ? `\n❌ ${errors} Datei(en) mit Fehlern` : '\n✅ Alle Karteikarten gebaut');
process.exit(errors ? 1 : 0);
