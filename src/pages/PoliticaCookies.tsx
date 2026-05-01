import { Link, useNavigate } from "@/lib/router-shim";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LogOut } from "lucide-react";

/**
 * Política de Cookies i Emmagatzematge Local de "Truc Valencià".
 *
 * L'app no fa servir cookies de seguiment. Sí que utilitza
 * localStorage del navegador per a guardar preferències i estat
 * de partida estrictament necessaris per al funcionament.
 */
const PoliticaCookies = () => {
  const navigate = useNavigate();
  useEffect(() => {
    document.title = "Política de Cookies · Truc Valencià";
    const desc =
      "Política de Cookies i emmagatzematge local de Truc Valencià: quines dades guardem al teu dispositiu i com gestionar-les.";
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", desc);
  }, []);

  const lastUpdate = "30 d'abril de 2026";

  return (
    <main className="min-h-screen px-5 py-8 bg-background text-foreground">
      <div className="w-full max-w-2xl mx-auto flex flex-col gap-6">
        <header className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">Actualitzada: {lastUpdate}</p>
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
            Política de Cookies i Emmagatzematge Local
          </h1>
          <p className="text-muted-foreground">
            Aquesta política explica quina informació guardem al teu navegador o
            dispositiu mentre utilitzes l'aplicació{" "}
            <strong>Truc Valencià</strong>, i com pots gestionar-la.
          </p>

          <section className="mt-6">
            <h2 className="font-display font-bold text-xl mt-4 mb-2">
              1. Resum
            </h2>
            <ul className="list-disc pl-6 my-3 space-y-1">
              <li>
                <strong>No fem servir cookies de seguiment</strong>, ni
                publicitàries, ni d'analítica de tercers (Google Analytics,
                Facebook Pixel, etc.).
              </li>
              <li>
                Sí que fem servir <strong>localStorage</strong> i, en alguns
                casos, <strong>sessionStorage</strong> del teu navegador per a
                guardar preferències i l'estat de la partida.
              </li>
              <li>
                Tota aquesta informació és <strong>tècnicament necessària</strong>{" "}
                per al funcionament de l'app, així que no requereix consentiment
                exprés segons l'article 22.2 de la LSSI-CE.
              </li>
              <li>
                Pots esborrar-la en qualsevol moment des del teu navegador.
              </li>
            </ul>
          </section>

          <section className="mt-6">
            <h2 className="font-display font-bold text-xl mt-4 mb-2">
              2. Què és localStorage?
            </h2>
            <p>
              <strong>localStorage</strong> és un mecanisme estàndard del
              navegador que permet a una web guardar petites quantitats de text
              al teu propi dispositiu. A diferència de les cookies,
              <strong> mai s'envia automàticament a cap servidor</strong>: només
              hi accedeix el codi de l'app que ja s'ha carregat al teu
              navegador.
            </p>
          </section>

          <section className="mt-6">
            <h2 className="font-display font-bold text-xl mt-4 mb-2">
              3. Què guardem al teu dispositiu
            </h2>

            <div className="overflow-x-auto my-4">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left p-2 font-display">Tipus</th>
                    <th className="text-left p-2 font-display">Finalitat</th>
                    <th className="text-left p-2 font-display">Durada</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border">
                    <td className="p-2 align-top">
                      <strong>Identificador anònim de dispositiu</strong>
                    </td>
                    <td className="p-2 align-top">
                      Cadena aleatòria que generem la primera vegada que obris
                      l'app per a identificar la teua cadira en sales online i
                      poder-hi tornar.
                    </td>
                    <td className="p-2 align-top">Persistent</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-2 align-top">
                      <strong>Sobrenom</strong>
                    </td>
                    <td className="p-2 align-top">
                      L'àlies que escrius per a identificar-te a la mesa.
                    </td>
                    <td className="p-2 align-top">Persistent</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-2 align-top">
                      <strong>Preferències de joc</strong>
                    </td>
                    <td className="p-2 align-top">
                      Idioma, dificultat dels bots, tipus de cama (9 o 12),
                      timeout de torn i altres ajustos.
                    </td>
                    <td className="p-2 align-top">Persistent</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-2 align-top">
                      <strong>Estat de l'última partida</strong>
                    </td>
                    <td className="p-2 align-top">
                      Permet continuar una partida contra bots si tanques i
                      tornes a obrir l'app.
                    </td>
                    <td className="p-2 align-top">Fins que la finalitzes</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-2 align-top">
                      <strong>Estadístiques per a l'adaptació dels bots</strong>
                    </td>
                    <td className="p-2 align-top">
                      Comptadors anònims (envits acceptats, freqüència de
                      farols, etc.) per a ajustar el comportament dels bots al
                      teu estil de joc.
                    </td>
                    <td className="p-2 align-top">Persistent</td>
                  </tr>
                  <tr>
                    <td className="p-2 align-top">
                      <strong>Estat de la sessió de diagnòstic</strong>
                      <br />
                      <span className="text-xs text-muted-foreground">
                        (sessionStorage)
                      </span>
                    </td>
                    <td className="p-2 align-top">
                      Informació tècnica per a depuració mentre tens la
                      pestanya oberta.
                    </td>
                    <td className="p-2 align-top">Fins tancar la pestanya</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-muted-foreground">
              Cap d'aquestes dades s'utilitza per a perfilat publicitari ni es
              comparteix amb tercers.
            </p>
          </section>

          <section className="mt-6">
            <h2 className="font-display font-bold text-xl mt-4 mb-2">
              4. Cookies estrictament tècniques de tercers
            </h2>
            <p>
              Per a les partides online, l'app fa servir un proveïdor
              d'infraestructura (base de dades i comunicació en temps real). En
              algunes peticions, aquest proveïdor pot utilitzar <strong>cookies
              estrictament tècniques o capçaleres de sessió</strong> imprescindibles
              per al funcionament del servei (autenticació de la connexió en
              temps real). Aquestes <strong>no fan seguiment</strong> de la teua
              activitat ni perfilen el teu comportament.
            </p>
          </section>

          <section className="mt-6">
            <h2 className="font-display font-bold text-xl mt-4 mb-2">
              5. Com gestionar o esborrar les dades
            </h2>
            <p>Pots eliminar tot el que l'app guarda al teu dispositiu:</p>
            <ul className="list-disc pl-6 my-3 space-y-1">
              <li>
                <strong>Des de l'app</strong>: amb el botó "Esborrar partida
                guardada" de la pantalla d'inici (per a l'estat de la partida).
              </li>
              <li>
                <strong>Des del navegador</strong> (mètode més complet):
                <ul className="list-disc pl-6 mt-1 space-y-1">
                  <li>
                    <strong>Chrome / Edge</strong>: Configuració →
                    Privacitat i seguretat → Esborrar dades de navegació →{" "}
                    <em>Cookies i altres dades de llocs</em>.
                  </li>
                  <li>
                    <strong>Firefox</strong>: Configuració → Privacitat i
                    seguretat → Cookies i dades de llocs → Esborra dades.
                  </li>
                  <li>
                    <strong>Safari (iOS / macOS)</strong>: Ajustos → Safari →
                    Esborra l'historial i les dades dels llocs web.
                  </li>
                </ul>
              </li>
            </ul>
            <p className="text-sm text-muted-foreground">
              Tingues en compte que esborrar aquestes dades farà que perdes
              l'identificador de dispositiu (i no podràs reincorporar-te
              automàticament a sales online en curs), el sobrenom i les teues
              preferències.
            </p>
          </section>

          <section className="mt-6">
            <h2 className="font-display font-bold text-xl mt-4 mb-2">
              6. Per què no demanem el típic banner de cookies?
            </h2>
            <p>
              L'article 22.2 de la LSSI-CE i les directrius de l'Agència
              Espanyola de Protecció de Dades exclouen del consentiment
              previ les cookies o tècniques d'emmagatzematge que són{" "}
              <strong>estrictament necessàries</strong> per a la prestació del
              servei sol·licitat per la persona usuària. Tot el que guardem
              entra dins d'aquesta categoria, motiu pel qual no mostrem un
              banner de consentiment. Si en el futur incorporem qualsevol
              cookie no essencial, t'avisarem i et demanarem consentiment
              previ.
            </p>
          </section>

          <section className="mt-6">
            <h2 className="font-display font-bold text-xl mt-4 mb-2">
              7. Canvis en aquesta política
            </h2>
            <p>
              Si modifiquem el tipus d'emmagatzematge que utilitzem,
              actualitzarem aquesta pàgina i la data del peçal. La versió
              vigent sempre és l'accessible des d'aquesta pantalla.
            </p>
          </section>

          <section className="mt-6">
            <h2 className="font-display font-bold text-xl mt-4 mb-2">
              8. Més informació
            </h2>
            <p>
              Per al tractament de dades personals consulta la{" "}
              <Link to="/privacitat" className="underline text-primary">
                Política de Privacitat
              </Link>
              . Per a les regles d'ús del servei, els{" "}
              <Link to="/termes" className="underline text-primary">
                Termes i Condicions
              </Link>{" "}
              i l'
              <Link to="/avis-legal" className="underline text-primary">
                Avís Legal
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

export default PoliticaCookies;