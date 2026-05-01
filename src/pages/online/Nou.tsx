import { useNavigate } from "@/lib/router-shim";
import { useState } from "react";
import { ClientOnly } from "@/components/ClientOnly";
import { Button } from "@/components/ui/button";
import { usePlayerIdentity } from "@/hooks/usePlayerIdentity";
import { createRoom } from "@/online/rooms.functions";
import type { PlayerId } from "@/game/types";
import type { SeatKind } from "@/online/types";
import { Loader2, LogOut, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { TableSeatPicker, type SeatInfo } from "@/online/TableSeatPicker";

function Loading() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
    </main>
  );
}

const CAMES_OPTIONS = [
  { value: 1, label: "1 cama" },
  { value: 2, label: "2 cames" },
  { value: 3, label: "3 cames" },
];

const TARGET_CAMA_OPTIONS = [
  { value: 9 as const, label: "9 punts" },
  { value: 12 as const, label: "12 punts" },
];

const TURN_TIMEOUT_OPTIONS = [15, 30, 45, 60];

function OnlineNouPage() {
  return (
    <ClientOnly fallback={<Loading />}>
      <NovaSala />
    </ClientOnly>
  );
}

function NovaSala() {
  const navigate = useNavigate();
  const { deviceId, name, hasName, ready } = usePlayerIdentity();

  const [hostSeat, setHostSeat] = useState<PlayerId>(0);
  const [seatKinds, setSeatKinds] = useState<SeatKind[]>(["human", "human", "human", "human"]);
  const [targetCames, setTargetCames] = useState(2);
  const [targetCama, setTargetCama] = useState<9 | 12>(12);
  const [turnTimeoutSec, setTurnTimeoutSec] = useState<number>(30);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!ready) return <Loading />;

  const humanCount = seatKinds.filter((s) => s === "human").length;

  const handleSeatClick = (seat: PlayerId) => {
    if (seat === hostSeat) return;
    setSeatKinds((prev) => {
      const next = [...prev] as SeatKind[];
      next[seat] = prev[seat] === "human" ? "bot" : "human";
      return next;
    });
  };

  const handleCreate = async () => {
    if (!hasName) { setError("Cal introduir un nom a Ajustes abans de crear la taula"); return; }
    setSubmitting(true);
    setError(null);
    try {
      // El jugador que comença és sempre aleatori.
      const randomMano = Math.floor(Math.random() * 4) as PlayerId;
      const res = await createRoom({
        data: { hostDevice: deviceId, hostName: name, targetCames, targetCama, turnTimeoutSec, initialMano: randomMano, seatKinds, hostSeat },
      });
      navigate(`/online/sala/${res.code}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error inesperat");
      setSubmitting(false);
    }
  };

  const seats: SeatInfo[] = ([0, 1, 2, 3] as PlayerId[]).map((s) => {
    if (s === hostSeat) {
      return {
        seat: s,
        kind: "human",
        occupant: { kind: "me", name: name || "Tu" },
        isHost: true,
        selectable: false,
      };
    }
    const kind = seatKinds[s];
    return {
      seat: s,
      kind,
      occupant: kind === "human" ? { kind: "empty" } : { kind: "bot" },
      selectable: true,
    };
  });

  return (
    <main className="min-h-screen flex flex-col items-center px-5 py-8">
      <div className="w-full max-w-md flex flex-col gap-5">
        <div className="flex justify-end">
          <Button
            onClick={() => navigate("/")}
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0 border-foreground/80 text-foreground hover:bg-foreground/10"
            aria-label="Tornar a inici"
            title="Tornar a inici"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>

        <header className="text-center">
          <h1 className="font-display font-black italic text-gold text-3xl">Crear taula online</h1>
          <p className="mt-1 text-sm text-muted-foreground">Per defecte els seients queden oberts per a altres jugadors. Toca un seient per posar-hi un bot.</p>
        </header>

        {!hasName && (
          <section className="px-1 py-2 flex items-center justify-between gap-3">
            <p className="text-xs text-foreground">Cal configurar el teu nom abans de crear la taula.</p>
            <Button size="sm" variant="outline" onClick={() => navigate("/ajustes")} className="border-primary/40">
              <Settings className="w-3 h-3 mr-1" /> Ajustes
            </Button>
          </section>
        )}

        <section className="flex flex-col gap-3">
          <div className="text-[11px] font-display tracking-widest uppercase text-primary/85 text-center">La taula</div>
          <p className="text-[11px] text-muted-foreground text-center -mt-1">
            Toca un seient lliure per alternar entre <strong>humà</strong> i <strong>bot</strong>.
          </p>

          <TableSeatPicker seats={seats} onSeatClick={handleSeatClick} highlightSeat={hostSeat} />

          <p className="text-[10px] text-muted-foreground text-center">
            {humanCount} humà{humanCount === 1 ? "" : "s"} · {4 - humanCount} bot{(4 - humanCount) === 1 ? "" : "s"}
          </p>
        </section>

        <section className="flex flex-col gap-1.5">
          <div className="text-[10px] font-display tracking-widest uppercase text-primary/85">Cames a guanyar</div>
          <div className="grid grid-cols-3 gap-2">
            {CAMES_OPTIONS.map((opt) => (
              <Chip
                key={opt.value}
                selected={targetCames === opt.value}
                onClick={() => setTargetCames(opt.value)}
                label={opt.label}
              />
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-1.5">
          <div className="text-[10px] font-display tracking-widest uppercase text-primary/85">Punts per cama</div>
          <div className="grid grid-cols-2 gap-2">
            {TARGET_CAMA_OPTIONS.map((opt) => (
              <Chip
                key={opt.value}
                selected={targetCama === opt.value}
                onClick={() => setTargetCama(opt.value)}
                label={opt.label}
              />
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-1.5">
          <div className="text-[10px] font-display tracking-widest uppercase text-primary/85">Temps d'espera per torn</div>
          <div className="grid grid-cols-4 gap-2">
            {TURN_TIMEOUT_OPTIONS.map((sec) => (
              <Chip
                key={sec}
                selected={turnTimeoutSec === sec}
                onClick={() => setTurnTimeoutSec(sec)}
                label={`${sec}s`}
              />
            ))}
          </div>
        </section>

        {error && <p className="text-xs text-destructive text-center">{error}</p>}

        <Button
          size="lg"
          className="h-14 bg-primary text-primary-foreground hover:bg-primary/90 font-display font-bold text-lg gold-glow"
          onClick={handleCreate}
          disabled={submitting || !hasName}
        >
          {submitting ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : null}
          Crear taula
        </Button>
      </div>
    </main>
  );
}

function Chip({ selected, onClick, label }: { selected: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "rounded-md border px-2 py-1.5 text-center transition-all flex flex-col items-center gap-0.5 leading-tight",
        selected
          ? "border-primary bg-primary/15 text-primary"
          : "border-primary/25 bg-background/30 text-foreground/80 hover:border-primary/50 hover:bg-primary/10",
      )}
    >
      <span className="inline-flex items-center gap-1.5 font-display font-bold text-xs">{label}</span>
    </button>
  );
}

export default OnlineNouPage;