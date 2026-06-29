"""YouTube-Link-Audit für die Kurstage.

Zweck:
  - Findet alle YouTube-Links in den Tagesdateien (Aufgabenheft_*.tex, Aufgaben_*.md, ...).
  - Prüft je Tag, ob jeder Link DIREKT zu einem echten YouTube-Video führt
    (Verifikation über den offiziellen oembed-Endpunkt: HTTP 200 = abspielbares Video).
  - Suchlinks (youtube.com/results?search_query=...) gelten NICHT als direktes Video.

Modi:
  python scripts/audit_youtube.py            # nur prüfen + Report
  python scripts/audit_youtube.py --fix      # Suchlinks durch verifizierte
                                             # Direkt-Videolinks ersetzen, dann prüfen

Voraussetzung: curl + Internetzugang. Keine externen Python-Pakete nötig.
"""

import re
import sys
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
KURS = ROOT / "Kurs 29.06.2026 bis 17.07.2026"

UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"

SEARCH_RE = re.compile(r'https?://(?:www\.)?youtube\.com/results\?search_query=[A-Za-z0-9_%+.\-]+')
WATCH_RE = re.compile(r'https?://(?:www\.)?youtube\.com/watch\?v=([A-Za-z0-9_-]{11})')
SHORT_RE = re.compile(r'https?://(?:www\.)?youtu\.be/([A-Za-z0-9_-]{11})')
VIDEOID_RE = re.compile(r'"videoId":"([A-Za-z0-9_-]{11})"')


def curl(url, max_time=25, head_only=False):
    cmd = ["curl", "-s", "--max-time", str(max_time), "-A", UA,
           "-H", "Accept-Language: de-DE,de;q=0.9"]
    if head_only:
        cmd += ["-o", "/dev/null", "-w", "%{http_code}"]
    cmd.append(url)
    try:
        r = subprocess.run(cmd, capture_output=True, text=True)
        return r.stdout
    except Exception:
        return ""


def oembed(video_id):
    """(ok, title) – ok=True wenn das Video öffentlich abspielbar ist."""
    url = (f"https://www.youtube.com/oembed?url="
           f"https://www.youtube.com/watch?v={video_id}&format=json")
    out = curl(url)
    if not out:
        return False, None
    try:
        data = json.loads(out)
        return True, data.get("title")
    except Exception:
        return False, None


def search_top_videos(search_url, limit=6):
    html = curl(search_url)
    seen, ids = set(), []
    for m in VIDEOID_RE.finditer(html):
        vid = m.group(1)
        if vid not in seen:
            seen.add(vid)
            ids.append(vid)
        if len(ids) >= limit:
            break
    return ids


def find_first_valid(search_url):
    """Erstes abspielbares Video aus den Top-Suchtreffern -> (video_id, title)."""
    for vid in search_top_videos(search_url):
        ok, title = oembed(vid)
        if ok:
            return vid, title
    return None, None


def day_files():
    for d in sorted(KURS.glob("Tag-*")):
        files = sorted(d.glob("Aufgabenheft_*.tex")) + sorted(d.glob("Aufgaben_*.md"))
        yield d, files


def cmd_fix():
    # 1) alle eindeutigen Suchlinks sammeln
    search_urls = set()
    for _, files in day_files():
        for f in files:
            search_urls.update(SEARCH_RE.findall(f.read_text(encoding="utf-8")))
    print(f"{len(search_urls)} eindeutige Suchlinks gefunden. Suche verifizierte Videos ...")

    mapping = {}
    for i, su in enumerate(sorted(search_urls), 1):
        vid, title = find_first_valid(su)
        if vid:
            mapping[su] = f"https://www.youtube.com/watch?v={vid}"
            print(f"  [{i}/{len(search_urls)}] OK  {vid}  {title}")
        else:
            print(f"  [{i}/{len(search_urls)}] KEIN Video gefunden: {su}")

    # 2) ersetzen
    changed = 0
    for _, files in day_files():
        for f in files:
            txt = f.read_text(encoding="utf-8")
            new = txt
            for su, watch in mapping.items():
                new = new.replace(su, watch)
            if new != txt:
                f.write_text(new, encoding="utf-8")
                changed += 1
    print(f"{changed} Dateien aktualisiert, {len(mapping)} Links ersetzt.")


def cmd_audit():
    total_ok = total_fail = total_search = 0
    print("=== YouTube-Link-Audit (direktes Video = oembed 200) ===\n")
    for d, files in day_files():
        tag = d.name
        links = []
        for f in files:
            txt = f.read_text(encoding="utf-8")
            for m in WATCH_RE.finditer(txt):
                links.append(("watch", m.group(1), f.name))
            for m in SHORT_RE.finditer(txt):
                links.append(("short", m.group(1), f.name))
            for _ in SEARCH_RE.findall(txt):
                links.append(("search", None, f.name))
        # eindeutige Video-IDs prüfen
        ids = sorted({vid for kind, vid, _ in links if vid})
        results = {vid: oembed(vid) for vid in ids}
        n_search = sum(1 for kind, _, _ in links if kind == "search")
        ok = sum(1 for vid in ids if results[vid][0])
        fail = len(ids) - ok
        total_ok += ok
        total_fail += fail
        total_search += n_search
        status = "OK" if (fail == 0 and n_search == 0 and ids) else "PRÜFEN"
        print(f"[{status}] {tag}: {len(ids)} Videolinks ({ok} gültig, {fail} ungültig), "
              f"{n_search} Suchlinks")
        for vid in ids:
            okv, title = results[vid]
            if not okv:
                print(f"        UNGÜLTIG: watch?v={vid}")
        if n_search:
            print(f"        {n_search} Suchlink(s) – kein direktes Video")
    print(f"\nSumme: {total_ok} gültige Videos, {total_fail} ungültige, "
          f"{total_search} Suchlinks.")
    return total_fail == 0 and total_search == 0


def main():
    if not KURS.exists():
        raise SystemExit(f"Kursordner fehlt: {KURS}")
    if "--fix" in sys.argv:
        cmd_fix()
        print()
    ok = cmd_audit()
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
