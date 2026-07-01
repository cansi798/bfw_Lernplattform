#!/usr/bin/env node
/* Audit der Morgenquizze in kurs-bueroprozesse.html:
 *  - JS-Syntax von QUIZ_DEFS parsebar?
 *  - je 60 Fragen, je 4 Optionen, a in 0..3
 *  - Antwort-Verteilung (Reihenfolge) je Woche
 *  - Dubletten (gleiche Frage) je Woche
 *  - Konsistenz der "Fragen"-Textangaben
 */
const fs = require('fs');
const DASH = '/media/sf_BFW/kurs-bueroprozesse.html';
const html = fs.readFileSync(DASH, 'utf8');

// QUIZ_DEFS-Objektliteral extrahieren
const m = html.match(/const QUIZ_DEFS\s*=\s*(\{[\s\S]*?\n\});/);
if (!m) { console.error('QUIZ_DEFS nicht gefunden'); process.exit(1); }
let defs;
try { defs = new Function('return ' + m[1])(); }
catch (e) { console.error('SYNTAXFEHLER in QUIZ_DEFS:', e.message); process.exit(1); }
console.log('✓ QUIZ_DEFS parst fehlerfrei (JS-Syntax ok)');

let problems = 0;
for (const wk of Object.keys(defs)) {
  const d = defs[wk];
  const qs = d.questions;
  const aDist = [0, 0, 0, 0];
  const seen = new Map();
  let structErr = 0, dup = 0;
  qs.forEach((q, i) => {
    if (!Array.isArray(q.options) || q.options.length !== 4) structErr++;
    if (typeof q.a !== 'number' || q.a < 0 || q.a > 3) structErr++;
    else aDist[q.a]++;
    if (new Set(q.options).size !== q.options.length) { structErr++; console.log(`  ⚠ ${wk} #${i}: doppelte Option`); }
    const key = q.q.trim().toLowerCase();
    if (seen.has(key)) { dup++; console.log(`  ⚠ ${wk}: Dublette „${q.q.slice(0,50)}…"`); }
    seen.set(key, true);
  });
  const balanced = aDist.every(x => x === aDist[0]);
  const subMatch = (d.sub.match(/(\d+) Fragen/) || [])[1];
  const subOk = String(qs.length) === subMatch;
  console.log(`\n${wk} (${d.title})`);
  console.log(`  Fragen: ${qs.length}  ${qs.length===60?'✓':'✗ (soll 60)'}`);
  console.log(`  Struktur-Fehler: ${structErr}  ${structErr===0?'✓':'✗'}`);
  console.log(`  Dubletten: ${dup}  ${dup===0?'✓':'✗'}`);
  console.log(`  a-Verteilung (Reihenfolge): [${aDist}]  ${balanced?'✓ ausgewogen':'✗ unausgewogen'}`);
  console.log(`  sub-Text nennt: ${subMatch} Fragen  ${subOk?'✓ konsistent':'✗ inkonsistent'}`);
  if (qs.length!==60||structErr||dup||!balanced||!subOk) problems++;
}

// Karten-Beschreibungen prüfen
const cardCounts = [...html.matchAll(/mq-desc">(\d+) Fragen/g)].map(x=>x[1]);
console.log(`\nKartentexte melden Fragenzahlen: [${cardCounts}]  ${cardCounts.every(c=>c==='60')?'✓':'✗'}`);
const rest24 = (html.match(/24 Fragen/g)||[]).length;
console.log(`Verbliebene "24 Fragen": ${rest24}  ${rest24===0?'✓':'✗'}`);

console.log(problems===0 && rest24===0 ? '\n✅ ALLE AUDITS BESTANDEN' : `\n❌ ${problems} Woche(n) mit Problemen`);
