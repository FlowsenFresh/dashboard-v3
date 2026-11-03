import type { UeberUns as UeberUnsDaten } from "@/app/lib/laeden";
import Bearbeitbar from "../_bearbeiten/Bearbeitbar";
import { Entfernen, Hinzufuegen } from "../_bearbeiten/ListenKnoepfe";
import Abschnitt, { type Ton } from "./Abschnitt";

type Props = { ueberUns: UeberUnsDaten | null; ton: Ton; bearbeiten?: boolean };

export default function UeberUns({ ueberUns, ton, bearbeiten }: Props) {
  // Ohne Text gibt es den Abschnitt nicht. Im Bearbeitungsmodus zeigen wir ihn leer zum Ausfüllen.
  if (!ueberUns?.text && !bearbeiten) return null;
  const fakten = ueberUns?.fakten ?? [];

  return (
    <Abschnitt id="ueber-uns" ton={ton} klein="Wer wir sind" titel="Über uns">
      <p className="text-2xl leading-relaxed">
        <Bearbeitbar
          pfad="ueberUns.text"
          wert={ueberUns?.text ?? ""}
          mehrzeilig
          platzhalter="Ein paar Sätze über euch. Leer lassen = Abschnitt wird nicht gezeigt."
        />
      </p>
      {(fakten.length > 0 || bearbeiten) && (
        <ul className="mt-10 flex flex-col gap-4">
          {fakten.map((fakt, index) => (
            <li key={index} className="flex items-center gap-4 text-xl font-medium">
              <span className="size-3 shrink-0 rounded-full bg-akzent" />
              <Bearbeitbar
                pfad={`ueberUns.fakten.${index}`}
                wert={fakt}
                platzhalter="z. B. Seit 1998"
              />
              <Entfernen pfad="ueberUns.fakten" index={index} />
            </li>
          ))}
        </ul>
      )}
      <Hinzufuegen pfad="ueberUns.fakten" neu="" text="Fakt" />
    </Abschnitt>
  );
}
