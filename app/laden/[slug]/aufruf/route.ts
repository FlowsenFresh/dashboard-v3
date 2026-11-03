import { sql } from "drizzle-orm";
import { db } from "@/app/lib/db";
import { aufrufe } from "@/app/lib/db/schema";
import { ladenFinden } from "@/app/lib/laeden";

// Zählt einen Aufruf der Laden-Webseite: POST /laden/radl-huber/aufruf
// Der Browser schickt das von selbst nach dem Laden (siehe _teile/AufrufZaehler.tsx).
// Wir speichern NUR "+1 für diesen Laden an diesem Tag". Keine IP, kein Cookie, kein Gerät.
export async function POST(_anfrage: Request, ctx: RouteContext<"/laden/[slug]/aufruf">) {
  const { slug } = await ctx.params;
  const laden = await ladenFinden(slug);
  if (!laden) return new Response(null, { status: 404 });

  // Gibt es für heute schon eine Zeile? Dann +1, sonst neue Zeile mit 1 ("upsert").
  // Der Tag nach deutscher Zeit, damit kurz nach Mitternacht nicht noch "gestern" zählt.
  await db
    .insert(aufrufe)
    .values({ ladenId: laden.id, tag: sql`(now() at time zone 'Europe/Berlin')::date`, anzahl: 1 })
    .onConflictDoUpdate({
      target: [aufrufe.ladenId, aufrufe.tag],
      set: { anzahl: sql`${aufrufe.anzahl} + 1` },
    });

  return new Response(null, { status: 204 }); // 204 = "ok, keine Antwort nötig"
}
