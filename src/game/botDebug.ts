// Store en memòria per a les decisions del bot, consumit per la UI de debug.

export interface BotDecisionEntry {
  id: number;
  ts: number;
  player: number;
  kind: "envit" | "truc";
  decision: string;
  level: string | number;
  myEnvit?: number;
  isMano?: boolean;
  pWin?: number;
  evAccept?: number;
  evReject?: number;
  trucStrength?: number;
  trucBonus?: number;
  // ----- Camps específics per a la decisió de truc oportunista (3a baza) -----
  /** Quantes cartes desconegudes tenen força > la millor del bot. */
  strongerThanMe?: number;
  /** Bazas guanyades pel meu equip fins ara (0–2). */
  myWins?: number;
  /** Bazas guanyades pel rival fins ara (0–2). */
  oppWins?: number;
  /** Marcador del meu equip dins la cama actual (0–24). */
  myScore?: number;
  /** Marcador del rival dins la cama actual (0–24). */
  oppScore?: number;
  /** Probabilitat calculada de cantar (0–1) abans del Math.random. */
  probability?: number;
  /** True si el meu equip va per davant o empatat en bazas. */
  winningTrickPosition?: boolean;
  /** Curt: motiu / etiqueta del subcas (ex: "3a-baza-millor", "3a-baza-quasi-millor"). */
  trigger?: string;
  extra?: string;
}

const MAX_ENTRIES = 30;
let nextId = 1;
const entries: BotDecisionEntry[] = [];
const listeners = new Set<() => void>();

export function recordBotDecision(e: Omit<BotDecisionEntry, "id" | "ts">): void {
  entries.unshift({ ...e, id: nextId++, ts: Date.now() });
  if (entries.length > MAX_ENTRIES) entries.length = MAX_ENTRIES;
  listeners.forEach((l) => l());
}

export function getBotDecisions(): BotDecisionEntry[] {
  return entries;
}

export function subscribeBotDecisions(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function clearBotDecisions(): void {
  entries.length = 0;
  listeners.forEach((l) => l());
}