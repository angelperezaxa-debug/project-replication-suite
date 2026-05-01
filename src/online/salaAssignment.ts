import type { LobbyRoomDTO } from "@/online/rooms.functions";
import type { PlayerId } from "@/game/types";
import type { OnlinePlayer } from "@/online/useLobbyPresence";

export const SALA_SLUGS = ["la-falta", "truquers", "joc-fora", "9-bones"] as const;
export type SalaSlug = (typeof SALA_SLUGS)[number];

export const VISIBLE_TABLES_PER_SALA = 12;
export const VISIBLE_TABLES_DEFAULT = 4;
/**
 * Estructura única de la UI online: cada mesa té sempre 4 seients potencials
 * per a humans. Aquesta constant és l'única font de veritat per al nombre de
 * seients per mesa, tant en mesures reals com en placeholders.
 */
export const HUMAN_SEATS_PER_TABLE = 4;
/** Total de seients humans potencials per sala (12 mesures × 4 seients). */
export const HUMAN_SEATS_PER_SALA = VISIBLE_TABLES_PER_SALA * HUMAN_SEATS_PER_TABLE;

/** Hash determinista molt senzill (FNV-1a) sobre el codi de la mesa. */
function hashCode(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

/** Normalitza un codi de mesa abans de fer servir-lo per a matching o hash:
 *  - tracta `null`/`undefined` com a string buit
 *  - elimina espais a banda i banda
 *  - passa a majúscules per a un matching estable
 */
function normalizeCode(code: string | null | undefined): string {
  if (code == null) return "";
  return String(code).trim().toUpperCase();
}

/** Assigna una sala determinista a partir del codi de la mesa.
 *  Es considera "prefix de sala" tant `SLUG-` (separador guió) com el codi
 *  exactament igual al slug (sense sufix). En cas contrari, es reparteix per
 *  hash entre les SALA_SLUGS. Codis buits/nuls van sempre a la primera sala
 *  per estabilitat (mai han de generar excepcions). */
export function salaForRoom(room: { code: string | null | undefined }): SalaSlug {
  const upper = normalizeCode(room.code);
  if (upper.length === 0) return SALA_SLUGS[0];
  for (const slug of SALA_SLUGS) {
    const SLUG = slug.toUpperCase();
    if (upper === SLUG) return slug;
    if (upper.startsWith(`${SLUG}-`)) return slug;
  }
  const idx = hashCode(upper) % SALA_SLUGS.length;
  return SALA_SLUGS[idx];
}

/** Estats explícitament no jugables: la mesa no es pot unir ni mostrar com
 *  a "disponible" sota cap circumstància. */
export const NON_PLAYABLE_STATUSES = ["finished", "abandoned"] as const;
export type NonPlayableStatus = (typeof NON_PLAYABLE_STATUSES)[number];

export function isRoomNonPlayable(room: { status: LobbyRoomDTO["status"] }): boolean {
  return (NON_PLAYABLE_STATUSES as readonly string[]).includes(room.status);
}

/** Mesa té algun seient humà lliure? (només té sentit en estat "lobby"). */
export function roomHasFreeHumanSeat(room: LobbyRoomDTO): boolean {
  if (room.status !== "lobby") return false;
  if (isRoomNonPlayable(room)) return false;
  const seatKinds = Array.isArray(room.seatKinds) ? room.seatKinds : [];
  const players = Array.isArray(room.players) ? room.players : [];
  const used = new Set(players.map((p) => p.seat));
  return seatKinds.some((k, i) => k === "human" && !used.has(i as PlayerId));
}

/**
 * Quants seients humans lliures té una mesa real.
 * Una mesa en joc no té seients lliures (no s'hi pot unir).
 * Una mesa al lobby: els seients de tipus "human" no ocupats.
 */
export function freeHumanSeatsInRoom(room: LobbyRoomDTO): number {
  if (room.status !== "lobby") return 0;
  if (isRoomNonPlayable(room)) return 0;
  const seatKinds = Array.isArray(room.seatKinds) ? room.seatKinds : [];
  const players = Array.isArray(room.players) ? room.players : [];
  const used = new Set(players.map((p) => p.seat));
  let n = 0;
  for (let i = 0; i < seatKinds.length; i++) {
    if (seatKinds[i] === "human" && !used.has(i as PlayerId)) n++;
  }
  return n;
}

/**
 * Una mesa "placeholder" (no creada encara) sempre té
 * `HUMAN_SEATS_PER_TABLE` seients humans lliures.
 */
export const FREE_SEATS_PER_PLACEHOLDER = HUMAN_SEATS_PER_TABLE;

/** Mesa visible al lobby d'una sala: mateix criteri que Lobby.tsx.
 *  Només es consideren els estats "lobby" (amb seients lliures) i "playing".
 *  Qualsevol altre estat (p.ex. "finished") queda fora. */
export function isRoomVisibleInSala(room: LobbyRoomDTO, slug: SalaSlug): boolean {
  if (salaForRoom(room) !== slug) return false;
  if (isRoomNonPlayable(room)) return false;
  if (room.status === "playing") return true;
  if (room.status !== "lobby") return false;
  return roomHasFreeHumanSeat(room);
}

/** Mesa unible (té seients lliures) dins d'una sala. */
export function isRoomJoinableInSala(room: LobbyRoomDTO, slug: SalaSlug): boolean {
  return isRoomVisibleInSala(room, slug) && roomHasFreeHumanSeat(room);
}

/** Resum d'una sala: meses visibles (unibles + en joc) fins a 12 + placeholders.
 *  IMPORTANT: si hi ha més meses "playing" que el límit visible, prioritzem
 *  primer les unibles (per no perdre el comptador "disponible") i després
 *  omplim amb les "playing". Així mai apareix "0 disponibles" perquè totes
 *  les visibles estan en joc quan hi havia mesa lliure però fora del límit. */
export function summarizeSala(rooms: LobbyRoomDTO[], slug: SalaSlug) {
  const allVisible = rooms.filter((r) => isRoomVisibleInSala(r, slug));
  const joinableAll = allVisible.filter(roomHasFreeHumanSeat);
  const playingAll = allVisible.filter((r) => !roomHasFreeHumanSeat(r));
  // Prioritzem unibles abans de meses en joc dins del límit visible.
  const visible = [...joinableAll, ...playingAll].slice(0, VISIBLE_TABLES_PER_SALA);
  const placeholders = Math.max(0, VISIBLE_TABLES_PER_SALA - visible.length);
  const realJoinable = visible.filter(roomHasFreeHumanSeat).length;
  const playing = visible.length - realJoinable;
  const available = realJoinable + placeholders; // placeholders són sempre lliures
  const freeSeatsReal = visible.reduce((acc, r) => acc + freeHumanSeatsInRoom(r), 0);
  const availableSeats = freeSeatsReal + placeholders * FREE_SEATS_PER_PLACEHOLDER;
  return { visibleReal: visible, placeholders, available, playing, availableSeats };
}

/** Jugadors online presents en una sala concreta (segons el codi de la mesa
 *  on estan asseguts). Mateixa font de dades que la resta de helpers. */
export function playersInSala(players: OnlinePlayer[], slug: SalaSlug): OnlinePlayer[] {
  return players.filter((p) => {
    const code = normalizeCode(p.roomCode);
    if (code.length === 0) return false;
    return salaForRoom({ code }) === slug;
  });
}

/**
 * HELPER COMPARTIT — única font de veritat per a Lobby i Sales.
 * A partir de la llista crua de `rooms` (de `listLobbyRooms`) i els jugadors
 * online (de `useLobbyPresence`), retorna la vista que totes dues pantalles
 * han de mostrar. Si `salaSlug` és null, es comporta com el "lobby general"
 * (totes les sales, límit `VISIBLE_TABLES_DEFAULT`, sense placeholders).
 */
export function summarizeLobbyView(args: {
  rooms: LobbyRoomDTO[];
  salaSlug: SalaSlug | null;
  onlinePlayers?: OnlinePlayer[];
}): {
  slug: SalaSlug | null;
  targetCount: number;
  visibleRooms: LobbyRoomDTO[];
  placeholderCount: number;
  joinableCount: number;
  playingCount: number;
  availableCount: number;
  /** Seients humans lliures totals (mesa reals + placeholders × 4). */
  availableSeatsCount: number;
  /** Constant exposada perquè els consumidors no la duplicin. */
  seatsPerTable: number;
  presentPlayers: OnlinePlayer[];
} {
  const { rooms, salaSlug, onlinePlayers = [] } = args;
  // Filtre dur a l'entrada: cap mesa "finished"/"abandoned" pot arribar a la
  // resta de la pipeline. Així mai es comptarà com disponible ni visible.
  const playableRooms = rooms.filter((r) => !isRoomNonPlayable(r));
  if (salaSlug) {
    const summary = summarizeSala(playableRooms, salaSlug);
    return {
      slug: salaSlug,
      targetCount: VISIBLE_TABLES_PER_SALA,
      visibleRooms: summary.visibleReal,
      placeholderCount: summary.placeholders,
      joinableCount: summary.visibleReal.filter(roomHasFreeHumanSeat).length,
      playingCount: summary.playing,
      availableCount: summary.available,
      availableSeatsCount: summary.availableSeats,
      seatsPerTable: HUMAN_SEATS_PER_TABLE,
      presentPlayers: playersInSala(onlinePlayers, salaSlug),
    };
  }
  // Vista "lobby general": totes les meses amb seients lliures + en joc.
  // Prioritzem també les unibles dins del límit visible.
  const joinableRooms = playableRooms.filter((r) => r.status === "lobby" && roomHasFreeHumanSeat(r));
  const playingRooms = playableRooms.filter((r) => r.status === "playing");
  const visible = [...joinableRooms, ...playingRooms].slice(0, VISIBLE_TABLES_DEFAULT);
  const joinableCount = visible.filter(roomHasFreeHumanSeat).length;
  const placeholderCount = Math.max(0, VISIBLE_TABLES_DEFAULT - visible.length);
  const freeSeatsReal = visible.reduce((acc, r) => acc + freeHumanSeatsInRoom(r), 0);
  return {
    slug: null,
    targetCount: VISIBLE_TABLES_DEFAULT,
    visibleRooms: visible,
    placeholderCount,
    joinableCount,
    playingCount: visible.length - joinableCount,
    // Vista general: no es renderitzen placeholders, així que "disponibles"
    // és només la suma de meses reals unibles (consistent amb el que es veu).
    availableCount: joinableCount,
    availableSeatsCount: freeSeatsReal + placeholderCount * FREE_SEATS_PER_PLACEHOLDER,
    seatsPerTable: HUMAN_SEATS_PER_TABLE,
    presentPlayers: onlinePlayers,
  };
}