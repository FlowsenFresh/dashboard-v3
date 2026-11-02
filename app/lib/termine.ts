export type Termin = {
  readonly id: number;
  auftragsnummer: number;
  datum: string;
  titel: string;
  vorname: string;
  nachname: string;
  telefon: string;
  notiz?: string;
  erledigt: boolean;
};

export const beispielTermine: Termin[] = [
  {
    id: 1,
    auftragsnummer: 1,
    datum: "17.10.2026",
    titel: "Schaltung neu",
    vorname: "Max",
    nachname: "Mustermann",
    telefon: "0160 1234567",
    notiz: "Nachricht zu Termin 1",
    erledigt: true,
  },
  {
    id: 2,
    auftragsnummer: 2,
    datum: "19.10.2026",
    titel: "Bremsen neu",
    vorname: "Moritz",
    nachname: "Mustermann",
    telefon: "0160 1234567",
    erledigt: false,
  },
  {
    id: 3,
    auftragsnummer: 3,
    datum: "21.10.2026",
    titel: "Schaltung einstellen",
    vorname: "Manfred",
    nachname: "Mustermann",
    telefon: "0160 1234567",
    notiz: "Nachricht zu Termin 3",
    erledigt: true,
  },
];
