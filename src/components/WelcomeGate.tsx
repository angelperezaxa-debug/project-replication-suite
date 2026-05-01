import { useState, type ReactNode } from "react";
import { ClientOnly } from "./ClientOnly";
import { usePlayerIdentity, sanitizeName } from "@/hooks/usePlayerIdentity";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles } from "lucide-react";

/**
 * Pantalla de benvinguda que es mostra la primera vegada que s'obre l'app
 * (quan no hi ha cap nom desat). Bloqueja la resta de l'aplicació fins que
 * el jugador introdueix i confirma el seu nom.
 */
function WelcomeForm({ onAccept }: { onAccept: (name: string) => void }) {
  const [value, setValue] = useState("");
  const clean = sanitizeName(value);
  const canSubmit = clean.length > 0;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    onAccept(clean);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-5 py-10 bg-background">
      <form
        onSubmit={submit}
        className="w-full max-w-md flex flex-col items-center gap-6"
      >
        <header className="text-center">
          <h1 className="font-display font-black italic text-gold text-5xl leading-none normal-case">
            Truc
          </h1>
          <h1 className="font-display font-black italic text-gold text-5xl leading-none normal-case">
            Valencià
          </h1>
          <p className="mt-4 text-sm text-muted-foreground flex items-center justify-center gap-1">
            <Sparkles className="w-4 h-4 text-primary" />
            Benvingut al joc
          </p>
        </header>

        <section className="w-full flex flex-col gap-3">
          <label
            htmlFor="welcome-name"
            className="text-sm font-display font-bold text-foreground text-center"
          >
            Com et dius?
          </label>
          <Input
            id="welcome-name"
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="El teu nom"
            maxLength={24}
            className="h-12 w-full text-center text-lg font-display border-2 border-primary bg-transparent focus-visible:border-primary focus-visible:ring-primary"
          />
          <p className="text-[11px] text-muted-foreground text-center">
            Aquest nom s'utilitzarà a les partides online i al menú
          </p>
        </section>

        <Button
          type="submit"
          size="lg"
          disabled={!canSubmit}
          className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-display font-bold text-lg gold-glow disabled:opacity-50"
        >
          Acceptar
        </Button>
      </form>
    </main>
  );
}

function Gate({ children }: { children: ReactNode }) {
  const { hasName, setName, ready } = usePlayerIdentity();
  if (!ready) {
    // Mentres es carrega localStorage no mostrem res per evitar un flaix
    // del formulari als jugadors que ja tenen nom desat.
    return null;
  }
  if (!hasName) {
    return <WelcomeForm onAccept={setName} />;
  }
  return <>{children}</>;
}

export function WelcomeGate({ children }: { children: ReactNode }) {
  return (
    <ClientOnly fallback={<>{children}</>}>
      <Gate>{children}</Gate>
    </ClientOnly>
  );
}