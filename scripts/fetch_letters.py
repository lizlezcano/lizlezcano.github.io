#!/usr/bin/env python3
"""Fetch Liz's latest Substack letters into data/letters.json.

Runs daily from .github/workflows/update-letters.yml. Standard library only.
"""
import html
import json
import re
import sys
import urllib.request
import xml.etree.ElementTree as ET
from email.utils import parsedate_to_datetime
from pathlib import Path

FEED = "https://lezcanoliz.substack.com/feed"
OUT = Path(__file__).resolve().parent.parent / "data" / "letters.json"
LIMIT = 9


def clean(text):
    text = html.unescape(re.sub(r"<[^>]+>", "", text or "")).strip()
    return re.sub(r"\s+", " ", text)


def main():
    req = urllib.request.Request(FEED, headers={"User-Agent": "Mozilla/5.0 (letters-sync)"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        root = ET.fromstring(resp.read())

    letters = []
    for item in root.iter("item"):
        enclosure = item.find("enclosure")
        image = enclosure.get("url") if enclosure is not None else ""
        letters.append({
            "title": clean(item.findtext("title")).rstrip("."),
            "subtitle": clean(item.findtext("description")),
            "url": (item.findtext("link") or "").strip(),
            "date": parsedate_to_datetime(item.findtext("pubDate")).date().isoformat(),
            "image": image,
        })
        if len(letters) == LIMIT:
            break

    if not letters:
        sys.exit("Feed returned no letters; leaving data/letters.json untouched.")

    OUT.write_text(json.dumps(letters, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(letters)} letters to {OUT}")


if __name__ == "__main__":
    main()
