'use client';

import { useRef, useState } from 'react';

/** N separate boxes (design style) that submit as one hidden field. Supports paste. */
export function OtpInput({ length = 6, name = 'code' }: { length?: number; name?: string }) {
  const [vals, setVals] = useState<string[]>(Array(length).fill(''));
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const setAt = (i: number, v: string) => {
    const digits = v.replace(/\D/g, '');
    if (digits.length > 1) {
      // pasted a full code
      const next = [...vals];
      for (let k = 0; k < length - i && k < digits.length; k++) next[i + k] = digits[k]!;
      setVals(next);
      refs.current[Math.min(length - 1, i + digits.length)]?.focus();
      return;
    }
    const next = [...vals];
    next[i] = digits;
    setVals(next);
    if (digits && i < length - 1) refs.current[i + 1]?.focus();
  };

  return (
    <div className="otp" style={{ justifyContent: 'center' }}>
      {vals.map((v, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          aria-label={`Digit ${i + 1}`}
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          value={v}
          autoFocus={i === 0}
          onChange={(e) => setAt(i, e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Backspace' && !vals[i] && i > 0) refs.current[i - 1]?.focus();
          }}
        />
      ))}
      <input type="hidden" name={name} value={vals.join('')} />
    </div>
  );
}
