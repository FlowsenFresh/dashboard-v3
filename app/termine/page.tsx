import { Suspense } from "react";
import TerminKarte from "../components/TerminKarte";
import { alleTermine } from "../lib/termineSpeicher";

export default function Termine() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <h1 className="seitentitel mb-6">Termine</h1>
      {/* Wie bei den Nachrichten: frisch aus der Datenbank, darum in Suspense */}
      <Suspense fallback={<p className="text-gedaempft">Lade Termine …</p>}>
        <TerminListe />
      </Suspense>
    </main>
  );
}

async function TerminListe() {
  const termine = await alleTermine();
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {termine.map((termin) => (
        <li key={termin.id}>
          <TerminKarte termin={termin} />
        </li>
      ))}
    </ul>
  );
}
