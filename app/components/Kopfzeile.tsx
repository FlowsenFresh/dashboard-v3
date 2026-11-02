import Link from "next/link";

const links = [
  { href: "/termine", text: "Termine" },
  { href: "/nachrichten", text: "Nachrichten" },
  { href: "/laden/radl-huber", text: "Laden-Seite" },
];

export default function Kopfzeile() {
  return (
    <header className="border-b border-rand">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="font-semibold tracking-tight">
          Dashboard
        </Link>
        <div className="flex gap-4 text-sm text-gedaempft sm:gap-6">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="transition hover:text-schrift">
              {link.text}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
