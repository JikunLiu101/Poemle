#!/usr/bin/env python3
"""
Scrape classical Chinese poems from guwendao.net and produce poems.json.

Sources (poetry-only collections — the grade-school canon pages mix in
classical prose like 师说 / 卖油翁 / 赤壁赋 and have been dropped):
  - https://www.guwendao.net/gushi/tangshi.aspx   唐诗三百首
  - https://www.guwendao.net/gushi/sanbai.aspx    古诗三百首
  - https://www.guwendao.net/gushi/songsan.aspx   宋词三百首

Output: src/data/poems.json
"""

import urllib.request
import re
import json
import sys
import os
import socket
from concurrent.futures import ThreadPoolExecutor, as_completed

socket.setdefaulttimeout(20)

BASE_URL = "https://www.guwendao.net"
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

# Poetry-only collections. The grade-school canon pages (xiaoxue / chuzhong
# / gaozhong) used to be scraped here too, but they mix in a lot of classical
# prose (师说, 卖油翁, 赤壁赋, 岳阳楼记 …) which we don't want as puzzles.
INDEX_PAGES = [
    "https://www.guwendao.net/gushi/tangshi.aspx",
    "https://www.guwendao.net/gushi/sanbai.aspx",
    "https://www.guwendao.net/gushi/songsan.aspx",
]

SENTENCE_DELIMS = set('。！？')          # split sentences on these
INTRA_SENTENCE_PUNCT = set('，；：、')    # keep these inside a sentence
# Everything else that's not CJK gets stripped (book brackets, dashes,
# curly quotes, ASCII punctuation, whitespace, BOM, etc.).

DYNASTY_MAP = {
    "唐代": "tang",
    "唐朝": "tang",
    "宋代": "song",
    "宋朝": "song",
}

MAX_WORKERS = 8


def fetch(url: str) -> str:
    """Fetch a URL once. Returns '' on any failure."""
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    try:
        with urllib.request.urlopen(req, timeout=12) as resp:
            raw = resp.read()
            try:
                return raw.decode("utf-8")
            except UnicodeDecodeError:
                return raw.decode("gb18030", errors="replace")
    except Exception:
        return ""


def extract_poem_ids(html: str) -> list[str]:
    return re.findall(r'/shiwenv_([0-9a-f]+)\.aspx', html)


def strip_html_tags(text: str) -> str:
    return re.sub(r'<[^>]+>', '', text)


def _is_cjk(ch: str) -> bool:
    return ('一' <= ch <= '鿿') or ('㐀' <= ch <= '䶿')


def _cjk_count(s: str) -> int:
    return sum(1 for ch in s if _is_cjk(ch))


def clean_sentence(text: str) -> str:
    """Strip everything that isn't a CJK char or intra-sentence punctuation,
    then trim leading/trailing punctuation/whitespace."""
    text = strip_html_tags(text).strip()
    text = re.sub(r'\([^)]*一作[^)]*\)', '', text)
    text = re.sub(r'（[^）]*一作[^）]*）', '', text)
    kept: list[str] = []
    for ch in text:
        if _is_cjk(ch) or ch in INTRA_SENTENCE_PUNCT:
            kept.append(ch)
    out = ''.join(kept)
    # Trim punctuation/whitespace from both ends (a sentence shouldn't start
    # or end with ，；：、).
    return re.sub(
        r'^[，；：、\s]+|[，；：、\s]+$',
        '',
        out,
    )


MIN_CJK_LEN = 5    # require at least one 五言 half-line worth of characters
MAX_CJK_LEN = 20   # drop overly long sentences (prose-essay style)
MIN_POEM_LINES = 2 # drop entries that look like prose remnants


def split_into_sentences(text: str) -> list[str]:
    """Split a poem body into full sentences. Sentence boundaries are
    `。 ！ ？` (sentence-final punctuation) and line breaks; commas and
    other intra-sentence punctuation are PRESERVED inside each sentence."""
    text = re.sub(r'[（\(][^）\)]*一作[^）\)]*[）\)]', '', text)
    text = re.sub(r'[（\(][^）\)]{1,30}[）\)]', '', text)

    sentences: list[str] = []
    for raw_line in text.split('\n'):
        raw_line = raw_line.strip()
        if not raw_line:
            continue
        # Split on sentence-final punctuation only.
        for part in re.split(r'[。！？]', raw_line):
            cleaned = clean_sentence(part)
            n = _cjk_count(cleaned)
            # Reject too-short (degenerate puzzle) and too-long (prose-essay
            # style) sentences. Classical 诗 / 词 sentences are typically
            # 5–14 CJK chars after the comma; 20 leaves slack for long 词
            # clauses without admitting prose.
            if MIN_CJK_LEN <= n <= MAX_CJK_LEN:
                sentences.append(cleaned)
    return sentences


def parse_poem_page(html: str, poem_id_str: str) -> dict | None:
    zhengwen_pattern = re.compile(
        r'<div id="zhengwen' + re.escape(poem_id_str) + r'">(.*?)</div>\s*</div>',
        re.DOTALL,
    )
    match = zhengwen_pattern.search(html)
    if not match:
        zhengwen_pattern2 = re.compile(
            r'<div id="zhengwen' + re.escape(poem_id_str) + r'">(.*?)<div class="tool">',
            re.DOTALL,
        )
        match = zhengwen_pattern2.search(html)
        if not match:
            return None

    block = match.group(1)

    h1_match = re.search(r'<h1[^>]*>(.*?)</h1>', block, re.DOTALL)
    if h1_match:
        title = strip_html_tags(h1_match.group(1)).strip()
    else:
        b_match = re.search(r'<b>(.*?)</b>', block, re.DOTALL)
        if not b_match:
            return None
        title = strip_html_tags(b_match.group(1)).strip()
    if not title:
        return None

    dynasty_match = re.search(r'cstr=[^"]*">〔([^〕]+)〕</a>', block)
    if not dynasty_match:
        return None
    dynasty = DYNASTY_MAP.get(dynasty_match.group(1).strip())
    if dynasty is None:
        return None

    source_match = re.search(r'<p class="source">(.*?)</p>', block, re.DOTALL)
    if not source_match:
        return None
    source_block = source_match.group(1)

    before_dynasty = re.split(r'<a[^>]+cstr=[^>]+>', source_block)[0]
    author = strip_html_tags(before_dynasty).strip()
    author = re.sub(r'[\(（][^)）]*[\)）]', '', author).strip()
    if not author:
        return None

    contson_match = re.search(
        r'<div class="contson" id="contson' + re.escape(poem_id_str) + r'">(.*?)</div>',
        html, re.DOTALL,
    )
    if not contson_match:
        return None

    body_html = contson_match.group(1)
    body_html = re.sub(r'<br\s*/?>', '\n', body_html, flags=re.IGNORECASE)
    body_text = strip_html_tags(body_html)
    lines = split_into_sentences(body_text)
    if not lines:
        return None

    return {
        "title": title,
        "author": author,
        "dynasty": dynasty,
        "lines_text": lines,
    }


def fetch_and_parse(pid: str) -> tuple[str, dict | None]:
    html = fetch(f"{BASE_URL}/shiwenv_{pid}.aspx")
    if not html:
        return pid, None
    return pid, parse_poem_page(html, pid)


def main() -> None:
    script_dir = os.path.dirname(os.path.abspath(__file__))
    repo_root = os.path.dirname(script_dir)
    output_path = os.path.join(repo_root, "src", "data", "poems.json")

    print("Step 1: Collecting poem IDs from index pages...", file=sys.stderr, flush=True)
    id_order: list[str] = []
    seen_ids: set[str] = set()

    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as ex:
        for idx_url, html in zip(INDEX_PAGES, ex.map(fetch, INDEX_PAGES)):
            if not html:
                print(f"  [ERROR] Could not fetch {idx_url}", file=sys.stderr)
                sys.exit(1)
            ids = extract_poem_ids(html)
            new = [i for i in ids if i not in seen_ids]
            for i in new:
                seen_ids.add(i)
                id_order.append(i)
            print(f"  {idx_url}: {len(ids)} links ({len(new)} new), total unique={len(id_order)}", file=sys.stderr, flush=True)

    print(f"\nStep 2: Fetching {len(id_order)} poem detail pages ({MAX_WORKERS} workers)...", file=sys.stderr, flush=True)

    results: dict[str, dict | None] = {}
    done = 0
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as ex:
        futs = [ex.submit(fetch_and_parse, pid) for pid in id_order]
        for fut in as_completed(futs):
            pid, parsed = fut.result()
            results[pid] = parsed
            done += 1
            if done % 50 == 0:
                tang = sum(1 for v in results.values() if v and v["dynasty"] == "tang")
                song = sum(1 for v in results.values() if v and v["dynasty"] == "song")
                print(f"  [{done}/{len(id_order)}] tang={tang} song={song}", file=sys.stderr, flush=True)

    print("\nStep 3: Assembling and validating...", file=sys.stderr, flush=True)

    poems: list[dict] = []
    seen_title_author: set[tuple] = set()
    poem_id_counter = 0
    line_id_counter = 0
    tang_count = 0
    song_count = 0
    skip_dynasty = 0
    skip_duplicate = 0
    skip_prose = 0

    # Preserve index order, not future-completion order
    for pid in id_order:
        poem_data = results.get(pid)
        if poem_data is None:
            skip_dynasty += 1
            continue
        key = (poem_data["title"], poem_data["author"])
        if key in seen_title_author:
            skip_duplicate += 1
            continue
        # Anything that ends up with fewer than MIN_POEM_LINES surviving
        # sentences (typically prose essays whose long sentences were all
        # filtered by MAX_CJK_LEN) is dropped as a non-poem.
        if len(poem_data["lines_text"]) < MIN_POEM_LINES:
            skip_prose += 1
            continue
        seen_title_author.add(key)
        poem_id_counter += 1
        p_id = poem_id_counter

        lines = []
        for line_text in poem_data["lines_text"]:
            line_id_counter += 1
            lines.append({"id": line_id_counter, "text": line_text})

        poems.append({
            "id": p_id,
            "title": poem_data["title"],
            "author": poem_data["author"],
            "dynasty": poem_data["dynasty"],
            "lines": lines,
        })
        if poem_data["dynasty"] == "tang":
            tang_count += 1
        else:
            song_count += 1

    total_lines = sum(len(p["lines"]) for p in poems)
    print(f"  Total poems: {len(poems)} (tang={tang_count}, song={song_count})", file=sys.stderr, flush=True)
    print(f"  Total lines: {total_lines}", file=sys.stderr, flush=True)
    print(f"  Skipped (likely prose, <{MIN_POEM_LINES} qualifying sentences): {skip_prose}", file=sys.stderr, flush=True)
    print(f"  Skipped (dynasty / parse fail): {skip_dynasty}", file=sys.stderr, flush=True)
    print(f"  Skipped (duplicate title+author): {skip_duplicate}", file=sys.stderr, flush=True)

    poem_ids = [p["id"] for p in poems]
    assert len(poem_ids) == len(set(poem_ids)), "Duplicate poem IDs!"
    line_ids = [l["id"] for p in poems for l in p["lines"]]
    assert len(line_ids) == len(set(line_ids)), "Duplicate line IDs!"

    # Only sentence-terminal punctuation and structural marks should be
    # absent from a `line.text` now — intra-sentence ，；：、 are preserved.
    forbidden_punc = set('。！？「」『』《》—“”‘’.-:;!?()（）[]【】…·~～·　​﻿""\'\'\'\"')
    for p in poems:
        for l in p["lines"]:
            for ch in l["text"]:
                assert ch not in forbidden_punc, (
                    f"Forbidden char in poem {p['id']}: '{ch}' in '{l['text']}'"
                )

    if tang_count < 300:
        print(f"  [WARN] tang_count={tang_count} < 300", file=sys.stderr, flush=True)
    if song_count < 200:
        print(f"  [WARN] song_count={song_count} < 200", file=sys.stderr, flush=True)
    if total_lines < 1500:
        print(f"  [WARN] total_lines={total_lines} < 1500", file=sys.stderr, flush=True)

    print(f"\nStep 4: Writing {output_path}", file=sys.stderr, flush=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(poems, f, ensure_ascii=False, indent=2)
    print("Done.", file=sys.stderr, flush=True)


if __name__ == "__main__":
    main()
