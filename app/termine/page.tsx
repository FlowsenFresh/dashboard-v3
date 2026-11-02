import TerminKarte from "../components/TerminKarte";
import { beispielTermine } from "../lib/termine";

export default function Termine() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <h1 className="seitentitel mb-6">Termine</h1>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {beispielTermine.map((termin) => (
          <li key={termin.id}>
            <TerminKarte termin={termin} />
          </li>
        ))}
      </ul>
    </main>
  );
}
