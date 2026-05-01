import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "@/lib/router-shim";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  LogOut,
  Loader2,
  Trash2,
  ShieldAlert,
  CheckCircle2,
  Eye,
} from "lucide-react";
import { requestAccountDeletion, type DeleteAccountResult } from "@/lib/deleteAccount";

const DEVICE_KEY = "truc:device-id";

type Step = "input" | "preview" | "done";

/** Etiquetes humanes per a cada taula del backend, perquè la previsualització
 *  no mostre noms tècnics. */
function labelForTable(table: string): string {
  switch (table) {
    case "player_profiles":
      return "perfils i estadístiques de joc";
    case "room_players":
      return "ocupacions de seient en sales";
    case "sala_chat":
      return "missatges del xat de sala";
    case "room_text_chat":
      return "missatges del xat de partida";
    default:
      return table;
  }
}

/**
 * Pàgina pública /esborrar-dades.
 *
 * Aquesta URL és la que es declararà a Google Play Store com a
 * "Data deletion URL" (requisit obligatori des de 2024 per a totes les
 * apps al Play Console). Permet a qualsevol usuari, fins i tot sense
 * tindre l'app instal·lada, sol·licitar l'esborrat de les seues dades
 * indicant l'identificador anònim del seu dispositiu.
 *
 * No requereix autenticació: l'identitat es prova amb el mateix
 * `device_id` que la persona ha rebut quan ha utilitzat l'app.
 */
const EsborrarDades = () => {
  const navigate = useNavigate();
  const [deviceId, setDeviceId] = useState("");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<DeleteAccountResult | null>(null);
  const [result, setResult] = useState<DeleteAccountResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [step, setStep] = useState<Step>("input");

  useEffect(() => {
    document.title = "Esborrar les meues dades · Truc Valencià";
    const desc =
      "Sol·licita l'esborrat de les teues dades de Truc Valencià indicant l'identificador anònim del teu dispositiu.";
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", desc);
    // Pre-emplenar el device_id si existeix al localStorage d'aquest navegador.
    try {
      const stored = window.localStorage.getItem(DEVICE_KEY);
      if (stored) setDeviceId(stored);
    } catch {
      /* mode privat / sense localStorage */
    }
  }, []);

  const trimmed = deviceId.trim();
  const looksValid = /^[a-zA-Z0-9_-]{4,80}$/.test(trimmed);
  const totalToDelete = useMemo(() => {
    if (!preview) return 0;
    return Object.values(preview.deleted).reduce((a, b) => a + b, 0);
  }, [preview]);
  const totalToAnonymize = useMemo(() => {
    if (!preview) return 0;
    return Object.values(preview.anonymized).reduce((a, b) => a + b, 0);
  }, [preview]);
  const hasAnyData = totalToDelete + totalToAnonymize > 0;

  async function onPreview(e: React.FormEvent) {
    e.preventDefault();
    if (!looksValid || loading) return;
    setLoading(true);
    setError(null);
    setPreview(null);
    try {
      const r = await requestAccountDeletion({ deviceId: trimmed, dryRun: true });
      setPreview(r);
      setStep("preview");
      setConfirmed(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconegut");
    } finally {
      setLoading(false);
    }
  }

  async function onConfirm() {
    if (!looksValid || !confirmed || loading) return;
    setLoading(true);
    setError(null);
    try {
      const r = await requestAccountDeletion({ deviceId: trimmed });
      setResult(r);
      setStep("done");
      // Si el device_id confirmat coincideix amb el d'aquest navegador,
      // netegem també les dades locals perquè quedi en estat "primera obertura".
      try {
        const stored = window.localStorage.getItem(DEVICE_KEY);
        if (stored && stored.trim() === trimmed) {
          window.localStorage.clear();
        }
      } catch {
        /* noop */
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconegut");
    } finally {
      setLoading(false);
    }
  }

  function onBackToInput() {
    setStep("input");
    setPreview(null);
    setConfirmed(false);
    setError(null);
  }

  return (
    <main className="min-h-screen px-5 py-8 bg-background text-foreground">
      <div className="w-full max-w-2xl mx-auto flex flex-col gap-6">
        <header className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">Sol·licitud d'esborrat de dades</p>
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
        </header>

        <article className="prose prose-sm md:prose-base max-w-none text-foreground">
          <h1 className="font-display font-black italic text-gold text-3xl md:text-4xl normal-case mb-2">
            Esborrar les meues dades
          </h1>
          <p className="text-muted-foreground">
            Aquesta pàgina permet sol·licitar l'esborrat de totes les dades
            associades al teu dispositiu en els servidors de{" "}
            <strong>Truc Valencià</strong>. No cal tindre cap compte: només
            necessites <strong>l'identificador anònim del teu dispositiu</strong>.
          </p>

          <section className="mt-6">
            <h2 className="font-display font-bold text-xl mt-4 mb-2">
              Què s'esborra
            </h2>
            <ul className="list-disc pl-6 my-3 space-y-1">
              <li>
                <strong>Estadístiques de joc</strong> associades al dispositiu
                (envits, fets, frequència de farols…).
              </li>
              <li>
                <strong>Presència a sales</strong>: el teu seient s'allibera de
                qualsevol mesa on encara aparegues.
              </li>
              <li>
                <strong>Missatges del xat de sala</strong> (sala-chat) que has
                enviat.
              </li>
              <li>
                <strong>Missatges de xat de partida</strong> que has enviat
                s'anonimitzen (es manté el text per coherència del fil, però
                s'esborra el teu identificador).
              </li>
            </ul>
          </section>

          <section className="mt-6">
            <h2 className="font-display font-bold text-xl mt-4 mb-2">
              Plazos de borrado
            </h2>
            <p>
              D'acord amb l'article 12.3 del{" "}
              <strong>Reglament (UE) 2016/679 (RGPD)</strong> i amb les{" "}
              <em>Google Play Data deletion policies</em>, ens comprometem als
              terminis següents:
            </p>
            <ul className="list-disc pl-6 my-3 space-y-1 text-sm">
              <li>
                <strong>Esborrat immediat (en línia, &lt; 60 segons)</strong>:
                quan polses <em>"Esborrar definitivament"</em>, les dades
                llistades més amunt s'eliminen o anonimitzen de manera síncrona
                a la base de dades de producció abans que aquesta pàgina mostre
                la confirmació.
              </li>
              <li>
                <strong>Còpies de seguretat (fins a 30 dies naturals)</strong>:
                els <em>backups</em> automàtics encriptats poden contenir una
                còpia residual de les teues dades. Es purguen per rotació en un
                termini màxim de 30 dies des de la sol·licitud, sense cap accés
                humà ni reutilització.
              </li>
              <li>
                <strong>Registres tècnics (fins a 90 dies)</strong>: els
                <em> logs</em> d'errors i auditoria de moderació poden conservar
                el teu identificador anònim de dispositiu durant un màxim de 90
                dies, exclusivament per a seguretat i prevenció d'abús (base
                legal: <em>interès legítim</em>, art. 6.1.f RGPD).
              </li>
              <li>
                <strong>Resposta a la sol·licitud (≤ 30 dies)</strong>: si
                l'esborrat automàtic falla, t'enviarem confirmació o notificació
                del motiu en el termini màxim d'<strong>un mes</strong> des de
                la recepció de la sol·licitud, prorrogable dos mesos addicionals
                en casos complexos (art. 12.3 RGPD), avisant-te del retard.
              </li>
            </ul>
          </section>

          <section className="mt-6">
            <h2 className="font-display font-bold text-xl mt-4 mb-2">
              Consentiment exprés
            </h2>
            <div className="rounded-md border border-border bg-muted/20 p-4 text-sm space-y-2">
              <p className="font-medium">
                En polsar <em>"Esborrar definitivament"</em> declares, sota la
                teua responsabilitat, que:
              </p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>
                  Ets el titular legítim del dispositiu identificat per
                  l'identificador anònim que has introduït, o actues amb la
                  seua autorització.
                </li>
                <li>
                  Has llegit i comprens que l'esborrat és{" "}
                  <strong>irreversible</strong>: no podrem recuperar les
                  estadístiques, missatges ni històrics associats una vegada
                  executada l'operació.
                </li>
                <li>
                  Acceptes que els missatges enviats al xat de partida es
                  conserven anonimitzats (sense vincle amb el teu dispositiu)
                  per preservar la coherència del fil per a la resta de
                  participants, i que aquesta retenció és compatible amb el
                  dret de supressió perquè ja no permet identificar-te.
                </li>
                <li>
                  Reconeixes haver llegit la{" "}
                  <Link to="/privacitat" className="underline text-primary">
                    Política de Privacitat
                  </Link>{" "}
                  i, en particular, els terminis de retenció descrits a
                  l'apartat anterior.
                </li>
                <li>
                  Quedes informat que pots exercir els drets d'accés,
                  rectificació, oposició, limitació del tractament i
                  portabilitat (arts. 15 a 22 RGPD), així com presentar una
                  reclamació davant l'<strong>Agencia Española de Protección
                  de Datos</strong> (www.aepd.es) si consideres que el
                  tractament no s'ajusta a la normativa.
                </li>
              </ol>
              <p className="text-xs text-muted-foreground pt-2">
                Responsable del tractament: equip de Truc Valencià. Finalitat:
                atendre la sol·licitud de supressió de dades. Base jurídica:
                consentiment exprés (art. 6.1.a RGPD) i compliment d'obligació
                legal (art. 17 RGPD — dret a l'oblit). Destinataris: cap cessió
                a tercers; el processament es fa exclusivament als servidors de
                Lovable Cloud que allotgen l'aplicació.
              </p>
            </div>
          </section>

          <section className="mt-6">
            <h2 className="font-display font-bold text-xl mt-4 mb-2">
              Com obtindre el meu identificador
            </h2>
            <p>
              Si encara tens l'app instal·lada, vés a{" "}
              <Link to="/ajustes" className="underline text-primary">
                Configuració
              </Link>{" "}
              i utilitza el botó <strong>"Esborrar les meues dades"</strong>:
              farà tot el procés sense que hages de copiar res.
            </p>
            <p className="text-sm text-muted-foreground">
              Si ja no tens l'app, l'identificador era una cadena tipus
              UUID que es generava al primer ús. Si no la tens guardada, no
              podem identificar les teues dades de manera fiable (és el
              cost de no demanar email ni compte).
            </p>
          </section>

          <section className="mt-6">
            <h2 className="font-display font-bold text-xl mt-4 mb-2">
              Sol·licitud
            </h2>
            {step === "input" && (
            <form onSubmit={onPreview} className="not-prose flex flex-col gap-3">
              <label htmlFor="deviceId" className="text-sm font-medium">
                Identificador anònim del dispositiu
              </label>
              <Input
                id="deviceId"
                type="text"
                value={deviceId}
                onChange={(e) => setDeviceId(e.target.value)}
                placeholder="p. ex. 3f8a1c20-…"
                autoComplete="off"
                disabled={loading}
                className="bg-background/40 border-primary/30"
              />
              {!looksValid && trimmed.length > 0 && (
                <p className="text-xs text-destructive">
                  Format no vàlid. Ha de tenir entre 4 i 80 caràcters
                  alfanumèrics, guió o guió baix.
                </p>
              )}
              {error && (
                <p className="text-sm text-destructive flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" /> {error}
                </p>
              )}
              <Button
                type="submit"
                disabled={!looksValid || loading}
                variant="outline"
                className="w-full"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Eye className="w-4 h-4 mr-2" />
                )}
                Comprovar quines dades hi ha
              </Button>
              <p className="text-xs text-muted-foreground">
                Aquest pas <strong>no esborra res encara</strong>. Et mostrarem
                quantes dades tenim del teu dispositiu i hauràs de confirmar
                explícitament l'esborrat.
              </p>
            </form>
            )}

            {step === "preview" && preview && (
              <div className="not-prose flex flex-col gap-4">
                <div className="rounded-md border border-primary/30 bg-primary/5 p-3 text-sm">
                  <p className="text-xs text-muted-foreground">
                    Dispositiu identificat amb:
                  </p>
                  <p className="font-mono text-xs break-all mt-1">{trimmed}</p>
                </div>

                {!hasAnyData ? (
                  <div className="rounded-md border border-border bg-muted/30 p-3 text-sm">
                    <p className="font-medium">No hi ha dades associades a aquest identificador.</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      O bé l'identificador és incorrecte, o ja s'han esborrat anteriorment.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm flex flex-col gap-2">
                    <p className="font-medium text-destructive">
                      Dades que s'esborraran de manera irreversible:
                    </p>
                    <ul className="text-xs space-y-1 ml-4 list-disc">
                      {Object.entries(preview.deleted)
                        .filter(([, n]) => n > 0)
                        .map(([t, n]) => (
                          <li key={t}>
                            <strong>{n}</strong> {labelForTable(t)}
                          </li>
                        ))}
                      {Object.entries(preview.anonymized)
                        .filter(([, n]) => n > 0)
                        .map(([t, n]) => (
                          <li key={`a-${t}`}>
                            <strong>{n}</strong> {labelForTable(t)} (s'anonimitzaran, el text es manté)
                          </li>
                        ))}
                    </ul>
                  </div>
                )}

                {hasAnyData && (
                  <label className="flex items-start gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={confirmed}
                      onChange={(e) => setConfirmed(e.target.checked)}
                      disabled={loading}
                      className="mt-1"
                    />
                    <span>
                      He llegit i accepte el <em>Consentiment exprés</em> i els{" "}
                      <em>Plazos de borrado</em> indicats més amunt. Confirme
                      que vull esborrar aquestes dades de manera{" "}
                      <strong>irreversible</strong> i sol·licite formalment
                      l'exercici del meu <strong>dret de supressió</strong>{" "}
                      (art. 17 RGPD).
                    </span>
                  </label>
                )}

                {error && (
                  <p className="text-sm text-destructive flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4" /> {error}
                  </p>
                )}

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onBackToInput}
                    disabled={loading}
                    className="flex-1"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Tornar
                  </Button>
                  {hasAnyData && (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={onConfirm}
                      disabled={!confirmed || loading}
                      className="flex-1"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4 mr-2" />
                      )}
                      Esborrar definitivament
                    </Button>
                  )}
                </div>
              </div>
            )}

            {step === "done" && result && (
              <div className="not-prose rounded-md border border-team-nos/40 bg-team-nos/10 p-4 text-sm flex flex-col gap-2">
                <p className="flex items-center gap-2 font-medium text-team-nos text-base">
                  <CheckCircle2 className="w-5 h-5" /> Dades esborrades correctament
                </p>
                <p className="text-sm">
                  Les dades associades al dispositiu{" "}
                  <code className="font-mono text-xs bg-background/40 px-1 py-0.5 rounded break-all">
                    {trimmed}
                  </code>{" "}
                  s'han processat al servidor.
                </p>
                <ul className="text-xs ml-4 list-disc space-y-0.5 text-muted-foreground">
                  {Object.entries(result.deleted)
                    .filter(([, n]) => n > 0)
                    .map(([t, n]) => (
                      <li key={t}>
                        Esborrats: <strong>{n}</strong> {labelForTable(t)}
                      </li>
                    ))}
                  {Object.entries(result.anonymized)
                    .filter(([, n]) => n > 0)
                    .map(([t, n]) => (
                      <li key={`a-${t}`}>
                        Anonimitzats: <strong>{n}</strong> {labelForTable(t)}
                      </li>
                    ))}
                  {totalToDelete + totalToAnonymize === 0 && (
                    <li>No s'ha trobat cap dada per aquest identificador.</li>
                  )}
                </ul>
                <p className="text-xs text-muted-foreground mt-2">
                  Si has fet aquesta operació des del mateix navegador on tenies
                  l'app, les dades locals també s'han netejat.
                </p>
              </div>
            )}
          </section>

          <section className="mt-8 text-sm text-muted-foreground">
            <p>
              Més informació a la nostra{" "}
              <Link to="/privacitat" className="underline text-primary">
                Política de Privacitat
              </Link>
              .
            </p>
          </section>
        </article>

        <footer className="pt-6 border-t border-border">
          <Button asChild variant="outline" className="w-full border-2">
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Tornar a l'inici
            </Link>
          </Button>
        </footer>
      </div>
    </main>
  );
};

export default EsborrarDades;