#!/usr/bin/env node
/*
 * Baut Memory-HTML (Paare finden: Begriff ↔ Definition) aus Template + Karteikarten-Daten.
 *   node scripts/build-memory.js            # alle Tage
 *   node scripts/build-memory.js tag-3      # nur Tag 3
 * Quelle: scripts/karteikarten-data/tag-N.json (cards[].front/back) → PAIRS[].term/def.
 */
const fs = require('fs');
const path = require('path');
const ROOT = '/media/sf_BFW';
const COURSE = path.join(ROOT, 'Kurs 29.06.2026 bis 17.07.2026');
const DATA_DIR = path.join(ROOT, 'scripts', 'karteikarten-data');
const TEMPLATE = fs.readFileSync(path.join(ROOT, 'scripts', 'memory-template.html'), 'utf8');
const MIN_PAIRS = 8;

const DAY_FOLDERS = {
  1:'Tag-1_29.06._Bueroraumplanung-und-Bueroformen',2:'Tag-2_30.06._Bueroausstattung-und-Bildschirmarbeitsplatz',
  3:'Tag-3_01.07._Arbeitsumgebung-und-Umweltfaktoren',4:'Tag-4_02.07._Arbeitsschutz-und-Gesundheit',
  5:'Tag-5_03.07._Zeitmanagement-und-Aufgabenplanung',6:'Tag-6_06.07._Terminplanung-und-Terminmanagement',
  7:'Tag-7_07.07._Besprechungen-vorbereiten-und-durchfuehren',8:'Tag-8_08.07._Besprechungen-nachbereiten-und-Protokoll',
  9:'Tag-9_09.07._Kommunikationsformen-und-Teamarbeit',10:'Tag-10_10.07._Postbearbeitung-Posteingang',
  11:'Tag-11_13.07._Postbearbeitung-Postausgang',12:'Tag-12_14.07._Dokumentenmanagement-Aufbewahrung-und-Fristen',
  13:'Tag-13_15.07._Ablage-und-Ablagesysteme',14:'Tag-14_16.07._Digitales-DMS-Datenschutz-und-Umweltschutz',
  15:'Tag-15_17.07._Vertiefung-und-Reflektion',
};

const filter = process.argv[2];
let files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
if (filter) files = files.filter(f => f === filter + '.json' || f === filter);

let errors = 0;
for (const file of files.sort((a,b)=>parseInt(a.match(/\d+/))-parseInt(b.match(/\d+/)))) {
  const data = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8'));
  const { tag, thema, slug, day_id, cards } = data;
  const pairs = cards.map(c => ({ term: c.front, def: c.back }))
    .filter(p => p.term && p.def);
  if (pairs.length < MIN_PAIRS) { console.error(`✗ Tag ${tag}: nur ${pairs.length} Paare (<${MIN_PAIRS})`); errors++; continue; }

  const html = TEMPLATE
    .replaceAll('{{TAG}}', String(tag)).replaceAll('{{THEMA}}', thema).replaceAll('{{DAY_ID}}', day_id)
    .replace('{{PAIRS_JSON}}', JSON.stringify(pairs, null, 0));
  const outPath = path.join(COURSE, DAY_FOLDERS[tag], `Memory_${slug}.html`);
  fs.writeFileSync(outPath, html, 'utf8');
  console.log(`✓ Tag ${tag}: ${pairs.length} Paare im Pool -> Memory_${slug}.html`);
}
console.log(errors ? `\n❌ ${errors} Fehler` : '\n✅ Alle Memory-Spiele gebaut');
process.exit(errors ? 1 : 0);
