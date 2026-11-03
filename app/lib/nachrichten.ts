export type Nachricht = {
  readonly id: number;
  laden?: string; // slug des Ladens, über den die Nachricht kam
  anliegen?: string; // was im Formular ausgewählt wurde, damit kann man zählen
  betreff: string;
  vorname: string;
  nachname: string;
  telefon?: string;
  email?: string;
  inhalt?: string;
  eingegangen: string; // fertig formatiert, z. B. "18.10.2026, 15:00 Uhr"
  eingegangenTag: string; // nur der Tag, z. B. "2026-10-18", damit der Kalender sortieren kann
  wunschDatum?: string;
  wunschZeit?: string;
  status: "neu" | "gelesen" | "beantwortet";
};
