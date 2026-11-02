import TerminKarte from "../components/TerminKarte";
import { beispielTermine } from "../lib/termine";

export default function Termine() {
  return (
    <main>
      <h1 className="text-5xl text-center border rounded-full p-4 mb-4">Termine</h1>

      <ul className="border rounded-xl grid lg:grid-cols-4 md:grid-cols-3 p-2 gap-3">
        {beispielTermine.map((termin) => (
          <li key={termin.id}>
            <TerminKarte termin={termin} />
          </li>
        ))}
      </ul>
    </main>
  );
}
