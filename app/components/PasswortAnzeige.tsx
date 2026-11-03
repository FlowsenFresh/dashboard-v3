// Zeigt ein neues Passwort einmal groß an, damit der Inhaber es weitergeben kann.
export default function PasswortAnzeige({ email, passwort }: { email?: string; passwort: string }) {
  return (
    <div className="rounded-lg border border-akzent/40 bg-akzent/10 p-4">
      <p className="text-sm text-gedaempft">
        {email ? `Login für ${email}. ` : ""}Gib dieses Passwort weiter. Es wird nur jetzt
        angezeigt:
      </p>
      <p className="mt-1 select-all font-mono text-2xl font-semibold tracking-wider text-akzent">
        {passwort}
      </p>
    </div>
  );
}
