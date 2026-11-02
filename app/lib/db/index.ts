import "server-only";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Die Verbindung zu Neon. Die Adresse (mit Passwort) steht in .env.local
// und kommt nie ins Git. Auf Vercel tragen wir sie später als Umgebungsvariable ein.
const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL fehlt. Trag sie in .env.local ein (siehe README).");
}

// neon-http schickt jede Abfrage als HTTPS-Anfrage. Das passt gut zu Vercel,
// weil dort keine Verbindung dauerhaft offen bleiben muss.
export const db = drizzle(neon(url), { schema });
