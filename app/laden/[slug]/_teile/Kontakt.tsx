import type { Laden } from "@/app/lib/laeden";
import KontaktFormular from "@/app/components/KontaktFormular";
import Ueberschrift from "./Ueberschrift";

// Das Formular von vorher, jetzt als Abschnitt im Template
export default function Kontakt({ laden }: { laden: Laden }) {
  return (
    <section id="kontakt" className="rahmen scroll-mt-20 py-16">
      <div className="mx-auto max-w-3xl">
        <Ueberschrift klein="Schreib uns" titel="Nachricht an uns" />
        <div className="karte">
          <p className="mb-5 text-sm text-gedaempft">Wir melden uns so schnell wie möglich.</p>
          <KontaktFormular slug={laden.slug} anliegen={laden.anliegen} />
        </div>
      </div>
    </section>
  );
}
