// Shared reconnection helpers for Supabase Realtime channels and presence.
//
// Goals:
//  - When a channel reports CHANNEL_ERROR / TIMED_OUT / CLOSED unexpectedly,
//    schedule a reconnection attempt with exponential backoff + jitter.
//  - When the browser regains network (`online`) or the tab becomes visible
//    again (`visibilitychange`), trigger an immediate resync.
//  - Always re-fetch authoritative state on reconnect, so the game state
//    stays consistent with the server even if we missed realtime events
//    while disconnected.
//
// The helpers here are intentionally framework-agnostic: they only deal with
// scheduling. Callers wire the actual `subscribe()` / `track()` / `refresh()`
// logic through the provided callbacks.

import { useEffect, useRef } from "react";

const BASE_DELAY_MS = 500;
const MAX_DELAY_MS = 15_000;

export function backoffDelay(attempt: number): number {
  const exp = Math.min(MAX_DELAY_MS, BASE_DELAY_MS * 2 ** Math.min(attempt, 6));
  // Full jitter: [0, exp]
  return Math.floor(Math.random() * exp);
}

/**
 * Subscribe to global "we should try reconnecting now" signals:
 *  - `online` event from `window` (network restored)
 *  - `visibilitychange` becoming visible (tab back in foreground)
 *
 * The callback is debounced via a microtask flag so multiple signals firing
 * back-to-back only trigger one reconnect attempt.
 */
export function useReconnectSignals(onSignal: () => void, enabled = true) {
  const cbRef = useRef(onSignal);
  cbRef.current = onSignal;

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;
    let scheduled = false;
    const fire = () => {
      if (scheduled) return;
      scheduled = true;
      queueMicrotask(() => {
        scheduled = false;
        try { cbRef.current(); } catch { /* ignore */ }
      });
    };
    const onOnline = () => fire();
    const onVisible = () => {
      if (document.visibilityState === "visible") fire();
    };
    window.addEventListener("online", onOnline);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("online", onOnline);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [enabled]);
}