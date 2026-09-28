import { SafeArea } from 'capacitor-plugin-safe-area';
import { isNativePlatform } from './device';
import { useState, useEffect } from 'react';

export interface Insets {
  top: number;
  bottom: number;
  right: number;
  left: number;
}

const DEFAULT_INSETS: Insets = { top: 0, bottom: 0, right: 0, left: 0 };

/**
 * Initializes and synchronizes CSS safe-area variables (--sat, --sab, --sar, --sal)
 * on document.documentElement.
 */
export async function initSafeArea(): Promise<() => void> {
  if (!isNativePlatform() || typeof document === 'undefined') {
    return () => {};
  }

  const applyInsets = (insets: Insets) => {
    const root = document.documentElement.style;
    root.setProperty('--sat', `${insets.top}px`);
    root.setProperty('--sab', `${insets.bottom}px`);
    root.setProperty('--sar', `${insets.right}px`);
    root.setProperty('--sal', `${insets.left}px`);
  };

  try {
    const { insets } = await SafeArea.getSafeAreaInsets();
    applyInsets(insets);
  } catch (err) {
    console.warn('[Platform:SafeArea] Initial fetch failed:', err);
  }

  let handle: any = null;
  try {
    handle = await SafeArea.addListener('safeAreaChanged', (data) => {
      applyInsets(data.insets);
    });
  } catch (err) {
    console.warn('[Platform:SafeArea] Listener attachment failed:', err);
  }

  return () => {
    if (handle?.remove) {
      handle.remove();
    }
  };
}

/**
 * React Hook to access current insets in component space.
 */
export function useSafeAreaInsets(): Insets {
  const [insets, setInsets] = useState<Insets>(DEFAULT_INSETS);

  useEffect(() => {
    if (!isNativePlatform()) return;

    let active = true;
    SafeArea.getSafeAreaInsets()
      .then((res) => {
        if (active && res?.insets) {
          setInsets(res.insets);
        }
      })
      .catch(() => {});

    let handle: any = null;
    SafeArea.addListener('safeAreaChanged', (data) => {
      if (active && data?.insets) {
        setInsets(data.insets);
      }
    }).then((h) => {
      handle = h;
    }).catch(() => {});

    return () => {
      active = false;
      if (handle?.remove) handle.remove();
    };
  }, []);

  return insets;
}
