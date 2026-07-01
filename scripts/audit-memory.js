#!/usr/bin/env node
/* Audit aller Memory-Spiele.
 *  INHALT:        PAIRS aus Karteikarten (term+def gefüllt), ≥8 Paare, keine leeren
 *  FUNKTIONALITÄT: Kernfunktionen (flip/newGame/win) + Match-Logik (pair===pair) vorhanden
 *  ERKLÄRUNG:     Spielanleitung im HTML
 *  DARSTELLUNG:   Grid-Markup, Platzhalter ersetzt, PAIRS parsebar
 */
const fs = require('fs');
const path = require('path');
const ROOT = '/media/sf_BFW';
const COURSE = path.join(ROOT, 'Kurs 29.06.2026 bis 17.07.2026');
const DATA_DIR = path.join(ROOT, 'scripts', 'karteikarten-data');
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

let problems = 0;
const files = fs.readdirSync(DATA_DIR).filter(f=>f.endsWith('.json'))
  .sort((a,b)=>parseInt(a.match(/\d+/))-parseInt(b.match(/\d+/)));

for (const file of files) {
  const d = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8'));
  const p = [];
  const htmlPath = path.join(COURSE, DAY_FOLDERS[d.tag], `Memory_${d.slug}.html`);
  if (!fs.existsSync(htmlPath)) { console.log(`Tag ${d.tag}: ✗ HTML fehlt`); problems++; continue; }
  const html = fs.readFileSync(htmlPath, 'utf8');
  // Darstellung
  if (html.includes('{{')) p.push('unersetzter Platzhalter');
  if (!/id="grid"/.test(html)) p.push('Grid-Markup fehlt');
  // Erklärung
  if (!/Spielanleitung/.test(html)) p.push('Spielanleitung fehlt');
  // Funktionalität
  ['function flip','function newGame','function win'].forEach(f=>{ if(!html.includes(f)) p.push(`${f} fehlt`); });
  if (!/\.pair===deck\[b\]\.pair|deck\[a\]\.pair===deck\[b\]\.pair/.test(html)) p.push('Match-Logik fehlt');
  // Inhalt: PAIRS parsen
  const m = html.match(/const PAIRS = (\[[\s\S]*?\]);/);
  if (!m) p.push('PAIRS-Array fehlt');
  else {
    let arr; try { arr = JSON.parse(m[1]); } catch(e){ p.push('PAIRS nicht parsebar'); }
    if (arr) {
      if (arr.length < MIN_PAIRS) p.push(`nur ${arr.length} Paare (<${MIN_PAIRS})`);
      const bad = arr.filter(x=>!x.term || !x.def || x.term.trim().length<2 || x.def.trim().length<5).length;
      if (bad) p.push(`${bad} Paare mit leerem/kurzem term/def`);
    }
  }
  const ok = p.length===0; if(!ok) problems++;
  const pool = m ? JSON.parse(m[1]).length : 0;
  console.log(`Tag ${String(d.tag).padStart(2)}: Pool ${pool} Paare  ${ok?'✓':'✗ '+p.slice(0,3).join('; ')}`);
}
console.log(`\n${files.length} Memory-Spiele`);
console.log(problems===0 ? '✅ ALLE MEMORY-AUDITS BESTANDEN (Inhalt · Funktionalität · Erklärung · Darstellung)' : `❌ ${problems} Tag(e) mit Problemen`);
process.exit(problems?1:0);
