import {
  boolean,
  date,
  index,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  time,
  timestamp,
} from "drizzle-orm/pg-core";

// Hier beschreiben wir die Tabellen in TypeScript. Drizzle macht daraus
// SQL (`pnpm db:generate`) und kennt dadurch auch die Typen beim Abfragen.

// Jeder Laden ist ein "Mandant". Alle anderen Tabellen hängen über laden_id dran,
// damit ein Ladenbesitzer später nur seine eigenen Daten sieht.
export const laeden = pgTable("laeden", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(), // Teil der URL: /laden/radl-huber
  name: text("name").notNull(),
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
