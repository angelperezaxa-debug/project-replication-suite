import { Link, useNavigate } from "@/lib/router-shim";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LogOut } from "lucide-react";

/**
 * Política de Privacitat de l'aplicació "Truc Valencià".
 *
 * Aquesta app no demana ni recopila dades personals identificatives
 * (no email, no telèfon, no compte d'usuari). Totes les preferències
 * i estadístiques es guarden al dispositiu de l'usuari (localStorage).
 *
 * Per a les partides online, només es transmet un identificador anònim
 * de dispositiu i el sobrenom triat, que el propi usuari escriu.
 */
const PoliticaPrivacitat = () => {
  const navigate = useNavigate();
  useEffect(() => {
    document.title = "Política de Privacitat · Truc Valencià";
    const desc =
      "Política de Privacitat de Truc Valencià: dades tractades, finalitat i com exercir els teus drets ARCO/ARSULIPO.";
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
            Política de Privacitat
          </h1>
          <p className="text-muted-foreground">
            Aquesta política explica quines dades tracta l'aplicació{" "}
            <strong>Truc Valencià</strong>, amb quina finalitat, durant quant de
            temps i com pots exercir els teus drets.
          </p>

          <section className="mt-6">
            <h2 className="font-display font-bold text-xl mt-4 mb-2">
              1. Responsable del tractament
            </h2>
            <p>
              Aquesta aplicació és un projecte personal sense ànim de lucre. Si
              vols exercir els teus drets o tens qualsevol dubte sobre privacitat,
              pots contactar a través del canal d'incidències indicat a la pàgina
              de publicació de l'app.
            </p>
          </section>

          <section className="mt-6">
            <h2 className="font-display font-bold text-xl mt-4 mb-2">
              2. Quines dades tractem
            </h2>
            <p>
              <strong>No demanem nom real, email, telèfon ni cap dada de
              contacte.</strong> No hi ha registre d'usuaris. Les dades que es
              tracten són mínimes i, en la seua majoria, no surten del teu
              dispositiu:
            </p>
            <ul className="list-disc pl-6 my-3 space-y-1">
              <li>
                <strong>Sobrenom (àlies)</strong>: el text que tu mateix escrius
                per identificar-te a la mesa. Pots posar el que vulgues; no es
                verifica ni s'associa a cap identitat real.
              </li>
              <li>
                <strong>Identificador anònim de dispositiu</strong>: una cadena
                aleatòria generada pel navegador la primera vegada que obris
                l'app. Serveix per saber quina cadira ocupes en una partida i
                permetre tornar-hi si tanques i obris l'app.
              </li>
              <li>
                <strong>Preferències del joc</strong>: dificultat dels bots,
                idioma, tipus de cama, etc. Es guarden{" "}
                <strong>només al teu dispositiu</strong> (<code>localStorage</code>).
              </li>
              <li>
                <strong>Estadístiques de partida</strong>: comptadors per
                adaptar el comportament dels bots (envits acceptats, frequència
                de farols, etc.). Anònimes i associades a l'identificador
                anònim del dispositiu.
              </li>
              <li>
                <strong>Estat de la partida online</strong>: cartes, accions i
                missatges de xat de la sala. Necessari perquè la resta de
                jugadors veja la partida en temps real. S'esborra automàticament
                en finalitzar (vegeu apartat 5).
              </li>
            </ul>
            <p className="text-sm text-muted-foreground">
              No fem servir cookies de seguiment, ni publicitat, ni eines
              d'analítica de tercers.
            </p>
          </section>

          <section className="mt-6">
            <h2 className="font-display font-bold text-xl mt-4 mb-2">
              3. Finalitat i base legal
            </h2>
            <ul className="list-disc pl-6 my-3 space-y-1">
              <li>
                <strong>Finalitat</strong>: que pugues jugar al Truc, sol contra
                bots o online amb amics, mantindre les teues preferències i
                permetre que els bots s'adapten al teu estil de joc.
              </li>
              <li>
                <strong>Base legal</strong>: execució del servei sol·licitat per
                tu (art. 6.1.b RGPD). En no haver-hi dades identificatives, no
                es tracta cap categoria especial de dades.
              </li>
            </ul>
          </section>

          <section className="mt-6">
            <h2 className="font-display font-bold text-xl mt-4 mb-2">
              4. Qui pot accedir a les dades
            </h2>
            <p>
              Les preferències i estadístiques només són accessibles{" "}
              <strong>des del teu dispositiu</strong>. Per al joc online, l'estat
              de la sala el processa el nostre proveïdor d'infraestructura
              (servidor i base de dades) per a fer arribar les jugades a la resta
              de participants. <strong>No cedim dades a tercers per a fins
              comercials</strong> ni les fem servir per a perfilat publicitari.
            </p>
          </section>

          <section className="mt-6">
            <h2 className="font-display font-bold text-xl mt-4 mb-2">
              5. Quant de temps les guardem
            </h2>
            <ul className="list-disc pl-6 my-3 space-y-1">
              <li>
                <strong>Dades al teu dispositiu</strong>: fins que tu les
                esborres (botó "Esborrar dades" de l'app, o esborrant les dades
                del navegador).
              </li>
              <li>
                <strong>Sales online actives</strong>: les sales inactives durant
                15 minuts es marquen com a abandonades i s'eliminen
                automàticament 1 hora després.
              </li>
              <li>
                <strong>Estadístiques anònimes per a bots</strong>: es conserven
                mentre l'identificador anònim del dispositiu existisca. Es poden
                eliminar a petició teua aportant aquest identificador.
              </li>
            </ul>
          </section>

          <section className="mt-6">
            <h2 className="font-display font-bold text-xl mt-4 mb-2">
              6. Els teus drets (ARCO / ARSULIPO)
            </h2>
            <p>
              Encara que tractem dades mínimes i pseudonimitzades, tens dret a:
            </p>
            <ul className="list-disc pl-6 my-3 space-y-1">
              <li>
                <strong>Accés (A)</strong>: saber què tractem sobre el teu
                identificador anònim.
              </li>
              <li>
                <strong>Rectificació (R)</strong>: corregir dades inexactes
                (p. ex., el sobrenom).
              </li>
              <li>
                <strong>Cancel·lació / Supressió (C / S)</strong>: demanar que
                eliminem les estadístiques associades al teu identificador.
              </li>
              <li>
                <strong>Oposició (O)</strong>: oposar-te al tractament concret.
              </li>
              <li>
                <strong>Limitació del tractament (LI)</strong>: demanar que
                deixem de tractar les dades temporalment.
              </li>
              <li>
                <strong>Portabilitat (P)</strong>: rebre les teues dades en un
                format estructurat (JSON).
              </li>
              <li>
                <strong>No ser objecte de decisions automatitzades (O)</strong>:
                els bots adapten el seu joc, però no pren decisions amb efectes
                jurídics sobre tu.
              </li>
            </ul>
            <p>
              <strong>Com exercir-los</strong>: la forma més ràpida és des del
              propi dispositiu (esborrar dades del navegador o de l'app). Si vols
              que esborrem dades del costat servidor, contacta indicant el teu
              identificador anònim de dispositiu (el trobaràs a{" "}
              <em>Configuració → Diagnòstic</em>). Respondrem en un termini màxim
              d'un mes.
            </p>
            <p>
              Tens dret a presentar una reclamació davant l'<strong>Agencia
              Española de Protección de Datos</strong> (
              <a
                href="https://www.aepd.es"
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-primary"
              >
                www.aepd.es
              </a>
              ) si consideres que el tractament de les teues dades no és correcte.
            </p>
          </section>

          <section className="mt-6">
            <h2 className="font-display font-bold text-xl mt-4 mb-2">
              7. Menors d'edat
            </h2>
            <p>
              L'app no està dirigida específicament a menors. Si ets pare, mare o
              tutor i creus que un menor ha facilitat dades, contacta'ns i les
              eliminarem immediatament. En no demanar dades identificatives, no
              és tècnicament possible verificar l'edat dels usuaris.
            </p>
          </section>

          <section className="mt-6">
            <h2 className="font-display font-bold text-xl mt-4 mb-2">
              8. Seguretat
            </h2>
            <p>
              Apliquem mesures tècniques raonables: comunicacions xifrades
              (HTTPS), accés restringit a la base de dades mitjançant polítiques
              de seguretat a nivell de fila (RLS) i revocació de privilegis.
            </p>
          </section>

          <section className="mt-6">
            <h2 className="font-display font-bold text-xl mt-4 mb-2">
              9. Canvis en aquesta política
            </h2>
            <p>
              Si modifiquem aquesta política, actualitzarem la data del peçal i
              farem visible un avís a l'app. La versió vigent sempre és
              l'accessible des d'aquesta pàgina.
            </p>
          </section>

          <section className="mt-6">
            <h2 className="font-display font-bold text-xl mt-4 mb-2">
              10. Esborrat del compte i de les dades (Google Play)
            </h2>
            <p>
              D'acord amb la política de Google Play sobre esborrat de dades
              d'usuari, oferim dos camins equivalents per a sol·licitar
              l'esborrat de totes les dades associades al teu dispositiu:
            </p>
            <ul className="list-disc pl-6 my-3 space-y-1">
              <li>
                <strong>Dins de l'app</strong>:{" "}
                <em>Configuració → Privacitat i dades → Esborrar les meues
                dades</em>. Esborra dades servidor i locals d'una sola passa.
              </li>
              <li>
                <strong>Pàgina pública</strong>:{" "}
                <a href="/esborrar-dades" className="underline text-primary">
                  /esborrar-dades
                </a>
                . Permet sol·licitar-ho des d'un navegador, encara que ja
                no tingues l'app instal·lada, indicant l'identificador
                anònim del dispositiu.
              </li>
            </ul>
            <p className="text-sm text-muted-foreground">
              Categories de dades que es processen segons el Data Safety form
              de Google Play: <em>App activity</em> (esdeveniments de partida)
              i <em>User-generated content</em> (sobrenom i missatges de xat).
              No es recullen dades de localització, contactes, fitxers,
              identificadors publicitaris ni dades financeres.
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

export default PoliticaPrivacitat;