import { Suspense } from "react";
import { redirect } from "next/navigation";
import { ladenNachId } from "@/app/lib/laeden";
import { benutzerPflicht, darfWebseiteBearbeiten, sichtbarerLaden } from "@/app/lib/sitzung";

// Die Webseite bearbeitet man direkt auf der Laden-Seite (Doppelklick auf einen Text).
// Das alte Formular gibt es nicht mehr. Diese Adresse bleibt, damit der Menüpunkt "Webseite"
// einfach funktioniert: sie prüft das Recht und schickt dann zur Laden-Seite mit ?bearbeiten,
// dort ist der Bearbeitungsmodus dann gleich an.
export default function Webseite() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="seitentitel">Webseite bearbeiten</h1>
      <Suspense fallback={<p className="mt-8 text-gedaempft">Öffne deine Webseite …</p>}>
        <Weiterleiten />
      </Suspense>
    </main>
  );
}

async function Weiterleiten() {
  const angemeldet = await benutzerPflicht();

  if (!darfWebseiteBearbeiten(angemeldet)) {
    return (
      <p className="karte mt-8 text-gedaempft">
        Die Webseite bearbeitet bei euch der Inhaber. Er kann es dir unter „Team“ erlauben.
      </p>
    );
  }

  const ladenId = sichtbarerLaden(angemeldet);
  const laden = ladenId === -1 ? null : await ladenNachId(ladenId);
  if (!laden) {
    return (
      <p className="karte mt-8 text-gedaempft">
        Du hast gerade keinen Zugang zu einem Laden. Öffne die Laden-Seite direkt, dort kannst du
        als admin per Doppelklick bearbeiten.
      </p>
    );
  }

  redirect(`/laden/${laden.slug}?bearbeiten`);
}
