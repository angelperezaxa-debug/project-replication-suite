// Floating panel (Alt+S) to inspect / save / compare state-diff recordings
// across solo and online sessions. Saves baselines to localStorage so a solo
// run can be replayed in an online seat and compared against it.
import { useEffect, useMemo, useState } from "react";
import { Activity, Download, RefreshCcw, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  compareSessions,
  serializeSession,
  stateDiffStore,
  type DiffMode,
  type RecordingSession,
  type StateSnapshot,
} from "./stateDiff";

const PANEL_KEY = "state-diff-panel-open";
const BASELINE_KEY_SOLO = "state-diff-baseline-solo";
const BASELINE_KEY_ONLINE = "state-diff-baseline-online";

function loadBaseline(key: string): StateSnapshot[] | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed?.snapshots) ? parsed.snapshots : null;
  } catch { return null; }
}

function saveBaseline(key: string, session: RecordingSession) {
  try { window.localStorage.setItem(key, serializeSession(session)); } catch { /* ignore */ }
}

function downloadJson(name: string, content: string) {
  const blob = new Blob([content], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

export function StateDiffPanel() {
  const [open, setOpen] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(PANEL_KEY) === "1";
  });
  const [, setTick] = useState(0);

  useEffect(() => {
    const unsub = stateDiffStore.subscribe(() => setTick((n) => n + 1));
    return () => { unsub(); };
  }, []);

  // Alt+S toggle.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === "s" || e.key === "S")) {
        e.preventDefault();
        setOpen((o) => {
          const next = !o;
          try { window.localStorage.setItem(PANEL_KEY, next ? "1" : "0"); } catch { /* ignore */ }
          return next;
        });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const solo = stateDiffStore.get("solo");
  const online = stateDiffStore.get("online");

  const baseline = useMemo(() => ({
    solo: loadBaseline(BASELINE_KEY_SOLO),
    online: loadBaseline(BASELINE_KEY_ONLINE),
  }), []);

  // Compare current online recording against saved solo baseline by default,
  // and vice-versa. Falls back to live solo↔online if no baseline saved.
  const report = useMemo(() => {
    const a = baseline.solo ?? solo.snapshots;
    const b = online.snapshots.length > 0 ? online.snapshots : (baseline.online ?? []);
    if (a.length === 0 || b.length === 0) return null;
    return compareSessions(a, b);
  }, [solo.snapshots, online.snapshots, baseline]);

  if (!open) {
    const dot =
      report && report.divergences.length === 0 ? "bg-emerald-500" :
      report && report.divergences.length > 0 ? "bg-amber-500" :
      "bg-muted-foreground/60";
    return (
      <button
        type="button"
        onClick={() => { setOpen(true); window.localStorage.setItem(PANEL_KEY, "1"); }}
        title="State diff (Alt+S)"
        className={cn(
          "fixed bottom-3 right-0 z-50 inline-flex items-center gap-1 rounded-l-full border border-r-0 px-2.5 py-1.5 text-[11px] font-medium shadow-md backdrop-blur",
          "border-border/60 bg-background/80 text-foreground hover:bg-background",
        )}
      >
        <Activity className="w-3 h-3" />
        <span>Diff</span>
        <span className={cn("inline-block h-1.5 w-1.5 rounded-full", dot)} />
      </button>
    );
  }

  function renderSession(label: string, mode: DiffMode, s: RecordingSession) {
    return (
      <section className="rounded border border-border/40 p-2 flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="font-display tracking-widest uppercase text-[10px] text-muted-foreground">{label}</span>
          <span className="text-[10px] text-muted-foreground">{s.snapshots.length} snaps</span>
        </div>
        <div className="flex flex-wrap gap-1">
          <Button size="sm" variant="outline" className="h-6 px-2 text-[10px]" onClick={() => stateDiffStore.clear(mode)}>
            <RefreshCcw className="w-3 h-3 mr-1" />Reiniciar
          </Button>
          <Button
            size="sm" variant="outline" className="h-6 px-2 text-[10px]"
            disabled={s.snapshots.length === 0}
            onClick={() => saveBaseline(mode === "solo" ? BASELINE_KEY_SOLO : BASELINE_KEY_ONLINE, s)}
          >
            <Save className="w-3 h-3 mr-1" />Guardar baseline
          </Button>
          <Button
            size="sm" variant="outline" className="h-6 px-2 text-[10px]"
            disabled={s.snapshots.length === 0}
            onClick={() => downloadJson(`state-diff-${mode}-${Date.now()}.json`, serializeSession(s))}
          >
            <Download className="w-3 h-3 mr-1" />Exportar
          </Button>
        </div>
        {s.snapshots.length > 0 && (() => {
          const last = s.snapshots[s.snapshots.length - 1];
          return (
            <div className="text-[10px] text-muted-foreground font-mono">
              r{last.round} · {last.phase} · turn {last.turn} · truc {last.trucLevel} · envit {String(last.envitLevel)} · {last.males.nos}-{last.males.ells} m / {last.bones.nos}-{last.bones.ells} b
            </div>
          );
        })()}
      </section>
    );
  }

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 w-[min(100vw-1.5rem,420px)] max-w-[100vw] max-h-[80vh] overflow-hidden rounded-xl border border-border/60 bg-background/95 shadow-xl backdrop-blur flex flex-col">
      <header className="flex items-center justify-between px-3 py-2 border-b border-border/60">
        <div className="flex items-center gap-2 text-xs font-semibold">
          <Activity className="w-3.5 h-3.5" />
          State diff
        </div>
        <button type="button" onClick={() => { setOpen(false); window.localStorage.setItem(PANEL_KEY, "0"); }} aria-label="Tancar" className="text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>
      </header>
      <div className="overflow-auto p-3 flex flex-col gap-3 text-xs">
        {renderSession("Solo (bots)", "solo", solo)}
        {renderSession("Online", "online", online)}

        <section className="rounded border border-border/40 p-2 flex flex-col gap-1">
          <span className="font-display tracking-widest uppercase text-[10px] text-muted-foreground">Comparació</span>
          {!report && <p className="text-muted-foreground italic">Cal una sessió solo i una online (o un baseline guardat).</p>}
          {report && (
            <>
              <div className="text-[11px]">
                Alineades: <strong>{report.alignedCount}</strong> · Solo extra: {report.soloOnlyTail} · Online extra: {report.onlineOnlyTail}
              </div>
              <div className={cn(
                "text-[11px] font-semibold",
                report.divergences.length === 0 ? "text-emerald-600" : "text-amber-600",
              )}>
                {report.divergences.length === 0 ? "✓ Sense divergències" : `⚠ ${report.divergences.length} divergències`}
              </div>
              {report.divergences.length > 0 && (
                <ul className="max-h-48 overflow-auto flex flex-col gap-1 mt-1">
                  {report.divergences.slice(0, 50).map((d, i) => (
                    <li key={i} className="rounded border border-amber-500/30 bg-amber-500/5 px-2 py-1 font-mono text-[10px]">
                      <div className="flex justify-between gap-2">
                        <span>#{d.index} · {String(d.field)}</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground break-all">
                        solo: {JSON.stringify(d.solo)} · online: {JSON.stringify(d.online)}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </section>

        <p className="text-[10px] text-muted-foreground/70 text-center">Alt+S per obrir/tancar</p>
      </div>
    </div>
  );
}