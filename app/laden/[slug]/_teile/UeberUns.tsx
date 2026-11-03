import type { Laden } from "@/app/lib/laeden";
import Ueberschrift from "./Ueberschrift";

// NonNullable: page.tsx zeigt den Abschnitt nur, wenn ueberUns gefüllt ist
type Props = { ueberUns: NonNullable<Laden["ueberUns"]> };

export default function UeberUns({ ueberUns }: Props) {
  return (
    <section id="ueber-uns" className="rahmen scroll-mt-20 py-16">
      <div className="grid gap-8 md:grid-cols-[2fr_1fr] md:items-center">
        <div>
          <Ueberschrift klein="Wer wir sind" titel="Über uns" />
          <p className="text-lg leading-relaxed text-schrift/90">{ueberUns.text}</p>
        </div>
        <ul className="flex flex-wrap gap-3 md:flex-col">
          {ueberUns.fakten.map((fakt) => (
            <li key={fakt} className="karte flex items-center gap-3 py-3">
              <span className="size-2 rounded-full bg-akzent" />
              <span className="font-medium">{fakt}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
