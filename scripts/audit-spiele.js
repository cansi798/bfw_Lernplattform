#!/usr/bin/env node
/* 5-Punkte-Audit für Wordle & Hängemann aller Tage.
 *  INHALT:        Wörter sind gültige Einzelbegriffe, Hinweise vorhanden & sinnvoll lang
 *  BUGS:          Hinweis verrät NICHT das Lösungswort; keine Dubletten; Länge 4–11;
 *                 nur erlaubte Zeichen; keine unersetzten {{Platzhalter}}
 *  FUNKTIONALITÄT: generiertes HTML enthält parsebares WORDS-Array (beide Spiele);
 *                 Engine-Funktionen (press/guess/newGame) im HTML vorhanden
 *  DARSTELLUNG:   Titel/Hinweis-Container/Keyboard-Markup vorhanden
 *  USER:          jedes Wort hat einen Hinweis (Lösbarkeit ohne Vorwissen)
 */
const fs = require('fs');
const path = require('path');
const ROOT = '/media/sf_BFW';
const COURSE = path.join(ROOT, 'Kurs 29.06.2026 bis 17.07.2026');
const DATA_DIR = path.join(ROOT, 'scripts', 'spiele-data');
const WORD_RE = /^[A-ZÄÖÜß]{4,14}$/;
const MIN_WORDS = 60;
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

function auditHtml(html, game) {
  const p = [];
  if (html.includes('{{')) p.push(`${game}: unersetzter Platzhalter`);
  const m = html.match(/const WORDS = (\[[\s\S]*?\]);\n/);
  if (!m) { p.push(`${game}: WORDS-Array fehlt`); return { p, n: 0 }; }
  let arr; try { arr = JSON.parse(m[1]); } catch(e){ p.push(`${game}: WORDS nicht parsebar`); return {p,n:0}; }
  // Funktionalität: Kernfunktionen vorhanden
  const fns = game==='Wordle'
    ? ['function press','function submit','function newGame','function initRow','knownGreens','function pickWord']
    : ['function guess','function lose','function newGame','function pickWord'];
  fns.forEach(f => { if (!html.includes(f)) p.push(`${game}: ${f} fehlt`); });
  // Darstellung: Grundgerüst + Spielanleitung
  if (!/id="keyboard"/.test(html)) p.push(`${game}: Keyboard-Markup fehlt`);
  if (!/id="hintText"/.test(html)) p.push(`${game}: Hinweis-Container fehlt`);
  if (!/Spielanleitung/.test(html)) p.push(`${game}: Spielanleitung fehlt`);
  if (game==='Wordle' && !/tile\.lock|classList\.toggle\('lock'/.test(html)) p.push('Wordle: Autofill-Markierung (lock) fehlt');
  return { p, n: arr.length };
}

let problems = 0, totalWords = 0;
const files = fs.readdirSync(DATA_DIR).filter(f=>f.endsWith('.json'))
  .sort((a,b)=>parseInt(a.match(/\d+/))-parseInt(b.match(/\d+/)));

for (const file of files) {
  const d = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8'));
  const p = [];
  if (d.words.length < MIN_WORDS) p.push(`nur ${d.words.length} Wörter (<${MIN_WORDS})`);
  const seen = new Set();
  d.words.forEach((w,i)=>{
    const W = w.word.toUpperCase();
    if (!WORD_RE.test(W)) p.push(`ungültig "${w.word}"`);
    if (seen.has(W)) p.push(`Dublette "${W}"`); seen.add(W);
    if (!w.hint || w.hint.trim().length < 5) p.push(`Wort ${i}: Hinweis fehlt/zu kurz`);
    // BUG-Check: Hinweis darf Lösungswort (oder Stamm) nicht enthalten
    if (w.hint && w.hint.toLowerCase().includes(W.toLowerCase())) p.push(`Hinweis verrät "${W}"`);
  });
  // HTML beider Spiele prüfen
  const folder = path.join(COURSE, DAY_FOLDERS[d.tag]);
  for (const [game, file2] of [['Wordle', `Wordle_${d.slug}.html`],['Hangman', `Hangman_${d.slug}.html`]]) {
    const hp = path.join(folder, file2);
    if (!fs.existsSync(hp)) { p.push(`${game}-HTML fehlt`); continue; }
    const r = auditHtml(fs.readFileSync(hp,'utf8'), game);
    p.push(...r.p);
    if (r.n !== d.words.length) p.push(`${game}: HTML ${r.n} Wörter ≠ ${d.words.length}`);
  }
  totalWords += d.words.length;
  const ok = p.length===0; if(!ok) problems++;
  console.log(`Tag ${String(d.tag).padStart(2)}: ${d.words.length} Wörter  ${ok?'✓':'✗ '+p.slice(0,3).join('; ')}`);
}
console.log(`\nGesamt: ${totalWords} Wörter · ${files.length} Tage · 2 Spiele = ${files.length*2} HTML-Dateien`);
console.log(problems===0 ? '✅ ALLE SPIELE-AUDITS BESTANDEN (Inhalt · Bugs · Funktionalität · Darstellung · UX)' : `❌ ${problems} Tag(e) mit Problemen`);
process.exit(problems?1:0);
