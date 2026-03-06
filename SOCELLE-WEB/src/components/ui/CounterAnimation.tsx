import { useEffect, useRef, useState } from 'react';

interface CounterAnimationProps {
  /** Target numeric value to count up to */
  value: number;
  /** Animation duration in milliseconds (default 1500) */
  duration?: number;
  /** Prefix displayed before the number (e.g. "$") */
  prefix?: string;
  /** Suffix displayed after the number (e.g. "%") */
  suffix?: string;
  /** Additional CSS classes */
  className?: string;
}

/** Format a number with commas for thousands separators */
function formatNumber(n: number): string {
  // Handle decimals: keep the same decimal precision as the target
  return n.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: Number.isInteger(n) ? 0 : 2,
  });
}

/** Ease-out cubic: decelerating curve */
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Animated number counter that counts from 0 to a target value.
 * Uses requestAnimationFrame for smooth 60fps animation with
 * ease-out cubic easing and comma-formatted output.
 */
export function CounterAnimation({
  value,
  duration = 1500,
  prefix = '',
  suffix = '',
  className = '',
}: CounterAnimationProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const prevValueRef = useRef<number>(0);

  useEffect(() => {
    const startValue = prevValueRef.current;
    const delta = value - startValue;

    // Skip animation if value hasn't changed
    if (delta === 0) return;

    startTimeRef.current = 0;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);
      const current = startValue + delta * easedProgress;

      setDisplayValue(current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        // Ensure we land exactly on target
        setDisplayValue(value);
        prevValueRef.current = value;
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [value, duration]);

  const formatted = Number.isInteger(value)
    ? formatNumber(Math.round(displayValue))
    : formatNumber(displayValue);

  return (
    <span className={`animate-counter-up font-mono tabular-nums ${className}`}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
