"use client";
import { useEffect } from "react";

// Sagt dem Server einmal "die Seite wurde angeschaut". Zeigt selbst nichts an.
// sendBeacon schickt im Hintergrund und bremst die Seite nicht.
// Warum nicht einfach auf dem Server zählen? Die Seite kommt aus dem Cache,
// der Server sieht den einzelnen Besuch gar nicht.
export default function AufrufZaehler({ slug }: { slug: string }) {
  useEffect(() => {
    navigator.sendBeacon?.(`/laden/${slug}/aufruf`);
  }, [slug]);
  return null;
}
