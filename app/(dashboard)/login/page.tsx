import { Suspense } from "react";
import { redirect } from "next/navigation";
import LoginFormular from "@/app/components/LoginFormular";
import { aktuellerBenutzer } from "@/app/lib/sitzung";

export default function Login({ searchParams }: PageProps<"/login">) {
  return (
    <main className="mx-auto w-full max-w-sm px-4 py-16">
      <h1 className="seitentitel">Anmelden</h1>
      <p className="mt-2 mb-6 text-gedaempft">Für Termine und Nachrichten deines Ladens.</p>
      {/* Cookie und URL werden erst beim Aufruf gelesen, darum in Suspense */}
      <Suspense fallback={<div className="karte h-64" />}>
        <Formular searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function Formular({ searchParams }: Pick<PageProps<"/login">, "searchParams">) {
  // Schon angemeldet? Dann gleich weiter zum Dashboard
  if (await aktuellerBenutzer()) redirect("/dashboard");

  const { weiter } = await searchParams;
  return <LoginFormular weiter={typeof weiter === "string" ? weiter : "/dashboard"} />;
}
