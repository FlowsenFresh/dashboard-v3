import type { Laden } from "@/app/lib/laeden";

export default function Fuss({ laden }: { laden: Laden }) {
  return (
    <footer className="border-t border-rand bg-hintergrund">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-2 px-5 py-10 text-gedaempft sm:flex-row sm:justify-between">
        <p>{laden.name}</p>
        {/* Impressum und Datenschutz kommen hier hin, bevor die Seite live geht */}
        <p>Webseite von FF420</p>
      </div>
    </footer>
  );
}
