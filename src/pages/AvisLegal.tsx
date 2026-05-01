import { Link, useNavigate } from "@/lib/router-shim";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LogOut } from "lucide-react";

/**
 * Avís Legal de l'aplicació "Truc Valencià".
 * Inclou identificació del titular i obligacions LSSI-CE.
 */
const AvisLegal = () => {
  const navigate = useNavigate();
  useEffect(() => {
    document.title = "Avís Legal · Truc Valencià";
    const desc =
      "Avís Legal de Truc Valencià: titular, dades de contacte, condicions d'ús i propietat intel·lectual.";
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
          <p className="text-xs text-muted-foreground">Actualitzat: {lastUpdate}</p>
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
            Avís Legal
          </h1>
          <p className="text-muted-foreground">
            En compliment de l'article 10 de la Llei 34/2002, d'11 de juliol, de
            Serveis de la Societat de la Informació i de Comerç Electrònic
            (LSSI-CE), s'informa dels següents aspectes legals.
          </p>

          <section className="mt-6">
            <h2 className="font-display font-bold text-xl mt-4 mb-2">
              1. Dades del titular
            </h2>
            <ul className="list-none pl-0 my-3 space-y-1">
              <li>
                <strong>Titular:</strong> Ángel Pérez Lara
              </li>
              <li>
                <strong>NIF:</strong> 53361351V
              </li>
              <li>
                <strong>Correu de contacte:</strong>{" "}
                <a
                  href="mailto:angelbudo4@gmail.com"
                  className="underline text-primary"
                >
                  angelbudo4@gmail.com
                </a>
              </li>
              <li>
                <strong>Aplicació:</strong> Truc Valencià
              </li>
            </ul>
          </section>

          <section className="mt-6">
            <h2 className="font-display font-bold text-xl mt-4 mb-2">
              2. Objecte
            </h2>
            <p>
              Aquest avís legal regula l'accés i ús de l'aplicació{" "}
              <strong>Truc Valencià</strong>, un projecte personal sense ànim de
              lucre per a jugar al joc de cartes del Truc, sol contra bots o
              online amb amics. L'ús de l'app implica l'acceptació plena
              d'aquest avís legal, dels{" "}
              <Link to="/termes" className="underline text-primary">
                Termes i Condicions
              </Link>{" "}
              i de la{" "}
              <Link to="/privacitat" className="underline text-primary">
                Política de Privacitat
              </Link>
              .
            </p>
          </section>

          <section className="mt-6">
            <h2 className="font-display font-bold text-xl mt-4 mb-2">
              3. Condicions d'ús
            </h2>
            <p>
              L'usuari es compromet a fer un ús diligent de l'app i a no
              utilitzar-la per a activitats il·lícites, lesives de drets o
              interessos de tercers, o que puguen perjudicar el funcionament
              normal del servei. Les regles concretes d'ús i de comportament al
              xat es detallen als{" "}
              <Link to="/termes" className="underline text-primary">
                Termes i Condicions
              </Link>
              .
            </p>
          </section>

          <section className="mt-6">
            <h2 className="font-display font-bold text-xl mt-4 mb-2">
              4. Propietat intel·lectual i industrial
            </h2>
            <p>
              Tots els continguts de l'app (codi font, textos, gràfics,
              dissenys, logotips, interfícies i qualsevol altre element) són
              titularitat del titular indicat al punt 1, o bé es fan servir amb
              autorització dels seus respectius propietaris. Queda prohibida la
              reproducció, distribució, comunicació pública o transformació, total
              o parcial, sense autorització expressa i per escrit del titular.
            </p>
            <p>
              El nom "Truc" fa referència al joc tradicional de cartes valencià;
              cap reclamació s'efectua sobre el joc en si, que pertany al
              patrimoni cultural.
            </p>
          </section>

          <section className="mt-6">
            <h2 className="font-display font-bold text-xl mt-4 mb-2">
              5. Exclusió de garanties i responsabilitat
            </h2>
            <p>
              El titular no garanteix la disponibilitat i continuïtat
              ininterrompudes del servei. En la mesura permesa per la llei, no
              es fa responsable dels danys de qualsevol naturalesa derivats de
              la falta de disponibilitat o de continuïtat del funcionament de
              l'app, ni de la presència de virus o altres elements lesius
              aliens al seu control. Vegeu el detall a la clàusula 7 dels{" "}
              <Link to="/termes" className="underline text-primary">
                Termes i Condicions
              </Link>
              .
            </p>
          </section>

          <section className="mt-6">
            <h2 className="font-display font-bold text-xl mt-4 mb-2">
              6. Enllaços a tercers
            </h2>
            <p>
              Si l'app inclou enllaços a llocs de tercers, el titular no es fa
              responsable del seu contingut, polítiques o pràctiques de
              privacitat. La inclusió d'aquests enllaços no implica relació,
              recomanació ni patrocini.
            </p>
          </section>

          <section className="mt-6">
            <h2 className="font-display font-bold text-xl mt-4 mb-2">
              7. Protecció de dades
            </h2>
            <p>
              El tractament de dades personals es regeix per la nostra{" "}
              <Link to="/privacitat" className="underline text-primary">
                Política de Privacitat
              </Link>
              . L'app no demana dades identificatives (correu, telèfon o nom
              real) i la majoria d'informació es guarda al dispositiu de
              l'usuari.
            </p>
          </section>

          <section className="mt-6">
            <h2 className="font-display font-bold text-xl mt-4 mb-2">
              8. Llei aplicable i jurisdicció
            </h2>
            <p>
              Aquest avís legal es regeix per la llei espanyola. Per a qualsevol
              controvèrsia, les parts se sotmeten als jutjats i tribunals que
              corresponguen segons la legislació de consum aplicable.
            </p>
          </section>

          <section className="mt-6">
            <h2 className="font-display font-bold text-xl mt-4 mb-2">
              9. Contacte
            </h2>
            <p>
              Per a qualsevol consulta legal, sol·licitud o report, pots
              escriure a{" "}
              <a
                href="mailto:angelbudo4@gmail.com"
                className="underline text-primary"
              >
                angelbudo4@gmail.com
              </a>
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

export default AvisLegal;