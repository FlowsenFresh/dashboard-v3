"use client";
import { useEffect } from "react";

// Wann wir zuletzt welche Seite gezählt haben. Liegt außerhalb der Komponente,
// damit es auch dann noch da ist, wenn React die Komponente neu aufbaut.
let zuletzt = { slug: "", zeit: 0 };

// Sagt dem Server einmal "die Seite wurde angeschaut". Zeigt selbst nichts an.
// sendBeacon schickt im Hintergrund und bremst die Seite nicht.
// Warum nicht einfach auf dem Server zählen? Die Seite kommt aus dem Cache,
// der Server sieht den einzelnen Besuch gar nicht.
export default function AufrufZaehler({ slug }: { slug: string }) {
  useEffect(() => {
    // Im Entwicklungsmodus (vp run dev) führt React Effekte zum Testen absichtlich
    // doppelt aus. Dieselbe Seite innerhalb von 2 Sekunden zählt darum nur einmal.
    const jetzt = Date.now();
    if (zuletzt.slug === slug && jetzt - zuletzt.zeit < 2000) return;
    zuletzt = { slug, zeit: jetzt };
    navigator.sendBeacon?.(`/laden/${slug}/aufruf`);
  }, [slug]);
  return null;
}
