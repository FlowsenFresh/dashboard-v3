// Kleine farbige Marke für einen Status, z. B. "neu" oder "erledigt"
const farben = {
  rot: "bg-fehler/15 text-fehler",
  gelb: "bg-warnung/15 text-warnung",
  gruen: "bg-erfolg/15 text-erfolg",
};

export default function StatusMarke({ text, farbe }: { text: string; farbe: keyof typeof farben }) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${farben[farbe]}`}>
      {text}
    </span>
  );
}
