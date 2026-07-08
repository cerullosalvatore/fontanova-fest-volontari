"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function OperativoView({ struttura }: { struttura: any }) {
    const [giornoSelezionato, setGiornoSelezionato] = useState("tutti");
    const giorni = Object.keys(struttura);

    async function eliminaAssegnazione(id: string) {
        if (!window.confirm("Vuoi rimuovere questo volontario dal turno?")) return;

        const { error } = await supabase
            .from("assignments")
            .delete()
            .eq("id", id);

        if (error) {
            alert("Errore nell'eliminazione");
            console.error(error);
        } else {
            window.location.reload();
        }
    }

    const giorniVisualizzati = giornoSelezionato === "tutti"
        ? giorni
        : giorni.filter(g => g === giornoSelezionato);

    return (
        <div>
            {/* Pulsanti filtro */}
            <div className="flex gap-3 mb-8 flex-wrap">
                <button
                    onClick={() => setGiornoSelezionato("tutti")}
                    className={`px-5 py-2.5 rounded-xl font-bold transition-all ${
                        giornoSelezionato === "tutti"
                            ? "bg-black text-white shadow-md"
                            : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                >
                    Tutti i giorni
                </button>

                {giorni.map(g => (
                    <button
                        key={g}
                        onClick={() => setGiornoSelezionato(g)}
                        className={`px-5 py-2.5 rounded-xl font-bold transition-all ${
                            giornoSelezionato === g
                                ? "bg-black text-white shadow-md"
                                : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                        }`}
                    >
                        {new Date(g).toLocaleDateString("it-IT", { day: 'numeric', month: 'long' })}
                    </button>
                ))}
            </div>

            {/* Visualizzazione Piano */}
            {giorniVisualizzati.length === 0 ? (
                <p className="text-gray-500 italic">Nessuna assegnazione per questa data.</p>
            ) : (
                giorniVisualizzati.map((giorno) => (
                    <section key={giorno} className="mb-12">
                        <h2 className="text-3xl font-extrabold text-gray-900 mb-8 border-b pb-4">
                            {new Date(giorno).toLocaleDateString("it-IT", { weekday: 'long', day: 'numeric', month: 'long' })}
                        </h2>

                        {Object.entries(struttura[giorno]).map(([categoria, ruoli]: any) => (
                            <div key={categoria} className="mb-10">
                                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                    <span className="w-2 h-8 bg-black rounded-full"></span>
                                    {categoria}
                                </h3>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {Object.entries(ruoli).map(([ruolo, turni]: any) => (
                                        <div key={ruolo} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                                            <h4 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b">{ruolo}</h4>

                                            <div className="space-y-3">
                                                {turni.map((t: any, index: number) => (
                                                    <div key={t.id || index} className="flex justify-between items-center py-2 border-b last:border-0 border-gray-100">
                                                        <div className="text-sm">
                                                            <p className="font-semibold text-gray-900">{t.turno}</p>
                                                            <p className="text-gray-500 text-xs font-medium">{t.orario}</p>
                                                        </div>

                                                        <div className="flex items-center gap-3">
                                                            <span className="px-3 py-1 bg-gray-100 text-gray-900 font-bold rounded-lg text-sm">
                                                                {t.volontario}
                                                            </span>
                                                            <button
                                                                onClick={() => eliminaAssegnazione(t.id)}
                                                                className="text-red-500 hover:text-red-700 font-bold text-xl px-2"
                                                                title="Elimina assegnazione"
                                                            >
                                                                ×
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </section>
                ))
            )}
        </div>
    );
}