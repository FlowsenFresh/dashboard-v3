import type { Laden } from "@/app/lib/laeden";
import KontaktFormular from "@/app/components/KontaktFormular";
import Abschnitt, { type Ton } from "./Abschnitt";

// Das Formular von vorher, jetzt als eigener Abschnitt
export default function Kontakt({ laden, ton }: { laden: Laden; ton: Ton }) {
  return (
    <Abschnitt id="kontakt" ton={ton} klein="Schreib uns" titel="Nachricht an uns">
      <p className="mb-8 text-gedaempft">Wir melden uns so schnell wie möglich.</p>
      <KontaktFormular slug={laden.slug} anliegen={laden.anliegen} />
    </Abschnitt>
  );
}
