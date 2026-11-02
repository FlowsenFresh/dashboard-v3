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
