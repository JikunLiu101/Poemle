export const MAX_ATTEMPTS = 8;

export const PUNCTUATION_SET = new Set<string>([
  '。', '，', '！', '？', '、', '；', '：',
  '「', '」', '『', '』', '《', '》', '—',
  '“', '”', '‘', '’', // “ ” ‘ ’ — typographic quotes used in prose excerpts
]);

export const STORAGE_KEY = 'poemle_active_puzzle';
