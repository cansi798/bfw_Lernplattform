#!/usr/bin/env node
/*
 * Baut für Lernfeld 1 aus Datendateien + gemeinsamen Templates:
 *   - Karteikarten_<slug>.html   (aus lernfeld1-data/karteikarten/session-N.json)
 *   - Memory_<slug>.html         (Paare aus denselben Karteikarten-Daten)
 *   - Wordle_<slug>.html         (aus lernfeld1-data/spiele/session-N.json)
 *   - Hangman_<slug>.html        (aus lernfeld1-data/spiele/session-N.json)
 *
 * Nutzung:
 *   node scripts/build-lernfeld1.js            # alle Sessions
 *   node scripts/build-lernfeld1.js session-3  # nur Session 3
 *
 * Datenschema karteikarten/session-N.json:
 *   { session, thema, slug, day_id, cards: [ { topic, front, back }, ... ] }  (60 Karten)
 * Datenschema spiele/session-N.json:
 *   { session, thema, slug, day_id, words: [ { word, hint }, ... ] }          (>=60 Wörter)
 *   word: nur A-Z + ÄÖÜß, 4-14 Zeichen, Großbuchstaben.
 *
 * Die Templates enthalten "Tag {{TAG}}"; für Lernfeld 1 wird daraus "Session {{TAG}}".
 */
const fs = require('fs');
const path = require('path');

const ROOT = '/media/sf_BFW';
const COURSE = path.join(ROOT, 'Lernfeld1');
const KART_DIR = path.join(ROOT, 'scripts', 'lernfeld1-data', 'karteikarten');
const SPIELE_DIR = path.join(ROOT, 'scripts', 'lernfeld1-data', 'spiele');

const KART_T   = fs.readFileSync(path.join(ROOT, 'scripts', 'karteikarten-template.html'), 'utf8');
const MEMORY_T = fs.readFileSync(path.join(ROOT, 'scripts', 'memory-template.html'), 'utf8');
const WORDLE_T = fs.readFileSync(path.join(ROOT, 'scripts', 'wordle-template.html'), 'utf8');
const HANGMAN_T= fs.readFileSync(path.join(ROOT, 'scripts', 'hangman-template.html'), 'utf8');

const SESSION_FOLDERS = {
  1: 'Session-1_Rechtliche-Grundlagen-der-Berufsausbildung',
  2: 'Session-2_Betrieb-in-der-Wirtschaft-Beduerfnisse-und-Wirtschaftskreislauf',
  3: 'Session-3_Unternehmen-Firma-Rechtsformen-und-Organisation',
  4: 'Session-4_Den-Betrieb-praesentieren-und-Wiederholung',
};

const EXPECT_CARDS = 60;
const MIN_WORDS = 60;
const MIN_PAIRS = 8;
const WORD_RE = /^[A-ZÄÖÜß]{4,14}$/;

// "Tag {{TAG}}" -> "Session {{TAG}}", dann Platzhalter füllen.
function fill(tpl, { tag, thema, day_id, jsonKey, json }) {
  return tpl
    .replaceAll('Tag {{TAG}}', 'Session {{TAG}}')
    .replaceAll('Büroprozesse (M-067)', 'Lernfeld 1')
    .replaceAll('{{TAG}}', String(tag))
    .replaceAll('{{THEMA}}', thema)
    .replaceAll('{{DAY_ID}}', day_id)
    .replace(jsonKey, json);
}

const filter = process.argv[2];
function pick(files) {
  if (!filter) return files;
  return files.filter(f => f === filter + '.json' || f === filter);
}
const sessNum = f => parseInt(f.match(/\d+/)[0], 10);

let errors = 0;

// ---- Karteikarten + Memory ----
let kartFiles = pick(fs.readdirSync(KART_DIR).filter(f => f.endsWith('.json'))).sort((a, b) => sessNum(a) - sessNum(b));
for (const file of kartFiles) {
  const data = JSON.parse(fs.readFileSync(path.join(KART_DIR, file), 'utf8'));
  const { session, thema, slug, day_id, cards } = data;
  const problems = [];
  if (!Array.isArray(cards)) problems.push('cards kein Array');
  else {
    if (cards.length !== EXPECT_CARDS) problems.push(`${cards.length} Karten (erwartet ${EXPECT_CARDS})`);
    const seen = new Set();
    cards.forEach((c, i) => {
      if (!c.front || !c.back || !c.topic) problems.push(`Karte ${i}: front/back/topic fehlt`);
      if (c.front && seen.has(c.front.trim().toLowerCase())) problems.push(`Karte ${i}: Dublette „${c.front}"`);
      if (c.front) seen.add(c.front.trim().toLowerCase());
    });
  }
  if (problems.length) { console.error(`✗ ${file}: ${problems.slice(0, 4).join('; ')}`); errors++; continue; }

  const outFolder = path.join(COURSE, SESSION_FOLDERS[session]);
  fs.writeFileSync(path.join(outFolder, `Karteikarten_${slug}.html`),
    fill(KART_T, { tag: session, thema, day_id, jsonKey: '{{CARDS_JSON}}', json: JSON.stringify(cards, null, 0) }), 'utf8');

  const pairs = cards.map(c => ({ term: c.front, def: c.back })).filter(p => p.term && p.def);
  if (pairs.length < MIN_PAIRS) { console.error(`✗ Session ${session}: nur ${pairs.length} Memory-Paare`); errors++; }
  else {
    fs.writeFileSync(path.join(outFolder, `Memory_${slug}.html`),
      fill(MEMORY_T, { tag: session, thema, day_id, jsonKey: '{{PAIRS_JSON}}', json: JSON.stringify(pairs, null, 0) }), 'utf8');
  }
  const topics = [...new Set(cards.map(c => c.topic))];
  console.log(`✓ Session ${session}: ${cards.length} Karten (${topics.length} Themen) -> Karteikarten + Memory`);
}

// ---- Wordle + Hangman ----
let spieleFiles = pick(fs.readdirSync(SPIELE_DIR).filter(f => f.endsWith('.json'))).sort((a, b) => sessNum(a) - sessNum(b));
for (const file of spieleFiles) {
  const data = JSON.parse(fs.readFileSync(path.join(SPIELE_DIR, file), 'utf8'));
  const { session, thema, slug, day_id, words } = data;
  const problems = [];
  if (!Array.isArray(words)) problems.push('words kein Array');
  else {
    if (words.length < MIN_WORDS) problems.push(`${words.length} Wörter (<${MIN_WORDS})`);
    const seen = new Set();
    words.forEach((w, i) => {
      const W = (w.word || '').toUpperCase();
      if (!WORD_RE.test(W)) problems.push(`Wort ${i} ungültig: "${w.word}"`);
      if (seen.has(W)) problems.push(`Dublette: "${W}"`); seen.add(W);
      if (!w.hint || w.hint.trim().length < 5) problems.push(`Wort ${i} ohne Hinweis`);
    });
  }
  if (problems.length) { console.error(`✗ ${file}: ${problems.slice(0, 4).join('; ')}`); errors++; continue; }

  const normWords = words.map(w => ({ word: w.word.toUpperCase(), hint: w.hint.trim() }));
  const json = JSON.stringify(normWords, null, 0);
  const outFolder = path.join(COURSE, SESSION_FOLDERS[session]);
  fs.writeFileSync(path.join(outFolder, `Wordle_${slug}.html`),
    fill(WORDLE_T, { tag: session, thema, day_id, jsonKey: '{{WORDS_JSON}}', json }), 'utf8');
  fs.writeFileSync(path.join(outFolder, `Hangman_${slug}.html`),
    fill(HANGMAN_T, { tag: session, thema, day_id, jsonKey: '{{WORDS_JSON}}', json }), 'utf8');
  const lens = normWords.map(w => w.word.length);
  console.log(`✓ Session ${session}: ${normWords.length} Wörter (Länge ${Math.min(...lens)}–${Math.max(...lens)}) -> Wordle + Hangman`);
}

console.log(errors ? `\n❌ ${errors} Problem(e)` : '\n✅ Lernfeld 1: alle Spiele/Karten/Memory gebaut');
process.exit(errors ? 1 : 0);
