// State-diff recorder: captures normalized snapshots of the live match state
// (turns, actions, timers, chat) so a solo-bots run and an online run can be
// compared event-by-event to detect divergences in rules, timing or bot logic.
//
// Design goals:
//  - Mode-agnostic: identical snapshot shape for "solo" and "online".
//  - Cheap: only normalized scalars (no card identities, no PII) — safe to
//    persist to localStorage and to ship via export.
//  - Deterministic alignment: snapshots are keyed by `(historyLen, eventSeq)`
//    where `eventSeq` increments inside the current round on every observable
//    transition (phase / turn / shout / chat). This gives a stable index to
//    align two recordings of the same scripted scenario.
//  - Timing as relative offsets from the first snapshot, so two recordings
//    started at different wall-clock times still align.
import type {
  EnvitState,
  GamePhase,
  MatchState,
  PlayerId,
  TeamId,
  TrucState,
} from "@/game/types";

export type DiffMode = "solo" | "online";

export interface ChatLike {
  /** Stable id; used to dedupe across re-renders. */
  id: string | number;
  /** Seat (0-3). Accept either `seat` or `player` to match both code paths. */
  seat?: PlayerId;
  player?: PlayerId;
  /** Logical phrase id (we record the id, never raw user text). */
  phraseId?: string;
  /** Monotonic timestamp (ms). */
  at?: number;
  timestamp?: number;
}

export interface StateSnapshot {
  /** Monotonic ordering inside the recording. */
  seq: number;
  /** Relative ms from recording start. */
  tRel: number;
  mode: DiffMode;
  /** Round index (== history.length when round in flight). */
  round: number;
  phase: GamePhase;
  turn: PlayerId;
  mano: PlayerId;
  dealer: PlayerId;
  /** Cards remaining in each hand (count only, never the cards themselves). */
  handsCount: [number, number, number, number];
  /** Number of completed tricks in the current round. */
  tricksCount: number;
  /** Cards on the table for the in-progress trick. */
  currentTrickCards: number;
  /** Truc level (0/2/3/4/24) and pending flag. */
  trucLevel: 0 | 2 | 3 | 4 | 24;
  trucKind: TrucState["kind"];
  /** Envit kind + level if pending. */
  envitKind: EnvitState["kind"];
  envitLevel: 0 | 2 | 4 | "falta";
  envitResolved: boolean;
  /** Cama / cames score. */
  males: { nos: number; ells: number };
  bones: { nos: number; ells: number };
  camesWon: { nos: number; ells: number };
  /** Cumulative chat phrase count (per seat). Used to verify both modes
   *  emit the same number of bot/partner chat lines at each phase. */
  chatCount: [number, number, number, number];
  /** Last chat phrase id (or null) — useful for spotting divergent intents. */
  lastChatPhraseId: string | null;
  /** Trigger that produced this snapshot (debug aid). */
  trigger:
    | "init"
    | "turn"
    | "phase"
    | "trick"
    | "truc"
    | "envit"
    | "round-end"
    | "score"
    | "chat"
    | "tick";
}

function teamScore(s: MatchState, t: TeamId, key: "males" | "bones"): number {
  return s.scores?.[t]?.[key] ?? 0;
}

function envitLevelOf(e: EnvitState): 0 | 2 | 4 | "falta" {
  if (e.kind === "pending") return e.level;
  if (e.kind === "accepted" || e.kind === "rejected") return 0;
  return 0;
}

function trucLevelOf(t: TrucState): 0 | 2 | 3 | 4 | 24 {
  if (t.kind === "none") return 0;
  if (t.kind === "rejected") return 0;
  return t.level;
}

/** Build a snapshot from the current match + chat state. Pure function — no
 *  side effects. */
export function buildSnapshot(
  match: MatchState,
  chat: ChatLike[],
  ctx: { mode: DiffMode; seq: number; tRel: number; trigger: StateSnapshot["trigger"] },
): StateSnapshot {
  const r = match.round;
  const handsCount: [number, number, number, number] = [
    r.hands[0]?.length ?? 0,
    r.hands[1]?.length ?? 0,
    r.hands[2]?.length ?? 0,
    r.hands[3]?.length ?? 0,
  ];
  const lastTrick = r.tricks[r.tricks.length - 1];
  const currentTrickCards = lastTrick && !lastTrick.winner && !lastTrick.parda
    ? lastTrick.cards.length
    : 0;
  const tricksCount = r.tricks.filter((t) => t.winner !== undefined || t.parda).length;
  const chatCount: [number, number, number, number] = [0, 0, 0, 0];
  for (const m of chat) {
    const seat = (m.seat ?? m.player) as PlayerId | undefined;
    if (seat !== undefined && seat >= 0 && seat <= 3) chatCount[seat] += 1;
  }
  const last = chat[chat.length - 1];
  return {
    seq: ctx.seq,
    tRel: ctx.tRel,
    mode: ctx.mode,
    round: match.history?.length ?? 0,
    phase: r.phase,
    turn: r.turn,
    mano: r.mano,
    dealer: match.dealer,
    handsCount,
    tricksCount,
    currentTrickCards,
    trucLevel: trucLevelOf(r.trucState),
    trucKind: r.trucState.kind,
    envitKind: r.envitState.kind,
    envitLevel: envitLevelOf(r.envitState),
    envitResolved: r.envitResolved,
    males: { nos: teamScore(match, "nos", "males"), ells: teamScore(match, "ells", "males") },
    bones: { nos: teamScore(match, "nos", "bones"), ells: teamScore(match, "ells", "bones") },
    camesWon: { nos: match.camesWon?.nos ?? 0, ells: match.camesWon?.ells ?? 0 },
    chatCount,
    lastChatPhraseId: last?.phraseId ?? null,
    trigger: ctx.trigger,
  };
}

/** Returns true when two snapshots represent a different observable game
 *  state (ignoring tRel and seq; those are recording-local). */
export function snapshotsDiffer(a: StateSnapshot, b: StateSnapshot): boolean {
  if (a.phase !== b.phase) return true;
  if (a.turn !== b.turn) return true;
  if (a.mano !== b.mano) return true;
  if (a.dealer !== b.dealer) return true;
  if (a.round !== b.round) return true;
  if (a.tricksCount !== b.tricksCount) return true;
  if (a.currentTrickCards !== b.currentTrickCards) return true;
  if (a.trucLevel !== b.trucLevel || a.trucKind !== b.trucKind) return true;
  if (a.envitKind !== b.envitKind || a.envitLevel !== b.envitLevel || a.envitResolved !== b.envitResolved) return true;
  if (a.handsCount.some((c, i) => c !== b.handsCount[i])) return true;
  if (a.chatCount.some((c, i) => c !== b.chatCount[i])) return true;
  if (a.lastChatPhraseId !== b.lastChatPhraseId) return true;
  if (a.males.nos !== b.males.nos || a.males.ells !== b.males.ells) return true;
  if (a.bones.nos !== b.bones.nos || a.bones.ells !== b.bones.ells) return true;
  if (a.camesWon.nos !== b.camesWon.nos || a.camesWon.ells !== b.camesWon.ells) return true;
  return false;
}

// ──────────────────────────────────────────────────────────────────────
// Recording session — global per-mode store with subscribe API
// ──────────────────────────────────────────────────────────────────────

export interface RecordingSession {
  mode: DiffMode;
  startedAt: number;
  snapshots: StateSnapshot[];
}

type Listener = () => void;

class SessionStore {
  private sessions: Record<DiffMode, RecordingSession> = {
    solo: { mode: "solo", startedAt: 0, snapshots: [] },
    online: { mode: "online", startedAt: 0, snapshots: [] },
  };
  private listeners = new Set<Listener>();
  private seq: Record<DiffMode, number> = { solo: 0, online: 0 };

  start(mode: DiffMode) {
    this.sessions[mode] = { mode, startedAt: Date.now(), snapshots: [] };
    this.seq[mode] = 0;
    this.emit();
  }

  push(mode: DiffMode, partial: Omit<StateSnapshot, "seq" | "tRel" | "mode">) {
    const s = this.sessions[mode];
    if (s.startedAt === 0) this.start(mode);
    const seq = this.seq[mode]++;
    const tRel = Date.now() - this.sessions[mode].startedAt;
    const snap: StateSnapshot = { ...partial, seq, tRel, mode } as StateSnapshot;
    // Dedupe trailing identical snapshots (cheap noise filter).
    const last = s.snapshots[s.snapshots.length - 1];
    if (last && !snapshotsDiffer(last, snap)) return;
    s.snapshots.push(snap);
    this.emit();
  }

  get(mode: DiffMode): RecordingSession {
    return this.sessions[mode];
  }

  clear(mode: DiffMode) {
    this.sessions[mode] = { mode, startedAt: 0, snapshots: [] };
    this.seq[mode] = 0;
    this.emit();
  }

  subscribe(l: Listener) {
    this.listeners.add(l);
    return () => this.listeners.delete(l);
  }

  private emit() { for (const l of this.listeners) l(); }
}

export const stateDiffStore = new SessionStore();

// ──────────────────────────────────────────────────────────────────────
// Comparison
// ──────────────────────────────────────────────────────────────────────

export interface DiffEntry {
  index: number;
  field: keyof StateSnapshot | string;
  solo: unknown;
  online: unknown;
}

export interface CompareReport {
  alignedCount: number;
  soloOnlyTail: number;
  onlineOnlyTail: number;
  divergences: DiffEntry[];
}

const COMPARABLE_FIELDS: (keyof StateSnapshot)[] = [
  "phase", "turn", "mano", "dealer", "round",
  "tricksCount", "currentTrickCards",
  "trucLevel", "trucKind",
  "envitKind", "envitLevel", "envitResolved",
  "handsCount", "chatCount",
  "lastChatPhraseId",
  "males", "bones", "camesWon",
];

function eq(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((v, i) => eq(v, b[i]));
  }
  if (a && b && typeof a === "object" && typeof b === "object") {
    const ka = Object.keys(a as object);
    const kb = Object.keys(b as object);
    if (ka.length !== kb.length) return false;
    return ka.every((k) => eq((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]));
  }
  return false;
}

/** Compare two recordings position-by-position. Both should ideally have been
 *  recorded from a deterministic seeded scenario for meaningful results. */
export function compareSessions(
  solo: StateSnapshot[],
  online: StateSnapshot[],
): CompareReport {
  const n = Math.min(solo.length, online.length);
  const divergences: DiffEntry[] = [];
  for (let i = 0; i < n; i++) {
    const s = solo[i]; const o = online[i];
    for (const f of COMPARABLE_FIELDS) {
      if (!eq(s[f], o[f])) divergences.push({ index: i, field: f, solo: s[f], online: o[f] });
    }
  }
  return {
    alignedCount: n,
    soloOnlyTail: Math.max(0, solo.length - n),
    onlineOnlyTail: Math.max(0, online.length - n),
    divergences,
  };
}

/** Serialize a session for export / persistence. */
export function serializeSession(s: RecordingSession): string {
  return JSON.stringify(s, null, 2);
}