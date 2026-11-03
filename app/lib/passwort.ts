import { randomBytes, scrypt, timingSafeEqual, type ScryptOptions } from "node:crypto";

// Passwörter speichern wir nie im Klartext, sondern als Hash.
// scrypt ist absichtlich langsam und braucht viel Speicher. Für uns kostet ein Login
// ca. 50 ms, aber wer eine geklaute Datenbank durchprobieren will, schafft nur
// wenige Versuche pro Sekunde statt Milliarden (wie bei SHA-256).
// scrypt ist in Node schon eingebaut, darum brauchen wir kein extra Paket wie bcrypt.

// N = Kosten (Arbeit + Speicher), r = Blockgröße, p = Parallelität. Werte nach OWASP-Empfehlung.
const OPTIONEN = { N: 2 ** 17, r: 8, p: 1, maxmem: 256 * 1024 * 1024 };
const LAENGE = 64;

// scrypt mit Optionen als Promise (util.promisify kennt die Optionen-Variante nicht)
function scryptAsync(passwort: string, salz: Buffer, opt: ScryptOptions): Promise<Buffer> {
  return new Promise((ok, fehler) =>
    scrypt(passwort, salz, LAENGE, opt, (err, hash) => (err ? fehler(err) : ok(hash))),
  );
}

// Ergebnis z. B. "scrypt$131072$8$1$<salz>$<hash>". Die Parameter stehen mit drin,
// damit wir sie später erhöhen können, ohne alte Passwörter ungültig zu machen.
export async function passwortHashen(passwort: string): Promise<string> {
  // Salz = Zufall pro Passwort. Zwei Leute mit "hallo123" haben trotzdem verschiedene Hashes.
  const salz = randomBytes(16);
  const hash = await scryptAsync(passwort, salz, OPTIONEN);
  const { N, r, p } = OPTIONEN;
  return ["scrypt", N, r, p, salz.toString("base64"), hash.toString("base64")].join("$");
}

export async function passwortPruefen(passwort: string, gespeichert: string): Promise<boolean> {
  const [verfahren, N, r, p, salz, hash] = gespeichert.split("$");
  if (verfahren !== "scrypt" || !hash) return false;
  const erwartet = Buffer.from(hash, "base64");
  const berechnet = await scryptAsync(passwort, Buffer.from(salz, "base64"), {
    N: Number(N),
    r: Number(r),
    p: Number(p),
    maxmem: OPTIONEN.maxmem,
  });
  // timingSafeEqual braucht immer gleich lang, egal ab welchem Zeichen es abweicht.
  // Sonst könnte man an der Antwortzeit ablesen, wie viel schon stimmt.
  return berechnet.length === erwartet.length && timingSafeEqual(berechnet, erwartet);
}
