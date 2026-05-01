import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Copy, History, LogOut, Mail, RotateCcw, Shield, Trash2 } from "lucide-react";
import { toast } from "sonner";

const CONTACT_EMAIL = "angelbudo4@gmail.com";
const HISTORY_KEY = "truc:reportHistory:v1";
const HISTORY_MAX = 20;

type ReportHistoryEntry = {
  id: string;
  date: string; // ISO
  reason: string;
  reportedNick: string;
  room: string;
  content: string;
  details: string;
  nick: string;
  contactEmail: string;
  messageId?: string;
  gameUrl?: string;
};

function loadHistory(): ReportHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveHistory(entries: ReportHistoryEntry[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(0, HISTORY_MAX)));
  } catch {
    /* quota / private mode: ignorat */
  }
}

const REASONS = [
  { value: "assetjament", label: "Assetjament o amenaces" },
  { value: "discurs-odi", label: "Discurs d'odi o discriminació" },
  { value: "contingut-sexual", label: "Contingut sexual / menors" },
  { value: "violencia", label: "Violència o autolesions" },
  { value: "spam", label: "Spam o frau" },
  { value: "drets-autor", label: "Vulneració de drets d'autor / propietat" },
  { value: "altres-il-legal", label: "Altres continguts il·legals" },
];

/**
 * Pàgina de reporte de contingut il·lice / moderació.
 * Compleix el Reglament (UE) 2022/2065 (DSA): mecanisme de notificació i acció,
 * punt de contacte únic i base per a una moderació reactiva.
 */
const Reportar = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [reason, setReason] = useState<string>(REASONS[0].value);
  const [nick, setNick] = useState<string>("");
  const [reportedNick, setReportedNick] = useState<string>(params.get("reportat") ?? "");
  const [room, setRoom] = useState<string>(params.get("sala") ?? "");
  const [content, setContent] = useState<string>(params.get("contingut") ?? "");
  const [details, setDetails] = useState<string>("");
  const [contactEmail, setContactEmail] = useState<string>("");
  const [messageId, setMessageId] = useState<string>(params.get("missatgeId") ?? "");
  const [gameUrl, setGameUrl] = useState<string>(params.get("url") ?? "");
  const [history, setHistory] = useState<ReportHistoryEntry[]>(() => loadHistory());
  const [showHistory, setShowHistory] = useState<boolean>(false);

  useEffect(() => {
    document.title = "Reportar contingut · Truc Valencià";
    const desc =
      "Mecanisme de notificació de continguts il·lícits (DSA) i punt de contacte de Truc Valencià.";
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", desc);
  }, []);

  const reportSummary = useMemo(() => {
    const reasonLabel = REASONS.find((r) => r.value === reason)?.label ?? reason;
    const now = new Date();
    const isoDate = now.toISOString();
    const localDate = now.toLocaleString("ca-ES", { dateStyle: "full", timeStyle: "long" });
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const derivedUrl =
      gameUrl?.trim() ||
      (room.trim() && origin ? `${origin}/online/sala/${encodeURIComponent(room.trim())}` : "");
    const subject = `[Truc Valencià · Report] ${reasonLabel}${room ? ` · sala ${room}` : ""}`;
    const body = [
      "Notificació de contingut il·lícit (Reglament UE 2022/2065 — DSA)",
      "",
      `Data/hora local: ${localDate} (${tz})`,
      `Data/hora ISO (UTC): ${isoDate}`,
      `Motiu: ${reasonLabel}`,
      `Sala / codi de partida (roomCode): ${room || "(no indicat)"}`,
      `Sobrenom reportat (nick): ${reportedNick || "(no indicat)"}`,
      `ID del missatge: ${messageId || "(no indicat)"}`,
      `Enllaç a la partida: ${derivedUrl || "(no disponible)"}`,
      "",
      `Contingut o missatge concret:`,
      content || "(no indicat)",
      "",
      "Detalls addicionals (context, hora aproximada, URL, captures…):",
      details || "(no indicats)",
      "",
      "— Dades del notificant —",
      `Sobrenom dins l'app: ${nick || "(anònim)"}`,
      `Email de contacte (opcional): ${contactEmail || "(no facilitat)"}`,
      "",
      "Declare de bona fe que la informació proporcionada és exacta i completa.",
    ].join("\n");
    return { subject, body };
  }, [reason, room, reportedNick, content, details, nick, contactEmail, messageId, gameUrl]);

  const mailtoHref = useMemo(
    () =>
      `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(reportSummary.subject)}&body=${encodeURIComponent(reportSummary.body)}`,
    [reportSummary],
  );

  const copyToClipboard = async (text: string, okMsg: string) => {
    if (!text.trim()) {
      toast.error("No hi ha res per copiar.");
      return;
    }
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      toast.success(okMsg);
    } catch {
      toast.error("No s'ha pogut copiar al porta-retalls.");
    }
  };


  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !details.trim()) {
      toast.error("Indica el contingut o detalls del que vols reportar.");
      return;
    }
    const entry: ReportHistoryEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      date: new Date().toISOString(),
      reason,
      reportedNick,
      room,
      content,
      details,
      nick,
      contactEmail,
      messageId,
      gameUrl,
    };
    const next = [entry, ...history].slice(0, HISTORY_MAX);
    setHistory(next);
    saveHistory(next);
    window.location.href = mailtoHref;
    toast.success("S'ha obert el client de correu amb el report. Revisem en menys de 72 h.");
  };

  const restoreEntry = (entry: ReportHistoryEntry) => {
    setReason(entry.reason);
    setReportedNick(entry.reportedNick);
    setRoom(entry.room);
    setContent(entry.content);
    setDetails(entry.details);
    setNick(entry.nick);
    setContactEmail(entry.contactEmail);
    setMessageId(entry.messageId ?? "");
    setGameUrl(entry.gameUrl ?? "");
    setShowHistory(false);
    toast.success("Formulari restaurat. Revisa les dades i torna a enviar si cal.");
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const removeEntry = (id: string) => {
    const next = history.filter((h) => h.id !== id);
    setHistory(next);
    saveHistory(next);
  };

  const clearHistory = () => {
    setHistory([]);
    saveHistory([]);
    toast.success("Historial esborrat.");
  };

  const lastEntry = history[0];

  return (
    <main className="min-h-screen px-5 py-8 bg-background text-foreground">
      <div className="w-full max-w-2xl mx-auto flex flex-col gap-6">
        <header className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground inline-flex items-center gap-1">
            <Shield className="w-3.5 h-3.5" /> Moderació · DSA (UE) 2022/2065
          </p>
          <Button
            onClick={() => navigate(-1)}
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0 border-foreground/80 text-foreground hover:bg-foreground/10"
            aria-label="Tornar"
            title="Tornar"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </header>

        <article className="prose prose-sm md:prose-base max-w-none text-foreground">
          <h1 className="font-display font-black italic text-gold text-3xl md:text-4xl normal-case mb-2">
            Reportar contingut
          </h1>
          <p className="text-muted-foreground">
            Si has detectat al xat o a la mesa un contingut il·lícit, ofensiu o
            que vulnera els <Link to="/termes" className="underline">Termes i Condicions</Link>,
            pots notificar-ho des d'ací. Tractem totes les notificacions de
            manera diligent i no arbitrària, en compliment del Reglament (UE)
            2022/2065 (Digital Services Act).
          </p>
          <p className="text-sm text-muted-foreground">
            <strong>Punt de contacte únic (DSA art. 11/12):</strong>{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="underline">{CONTACT_EMAIL}</a>{" "}
            · Idiomes: valencià, català, castellà, anglés.
          </p>
        </article>

        {history.length > 0 && (
          <section className="rounded-lg border border-primary/30 bg-card/40 p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold inline-flex items-center gap-1.5">
                <History className="w-4 h-4" /> Historial local de reports
                <span className="text-xs text-muted-foreground font-normal">({history.length})</span>
              </p>
              <div className="flex items-center gap-2">
                {lastEntry && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => restoreEntry(lastEntry)}
                    className="h-8"
                    title="Reobrir el darrer report"
                  >
                    <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Reobrir últim
                  </Button>
                )}
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowHistory((v) => !v)}
                  className="h-8"
                >
                  {showHistory ? "Amagar" : "Veure tots"}
                </Button>
              </div>
            </div>

            {showHistory && (
              <ul className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
                {history.map((h) => {
                  const reasonLabel = REASONS.find((r) => r.value === h.reason)?.label ?? h.reason;
                  const dateStr = new Date(h.date).toLocaleString("ca-ES", {
                    dateStyle: "short",
                    timeStyle: "short",
                  });
                  return (
                    <li
                      key={h.id}
                      className="flex items-start justify-between gap-2 rounded-md border border-border/60 bg-background/40 p-2"
                    >
                      <div className="flex flex-col min-w-0">
                        <p className="text-sm font-medium truncate">{reasonLabel}</p>
                        <p className="text-xs text-muted-foreground">
                          {dateStr}
                          {h.reportedNick ? ` · ${h.reportedNick}` : ""}
                          {h.room ? ` · sala ${h.room}` : ""}
                        </p>
                        {(h.content || h.details) && (
                          <p className="text-xs text-muted-foreground/80 truncate">
                            {(h.content || h.details).slice(0, 120)}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-7 px-2"
                          onClick={() => restoreEntry(h)}
                          title="Restaurar al formulari"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                          onClick={() => removeEntry(h.id)}
                          title="Esborrar entrada"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            {showHistory && history.length > 0 && (
              <div className="flex justify-end">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={clearHistory}
                  className="h-8 text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Esborrar historial
                </Button>
              </div>
            )}

            <p className="text-[11px] text-muted-foreground">
              L'historial es guarda només al teu dispositiu (localStorage). No s'envia a cap servidor.
            </p>
          </section>
        )}

        <form onSubmit={onSubmit} className="flex flex-col gap-4 rounded-lg border border-primary/30 bg-card/40 p-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="reason">Motiu del report</Label>
            <select
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              {REASONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="room">Sala / codi de partida</Label>
              <Input id="room" value={room} onChange={(e) => setRoom(e.target.value)} placeholder="p. ex. ABCD" maxLength={20} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="reportedNick">Sobrenom reportat</Label>
              <Input id="reportedNick" value={reportedNick} onChange={(e) => setReportedNick(e.target.value)} maxLength={40} />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="content">Contingut concret (missatge, frase…)</Label>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-xs"
                onClick={() => copyToClipboard(content, "Missatge copiat al porta-retalls.")}
                disabled={!content.trim()}
                title="Copiar el text del missatge"
              >
                <Copy className="w-3.5 h-3.5 mr-1" /> Copiar missatge
              </Button>
            </div>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="Copia ací el text exacte si és possible"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="details">Detalls i context</Label>
            <Textarea
              id="details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              maxLength={2000}
              rows={4}
              placeholder="Hora aproximada, situació, captures (descriu-les), per què consideres que és il·lícit…"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="messageId">ID del missatge (opcional)</Label>
              <Input
                id="messageId"
                value={messageId}
                onChange={(e) => setMessageId(e.target.value)}
                placeholder="p. ex. msg_123"
                maxLength={80}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="gameUrl">Enllaç a la partida (opcional)</Label>
              <Input
                id="gameUrl"
                type="url"
                value={gameUrl}
                onChange={(e) => setGameUrl(e.target.value)}
                placeholder="https://…/online/sala/ABCD"
                maxLength={300}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="nick">El teu sobrenom (opcional)</Label>
              <Input id="nick" value={nick} onChange={(e) => setNick(e.target.value)} maxLength={40} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="contact">Email de contacte (opcional)</Label>
              <Input id="contact" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} maxLength={120} />
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            En enviar, s'obrirà el teu client de correu amb la notificació
            preparada cap al punt de contacte. No emmagatzemem els teus reports
            en cap servidor: arriben directament per email.
          </p>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button type="submit" className="h-11 flex-1">
              <Mail className="w-4 h-4 mr-2" /> Enviar notificació
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-11 sm:w-auto"
              onClick={() =>
                copyToClipboard(
                  `${reportSummary.subject}\n\n${reportSummary.body}`,
                  "Resum del report copiat. Pots enganxar-lo al teu correu.",
                )
              }
              title="Copiar el resum complet del report"
            >
              <Copy className="w-4 h-4 mr-2" /> Copiar resum
            </Button>
          </div>
        </form>

        <article className="prose prose-sm max-w-none text-foreground">
          <h2 className="font-display font-bold text-xl mt-4 mb-2">Què passa amb el teu report?</h2>
          <ol>
            <li>Acusament de recepció en un termini màxim de <strong>72 hores</strong>.</li>
            <li>Revisió manual del contingut reportat i del context.</li>
            <li>
              Mesures possibles: avís al jugador, eliminació del contingut,
              expulsió de la sala, bloqueig del dispositiu (device id) o
              denúncia a les autoritats si escau.
            </li>
            <li>Comunicació motivada al notificant, si ha facilitat email.</li>
          </ol>
          <h2 className="font-display font-bold text-xl mt-4 mb-2">Notificacions falses o abusives</h2>
          <p>
            Les notificacions manifestament infundades o abusives podran
            comportar la restricció temporal del dret a notificar, conforme a
            l'article 23 del DSA.
          </p>
          <h2 className="font-display font-bold text-xl mt-4 mb-2">Autoritats competents</h2>
          <p>
            Pots també adreçar-te a la Comissió Nacional dels Mercats i la
            Competència (CNMC), com a Coordinador de Serveis Digitals a
            Espanya, o a l'autoritat del teu Estat membre.
          </p>
        </article>
      </div>
    </main>
  );
};

export default Reportar;