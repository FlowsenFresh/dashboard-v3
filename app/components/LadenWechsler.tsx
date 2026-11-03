"use client";
import { ladenWechseln } from "@/app/(dashboard)/admin/actions";

type Props = { laeden: { id: number; name: string }[]; aktuell: number | null };

// Nur für admin: Auswahlfeld, das beim Ändern sofort das Formular abschickt
export default function LadenWechsler({ laeden, aktuell }: Props) {
  return (
    <form action={ladenWechseln}>
      <select
        name="laden"
        defaultValue={aktuell ?? ""}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        aria-label="Laden wählen"
        className="rounded-lg border border-rand bg-hintergrund px-2 py-1.5 text-sm text-schrift outline-none focus:border-akzent"
      >
        <option value="">Alle Läden</option>
        {laeden.map((laden) => (
          <option key={laden.id} value={laden.id}>
            {laden.name}
          </option>
        ))}
      </select>
    </form>
  );
}
