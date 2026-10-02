import { useEffect, useRef, useState } from 'react';
import { useAppearanceStore } from '@stores/appearanceStore';

/** Eased number count-up. Respects the `animations` flag. */
export function useCountUp(target: number, dur = 900): number {
  const animations = useAppearanceStore((s) => s.animations);
  const [val, setVal] = useState(animations ? 0 : target);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (!animations) {
      setVal(target);
      return;
    }
    const start = Date.now();
    const from = 0;
    const tick = () => {
      const p = Math.min(1, (Date.now() - start) / dur);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(from + (target - from) * eased));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current != null) cancelAnimationFrame(raf.current);
    };
  }, [target, dur, animations]);

  return val;
}
