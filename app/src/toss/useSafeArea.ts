import { useEffect, useState } from 'react';
import { SafeAreaInsets } from '@apps-in-toss/web-framework';

export interface Insets {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

const ZERO: Insets = { top: 0, bottom: 0, left: 0, right: 0 };

/**
 * Safe Area 여백(px)을 구독해요. (지침 4-2)
 * 토스 환경이 아니면 0을 반환해요.
 */
export function useSafeArea(): Insets {
  const [insets, setInsets] = useState<Insets>(() => {
    try {
      return SafeAreaInsets.get();
    } catch {
      return ZERO;
    }
  });

  useEffect(() => {
    try {
      const cleanup = SafeAreaInsets.subscribe({
        onEvent: (next: Insets) => setInsets(next),
      });
      return () => cleanup?.();
    } catch {
      return undefined;
    }
  }, []);

  return insets;
}
