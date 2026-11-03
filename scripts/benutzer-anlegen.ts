// Legt einen Login an oder setzt ein neues Passwort: vp run benutzer:anlegen
// Fragt E-Mail, Passwort und Laden ab. Das Passwort tippst du hier ein statt es
// als Parameter mitzugeben, damit es nicht in der Befehls-Historie landet.
import { stdin, stdout } from "node:process";
import { createInterface } from "node:readline/promises";
import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import { benutzer, laeden } from "../app/lib/db/schema";
import { passwortHashen } from "../app/lib/passwort";

config({ path: ".env.local" });
const db = drizzle(neon(process.env.DATABASE_URL!));

async function main() {
  const frage = createInterface({ input: stdin, output: stdout });
  const email = (await frage.question("E-Mail: ")).trim().toLowerCase();
  const passwort = await frage.question("Passwort (mind. 12 Zeichen): ");
  const slug = (
    await frage.question("Laden-Slug (leer lassen = admin, sieht alle Läden): ")
  ).trim();
  frage.close();

  if (!email.includes("@")) throw new Error("Das ist keine E-Mail-Adresse.");
  // Lieber lang als kompliziert: 12+ Zeichen schlagen "P@ssw0rt!"
  if (passwort.length < 12) throw new Error("Passwort zu kurz, bitte mindestens 12 Zeichen.");

  let ladenId: number | null = null;
  if (slug) {
    const [laden] = await db.select({ id: laeden.id }).from(laeden).where(eq(laeden.slug, slug));
    if (!laden) throw new Error(`Laden "${slug}" gibt es nicht.`);
    ladenId = laden.id;
  }

  const werte = {
    email,
    passwortHash: await passwortHashen(passwort),
    rolle: slug ? ("laden" as const) : ("admin" as const),
    ladenId,
    // Wer hier mit Laden angelegt wird, ist der Inhaber. Mitarbeiter legt er selbst unter /team an.
    istInhaber: Boolean(slug),
    darfWebseite: Boolean(slug),
  };
  // Gibt es die E-Mail schon, wird sie aktualisiert (z. B. Passwort vergessen)
  await db
    .insert(benutzer)
    .values(werte)
    .onConflictDoUpdate({ target: benutzer.email, set: werte });

  console.log(`Fertig: ${email} (${slug ? `Inhaber von ${slug}` : "admin"})`);
}

main().catch((fehler) => {
  console.error(fehler.message);
  process.exit(1);
});
