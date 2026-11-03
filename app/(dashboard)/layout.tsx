import Kopfzeile from "@/app/components/Kopfzeile";

// Die Klammern im Ordnernamen "(dashboard)" sind eine Route Group:
// Sie tauchen NICHT in der URL auf (/termine bleibt /termine), geben aber allen
// Seiten darin ein gemeinsames Layout. So bekommt nur unser Dashboard die Kopfzeile.
// Die Laden-Seite unter /laden/... liegt außerhalb und hat ihr eigenes Layout.
export default function DashboardLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Kopfzeile />
      {children}
    </>
  );
}
