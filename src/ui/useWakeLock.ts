/**
 * Keep the screen awake while the countdown runs.
 *
 * A phone that sleeps at 30 seconds is the single most likely way this app gets
 * abandoned mid-wait: the screen goes dark, the moment is left alone with the
 * craving, and reopening takes a deliberate act at exactly the point where
 * deliberate acts are scarce.
 *
 * Three things make this less trivial than one API call:
 *
 * 1. The lock is dropped by the browser whenever the page is hidden, and it is
 *    *not* restored on return. Without the visibility listener it survives one
 *    switch to another app and then silently stops working.
 * 2. Support is uneven (Safari only from 16.4, and absent in some in-app
 *    browsers). Every failure is swallowed — a wait that works is worth more
 *    than an error about screen brightness.
 * 3. The request must be released when the wait ends, or the screen stays lit
 *    on a screen that no longer needs it and the battery pays for it.
 */

import { useEffect } from 'react';

interface WakeLockSentinelLike {
  released: boolean;
  release: () => Promise<void>;
}

type WakeLockCapableNavigator = Navigator & {
  wakeLock?: { request: (type: 'screen') => Promise<WakeLockSentinelLike> };
};

export function useWakeLock(active: boolean): void {
  useEffect(() => {
    if (!active) return;

    const api = (navigator as WakeLockCapableNavigator).wakeLock;
    if (!api) return;

    let sentinel: WakeLockSentinelLike | null = null;
    let cancelled = false;

    const acquire = async () => {
      if (cancelled || document.visibilityState !== 'visible') return;
      try {
        sentinel = await api.request('screen');
      } catch {
        // Denied, unsupported, or the tab lost focus mid-request. Not worth
        // telling the user about: the wait itself is unaffected.
      }
    };

    // Re-acquired on every return to the foreground, because the browser drops
    // the lock on hide and never gives it back on its own.
    const onVisibility = () => {
      if (document.visibilityState === 'visible' && (!sentinel || sentinel.released)) {
        void acquire();
      }
    };

    void acquire();
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisibility);
      void sentinel?.release().catch(() => undefined);
    };
  }, [active]);
}
