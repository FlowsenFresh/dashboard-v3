// Gleiche Überschrift für jeden Abschnitt: kleine farbige Zeile + großer Titel
export default function Ueberschrift({ klein, titel }: { klein: string; titel: string }) {
  return (
    <div className="mb-8">
      <p className="text-sm font-medium text-akzent">{klein}</p>
      <h2 className="mt-1 text-3xl font-semibold tracking-tight">{titel}</h2>
    </div>
  );
}
