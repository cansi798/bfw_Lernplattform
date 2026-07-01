#!/usr/bin/env node
/*
 * Baut die drei Wiederholungs-Morgenquizze (Woche 1/2/3) im Dashboard
 * kurs-bueroprozesse.html auf je 60 Fragen aus.
 *
 * Quelle: die bereits geprüften Tages-Quizze (Quiz_*.html, je 60 Fragen,
 * a:-Werte perfekt auf 0..3 verteilt).
 *
 * Auswahl je Tag: 12 Fragen = 3 je Antwortposition (a:0/1/2/3),
 * innerhalb jeder Positionsgruppe gleichmäßig gestreut (Themenvielfalt),
 * danach positions-interleaved (a0,a1,a2,a3,...), damit die richtige
 * Antwort NICHT klumpt. Ergebnis pro Woche: 60 Fragen, exakt 15 je Position.
 *
 * Deterministisch (keine Zufallszahlen) → reproduzierbar & reviewbar.
 */
const fs = require('fs');
const path = require('path');

const ROOT = '/media/sf_BFW';
const COURSE = path.join(ROOT, 'Kurs 29.06.2026 bis 17.07.2026');
const DASH = path.join(ROOT, 'kurs-bueroprozesse.html');

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

const WEEKS = { w1: [1, 2, 3, 4, 5], w2: [6, 7, 8, 9, 10], w3: [11, 12, 13, 14, 15] };
const PER_DAY = 12;

function extractQuestions(tag) {
  const folder = path.join(COURSE, DAY_FOLDERS[tag]);
  const quizFile = fs.readdirSync(folder).find(f => /^Quiz_.*\.html$/.test(f));
  if (!quizFile) throw new Error(`Kein Quiz für Tag ${tag}`);
  const html = fs.readFileSync(path.join(folder, quizFile), 'utf8');
  const m = html.match(/const QUESTIONS\s*=\s*(\[[\s\S]*?\n\s*\]);/);
  if (!m) throw new Error(`QUESTIONS-Array nicht gefunden in Tag ${tag}`);
  // eslint-disable-next-line no-new-func
  const arr = new Function('return ' + m[1])();
  if (!Array.isArray(arr)) throw new Error(`Tag ${tag}: kein Array`);
  return arr;
}

// wählt n Elemente gleichmäßig gestreut aus arr
function evenPick(arr, n) {
  if (arr.length <= n) return arr.slice();
  const out = [];
  const step = arr.length / n;
  for (let i = 0; i < n; i++) out.push(arr[Math.floor(i * step)]);
  return out;
}

function selectForDay(tag) {
  const all = extractQuestions(tag);
  // strukturelle Validierung
  const bad = all.filter(q => !Array.isArray(q.options) || q.options.length !== 4 ||
    typeof q.a !== 'number' || q.a < 0 || q.a > 3 || !q.q || !q.e);
  if (bad.length) throw new Error(`Tag ${tag}: ${bad.length} fehlerhafte Frage(n)`);

  // nach Antwortposition gruppieren
  const byA = [[], [], [], []];
  all.forEach(q => byA[q.a].push(q));
  const need = PER_DAY / 4; // 3 je Position
  const picks = byA.map(group => evenPick(group, need));
  // positions-interleaved zusammensetzen: a0,a1,a2,a3, a0,a1,...
  const out = [];
  for (let i = 0; i < need; i++) for (let a = 0; a < 4; a++) out.push(picks[a][i]);
  // tag-Feld ergänzen
  return out.map(q => ({ tag, topic: q.topic, q: q.q, options: q.options, a: q.a, e: q.e }));
}

function fmtQuestion(q) {
  const opts = q.options.map(o => JSON.stringify(o)).join(', ');
  return `      { tag: ${q.tag}, topic: ${JSON.stringify(q.topic)}, q: ${JSON.stringify(q.q)},\n` +
         `        options: [${opts}],\n` +
         `        a: ${q.a}, e: ${JSON.stringify(q.e)} }`;
}

function buildWeek(wk) {
  const qs = [];
  for (const tag of WEEKS[wk]) qs.push(...selectForDay(tag));
  return qs;
}

// ---- Dashboard einlesen und Wochen-Arrays ersetzen ----
let dash = fs.readFileSync(DASH, 'utf8');
const report = {};

for (const wk of Object.keys(WEEKS)) {
  const qs = buildWeek(wk);
  report[wk] = qs;
  const body = qs.map(fmtQuestion).join(',\n');

  // Anker: von "    questions: [" bis zum passenden "\n    ]" (4-Space-Bracket)
  // eindeutig je Woche über den title davor -> wir ersetzen das erste questions-Array
  // nach dem jeweiligen wk-Schlüssel.
  const keyIdx = dash.indexOf(`  ${wk}: {`);
  if (keyIdx < 0) throw new Error(`Wochen-Key ${wk} nicht gefunden`);
  const qStart = dash.indexOf('    questions: [', keyIdx);
  if (qStart < 0) throw new Error(`questions: [ für ${wk} nicht gefunden`);
  const afterOpen = qStart + '    questions: ['.length;
  const qEnd = dash.indexOf('\n    ]', afterOpen);
  if (qEnd < 0) throw new Error(`Array-Ende für ${wk} nicht gefunden`);
  dash = dash.slice(0, afterOpen) + '\n' + body + '\n' + dash.slice(qEnd + 1);
}

// ---- "24 Fragen" -> "60 Fragen" (Karten, sub, Kommentar) ----
const before24 = (dash.match(/24 Fragen/g) || []).length;
dash = dash.replace(/24 Fragen/g, '60 Fragen');
dash = dash.replace(/je 24 Fragen/g, 'je 60 Fragen'); // falls Kommentar-Variante
dash = dash.replace(/drei Wochen-Wiederholungen \(je 60 Fragen\)/,
                    'drei Wochen-Wiederholungen (je 60 Fragen)');

fs.writeFileSync(DASH, dash, 'utf8');

// ---- Report ----
console.log('== AUFBAU FERTIG ==');
for (const wk of Object.keys(WEEKS)) {
  const qs = report[wk];
  const aDist = [0, 0, 0, 0];
  const tagDist = {};
  qs.forEach(q => { aDist[q.a]++; tagDist[q.tag] = (tagDist[q.tag] || 0) + 1; });
  console.log(`${wk}: ${qs.length} Fragen | a-Verteilung ${JSON.stringify(aDist)} | pro Tag ${JSON.stringify(tagDist)}`);
}
console.log(`"24 Fragen"-Vorkommen ersetzt: ${before24}`);
