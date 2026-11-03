import type { UeberUns as UeberUnsDaten } from "@/app/lib/laeden";
import Abschnitt, { type Ton } from "./Abschnitt";

export default function UeberUns({ ueberUns, ton }: { ueberUns: UeberUnsDaten; ton: Ton }) {
  return (
    <Abschnitt id="ueber-uns" ton={ton} klein="Wer wir sind" titel="Über uns">
      <p className="text-2xl leading-relaxed">{ueberUns.text}</p>
      {ueberUns.fakten.length > 0 && (
        <ul className="mt-10 flex flex-col gap-4">
          {ueberUns.fakten.map((fakt) => (
            <li key={fakt} className="flex items-center gap-4 text-xl font-medium">
              <span className="size-3 shrink-0 rounded-full bg-akzent" />
              {fakt}
            </li>
          ))}
        </ul>
      )}
    </Abschnitt>
  );
}
