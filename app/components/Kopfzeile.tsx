import Link from "next/link";

export default function Kopfzeile() {
  return (
    <header>
      <nav className="border rounded flex gap-4 w-fit mx-auto p-3 text-xl mb-4">
        <Link href={"/"} className="hover:underline">
          Home
        </Link>
        <Link href={"/termine"} className="hover:underline">
          Termine
        </Link>
        <Link href={"/nachrichten"} className="hover:underline">
          Nachrichten
        </Link>
        <Link href={"/laden/radl-huber"} className="hover:underline">
          Laden-Seite
        </Link>
      </nav>
    </header>
  );
}
