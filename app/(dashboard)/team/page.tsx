import { Suspense } from "react";
import MitarbeiterAktionen from "@/app/components/MitarbeiterAktionen";
import MitarbeiterNeu from "@/app/components/MitarbeiterNeu";
import { benutzerPflicht, istLadenInhaber } from "@/app/lib/sitzung";
import { teamListe } from "@/app/lib/team";
import { webseiteRechtUmschalten } from "./actions";

// Für den Inhaber: Logins für Mitarbeiter anlegen und festlegen, wer die Webseite ändern darf.
export default function Team() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="seitentitel">Team</h1>
      <p className="mt-2 text-gedaempft">
        Du bist der Inhaber und verwaltest hier die Logins für deinen Laden. Mitarbeiter sehen
        Nachrichten und Termine. Die Webseite bearbeiten dürfen sie nur, wenn du es erlaubst.
      </p>
      <Suspense fallback={<p className="mt-8 text-gedaempft">Lade …</p>}>
        <Inhalt />
      </Suspense>
    </main>
  );
}

async function Inhalt() {
  const angemeldet = await benutzerPflicht();
  if (!istLadenInhaber(angemeldet)) {
    return (
      <p className="karte mt-8 text-gedaempft">
        Diese Seite ist für den Inhaber des Ladens. Nur er verwaltet das Team.
      </p>
    );
  }

  const team = await teamListe(angemeldet.ladenId);

  return (
    <div className="mt-8 flex flex-col gap-6">
      <ul className="flex flex-col gap-3">
        {team.map((mitglied) => (
          <li key={mitglied.id} className="karte flex flex-col gap-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{mitglied.name ?? mitglied.email}</p>
                {mitglied.name && <p className="text-sm text-gedaempft">{mitglied.email}</p>}
              </div>
              {mitglied.istInhaber ? (
                <span className="rounded-full bg-akzent/15 px-3 py-1 text-xs font-medium text-akzent">
                  Inhaber{mitglied.id === angemeldet.id ? " · du" : ""}
                </span>
              ) : (
                <span className="rounded-full border border-rand px-3 py-1 text-xs text-gedaempft">
                  Mitarbeiter
                </span>
              )}
            </div>

            {/* Den Inhaber selbst kann man hier nicht ändern: er darf immer alles */}
            {!mitglied.istInhaber && (
              <>
                <form
                  action={webseiteRechtUmschalten.bind(null, mitglied.id, !mitglied.darfWebseite)}
                  className="flex flex-wrap items-center justify-between gap-3 border-t border-rand pt-4"
                >
                  <p className="text-sm">
                    Webseite bearbeiten:{" "}
                    {mitglied.darfWebseite ? (
                      <span className="font-medium text-erfolg">erlaubt</span>
                    ) : (
                      <span className="text-gedaempft">nicht erlaubt</span>
                    )}
                  </p>
                  <button className="knopf-rand text-sm">
                    {mitglied.darfWebseite ? "Recht entziehen" : "Erlauben"}
                  </button>
                </form>
                <MitarbeiterAktionen id={mitglied.id} email={mitglied.email} />
              </>
            )}
          </li>
        ))}
      </ul>

      <div className="karte">
        <MitarbeiterNeu />
      </div>
    </div>
  );
}
