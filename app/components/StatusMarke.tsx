// Kleine farbige Marke für einen Status, z. B. "neu" oder "erledigt"
const farben = {
  rot: "bg-red-500/15 text-red-400",
  gelb: "bg-amber-500/15 text-amber-400",
  gruen: "bg-emerald-500/15 text-emerald-400",
};

export default function StatusMarke({ text, farbe }: { text: string; farbe: keyof typeof farben }) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${farben[farbe]}`}>
      {text}
    </span>
  );
}
