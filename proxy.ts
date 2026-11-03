import { NextResponse, type NextRequest } from "next/server";

// Läuft vor jeder Seite. Schaut nur, ob überhaupt ein Sitzungs-Cookie da ist,
// und schickt sonst zur Login-Seite. Das ist schnell, ersetzt aber nicht die echte
// Prüfung in app/lib/sitzung.ts (benutzerPflicht), die auch ein gefälschtes
// oder abgelaufenes Cookie erkennt.

// Diese Seiten darf jeder sehen
const OEFFENTLICH = ["/login", "/laden/"];

export function proxy(request: NextRequest) {
  const pfad = request.nextUrl.pathname;
  // "/" (die Startseite) prüfen wir extra und nur genau so. In der Liste oben ginge das nicht:
  // mit startsWith("/") wäre sonst JEDE Seite öffentlich, auch das Dashboard.
  const istOeffentlich =
    pfad === "/" || OEFFENTLICH.some((anfang) => pfad === anfang || pfad.startsWith(anfang));
  if (istOeffentlich) return NextResponse.next();

  // Gleicher Name wie SITZUNG_COOKIE in sitzung.ts (die Datei können wir hier nicht
  // importieren, weil sie die Datenbank lädt)
  if (!request.cookies.has("sitzung")) {
    const ziel = new URL("/login", request.url);
    ziel.searchParams.set("weiter", pfad); // nach dem Login wieder hierher
    return NextResponse.redirect(ziel);
  }
  return NextResponse.next();
}

export const config = {
  // Nicht für Bilder, CSS/JS von Next und das Favicon, sonst fehlen die auch auf der Login-Seite
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|ico)$).*)"],
};
