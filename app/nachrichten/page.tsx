import { beispielNachrichten } from "../lib/nachrichten";
import NachrichtenKarte from "../components/NachrichtenKarte";

export default function Nachrichten() {
  return (
    <main>
      <h1 className="text-5xl text-center border rounded-full p-4 mb-4">Nachrichten</h1>
      <ul className="border rounded-xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 p-2 gap-3">
        {beispielNachrichten.map((nachricht) => (
          <li key={nachricht.id}>
            <NachrichtenKarte nachricht={nachricht} />
          </li>
        ))}
      </ul>
    </main>
  );
}
