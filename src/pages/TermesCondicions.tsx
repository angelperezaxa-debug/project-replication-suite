import { Link, useNavigate } from "@/lib/router-shim";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LogOut } from "lucide-react";

/**
 * Termes i Condicions d'ús de l'aplicació "Truc Valencià".
 *
 * Cobreix: acceptació, ús permès, regles del xat (in-game i text lliure),
 * moderació, sistema de report, limitació de responsabilitat i llei aplicable.
 */
const TermesCondicions = () => {
  const navigate = useNavigate();
  useEffect(() => {
    document.title = "Termes i Condicions · Truc Valencià";
    const desc =
      "Termes i Condicions d'ús de Truc Valencià: regles del xat, moderació, reports i limitació de responsabilitat.";
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
          <p className="text-xs text-muted-foreground">Actualitzats: {lastUpdate}</p>
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
            Termes i Condicions d'ús
          </h1>
          <p className="text-muted-foreground">
            Aquests termes regulen l'ús de l'aplicació <strong>Truc Valencià</strong>.
            En utilitzar-la acceptes íntegrament aquestes condicions. Si no
            estàs d'acord, no la utilitzes.
          </p>

          <section className="mt-6">
            <h2 className="font-display font-bold text-xl mt-4 mb-2">
              1. Objecte i acceptació
            </h2>
            <p>
              Truc Valencià és una aplicació gratuïta per a jugar al joc de cartes
              del Truc, sol contra bots o online amb amics. L'ús de l'app implica
              l'acceptació d'aquests termes i de la{" "}
              <Link to="/privacitat" className="underline text-primary">
                Política de Privacitat
              </Link>
              .
            </p>
          </section>

          <section className="mt-6">
            <h2 className="font-display font-bold text-xl mt-4 mb-2">
              2. Ús permès
            </h2>
            <ul className="list-disc pl-6 my-3 space-y-1">
              <li>L'app és per a ús personal, lúdic i no comercial.</li>
              <li>
                Cal ser <strong>major de 14 anys</strong>. Si tens entre 14 i 18
                anys, et recomanem fer-la servir amb el coneixement dels teus
                pares o tutors.
              </li>
              <li>
                Has de fer servir un sobrenom respectuós, sense suplantar la
                identitat de tercers ni utilitzar marques, insults o continguts
                ofensius.
              </li>
              <li>
                No pots utilitzar bots, scripts, eines automatitzades o
                enginyeria inversa per a alterar el funcionament del joc o
                obtindre avantatge sobre altres jugadors.
              </li>
            </ul>
          </section>

          <section className="mt-6">
            <h2 className="font-display font-bold text-xl mt-4 mb-2">
              3. Regles del xat
            </h2>
            <p>L'app disposa de dos tipus de comunicació entre jugadors:</p>
            <ul className="list-disc pl-6 my-3 space-y-1">
              <li>
                <strong>Frases predefinides de mesa</strong>: missatges curts del
                joc ("Envit!", "Vull!", "Bona!", etc.). Tot el repertori està
                controlat i no permet text lliure.
              </li>
              <li>
                <strong>Xat lliure de text</strong>: missatges curts (màxim 200
                caràcters) entre jugadors d'una mateixa sala.
              </li>
            </ul>
            <p>
              <strong>Conductes prohibides al xat (i al sobrenom):</strong>
            </p>
            <ul className="list-disc pl-6 my-3 space-y-1">
              <li>
                Insults, amenaces, assetjament, discurs d'odi o discriminació
                per raó de sexe, gènere, orientació sexual, raça, origen,
                religió, ideologia o discapacitat.
              </li>
              <li>
                Continguts sexuals explícits, violents o que puguen ferir la
                sensibilitat d'altres jugadors.
              </li>
              <li>
                <strong>Spam</strong>, publicitat no sol·licitada, enllaços a
                webs externes o estafes (phishing).
              </li>
              <li>
                Compartir <strong>dades personals teues o d'altres</strong>{" "}
                (telèfon, adreça, email, xarxes socials, etc.).
              </li>
              <li>
                Suplantar la identitat de persones reals o personatges públics.
              </li>
              <li>
                Trampes, col·lusió entre jugadors d'equips contraris o qualsevol
                comportament antiesportiu deliberat.
              </li>
            </ul>
            <p>
              El xat <strong>no és privat</strong>: el veuen tots els jugadors de
              la sala. Sigues respectuós; estàs jugant amb persones reals.
            </p>
          </section>

          <section className="mt-6">
            <h2 className="font-display font-bold text-xl mt-4 mb-2">
              4. Moderació
            </h2>
            <p>Per a mantindre un entorn segur:</p>
            <ul className="list-disc pl-6 my-3 space-y-1">
              <li>
                Apliquem filtres tècnics automàtics (límits de longitud, control
                d'enviaments massius i validacions del costat servidor).
              </li>
              <li>
                Ens reservem el dret de <strong>retirar missatges</strong>,
                <strong> tancar sales</strong> o <strong>bloquejar
                identificadors de dispositiu</strong> que incomplisquen aquests
                termes, sense necessitat de previ avís.
              </li>
              <li>
                Les sales online inactives s'arxiven automàticament als 15
                minuts i s'eliminen 1 hora després (incloent-hi tot el seu xat).
              </li>
              <li>
                En cas de reincidència o conducta greu (assetjament, amenaces),
                podrem aplicar un bloqueig permanent del dispositiu.
              </li>
            </ul>
          </section>

          <section className="mt-6">
            <h2 className="font-display font-bold text-xl mt-4 mb-2">
              5. Sistema de report
            </h2>
            <p>
              Si veus un missatge o comportament que incompleix aquests termes,
              pots reportar-lo:
            </p>
            <ul className="list-disc pl-6 my-3 space-y-1">
              <li>
                <strong>Des de la sala</strong>: mantén premut un missatge del
                xat per obrir l'opció de reportar (si està disponible a la teua
                versió).
              </li>
              <li>
                <strong>Per correu d'incidències</strong>: indica el codi de la
                sala, l'hora aproximada i una descripció del fet. Trobaràs el
                canal de contacte a la pàgina de publicació de l'app.
              </li>
            </ul>
            <p>
              Inclou tota la informació possible: <strong>codi de sala</strong>,
              data i hora aproximada, sobrenom de la persona reportada i, si en
              tens, una captura. Tractarem els reports amb confidencialitat i
              respondrem en el termini més breu possible.
            </p>
          </section>

          <section className="mt-6">
            <h2 className="font-display font-bold text-xl mt-4 mb-2">
              6. Disponibilitat del servei
            </h2>
            <p>
              L'app es proporciona <strong>"tal qual" i "segons disponibilitat"</strong>.
              No garantim que estiga lliure d'errors, interrupcions o pèrdues de
              connexió. Podem modificar, suspendre o discontinuar funcionalitats
              en qualsevol moment, especialment per manteniment, motius
              tècnics o legals.
            </p>
            <p>
              Les partides online depenen de connexió estable a Internet i del
              proveïdor d'infraestructura. <strong>No garantim la conservació
              indefinida</strong> de partides ni de l'historial de xat.
            </p>
          </section>

          <section className="mt-6">
            <h2 className="font-display font-bold text-xl mt-4 mb-2">
              7. Limitació de responsabilitat
            </h2>
            <p>
              En la màxima mesura permesa per la llei aplicable:
            </p>
            <ul className="list-disc pl-6 my-3 space-y-1">
              <li>
                L'app es facilita <strong>sense cap garantia</strong> expressa o
                implícita, incloent-hi (sense limitació) la idoneïtat per a un
                propòsit concret o l'absència d'errors.
              </li>
              <li>
                <strong>No ens fem responsables</strong> dels danys directes,
                indirectes, incidentals, especials o conseqüents derivats de
                l'ús o la impossibilitat d'ús de l'app, ni de pèrdues de dades,
                de partides o de progrés.
              </li>
              <li>
                <strong>No assumim responsabilitat pel contingut publicat
                pels usuaris</strong> al xat o als sobrenoms. La responsabilitat
                d'allò que cada persona escriu és exclusivament seua.
              </li>
              <li>
                No responem per perjudicis derivats de talls de connexió,
                fallades del dispositiu, virus o atacs informàtics aliens al
                nostre control.
              </li>
              <li>
                Aquestes limitacions <strong>no afecten</strong> els drets que
                la legislació reconega a les persones consumidores que no es
                puguen excloure per contracte.
              </li>
            </ul>
          </section>

          <section className="mt-6">
            <h2 className="font-display font-bold text-xl mt-4 mb-2">
              8. Propietat intel·lectual
            </h2>
            <p>
              L'app, el seu codi, disseny, gràfics i textos estan protegits per
              drets d'autor del seu titular. Es permet l'ús personal i privat de
              l'app. Queda prohibida qualsevol reproducció, distribució o
              transformació no autoritzada.
            </p>
          </section>

          <section className="mt-6">
            <h2 className="font-display font-bold text-xl mt-4 mb-2">
              9. Modificacions dels termes
            </h2>
            <p>
              Podem actualitzar aquests termes per motius legals, tècnics o
              operatius. Quan hi haja canvis significatius, t'avisarem a l'app.
              L'ús continuat després de la data d'actualització implica
              l'acceptació de la nova versió.
            </p>
          </section>

          <section className="mt-6">
            <h2 className="font-display font-bold text-xl mt-4 mb-2">
              10. Llei aplicable i jurisdicció
            </h2>
            <p>
              Aquests termes es regeixen per la llei espanyola. Per a qualsevol
              controvèrsia, les parts se sotmeten als jutjats i tribunals que
              corresponguen segons la legislació de consum aplicable.
            </p>
          </section>

          <section className="mt-6">
            <h2 className="font-display font-bold text-xl mt-4 mb-2">
              11. Contacte
            </h2>
            <p>
              Per a reports, sol·licituds de drets o consultes legals, contacta a
              través del canal d'incidències indicat a la pàgina de publicació
              de l'app. Pots consultar també la{" "}
              <Link to="/privacitat" className="underline text-primary">
                Política de Privacitat
              </Link>{" "}
              per a qüestions relacionades amb les teues dades.
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

export default TermesCondicions;