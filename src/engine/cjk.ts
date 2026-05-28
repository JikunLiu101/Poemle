// Shared CJK character test. Covers CJK Unified Ideographs (U+4E00–U+9FFF)
// plus Extension A (U+3400–U+4DBF), which together include essentially every
// character in the curated classical-Chinese dataset.
export const CJK_RE = /[一-鿿㐀-䶿]/;

// Intra-sentence punctuation that the player is allowed to leave in the
// input — visible but ignored when the guess is evaluated.
export const INTRA_PUNCT_RE = /[，；：、]/;

export function isCJK(ch: string): boolean {
  return CJK_RE.test(ch);
}

export function onlyCJK(s: string): string {
  let out = '';
  for (const ch of s) {
    if (CJK_RE.test(ch)) out += ch;
  }
  return out;
}

export function cjkCount(s: string): number {
  let n = 0;
  for (const ch of s) if (CJK_RE.test(ch)) n++;
  return n;
}

/**
 * Sanitise raw input from the text field. Keeps CJK characters (up to
 * `maxCJK` of them) and intra-sentence punctuation; drops Latin letters,
 * digits, sentence-final punctuation, and anything else.
 */
export function filterInput(raw: string, maxCJK: number): string {
  let cjk = 0;
  let out = '';
  for (const ch of raw) {
    if (CJK_RE.test(ch)) {
      if (cjk >= maxCJK) continue;
      out += ch;
      cjk++;
    } else if (INTRA_PUNCT_RE.test(ch)) {
      out += ch;
    }
  }
  return out;
}
