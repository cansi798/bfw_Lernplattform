#!/usr/bin/env node
/*
 * Baut Wordle- und Hängemann-HTML aus Template + Tages-Wortlisten.
 *   node scripts/build-spiele.js           # alle spiele-data/*.json
 *   node scripts/build-spiele.js tag-3     # nur Tag 3
 * Datenschema spiele-data/tag-N.json:
 *   { tag, thema, slug, day_id, words: [ { word, hint }, ... ] }
 *   word: nur Buchstaben A-Z + ÄÖÜß, 4-11 Zeichen (Wortle-Grid), Großbuchstaben.
 */
const fs = require('fs');
const path = require('path');
const ROOT = '/media/sf_BFW';
const COURSE = path.join(ROOT, 'Kurs 29.06.2026 bis 17.07.2026');
const DATA_DIR = path.join(ROOT, 'scripts', 'spiele-data');
const WORDLE_T = fs.readFileSync(path.join(ROOT, 'scripts', 'wordle-template.html'), 'utf8');
const HANGMAN_T = fs.readFileSync(path.join(ROOT, 'scripts', 'hangman-template.html'), 'utf8');
const MIN_WORDS = 60;
const WORD_RE = /^[A-ZÄÖÜß]{4,14}$/;

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
if (!files.length) { console.error('Keine Wortlisten gefunden.'); process.exit(1); }

let errors = 0;
for (const file of files.sort((a,b)=>parseInt(a.match(/\d+/))-parseInt(b.match(/\d+/)))) {
  const data = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8'));
  const { tag, thema, slug, day_id, words } = data;
  const p = [];
  if (!Array.isArray(words)) p.push('words kein Array');
  else {
    if (words.length < MIN_WORDS) p.push(`${words.length} Wörter (<${MIN_WORDS})`);
    const seen = new Set();
    words.forEach((w,i)=>{
      const W = (w.word||'').toUpperCase();
      if (!WORD_RE.test(W)) p.push(`Wort ${i} ungültig: "${w.word}"`);
      if (seen.has(W)) p.push(`Dublette: "${W}"`); seen.add(W);
      if (!w.hint || w.hint.trim().length < 5) p.push(`Wort ${i} ohne Hinweis`);
    });
  }
  if (p.length) { console.error(`✗ ${file}: ${p.slice(0,4).join('; ')}`); errors++; continue; }

  const normWords = words.map(w => ({ word: w.word.toUpperCase(), hint: w.hint.trim() }));
  const json = JSON.stringify(normWords, null, 0);
  const outFolder = path.join(COURSE, DAY_FOLDERS[tag]);
  const fill = (tpl) => tpl.replaceAll('{{TAG}}', String(tag)).replaceAll('{{THEMA}}', thema)
    .replaceAll('{{DAY_ID}}', day_id).replace('{{WORDS_JSON}}', json);
  fs.writeFileSync(path.join(outFolder, `Wordle_${slug}.html`), fill(WORDLE_T), 'utf8');
  fs.writeFileSync(path.join(outFolder, `Hangman_${slug}.html`), fill(HANGMAN_T), 'utf8');
  const lens = normWords.map(w=>w.word.length);
  console.log(`✓ Tag ${tag}: ${normWords.length} Wörter (Länge ${Math.min(...lens)}–${Math.max(...lens)}) -> Wordle + Hangman`);
}
console.log(errors ? `\n❌ ${errors} Datei(en) mit Fehlern` : '\n✅ Alle Spiele gebaut');
process.exit(errors ? 1 : 0);
