/**
 * The signature motion of the product. Every changing figure transitions
 * digit by digit; digits that did not change do not move.
 * Stagger 14ms from the least significant digit.
 */
import { useEffect, useRef, useState } from 'react';

const DIGITS = ['0','1','2','3','4','5','6','7','8','9'];

function useReducedMotion() {
  const [r, setR] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setR(mq.matches);
    const on = (e: MediaQueryListEvent) => setR(e.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return r;
}

interface OdometerProps {
  /** Pre-formatted string. Digits animate, everything else is static. */
  value: string;
  className?: string;
  title?: string;
}

export function Odometer({ value, className = '', title }: OdometerProps) {
  const reduced = useReducedMotion();
  const prev = useRef<string>(value);
  const chars = value.split('');
  const prevChars = prev.current.split('');

  useEffect(() => { prev.current = value; }, [value]);

  // Count digits from the right so the least significant leads the stagger.
  let digitsFromRight = -1;
  const totalDigits = chars.filter((c) => /\d/.test(c)).length;

  return (
    <span className={`odo ${className}`} title={title} aria-label={value}>
      {chars.map((c, i) => {
        if (!/\d/.test(c)) {
          return <span key={`s${i}`} aria-hidden="true">{c}</span>;
        }
        digitsFromRight += 1;
        const idxFromRight = totalDigits - 1 - digitsFromRight;
        const d = Number(c);
        const changed = prevChars[i] !== c;
        const delay = reduced || !changed ? 0 : idxFromRight * 8;
        return (
          <span className="odo-col" key={`d${i}`} aria-hidden="true">
            <span
              className="odo-strip"
              style={{
                transform: `translateY(calc(${d} * -1.12em))`,
                transitionDelay: `${delay}ms`,
                transitionDuration: reduced ? '0ms' : undefined,
              }}
            >
              {DIGITS.map((g) => <span key={g}>{g}</span>)}
            </span>
          </span>
        );
      })}
    </span>
  );
}
