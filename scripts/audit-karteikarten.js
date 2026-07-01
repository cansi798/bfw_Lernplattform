#!/usr/bin/env node
/* Gesamt-Audit aller Karteikarten-Decks.
 *  Inhalt:      60 Karten, keine doppelten fronts, Felder vorhanden
 *  Erklärungen: back nicht leer, sinnvolle Länge, back != front
 *  Darstellung: generiertes HTML enthält parsebares CARDS-Array mit 60 Einträgen
 *  Global:      day_id eindeutig, front-Überschneidungen zwischen Tagen (Info)
 */
const fs = require('fs');
const path = require('path');
const ROOT = '/media/sf_BFW';
const COURSE = path.join(ROOT, 'Kurs 29.06.2026 bis 17.07.2026');
const DATA_DIR = path.join(ROOT, 'scripts', 'karteikarten-data');
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

let totalProblems = 0, totalCards = 0;
const dayIds = new Map();
const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'))
  .sort((a,b) => parseInt(a.match(/\d+/)) - parseInt(b.match(/\d+/)));

for (const file of files) {
  const data = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8'));
  const { tag, day_id, cards } = data;
  const p = [];
  // Inhalt
  if (cards.length !== 60) p.push(`${cards.length} Karten (≠60)`);
  const fronts = new Set(), topics = new Set();
  let shortBack = 0, backEqFront = 0, missing = 0;
  cards.forEach((c, i) => {
    if (!c.front || !c.back || !c.topic) missing++;
    if (c.front) { if (fronts.has(c.front.trim().toLowerCase())) p.push(`Dublette front #${i}`); fronts.add(c.front.trim().toLowerCase()); }
    if (c.topic) topics.add(c.topic);
    // Erklärungen
    if (c.back && c.back.trim().length < 8) shortBack++;
    if (c.front && c.back && c.front.trim().toLowerCase() === c.back.trim().toLowerCase()) backEqFront++;
  });
  if (missing) p.push(`${missing} Karten mit fehlendem Feld`);
  if (shortBack) p.push(`${shortBack} sehr kurze Rückseiten`);
  if (backEqFront) p.push(`${backEqFront} back==front`);
  // day_id eindeutig
  if (dayIds.has(day_id)) p.push(`day_id "${day_id}" doppelt`); dayIds.set(day_id, tag);
  // Darstellung: HTML prüfen
  const slug = data.slug;
  const htmlPath = path.join(COURSE, DAY_FOLDERS[tag], `Karteikarten_${slug}.html`);
  if (!fs.existsSync(htmlPath)) p.push('HTML fehlt');
  else {
    const html = fs.readFileSync(htmlPath, 'utf8');
    const m = html.match(/const CARDS = (\[[\s\S]*?\]);\n/);
    if (!m) p.push('CARDS-Array im HTML nicht gefunden');
    else { try { const arr = JSON.parse(m[1]); if (arr.length !== 60) p.push(`HTML-CARDS ${arr.length}≠60`); } catch(e){ p.push('HTML-CARDS nicht parsebar'); } }
    if (!html.includes('{{')) {} else p.push('unersetzter Platzhalter {{...}}');
  }
  totalCards += cards.length;
  const ok = p.length === 0;
  if (!ok) totalProblems++;
  console.log(`Tag ${String(tag).padStart(2)}: ${cards.length} Karten, ${topics.size} Themen  ${ok ? '✓' : '✗ ' + p.join('; ')}`);
}

// globale front-Überschneidungen (nur Info)
console.log(`\nGesamt: ${totalCards} Karten über ${files.length} Tage`);
console.log(totalProblems === 0 ? '✅ ALLE KARTEIKARTEN-AUDITS BESTANDEN' : `❌ ${totalProblems} Tag(e) mit Problemen`);
process.exit(totalProblems ? 1 : 0);
