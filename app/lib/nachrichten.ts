export type Nachricht = {
  readonly id: number;
  laden?: string; // slug des Ladens, über den die Nachricht kam
  betreff: string;
  vorname: string;
  nachname: string;
  telefon?: string;
  email?: string;
  inhalt?: string;
  eingegangen: string;
  wunschDatum?: string;
  wunschZeit?: string;
  status: "neu" | "gelesen" | "beantwortet";
};

export const beispielNachrichten: Nachricht[] = [
  {
    id: 1,
    betreff: "Bremsen wechseln",
    vorname: "Michael",
    nachname: "Mustermann",
    telefon: "0160 1234567",
    eingegangen: "18.10.2026, 15:00 Uhr",
    wunschDatum: "2026-10-19",
    wunschZeit: "15:00",
    status: "neu",
  },
  {
    id: 2,
    betreff: "Reifenwechseln kosten?",
    vorname: "Menni",
    nachname: "Mustermann",
    email: "email@email.de",
    inhalt: "Servus habts ihr was frei ?",
    eingegangen: "18.10.2026, 15:30 Uhr",
    status: "gelesen",
  },
  {
    id: 3,
    betreff: "Frühjahrscheck",
    vorname: "Michael",
    nachname: "Mustermann",
    telefon: "0160 1234567",
    eingegangen: "18.10.2026, 14:00 Uhr",
    wunschDatum: "2026-10-19",
    wunschZeit: "15:00",
    status: "beantwortet",
  },
  {
    id: 4,
    betreff: "Was frei am 18.10 - 16:00 Uhr",
    vorname: "Michael",
    nachname: "Mustermann",
    email: "email@email.de",
    telefon: "0160 1234567",
    inhalt: "Servus habts ihr was frei ?",
    eingegangen: "18.10.2026, 16:00 Uhr",
    status: "neu",
  },
  {
    id: 5,
    betreff: "Was frei am 18.10 - 16:00 Uhr",
    vorname: "Michael",
    nachname: "Mustermann",
    email: "email@email.de",
    telefon: "0160 1234567",
    inhalt: "Servus habts ihr was frei ?",
    eingegangen: "18.10.2026, 16:00 Uhr",
    status: "gelesen",
  },
];
