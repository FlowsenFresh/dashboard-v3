import type { Laden } from "@/app/lib/laeden";
import KontaktFormular from "@/app/components/KontaktFormular";
import Bearbeitbar from "../_bearbeiten/Bearbeitbar";
import { Entfernen, Hinzufuegen } from "../_bearbeiten/ListenKnoepfe";
import Abschnitt, { type Ton } from "./Abschnitt";

type Props = { laden: Laden; ton: Ton; bearbeiten?: boolean };

// Das Kontaktformular. Im Bearbeitungsmodus stattdessen die Liste der Anliegen,
// aus denen Kunden im ersten Schritt wählen.
export default function Kontakt({ laden, ton, bearbeiten }: Props) {
  return (
    <Abschnitt id="kontakt" ton={ton} klein="Schreib uns" titel="Nachricht an uns">
      {bearbeiten ? (
        <>
          <p className="mb-6 text-gedaempft">
            Aus diesen Anliegen wählen Kunden im Formular, worum es geht:
          </p>
          <ul className="flex flex-col gap-3">
            {laden.anliegen.map((eintrag, index) => (
              <li key={index} className="auswahl flex items-center justify-between gap-4">
                <Bearbeitbar pfad={`anliegen.${index}`} wert={eintrag} platzhalter="Anliegen" />
                <Entfernen pfad="anliegen" index={index} />
              </li>
            ))}
          </ul>
          <Hinzufuegen pfad="anliegen" neu="" text="Anliegen" />
        </>
      ) : (
        <>
          <p className="mb-8 text-gedaempft">Wir melden uns so schnell wie möglich.</p>
          <KontaktFormular slug={laden.slug} anliegen={laden.anliegen} />
        </>
      )}
    </Abschnitt>
  );
}
