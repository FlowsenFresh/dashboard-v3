import type { Laden } from "@/app/lib/laeden";

export default function Fuss({ laden }: { laden: Laden }) {
  return (
    <footer className="mt-8 border-t border-rand">
      <div className="rahmen flex flex-col gap-2 py-8 text-sm text-gedaempft sm:flex-row sm:justify-between">
        <p>
          {laden.name} · {laden.adresse.strasse}, {laden.adresse.plzOrt}
        </p>
        {/* Impressum und Datenschutz kommen hier hin, bevor die Seite live geht */}
        <p>Webseite von FF420</p>
      </div>
    </footer>
  );
}
