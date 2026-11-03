import { Suspense } from "react";
import WebseiteFormular from "@/app/components/WebseiteFormular";
import { ladenNachId } from "@/app/lib/laeden";
import { benutzerPflicht, sichtbarerLaden } from "@/app/lib/sitzung";

// Das CMS: hier pflegt der Ladenbesitzer die Inhalte seiner Webseite selbst.
// Der admin bearbeitet den Laden, den er oben im Laden-Wechsler gewählt hat.
export default function Webseite() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="seitentitel">Webseite bearbeiten</h1>
      <p className="mb-8 mt-2 text-gedaempft">
        Was du hier speicherst, steht sofort auf der Laden-Seite.
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

  if (ladenId === null) {
    return (
      <p className="karte text-gedaempft">
        Du schaust gerade auf „Alle Läden“. Wähle oben einen Laden aus, dann kannst du seine
        Webseite bearbeiten.
      </p>
    );
  }

  const laden = await ladenNachId(ladenId);
  if (!laden) return <p className="karte text-gedaempft">Diesen Laden gibt es nicht.</p>;

  // key: wechselt der admin den Laden, startet das Formular frisch mit den neuen Daten
  return <WebseiteFormular key={laden.id} laden={laden} />;
}
