import { useEffect, useRef, useState } from 'react';

// ── AnimatedCounter — W12-36 ─────────────────────────────────────────
// Scroll-triggered animated number counter for public marketing pages.
// Uses IntersectionObserver to start counting only when visible.
// Supports string values like "340+", "98%", "12k+" — parses the
// numeric portion and preserves prefix/suffix characters.

interface AnimatedCounterProps {
  /** Target value — can be a number or formatted string like "340+", "98%", "12k+" */
  value: string | number;
  /** Animation duration in ms (default 1600) */
  duration?: number;
  /** Additional CSS classes for the rendered <span> */
  className?: string;
}

/** Ease-out cubic: fast start, gentle landing */
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/** Parse a value like "12k+" into { num: 12, prefix: '', suffix: 'k+' } */
function parseValue(raw: string | number): {
  num: number;
  prefix: string;
  suffix: string;
} {
  if (typeof raw === 'number') {
    return { num: raw, prefix: '', suffix: '' };
  }

  const str = raw.trim();

  // Extract leading non-numeric chars (prefix like "$")
  const prefixMatch = str.match(/^([^0-9]*)/);
  const prefix = prefixMatch?.[1] ?? '';

  // Extract trailing non-numeric chars (suffix like "+", "%", "k+", "hr")
  const suffixMatch = str.match(/([^0-9.]*)$/);
  const suffix = suffixMatch?.[1] ?? '';

  // Extract the numeric middle
  const numStr = str.slice(prefix.length, str.length - suffix.length);
  const num = parseFloat(numStr) || 0;

  return { num, prefix, suffix };
}

/** Format number with commas */
function formatNum(n: number, isInteger: boolean): string {
  return n.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: isInteger ? 0 : 1,
  });
}

export default function AnimatedCounter({
  value,
  duration = 1600,
  className = '',
}: AnimatedCounterProps) {
  const { num, prefix, suffix } = parseValue(value);
  const isInteger = Number.isInteger(num);

  const [display, setDisplay] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const rafRef = useRef<number>(0);

  // ── IntersectionObserver: trigger animation on scroll into view ────
  useEffect(() => {
    const el = ref.current;
    if (!el || hasAnimated) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasAnimated(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasAnimated]);

  // ── rAF animation: count from 0 → num ─────────────────────────────
  useEffect(() => {
    if (!hasAnimated || num === 0) return;

    let start = 0;

    const animate = (timestamp: number) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);

      setDisplay(num * eased);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setDisplay(num);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [hasAnimated, num, duration]);

  const formatted = isInteger ? formatNum(Math.round(display), true) : formatNum(display, false);

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {prefix}
      {hasAnimated ? formatted : '0'}
      {suffix}
    </span>
  );
}
