import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  text,
  time,
  timestamp,
} from "drizzle-orm/pg-core";
import type { Leistung, Oeffnungszeit, UeberUns } from "../laeden";

// Hier beschreiben wir die Tabellen in TypeScript. Drizzle macht daraus
// SQL (`pnpm db:generate`) und kennt dadurch auch die Typen beim Abfragen.

// Jeder Laden ist ein "Mandant". Alle anderen Tabellen hängen über laden_id dran,
// damit ein Ladenbesitzer später nur seine eigenen Daten sieht.
export const laeden = pgTable("laeden", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(), // Teil der URL: /laden/radl-huber
  name: text("name").notNull(),

  // ── Inhalt der Webseite (CMS) ──
  // Bearbeitet per Doppelklick auf der Laden-Seite. Die Seite liest genau diese Spalten.
  branche: text("branche").notNull().default(""),
  slogan: text("slogan").notNull().default(""),
  beschreibung: text("beschreibung").notNull().default(""),
  farbe: text("farbe"), // z. B. "#38bdf8", leer = unser Türkis-Grün
  strasse: text("strasse").notNull().default(""),
  plzOrt: text("plz_ort").notNull().default(""),
  telefon: text("telefon").notNull().default(""),
  email: text("email"),
  hinweisZeiten: text("hinweis_zeiten"),
  // Listen speichern wir als JSON in einer Spalte. Für eine Handvoll Einträge pro Laden
  // ist das einfacher als eigene Tabellen. $type sagt TypeScript, wie der Inhalt aussieht.
  leistungen: jsonb("leistungen").$type<Leistung[]>().notNull().default([]),
  oeffnungszeiten: jsonb("oeffnungszeiten").$type<Oeffnungszeit[]>().notNull().default([]),
  anliegen: jsonb("anliegen").$type<string[]>().notNull().default([]),
  ueberUns: jsonb("ueber_uns").$type<UeberUns>(), // leer = Abschnitt wird nicht gezeigt

  // Wie lange Termine aufgehoben werden, pro Laden einstellbar (z. B. 24 = Garantie 2 Jahre)
  termineAufbewahrenMonate: integer("termine_aufbewahren_monate").notNull().default(24),
  erstelltAm: timestamp("erstellt_am", { withTimezone: true }).notNull().defaultNow(),
});

// Personendaten getrennt von den Nachrichten: schreibt jemand zweimal,
// gibt es nur einen Kontakt. Und beim Löschen sieht man genau, wo Namen liegen.
export const kontakte = pgTable(
  "kontakte",
  {
    id: serial("id").primaryKey(),
    ladenId: integer("laden_id")
      .notNull()
      .references(() => laeden.id, { onDelete: "cascade" }),
    vorname: text("vorname").notNull(),
    nachname: text("nachname").notNull(),
    email: text("email"),
    telefon: text("telefon"),
    erstelltAm: timestamp("erstellt_am", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("kontakte_laden_idx").on(t.ladenId)],
);

export const nachrichtStatus = pgEnum("nachricht_status", ["neu", "gelesen", "beantwortet"]);

export const nachrichten = pgTable(
  "nachrichten",
  {
    id: serial("id").primaryKey(),
    ladenId: integer("laden_id")
      .notNull()
      .references(() => laeden.id, { onDelete: "cascade" }),
    kontaktId: integer("kontakt_id")
      .notNull()
      .references(() => kontakte.id, { onDelete: "cascade" }),
    anliegen: text("anliegen"), // Auswahl aus dem Formular, damit kann man zählen
    betreff: text("betreff").notNull(),
    inhalt: text("inhalt"),
    wunschDatum: date("wunsch_datum"),
    wunschZeit: time("wunsch_zeit"),
    status: nachrichtStatus("status").notNull().default("neu"),
    eingegangenAm: timestamp("eingegangen_am", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("nachrichten_laden_idx").on(t.ladenId, t.eingegangenAm)],
);

export const termine = pgTable(
  "termine",
  {
    id: serial("id").primaryKey(),
    ladenId: integer("laden_id")
      .notNull()
      .references(() => laeden.id, { onDelete: "cascade" }),
    kontaktId: integer("kontakt_id")
      .notNull()
      .references(() => kontakte.id, { onDelete: "cascade" }),
    auftragsnummer: integer("auftragsnummer").notNull(),
    datum: date("datum").notNull(),
    titel: text("titel").notNull(),
    notiz: text("notiz"),
    erledigt: boolean("erledigt").notNull().default(false),
    erstelltAm: timestamp("erstellt_am", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("termine_laden_idx").on(t.ladenId, t.datum)],
);

// ── Login ──────────────────────────────────────────────────────────
// "admin" = Flo, sieht alle Läden. "laden" = jemand aus einem Laden (Inhaber oder Mitarbeiter),
// sieht nur seinen Laden.
export const benutzerRolle = pgEnum("benutzer_rolle", ["admin", "laden"]);

export const benutzer = pgTable("benutzer", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(), // immer klein geschrieben gespeichert
  // Nie das Passwort selbst, nur der langsame scrypt-Hash (siehe app/lib/passwort.ts)
  passwortHash: text("passwort_hash").notNull(),
  rolle: benutzerRolle("rolle").notNull().default("laden"),
  // Bei "laden" der eigene Laden, bei "admin" leer
  ladenId: integer("laden_id").references(() => laeden.id, { onDelete: "cascade" }),
  // ── Team im Laden (nur bei rolle "laden") ──
  // Inhaber = der "Admin" seines Ladens: verwaltet das Team und gibt den Support-Code.
  // Mitarbeiter legt der Inhaber unter /team an. Die haben hier false.
  istInhaber: boolean("ist_inhaber").notNull().default(false),
  // Darf die Webseite des Ladens bearbeiten? Der Inhaber darf das immer,
  // bei Mitarbeitern schaltet er es an oder aus.
  darfWebseite: boolean("darf_webseite").notNull().default(false),
  name: text("name"), // z. B. "Anna", damit man im Team weiß, wer wer ist
  erstelltAm: timestamp("erstellt_am", { withTimezone: true }).notNull().defaultNow(),
});

// Eine Zeile pro Anmeldung. Der Browser bekommt ein zufälliges Token im Cookie,
// hier steht nur dessen SHA-256-Hash. Wer die Datenbank liest, kann sich damit nicht anmelden.
// Abmelden = Zeile löschen. Das geht auch "aus der Ferne", z. B. alle Sitzungen eines Benutzers.
export const sitzungen = pgTable(
  "sitzungen",
  {
    id: text("id").primaryKey(), // SHA-256 vom Token, als Hex-Text
    benutzerId: integer("benutzer_id")
      .notNull()
      .references(() => benutzer.id, { onDelete: "cascade" }),
    laeuftAbAm: timestamp("laeuft_ab_am", { withTimezone: true }).notNull(),
    // Nur für admin: in welchen Laden er gerade schaut. Leer = alle Läden.
    // Hängt an der Sitzung, nicht am Benutzer: zwei offene Browser können verschiedene Läden zeigen.
    ansichtLadenId: integer("ansicht_laden_id").references(() => laeden.id, {
      onDelete: "set null",
    }),
    erstelltAm: timestamp("erstellt_am", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("sitzungen_benutzer_idx").on(t.benutzerId)],
);

// ── Zugang für den admin (Support) ─────────────────────────────────
// Flo darf nicht einfach so in ein Kunden-Dashboard schauen. Der Ladeninhaber erzeugt einen
// Code und sagt ihn Flo. Erst damit gibt es Zugriff, und nur für kurze Zeit.
// Jede Zeile ist ein Code. Wurde er eingelöst, steht hier auch, bis wann der Zugriff gilt.
// Die Zeilen bleiben stehen: so sieht der Inhaber, wann Flo drin war.
export const freigaben = pgTable(
  "freigaben",
  {
    id: serial("id").primaryKey(),
    ladenId: integer("laden_id")
      .notNull()
      .references(() => laeden.id, { onDelete: "cascade" }),
    // Wie beim Passwort: nie den Code selbst, nur seinen Hash
    codeHash: text("code_hash").notNull(),
    codeGueltigBis: timestamp("code_gueltig_bis", { withTimezone: true }).notNull(),
    fehlversuche: integer("fehlversuche").notNull().default(0), // ab 5 ist der Code verbrannt
    eingeloestAm: timestamp("eingeloest_am", { withTimezone: true }),
    zugriffBis: timestamp("zugriff_bis", { withTimezone: true }), // leer = noch nicht eingelöst
    beendetAm: timestamp("beendet_am", { withTimezone: true }), // vom Inhaber früher beendet
    erstelltAm: timestamp("erstellt_am", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("freigaben_laden_idx").on(t.ladenId, t.erstelltAm)],
);

// ── Aufrufe der Laden-Webseite ─────────────────────────────────────
// Nur eine Zahl pro Laden und Tag. Keine IP, kein Cookie, nichts über die Besucher.
// Darum braucht man dafür auch keinen Cookie-Banner.
export const aufrufe = pgTable(
  "aufrufe",
  {
    ladenId: integer("laden_id")
      .notNull()
      .references(() => laeden.id, { onDelete: "cascade" }),
    tag: date("tag").notNull(),
    anzahl: integer("anzahl").notNull().default(0),
  },
  // Pro Laden und Tag genau eine Zeile. Der Schlüssel aus zwei Spalten sorgt dafür.
  (t) => [primaryKey({ columns: [t.ladenId, t.tag] })],
);
