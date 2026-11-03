import { Suspense } from "react";
import { alleNachrichten } from "@/app/lib/nachrichtenSpeicher";
import NachrichtenKarte from "@/app/components/NachrichtenKarte";

export default function Nachrichten() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <h1 className="seitentitel mb-6">Nachrichten</h1>
      {/* Die Liste wird bei jedem Aufruf frisch gelesen, darum in Suspense */}
      <Suspense fallback={<p className="text-gedaempft">Lade Nachrichten …</p>}>
        <NachrichtenListe />
      </Suspense>
    </main>
  );
}

async function NachrichtenListe() {
  const nachrichten = await alleNachrichten();
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {nachrichten.map((nachricht) => (
        <li key={nachricht.id}>
          <NachrichtenKarte nachricht={nachricht} />
        </li>
      ))}
    </ul>
  );
}
