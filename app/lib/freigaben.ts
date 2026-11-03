import "server-only";
import { createHash, randomInt, timingSafeEqual } from "node:crypto";
import { and, desc, eq, gt, isNotNull, isNull, lt, sql } from "drizzle-orm";
import { db } from "./db";
import { freigaben } from "./db/schema";

// ── Zugang für den admin, nur mit Code vom Ladeninhaber ──
// Ablauf:
// 1. Inhaber drückt "Zugangscode erzeugen" -> 6 Ziffern, 30 Minuten gültig
// 2. Er sagt Flo den Code (Telefon, WhatsApp ...)
// 3. Flo gibt ihn im Admin-Bereich ein -> 2 Stunden Zugriff auf dieses Dashboard
// 4. Danach ist automatisch Schluss. Der Inhaber kann auch früher beenden.

const CODE_MINUTEN = 30;
const ZUGRIFF_STUNDEN = 2;
const MAX_FEHLVERSUCHE = 5;

function hash(code: string): Buffer {
  return createHash("sha256").update(code).digest();
}

// Neuen Code für diesen Laden. Ein älterer, noch nicht benutzter Code wird dabei ungültig.
export async function codeErzeugen(ladenId: number): Promise<{ code: string; gueltigBis: Date }> {
  await db
    .update(freigaben)
    .set({ codeGueltigBis: sql`now()` })
    .where(and(eq(freigaben.ladenId, ladenId), isNull(freigaben.eingeloestAm)));

  // randomInt ist echter Zufall (kryptografisch), nicht Math.random
  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  const gueltigBis = new Date(Date.now() + CODE_MINUTEN * 60_000);
  await db.insert(freigaben).values({
    ladenId,
    codeHash: hash(code).toString("hex"),
    codeGueltigBis: gueltigBis,
  });
  return { code, gueltigBis };
}

export type EinloesenErgebnis = { ok: true } | { ok: false; fehler: string };

// Flo gibt den Code ein. Bei Erfolg: Zugriff für 2 Stunden.
export async function codeEinloesen(ladenId: number, eingabe: string): Promise<EinloesenErgebnis> {
  const code = eingabe.replace(/\s/g, "");
  if (!/^\d{6}$/.test(code)) return { ok: false, fehler: "Der Code hat 6 Ziffern." };

  // Der neueste offene Code dieses Ladens: noch nicht benutzt, nicht abgelaufen, nicht verbrannt
  const [offen] = await db
    .select()
    .from(freigaben)
    .where(
      and(
        eq(freigaben.ladenId, ladenId),
        isNull(freigaben.eingeloestAm),
        gt(freigaben.codeGueltigBis, sql`now()`),
        lt(freigaben.fehlversuche, MAX_FEHLVERSUCHE),
      ),
    )
    .orderBy(desc(freigaben.erstelltAm))
    .limit(1);
  if (!offen) {
    return { ok: false, fehler: "Kein gültiger Code. Bitte den Inhaber um einen neuen." };
  }

  // timingSafeEqual vergleicht immer gleich lang. So verrät die Antwortzeit nichts über den Code.
  const passt = timingSafeEqual(hash(code), Buffer.from(offen.codeHash, "hex"));
  if (!passt) {
    const versuche = offen.fehlversuche + 1;
    await db.update(freigaben).set({ fehlversuche: versuche }).where(eq(freigaben.id, offen.id));
    const rest = MAX_FEHLVERSUCHE - versuche;
    return {
      ok: false,
      fehler:
        rest > 0
          ? `Code stimmt nicht. Noch ${rest} ${rest === 1 ? "Versuch" : "Versuche"}.`
          : "Code stimmt nicht. Der Code ist jetzt gesperrt, bitte um einen neuen.",
    };
  }

  await db
    .update(freigaben)
    .set({
      eingeloestAm: sql`now()`,
      zugriffBis: sql`now() + make_interval(hours => ${ZUGRIFF_STUNDEN})`,
    })
    .where(eq(freigaben.id, offen.id));
  return { ok: true };
}

// Läuft gerade ein Zugang für diesen Laden? Dann bis wann.
export async function laufenderZugriff(ladenId: number): Promise<Date | null> {
  const [zeile] = await db
    .select({ bis: freigaben.zugriffBis })
    .from(freigaben)
    .where(
      and(
        eq(freigaben.ladenId, ladenId),
        gt(freigaben.zugriffBis, sql`now()`),
        isNull(freigaben.beendetAm),
      ),
    )
    .orderBy(desc(freigaben.zugriffBis))
    .limit(1);
  return zeile?.bis ?? null;
}

// Der Inhaber beendet den Zugang sofort. Offene Codes werden auch ungültig.
export async function zugangBeenden(ladenId: number): Promise<void> {
  await db
    .update(freigaben)
    .set({ beendetAm: sql`now()` })
    .where(
      and(
        eq(freigaben.ladenId, ladenId),
        gt(freigaben.zugriffBis, sql`now()`),
        isNull(freigaben.beendetAm),
      ),
    );
  await db
    .update(freigaben)
    .set({ codeGueltigBis: sql`now()` })
    .where(and(eq(freigaben.ladenId, ladenId), isNull(freigaben.eingeloestAm)));
}

export type ProtokollEintrag = { von: Date; bis: Date; beendet: Date | null };

// Für den Inhaber: wann hatte Flo Zugang? Die letzten 10 Male.
export async function zugangsProtokoll(ladenId: number): Promise<ProtokollEintrag[]> {
  const zeilen = await db
    .select({
      von: freigaben.eingeloestAm,
      bis: freigaben.zugriffBis,
      beendet: freigaben.beendetAm,
    })
    .from(freigaben)
    .where(and(eq(freigaben.ladenId, ladenId), isNotNull(freigaben.eingeloestAm)))
    .orderBy(desc(freigaben.eingeloestAm))
    .limit(10);
  return zeilen.map((z) => ({ von: z.von!, bis: z.bis!, beendet: z.beendet }));
}
