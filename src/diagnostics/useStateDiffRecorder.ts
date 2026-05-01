// React hook that records normalized state snapshots for the active match
// into the global stateDiffStore. Mounted once per page (solo or online).
import { useEffect, useRef } from "react";
import type { MatchState } from "@/game/types";
import {
  buildSnapshot,
  stateDiffStore,
  type ChatLike,
  type DiffMode,
  type StateSnapshot,
} from "./stateDiff";

interface Options {
  mode: DiffMode;
  /** Set to true to disable the recorder without unmounting. */
  paused?: boolean;
}

/** Watches `match` and `chat` and pushes a snapshot whenever an observable
 *  transition happens. The store dedupes identical trailing snapshots. */
export function useStateDiffRecorder(
  match: MatchState | null | undefined,
  chat: ChatLike[] | null | undefined,
  opts: Options,
) {
  const startedRef = useRef(false);
  const seqRef = useRef(0);
  const startTsRef = useRef(0);

  useEffect(() => {
    if (!match) return;
    if (opts.paused) return;
    if (!startedRef.current) {
      stateDiffStore.start(opts.mode);
      startedRef.current = true;
      seqRef.current = 0;
      startTsRef.current = Date.now();
    }
    const trigger: StateSnapshot["trigger"] = seqRef.current === 0 ? "init" : "tick";
    const snap = buildSnapshot(match, chat ?? [], {
      mode: opts.mode,
      seq: seqRef.current,
      tRel: Date.now() - startTsRef.current,
      trigger,
    });
    stateDiffStore.push(opts.mode, {
      round: snap.round,
      phase: snap.phase,
      turn: snap.turn,
      mano: snap.mano,
      dealer: snap.dealer,
      handsCount: snap.handsCount,
      tricksCount: snap.tricksCount,
      currentTrickCards: snap.currentTrickCards,
      trucLevel: snap.trucLevel,
      trucKind: snap.trucKind,
      envitKind: snap.envitKind,
      envitLevel: snap.envitLevel,
      envitResolved: snap.envitResolved,
      males: snap.males,
      bones: snap.bones,
      camesWon: snap.camesWon,
      chatCount: snap.chatCount,
      lastChatPhraseId: snap.lastChatPhraseId,
      trigger,
    });
    seqRef.current += 1;
    // Re-run on every match update; the store dedupes equal snapshots.
  }, [match, chat, opts.mode, opts.paused]);
}