import { useEffect, useRef, type ChangeEvent, type CompositionEvent } from 'react';

// CJK Unified Ideographs (U+4E00–U+9FFF) plus Extension A (U+3400–U+4DBF).
// Together they cover essentially every character appearing in the curated
// classical-Chinese dataset.
const CJK_RE = /[一-鿿㐀-䶿]/;

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
  // True while an IME composition is in progress (pinyin → 漢字). During
  // composition the raw input contains Latin pinyin letters that we must NOT
  // filter or truncate — doing so would corrupt the IME state mid-keystroke.
  const composingRef = useRef(false);

  useEffect(() => {
    if (!disabled) ref.current?.focus();
  }, [disabled, length]);

  // Ready to submit only when the value is the right length AND fully CJK.
  // The CJK check is what gates the button while pinyin is still on screen.
  const ready =
    !disabled &&
    value.length === length &&
    [...value].every((ch) => CJK_RE.test(ch));

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (composingRef.current) {
      // Mid-composition: pass through so the IME can display its draft.
      onChange(raw);
    } else {
      onChange(filterCJK(raw, length));
    }
  };

  const handleCompositionEnd = (e: CompositionEvent<HTMLInputElement>) => {
    composingRef.current = false;
    onChange(filterCJK(e.currentTarget.value, length));
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
        value={value}
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
