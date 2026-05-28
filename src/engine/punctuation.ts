import { PUNCTUATION_SET } from './constants';

export interface StripResult {
  /** Text with all punctuation removed. */
  clean: string;
  /** Map of ORIGINAL index → punctuation character. */
  punctuationSlots: Map<number, string>;
}

export function stripPunctuation(text: string): StripResult {
  const slots = new Map<number, string>();
  let clean = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (PUNCTUATION_SET.has(ch)) {
      slots.set(i, ch);
    } else {
      clean += ch;
    }
  }
  return { clean, punctuationSlots: slots };
}
