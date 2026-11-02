export type Laden = {
  slug: string; // Teil der URL: /laden/radl-huber
  name: string;
  branche: string;
  slogan: string;
  beschreibung: string;
  adresse: string;
  telefon: string;
  oeffnungszeiten: string[];
  anliegen: string[]; // Auswahl im Kontaktformular, jeder Laden hat seine eigene
};

// Später kommt das aus der Datenbank und wird im Dashboard bearbeitet (CMS).
export const beispielLaeden: Laden[] = [
  {
    slug: "radl-huber",
    name: "Radl Huber",
    branche: "Fahrradwerkstatt",
    slogan: "Dein Radl in guten Händen",
    beschreibung:
      "Reparatur, Inspektion und Frühjahrscheck für alle Räder. Schreib uns einfach eine Nachricht, wir melden uns schnell zurück.",
    adresse: "Marktstraße 1, 82515 Wolfratshausen",
    telefon: "08171 123456",
    oeffnungszeiten: ["Mo–Fr: 9–18 Uhr", "Sa: 9–13 Uhr"],
    anliegen: ["Reparatur", "Inspektion", "Reifen & Schlauch", "Termin anfragen", "Sonstige Frage"],
  },
];

export function ladenFinden(slug: string): Laden | undefined {
  return beispielLaeden.find((laden) => laden.slug === slug);
}
