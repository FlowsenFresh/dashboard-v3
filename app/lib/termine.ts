export type Termin = {
  readonly id: number;
  auftragsnummer: number;
  datum: string; // zum Anzeigen, z. B. "17.10.2026"
  tag: string; // für den Kalender, z. B. "2026-10-17"
  titel: string;
  vorname: string;
  nachname: string;
  telefon: string;
  notiz?: string;
  erledigt: boolean;
};
