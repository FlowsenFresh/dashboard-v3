import type { CSSProperties } from "react";
import type { Laden } from "@/app/lib/laeden";
import Kopf from "./Kopf";
import Held from "./Held";
import Leistungen from "./Leistungen";
import UeberUns from "./UeberUns";
import Oeffnungszeiten from "./Oeffnungszeiten";
import Anfahrt from "./Anfahrt";
import Kontakt from "./Kontakt";
import Fuss from "./Fuss";

// Die ganze Laden-Seite aus ihren Abschnitten. Wird zweimal benutzt:
// - normal von page.tsx (für Besucher)
// - im Bearbeitungsmodus mit bearbeiten=true und den gerade geänderten Daten
// Reihenfolge oder Hintergrundton ändern = hier Zeilen tauschen.

// Überschreibt unsere Akzentfarbe nur für diese Seite. Alle Klassen wie
// text-akzent oder bg-akzent/10 lesen die CSS-Variable und ziehen automatisch mit.
// Die Farbe beim Drüberfahren mischt der Browser selbst: 25 % Weiß dazu.
function farbVariablen(farbe: string | null): CSSProperties | undefined {
  if (!farbe) return undefined;
  return {
    "--color-akzent": farbe,
    "--color-akzent-hell": `color-mix(in oklab, ${farbe}, white 25%)`,
  } as CSSProperties;
}

export default function Seite({ laden, bearbeiten }: { laden: Laden; bearbeiten?: boolean }) {
  return (
    // text-lg: auf der Laden-Seite ist alles etwas größer, angenehm auch für ältere Kunden
    <div style={farbVariablen(laden.farbe)} className="flex flex-1 flex-col text-lg">
      <Kopf laden={laden} />
      <main className="flex-1">
        {/* Die Abschnitte wechseln sich im Hintergrund ab (siehe Abschnitt.tsx) */}
        <Held laden={laden} bearbeiten={bearbeiten} />
        <Leistungen leistungen={laden.leistungen} ton="dunkel" bearbeiten={bearbeiten} />
        <UeberUns ueberUns={laden.ueberUns} ton="hell" bearbeiten={bearbeiten} />
        <Oeffnungszeiten laden={laden} ton="mittel" bearbeiten={bearbeiten} />
        <Anfahrt laden={laden} ton="dunkel" bearbeiten={bearbeiten} />
        <Kontakt laden={laden} ton="hell" bearbeiten={bearbeiten} />
      </main>
      <Fuss laden={laden} />
      {/* Platz für die Leiste unten, damit sie nichts verdeckt */}
      {bearbeiten && <div className="h-24" />}
    </div>
  );
}
