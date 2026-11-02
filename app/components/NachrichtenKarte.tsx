"use client";
import { useState } from "react";
import type { Nachricht } from "../lib/nachrichten";

const statusFarbe = {
  neu: "text-red-500",
  gelesen: "text-yellow-500",
  beantwortet: "text-green-500",
};
export default function NachrichtenKarte({ nachricht }: { nachricht: Nachricht }) {
  const [status, setStatus] = useState(nachricht.status);

  return (
    <div className="bg-zinc-600 border rounded p-2">
      <div className="flex justify-between items-center flex-wrap">
        <span className="text-sm">{nachricht.eingegangen}</span>
        <span className={`text-sm border rounded-full px-2 ${statusFarbe[status]}`}>{status}</span>
      </div>
      <h2 className="font-bold text-center text-xl p-2">{nachricht.betreff}</h2>
      <div className="flex gap-1">
        <p>{nachricht.vorname}</p>
        <p>{nachricht.nachname}</p>
      </div>
      {nachricht.email && <p>{nachricht.email}</p>}
      {nachricht.telefon && <p>{nachricht.telefon}</p>}

      {nachricht.wunschDatum && (
        <div className="flex gap-1">
          <p>Wunschtermin: {nachricht.wunschDatum}</p>
          <p>{nachricht.wunschZeit}</p>
        </div>
      )}
      {nachricht.inhalt && <p>{nachricht.inhalt}</p>}
      {status === "neu" && (
        <div className="flex justify-center">
          <button onClick={() => setStatus("gelesen")} className="border rounded-xl text-sm px-1 mt-2 hover:bg-zinc-800">
            Als gelesen markieren
          </button>
        </div>
      )}
    </div>
  );
}
