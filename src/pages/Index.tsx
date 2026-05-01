import { Link, useNavigate } from "@/lib/router-shim";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, RotateCcw, Trash2, Users, LogIn, Settings as SettingsIcon, Wifi, BookOpen } from "lucide-react";
import { hasSavedMatch, clearSavedMatch } from "@/hooks/useTrucMatch";
import { loadSettings, resolveInitialMano } from "@/lib/gameSettings";
import { useMyActiveRooms } from "@/online/useMyActiveRooms";
import { useT } from "@/i18n/useT";
import { usePlayerIdentity } from "@/hooks/usePlayerIdentity";

const Index = () => {
  const navigate = useNavigate();
  const t = useT();
  const { name: playerName } = usePlayerIdentity();
  const [hasSaved, setHasSaved] = useState(false);
  const { rooms: activeOnlineRooms } = useMyActiveRooms();
  const [startSearch, setStartSearch] = useState<{ cames: number; mano: number; targetCama: number }>({
    cames: 2,
    mano: 0,
    targetCama: 12,
  });

  useEffect(() => {
    setHasSaved(hasSavedMatch());
    const s = loadSettings();
    setStartSearch({
      cames: s.cames,
      // El jugador que comença sempre és aleatori (l'opció ha sigut eliminada).
      mano: resolveInitialMano(-1),
      targetCama: s.targetCama,
    });
  }, []);

  const baseQS = `cames=${startSearch.cames}&mano=${startSearch.mano}&targetCama=${startSearch.targetCama}`;
  const newGameLink = `/partida?${baseQS}`;
  const resumeLink = `/partida?${baseQS}&resume=1`;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-5 py-10">
      <div className="w-full max-w-md flex flex-col items-center gap-7">
        <header className="text-center">
          <h1 className="font-display font-black italic text-gold text-5xl leading-none normal-case">{t("home.title.line1")}</h1>
          <h1 className="font-display font-black italic text-gold text-5xl leading-none normal-case">{t("home.title.line2")}</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {playerName ? `${playerName}, ` : ""}
            {playerName
              ? t("home.subtitle").charAt(0).toLowerCase() + t("home.subtitle").slice(1)
              : t("home.subtitle")}
          </p>
        </header>

        {activeOnlineRooms.length > 0 && (
          <section className="w-full flex flex-col gap-2">
            {activeOnlineRooms.map((room) => (
              <Button
                key={room.id}
                asChild
                size="lg"
                className="w-full h-12 bg-team-nos text-white hover:bg-team-nos/90 font-display font-bold"
              >
                <Link to={`/online/partida/${room.code}`}>
                  <Wifi className="w-4 h-4 mr-2" />
                  {t("home.resume_online", { code: room.code })}
                </Link>
              </Button>
            ))}
            <p className="self-center text-[11px] text-muted-foreground text-center">
              {t("home.online_in_progress")}
            </p>
          </section>
        )}

        {hasSaved && (
          <section className="w-full flex flex-col gap-2">
            <Button asChild size="lg" className="w-full h-12 bg-accent text-accent-foreground hover:bg-accent/90 font-display font-bold">
              <Link to={resumeLink}>
                <RotateCcw className="w-4 h-4 mr-2" />
                {t("home.continue_last")}
              </Link>
            </Button>
            <button
              type="button"
              onClick={() => { clearSavedMatch(); setHasSaved(false); }}
              className="self-center inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              {t("home.delete_saved")}
            </button>
          </section>
        )}

        <section className="w-full flex flex-col gap-3">
          <h2 className="text-center font-display text-sm font-black uppercase tracking-widest text-primary/80">
            Jugar a soles
          </h2>
          <Button
            asChild
            size="lg"
            className="w-full min-h-14 h-auto py-2 bg-primary text-primary-foreground hover:bg-primary/90 font-display font-bold text-lg gold-glow whitespace-normal"
            onClick={() => clearSavedMatch()}
          >
            <Link to={newGameLink}>
              <Play className="w-5 h-5 mr-2 shrink-0" />
              <span className="line-clamp-2 text-center leading-tight">Jugar contra bots</span>
            </Link>
          </Button>
        </section>

        <section className="w-full flex flex-col gap-3">
          <h2 className="text-center font-display text-sm font-black uppercase tracking-widest text-primary/80">
            Jugar Online amb amics
          </h2>
          <Button asChild size="lg" className="min-h-12 h-auto px-2 py-2 bg-primary text-primary-foreground hover:bg-primary/90 font-display font-bold whitespace-normal gap-1">
            <Link to="/online/sales">
              <Users className="w-4 h-4 shrink-0" />
              <span className="line-clamp-2 text-center leading-tight">{t("home.see_tables")}</span>
            </Link>
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button asChild size="lg" className="min-h-12 h-auto px-2 py-2 bg-team-nos text-background hover:bg-team-nos/90 font-display font-bold whitespace-normal gap-1">
              <Link to="/online/nou">
                <Users className="w-4 h-4 shrink-0" />
                <span className="line-clamp-2 leading-tight text-center">
                  {t("home.create_table")}
                </span>
              </Link>
            </Button>
            <Button asChild size="lg" className="min-h-12 h-auto px-2 py-2 bg-primary text-primary-foreground hover:bg-primary/90 font-display font-bold whitespace-normal gap-1">
              <Link to="/online/unir">
                <LogIn className="w-4 h-4 shrink-0 -mr-1" />
                <span className="line-clamp-2 leading-tight text-center">
                  {t("home.join_with_code")}
                </span>
              </Link>
            </Button>
          </div>
        </section>

        <div className="h-3" aria-hidden="true" />

        <Button asChild size="lg" variant="outline" className="w-full h-12 border-2 border-primary/60 text-primary hover:bg-primary/10 font-display font-bold">
          <Link to="/ajustes">
            <SettingsIcon className="w-4 h-4 mr-2" />
            Configuració
          </Link>
        </Button>

        <nav className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <Link
            to="/privacitat"
            className="hover:text-primary underline underline-offset-4 transition-colors"
          >
            Política de Privacitat
          </Link>
          <span aria-hidden="true">·</span>
          <Link
            to="/termes"
            className="hover:text-primary underline underline-offset-4 transition-colors"
          >
            Termes i Condicions
          </Link>
          <span aria-hidden="true">·</span>
          <Link
            to="/avis-legal"
            className="hover:text-primary underline underline-offset-4 transition-colors"
          >
            Avís Legal
          </Link>
          <span aria-hidden="true">·</span>
          <Link
            to="/cookies"
            className="hover:text-primary underline underline-offset-4 transition-colors"
          >
            Cookies
          </Link>
          <span aria-hidden="true">·</span>
          <Link
            to="/reportar"
            className="hover:text-primary underline underline-offset-4 transition-colors"
          >
            Reportar contingut
          </Link>
        </nav>
      </div>
    </main>
  );
};


export default Index;