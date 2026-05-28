// Shared CJK character test. Covers CJK Unified Ideographs (U+4E00–U+9FFF)
// plus Extension A (U+3400–U+4DBF), which together include essentially every
// character in the curated classical-Chinese dataset.
export const CJK_RE = /[一-鿿㐀-䶿]/;

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
