"""Wählt für jede YouTube-Referenz in den Aufgabenheften/Aufgaben ein
THEMATISCH PASSENDES Video, statt blind das erste Suchergebnis.

Vorgehen je Referenz (zeilenweise, damit gleiche IDs nicht kollidieren):
  1. Label (der beschreibende Linktext) wird gelesen -> beschreibt das Thema.
  2. YouTube-Suche nach dem Label, Top-Kandidaten (videoId + Titel) holen.
  3. Kandidaten werden nach Titel-Übereinstimmung mit den Label-Stichworten
     bewertet (Volltreffer + 4-Zeichen-Präfix-Treffer + Büro-Bonus).
  4. Bestes oembed-gültiges Video gewinnt; nur ersetzen, wenn es echt besser
     ist als das aktuell verlinkte (kein Verschlechtern, kein Zufall).

Aufruf:
  python scripts/fix_youtube_relevance.py            # nur Vorschlag/Report
  python scripts/fix_youtube_relevance.py --apply    # Dateien tatsächlich ändern
  python scripts/fix_youtube_relevance.py --apply --only Tag-1   # nur ein Tag
"""

import re, sys, json, subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
KURS = ROOT / "Kurs 29.06.2026 bis 17.07.2026"
UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"
VIDEOID_RE = re.compile(r'"videoId":"([A-Za-z0-9_-]{11})"')

STOP = {"grundlagen","vergleich","einfach","erklaert","erklärt","und","oder","am","im","pro",
        "vs","der","die","das","des","von","mit","für","fuer","beim","zum","zur","eines","einer",
        "the","wie","was","ein","eine","ist","sind"}

CACHE = {}


def curl(url, max_time=25):
    try:
        return subprocess.run(["curl","-s","--max-time",str(max_time),"-A",UA,
                               "-H","Accept-Language: de-DE,de;q=0.9", url],
                              capture_output=True, text=True).stdout
    except Exception:
        return ""


def clean_label(lbl):
    lbl = lbl.replace("---"," ").replace("\\&"," und ").replace("&"," und ")
    lbl = lbl.replace("\\,"," ").replace("vs.\\","vs").replace("vs.","vs")
    lbl = re.sub(r'YouTube:\s*','',lbl)
    lbl = lbl.replace("„","").replace("“","").replace("”","").replace('"','')
    return lbl.strip()


def tokens(text):
    text = text.lower()
    raw = re.split(r'[^a-zäöüß]+', text)
    return [t for t in raw if len(t) >= 4 and t not in STOP]


def oembed_title(vid):
    out = curl(f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={vid}&format=json", 15)
    if not out:
        return None
    try:
        return json.loads(out).get("title")
    except Exception:
        return None


def search(query, limit=20):
    if query in CACHE:
        return CACHE[query]
    from urllib.parse import quote
    html = curl("https://www.youtube.com/results?search_query=" + quote(query + " einfach erklärt"))
    seen, out = set(), []
    # Titel grob aus dem JSON der Suchseite ziehen: "title":{"runs":[{"text":"..."}
    # Fallback: nur videoIds (Titel via oembed bei Bedarf)
    for m in VIDEOID_RE.finditer(html):
        vid = m.group(1)
        if vid not in seen:
            seen.add(vid); out.append(vid)
        if len(out) >= limit:
            break
    CACHE[query] = out
    return out


def score(label_clean, title):
    if not title:
        return -1
    tl = title.lower()
    lab_tokens = tokens(label_clean)
    s = 0
    for t in lab_tokens:
        if t in tl:
            s += 2
        elif len(t) >= 6 and t[:4] in tl:
            s += 1
    if "büro" in label_clean.lower() and "büro" in tl:
        s += 1
    return s


def best_for(label):
    lc = clean_label(label)
    cands = search(lc)
    scored = []
    for vid in cands[:12]:
        title = oembed_title(vid)
        if title is None:
            continue
        scored.append((score(lc, title), vid, title))
    scored.sort(key=lambda x: -x[0])
    return scored[0] if scored else (None, None, None)


HREF_RE = re.compile(r'\\href\{https://www\.youtube\.com/watch\?v=([A-Za-z0-9_-]{11})\}\{([^}]*)\}')
MD_RE = re.compile(r'\[([^\]]+)\]\(https://www\.youtube\.com/watch\?v=([A-Za-z0-9_-]{11})\)')


def process(path, apply):
    lines = path.read_text(encoding="utf-8").split("\n")
    changes = []
    for i, line in enumerate(lines):
        m = HREF_RE.search(line) or MD_RE.search(line)
        if not m:
            continue
        if m.re is HREF_RE:
            old_id, label = m.group(1), m.group(2)
        else:
            label, old_id = m.group(1), m.group(2)
        sc, vid, title = best_for(label)
        if not vid:
            continue
        cur_title = oembed_title(old_id)
        cur_score = score(clean_label(label), cur_title)
        # nur ersetzen, wenn neues Video echt besser passt
        if sc > cur_score and vid != old_id:
            new_line = line.replace(f"watch?v={old_id}", f"watch?v={vid}")
            lines[i] = new_line
            changes.append((label, cur_title, sc, cur_score, title))
        # Bericht auch ohne Änderung
        changes_log.append((path.parent.name, clean_label(label), old_id, cur_title, cur_score, vid, title, sc,
                            "ERSETZT" if (sc > cur_score and vid != old_id) else "behalten"))
    if apply and any(True for _ in changes):
        path.write_text("\n".join(lines), encoding="utf-8")
    return len(changes)


changes_log = []


def main():
    apply = "--apply" in sys.argv
    only = None
    if "--only" in sys.argv:
        only = sys.argv[sys.argv.index("--only")+1]
    total = 0
    for d in sorted(KURS.glob("Tag-*")):
        if only and not d.name.startswith(only):
            continue
        for f in sorted(d.glob("Aufgabenheft_*.tex")) + sorted(d.glob("Aufgaben_*.md")):
            total += process(f, apply)
    # Report
    print(f"{'TAG':<14}{'SCORE':>6}  LABEL -> NEUER TITEL")
    for (tag, label, oid, ot, os_, nid, nt, ns, act) in changes_log:
        flag = "�e" if act == "ERSETZT" else "  "
        print(f"{flag} {tag[:12]:<12} {ns:>3}/{os_:<2} {label[:34]:<34} -> {(nt or '?')[:46]}")
    print(f"\n{'ANGEWENDET' if apply else 'VORSCHAU'}: {total} Referenzen ersetzt.")


if __name__ == "__main__":
    main()
