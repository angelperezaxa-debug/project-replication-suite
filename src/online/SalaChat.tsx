import { useEffect, useRef, useState, type FormEvent } from "react";
import { Flag, Send, ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useSalaChat, sendSalaChat, type SalaChatMessage } from "@/online/useSalaChat";

const MAX_LEN = 200;

interface SalaChatProps {
  salaSlug: string;
  deviceId: string;
  name: string;
  hasName: boolean;
}

/** Xat de sala (lobby). Mateix estil que TableChat de la mesa, sense moderació. */
export function SalaChat({ salaSlug, deviceId, name, hasName }: SalaChatProps) {
  const messages = useSalaChat(salaSlug);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  const inputDisabled = sending || !hasName;
  const placeholder = !hasName
    ? "Configura el teu nom per xerrar"
    : "Escriu un missatge a la sala…";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (inputDisabled) return;
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setError(null);
    try {
      await sendSalaChat({ salaSlug, deviceId, name, text: trimmed });
      setText("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No s'ha pogut enviar");
    } finally {
      setSending(false);
    }
  };

  return (
    <section
      className="relative rounded-lg border border-primary/30 bg-background/80 flex flex-col"
      aria-label="Xat de la sala"
    >
      <div className="px-2 py-1 border-b border-primary/20 flex items-center justify-between">
        <span className="text-[11px] font-display tracking-widest uppercase text-primary/85">
          Xat de la sala
        </span>
        <span className="text-[10px] text-muted-foreground">
          {messages.length} missatge{messages.length === 1 ? "" : "s"}
        </span>
      </div>
      <div
        ref={scrollRef}
        className="px-2 py-1.5 max-h-48 overflow-y-auto text-xs space-y-0.5"
      >
        {messages.length === 0 ? (
          <p className="text-muted-foreground italic text-center py-2">
            Encara no hi ha missatges en aquesta sala
          </p>
        ) : (
          messages.map((m: SalaChatMessage) => {
            const isMine = m.deviceId === deviceId;
            const reportHref = `/reportar?sala=${encodeURIComponent(salaSlug)}&reportat=${encodeURIComponent(m.name)}&contingut=${encodeURIComponent(m.text)}`;
            return (
              <div key={m.id} className="leading-snug flex items-start gap-1 group">
                <div className="flex-1 min-w-0">
                  <span className={cn("font-semibold mr-1", isMine ? "text-primary" : "text-foreground")}>
                    {m.name}:
                  </span>
                  <span className="text-foreground/90 break-words">{m.text}</span>
                </div>
                {!isMine && (
                  <Link
                    to={reportHref}
                    className="opacity-50 hover:opacity-100 text-muted-foreground hover:text-destructive shrink-0 mt-0.5"
                    aria-label={`Reportar missatge de ${m.name}`}
                    title="Reportar aquest missatge (DSA)"
                  >
                    <Flag className="w-3 h-3" />
                  </Link>
                )}
              </div>
            );
          })
        )}
      </div>
      {error && (
        <div className="px-2 py-1 text-[11px] text-destructive border-t border-destructive/30">
          {error}
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-1 border-t border-primary/20 p-1"
      >
        <Input
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, MAX_LEN))}
          placeholder={placeholder}
          maxLength={MAX_LEN}
          disabled={inputDisabled}
          className="h-8 text-xs flex-1 bg-background/80"
          aria-label="Missatge a la sala"
        />
        <Link
          to={`/reportar?sala=${encodeURIComponent(salaSlug)}`}
          className="h-8 w-8 shrink-0 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          aria-label="Reportar contingut del xat"
          title="Reportar contingut (DSA)"
        >
          <ShieldAlert className="w-3.5 h-3.5" />
        </Link>
        <Button
          type="submit"
          size="sm"
          variant="default"
          disabled={inputDisabled || !text.trim()}
          className="h-8 w-8 p-0 shrink-0"
          aria-label="Enviar"
        >
          <Send className="w-3.5 h-3.5" />
        </Button>
      </form>
    </section>
  );
}