import Link from "next/link";
import { abmelden } from "@/app/(dashboard)/login/actions";

// Eigenes Layout für den Admin-Bereich. Bewusst anders als das Kunden-Dashboard:
// eigene Kopfzeile mit "Admin", keine Links zu Termine/Nachrichten eines Ladens.
// So weiß man immer, wo man gerade ist: bei sich selbst oder beim Kunden.
export default function AdminLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <header className="border-b border-rand bg-band">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link
            href="/admin"
            className="flex items-center gap-3 text-lg font-semibold tracking-tight"
          >
            <span className="size-3 rounded-full bg-akzent" />
            Admin
            <span className="rounded-full border border-rand px-2.5 py-0.5 text-xs font-medium text-gedaempft">
              nur für dich
            </span>
          </Link>
          <form action={abmelden}>
            <button className="knopf-leise">Abmelden</button>
          </form>
        </nav>
      </header>
      {children}
    </>
  );
}
