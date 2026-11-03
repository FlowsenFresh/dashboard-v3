import { aktuellerBenutzer, darfLadenBearbeiten } from "@/app/lib/sitzung";
import Leiste from "./Leiste";

// Läuft auf dem Server und liest das Login-Cookie. Darum steht es in page.tsx in <Suspense>:
// Die Seite selbst kommt sofort aus dem Cache, nur dieser kleine Teil wird pro Besuch geprüft.
// Normale Besucher bekommen hier gar nichts, nicht mal einen versteckten Knopf.
export default async function BearbeitenLeiste({
  slug,
  ladenId,
}: {
  slug: string;
  ladenId: number;
}) {
  const angemeldet = await aktuellerBenutzer();
  if (!angemeldet || !darfLadenBearbeiten(angemeldet, ladenId)) return null;
  return <Leiste slug={slug} />;
}
