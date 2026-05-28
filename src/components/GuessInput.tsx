import { useEffect, useRef } from 'react';

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

  // Keep focus when not disabled.
  useEffect(() => {
    if (!disabled) ref.current?.focus();
  }, [disabled, length]);

  const ready = value.length === length;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (ready && !disabled) onSubmit();
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
        maxLength={length}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value.slice(0, length))}
        className="w-full max-w-sm rounded-lg border border-[#3a3a3c]
                   bg-[#1a1a1b] px-3 py-2 text-center text-xl tracking-widest
                   focus:border-white outline-none"
        placeholder={`輸入 ${length} 字`}
      />
      <button type="submit" disabled={!ready || disabled} className="btn-primary">
        提交
      </button>
    </form>
  );
}
