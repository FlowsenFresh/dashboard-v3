import { Suspense } from "react";
import { alleNachrichten } from "../lib/nachrichtenSpeicher";
import NachrichtenKarte from "../components/NachrichtenKarte";

export default function Nachrichten() {
  return (
    <main>
      <h1 className="text-5xl text-center border rounded-full p-4 mb-4">Nachrichten</h1>
      {/* Die Liste wird bei jedem Aufruf frisch gelesen, darum in Suspense */}
      <Suspense fallback={<p className="text-center">Lade Nachrichten …</p>}>
        <NachrichtenListe />
      </Suspense>
    </main>
  );
}

async function NachrichtenListe() {
  const nachrichten = await alleNachrichten();
  return (
    <ul className="border rounded-xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 p-2 gap-3">
      {nachrichten.map((nachricht) => (
        <li key={nachricht.id}>
          <NachrichtenKarte nachricht={nachricht} />
        </li>
      ))}
    </ul>
  );
}
