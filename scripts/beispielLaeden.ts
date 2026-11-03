// Beispiel-Läden zum Testen des Templates. pnpm db:seed schreibt sie in die Datenbank.
// Danach werden die Inhalte im Dashboard unter /webseite gepflegt, nicht mehr hier.
import type { LadenInhalt } from "../app/lib/laeden";

// Wie im Dashboard, nur mit slug und alle Felder, die fehlen dürfen, optional
type Beispiel = Partial<LadenInhalt> & Pick<LadenInhalt, "name"> & { slug: string };

export const beispielLaeden: Beispiel[] = [
  {
    slug: "radl-huber",
    name: "Radl Huber",
    branche: "Fahrradwerkstatt",
    slogan: "Dein Radl in guten Händen",
    beschreibung:
      "Reparatur, Inspektion und Frühjahrscheck für alle Räder. Schreib uns einfach eine Nachricht, wir melden uns schnell zurück.",
    leistungen: [
      {
        titel: "Reparatur",
        text: "Bremsen, Schaltung, Speichen: wir bringen dein Rad wieder auf die Straße.",
        preis: "nach Aufwand",
      },
      {
        titel: "Inspektion",
        text: "Einmal komplett durchgecheckt, eingestellt und abgeschmiert.",
        preis: "ab 59 €",
      },
      {
        titel: "Reifen & Schlauch",
        text: "Platten? Meist am selben Tag erledigt, oft während du wartest.",
        preis: "ab 15 €",
      },
      {
        titel: "E-Bike-Service",
        text: "Software-Update, Akku-Test und Motor-Check für alle gängigen Marken.",
      },
    ],
    ueberUns: {
      text: "Wir sind eine kleine Werkstatt mitten in Wolfratshausen. Bei uns schraubt der Chef noch selbst, und du bekommst dein Rad mit einer ehrlichen Einschätzung zurück.",
      fakten: ["Seit 2009", "Meisterbetrieb", "Alle Marken"],
    },
    oeffnungszeiten: [
      { tage: "Mo–Fr", zeit: "9–18 Uhr" },
      { tage: "Sa", zeit: "9–13 Uhr" },
      { tage: "So", zeit: "geschlossen" },
    ],
    hinweisZeiten: "Im Frühjahr lieber vorher einen Termin anfragen.",
    strasse: "Marktstraße 1",
    plzOrt: "82515 Wolfratshausen",
    telefon: "08171 123456",
    anliegen: ["Reparatur", "Inspektion", "Reifen & Schlauch", "Termin anfragen", "Sonstige Frage"],
  },
  {
    // Zweiter Beispiel-Laden: zeigt, dass das Template mit anderen Daten
    // und einer anderen Farbe funktioniert
    slug: "haarwerk-isar",
    name: "Haarwerk Isar",
    branche: "Friseur",
    slogan: "Schnitt, Farbe, gute Laune",
    beschreibung:
      "Dein Friseur in Geretsried. Termin anfragen geht hier ganz einfach, wir rufen dich zurück.",
    farbe: "#f59e0b",
    leistungen: [
      { titel: "Haarschnitt", text: "Waschen, Schneiden, Föhnen.", preis: "ab 32 €" },
      {
        titel: "Farbe & Strähnen",
        text: "Von dezent bis knallig, mit Beratung vorab.",
        preis: "ab 55 €",
      },
      { titel: "Bart", text: "Konturen, Trimmen, heißes Tuch.", preis: "ab 18 €" },
    ],
    oeffnungszeiten: [
      { tage: "Di–Fr", zeit: "9–19 Uhr" },
      { tage: "Sa", zeit: "8–14 Uhr" },
      { tage: "So–Mo", zeit: "geschlossen" },
    ],
    strasse: "Egerlandstraße 5",
    plzOrt: "82538 Geretsried",
    telefon: "08171 654321",
    email: "hallo@haarwerk-isar.de",
    anliegen: ["Termin anfragen", "Beratung Farbe", "Gutschein", "Sonstige Frage"],
  },
  // ── Weitere Test-Läden: andere Farben und Branchen ──
  {
    slug: "velo-blau",
    name: "Velo Blau",
    branche: "Fahrradwerkstatt",
    slogan: "Schnell wieder fahren",
    beschreibung: "Express-Reparatur in Bad Tölz. Kleine Sachen oft noch am selben Tag.",
    farbe: "#38bdf8",
    leistungen: [
      {
        titel: "Express-Reparatur",
        text: "Platten, Bremse, Kette: meist in unter einer Stunde.",
        preis: "ab 12 €",
      },
      {
        titel: "Rennrad-Service",
        text: "Schaltung fein einstellen, Lager prüfen, Laufräder zentrieren.",
        preis: "ab 79 €",
      },
      {
        titel: "Leihrad",
        text: "Während wir schrauben, fährst du mit unserem Leihrad.",
        preis: "kostenlos",
      },
    ],
    oeffnungszeiten: [
      { tage: "Mo–Fr", zeit: "8–18 Uhr" },
      { tage: "Sa–So", zeit: "geschlossen" },
    ],
    strasse: "Isarweg 12",
    plzOrt: "83646 Bad Tölz",
    telefon: "08041 223344",
    anliegen: ["Reparatur", "Rennrad-Service", "Leihrad", "Sonstige Frage"],
  },
  {
    slug: "pedalwerk",
    name: "Pedalwerk",
    branche: "Fahrradwerkstatt",
    slogan: "E-Bikes sind unser Ding",
    beschreibung: "Spezialisiert auf E-Bikes und Lastenräder. Mit Abholservice im Umkreis.",
    farbe: "#a78bfa",
    leistungen: [
      {
        titel: "E-Bike-Inspektion",
        text: "Motor, Akku, Software und alles Mechanische.",
        preis: "ab 89 €",
      },
      { titel: "Lastenrad", text: "Wartung und Umbau für Familien- und Gewerberäder." },
      {
        titel: "Abholservice",
        text: "Wir holen dein Rad ab und bringen es zurück.",
        preis: "ab 20 €",
      },
    ],
    ueberUns: {
      text: "Zwei Mechaniker, eine Leidenschaft: Räder mit Motor. Wir kennen alle großen Antriebe.",
      fakten: ["Bosch-zertifiziert", "Abholung bis 15 km", "Seit 2018"],
    },
    oeffnungszeiten: [
      { tage: "Mo", zeit: "geschlossen" },
      { tage: "Di–Fr", zeit: "10–18 Uhr" },
      { tage: "Sa", zeit: "10–14 Uhr" },
    ],
    strasse: "Bahnhofstraße 30",
    plzOrt: "82538 Geretsried",
    telefon: "08171 778899",
    email: "werkstatt@pedalwerk.de",
    anliegen: ["E-Bike-Inspektion", "Lastenrad", "Abholung anfragen", "Sonstige Frage"],
  },
  {
    slug: "kfz-brandl",
    name: "Kfz Brandl",
    branche: "Autowerkstatt",
    slogan: "Ehrlich. Schnell. Fair.",
    beschreibung: "Freie Werkstatt für alle Marken. TÜV, Inspektion und Reparatur aus einer Hand.",
    farbe: "#f87171",
    leistungen: [
      {
        titel: "Inspektion",
        text: "Nach Herstellervorgabe, die Garantie bleibt erhalten.",
        preis: "ab 149 €",
      },
      {
        titel: "HU / AU (TÜV)",
        text: "Jeden Dienstag und Donnerstag direkt bei uns im Haus.",
        preis: "ab 139 €",
      },
      {
        titel: "Reifenwechsel",
        text: "Wechseln, wuchten und auf Wunsch einlagern.",
        preis: "ab 39 €",
      },
      { titel: "Bremsen", text: "Beläge, Scheiben, Bremsflüssigkeit." },
      { titel: "Klimaservice", text: "Prüfen, desinfizieren, neu befüllen.", preis: "ab 89 €" },
      { titel: "Unfallreparatur", text: "Wir regeln das mit deiner Versicherung." },
    ],
    ueberUns: {
      text: "Familienbetrieb in zweiter Generation. Bei uns bekommst du vorher einen Preis, und dabei bleibt es.",
      fakten: ["Meisterbetrieb", "Alle Marken", "Ersatzwagen"],
    },
    oeffnungszeiten: [
      { tage: "Mo–Fr", zeit: "7:30–17 Uhr" },
      { tage: "Sa", zeit: "8–12 Uhr" },
    ],
    hinweisZeiten: "Reifenwechsel im Oktober und April nur mit Termin.",
    strasse: "Gewerbering 4",
    plzOrt: "82515 Wolfratshausen",
    telefon: "08171 445566",
    anliegen: ["Inspektion", "TÜV-Termin", "Reifenwechsel", "Kostenvoranschlag", "Sonstige Frage"],
  },
  {
    slug: "baeckerei-moser",
    name: "Bäckerei Moser",
    branche: "Bäckerei",
    slogan: "Jeden Morgen frisch",
    beschreibung: "Brot, Brezen und Kuchen aus eigener Backstube. Torten auf Bestellung.",
    farbe: "#fb7185",
    leistungen: [
      { titel: "Brot & Brezen", text: "Sauerteig, Dinkel, Roggen. Täglich frisch gebacken." },
      {
        titel: "Torten",
        text: "Geburtstag, Hochzeit, Taufe: sag uns, was du dir vorstellst.",
        preis: "auf Anfrage",
      },
      { titel: "Frühstück", text: "Für Büro und Feiern, wir liefern auch.", preis: "ab 6 € p. P." },
    ],
    oeffnungszeiten: [
      { tage: "Mo–Fr", zeit: "6–18 Uhr" },
      { tage: "Sa", zeit: "6–12 Uhr" },
      { tage: "So", zeit: "7–11 Uhr" },
    ],
    strasse: "Untermarkt 8",
    plzOrt: "82515 Wolfratshausen",
    telefon: "08171 112233",
    anliegen: ["Torte bestellen", "Frühstück bestellen", "Sonstige Frage"],
  },
];
