import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type CompositionEvent,
} from 'react';
import { CJK_RE } from '../engine/cjk';

function filterCJK(input: string, max: number): string {
  let out = '';
  for (const ch of input) {
    if (CJK_RE.test(ch)) {
      out += ch;
      if (out.length >= max) break;
    }
  }
  return out;
}

export interface GuessInputProps {
  length: number;
  value: string;
  disabled: boolean;
  onChange: (next: string) => void;
  onSubmit: () => void;
}

export function GuessInput({
  length,
  value,
  disabled,
  onChange,
  onSubmit,
}: GuessInputProps) {
  const ref = useRef<HTMLInputElement>(null);

  // Internal draft tracked separately from the parent's committed `value`.
  // During an IME composition, the draft holds whatever the IME is showing
  // (including in-progress pinyin); the parent state is only updated once
  // composition ends. This is what lets a 5-char puzzle still accept a
  // pinyin draft longer than 5 letters at the tail of the input.
  const [draft, setDraft] = useState(value);
  const composingRef = useRef(false);

  // Pull the parent's value into the draft when it changes for any reason
  // OTHER than ongoing IME (e.g. submit cleared it, or restored on reload).
  useEffect(() => {
    if (!composingRef.current) setDraft(value);
  }, [value]);

  useEffect(() => {
    if (!disabled) ref.current?.focus();
  }, [disabled, length]);

  // The submit button can only activate when the committed value (parent
  // state) is the full answer-length and entirely CJK. During composition
  // the parent value lags, so this naturally stays false until commit.
  const ready =
    !disabled &&
    value.length === length &&
    [...value].every((ch) => CJK_RE.test(ch));

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (composingRef.current) {
      // Mid-composition: pass pinyin/Latin through so the IME draft stays
      // visible. Parent state stays put; we'll push filtered text up in
      // onCompositionEnd.
      setDraft(raw);
    } else {
      // Direct input (typing without an IME, paste, backspace, etc.) —
      // filter BEFORE updating the draft so a typed comma never flashes
      // in the input element.
      const filtered = filterCJK(raw, length);
      setDraft(filtered);
      onChange(filtered);
    }
  };

  const handleCompositionEnd = (e: CompositionEvent<HTMLInputElement>) => {
    composingRef.current = false;
    const filtered = filterCJK(e.currentTarget.value, length);
    setDraft(filtered);
    if (filtered !== value) onChange(filtered);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (ready) onSubmit();
      }}
      className="flex flex-col items-center gap-3"
    >
      <input
        ref={ref}
        type="text"
        inputMode="text"
        autoCapitalize="none"
        autoComplete="off"
        spellCheck={false}
        value={draft}
        disabled={disabled}
        onCompositionStart={() => {
          composingRef.current = true;
        }}
        onCompositionEnd={handleCompositionEnd}
        onChange={handleChange}
        className="w-full max-w-sm rounded-lg border border-[#3a3a3c]
                   bg-[#1a1a1b] px-3 py-2 text-center text-xl tracking-widest
                   focus:border-white outline-none"
        placeholder={`輸入 ${length} 字`}
      />
      <button type="submit" disabled={!ready} className="btn-primary">
        提交
      </button>
    </form>
  );
}
