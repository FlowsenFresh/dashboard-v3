import { Suspense } from "react";
import WebseiteFormular from "@/app/components/WebseiteFormular";
import { ladenNachId } from "@/app/lib/laeden";
import { benutzerPflicht, darfWebseiteBearbeiten, sichtbarerLaden } from "@/app/lib/sitzung";

// Das CMS: hier pflegt der Ladenbesitzer die Inhalte seiner Webseite selbst.
// Der admin bearbeitet den Laden, den er oben im Laden-Wechsler gewählt hat.
export default function Webseite() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="seitentitel">Webseite bearbeiten</h1>
      <p className="mb-8 mt-2 text-gedaempft">
        Was du hier speicherst, steht sofort auf der Laden-Seite. Tipp: Auf der Laden-Seite selbst
        gibt es unten den Knopf „Seite bearbeiten“. Dann änderst du jeden Text per Doppelklick.
      </p>
      <Suspense fallback={<p className="text-gedaempft">Lade Inhalte …</p>}>
        <Bearbeiten />
      </Suspense>
    </main>
  );
}

async function Bearbeiten() {
  const angemeldet = await benutzerPflicht();
  const ladenId = sichtbarerLaden(angemeldet);

  if (!darfWebseiteBearbeiten(angemeldet)) {
    return (
      <p className="karte text-gedaempft">
        Die Webseite bearbeitet bei euch der Inhaber. Er kann es dir unter „Team“ erlauben.
      </p>
    );
  }

  if (ladenId === -1) {
    return (
      <p className="karte text-gedaempft">
        Du hast gerade keinen Zugang zu einem Laden. Öffne ihn im Admin-Bereich mit dem Code vom
        Inhaber, oder bearbeite die Webseite direkt auf der Laden-Seite.
      </p>
    );
  }

  const laden = await ladenNachId(ladenId);
  if (!laden) return <p className="karte text-gedaempft">Diesen Laden gibt es nicht.</p>;

  // key: wechselt der admin den Laden, startet das Formular frisch mit den neuen Daten
  return <WebseiteFormular key={laden.id} laden={laden} />;
}
