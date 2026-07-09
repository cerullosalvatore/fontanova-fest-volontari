"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function PianificazionePage() {
    const [isGenerating, setIsGenerating] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    async function generaBozza() {
        if (!window.confirm("Questa operazione eliminerà la pianificazione attuale e ne creerà una nuova basata sulle prime scelte. Procedere?")) {
            return;
        }

        setIsGenerating(true);
        setMessage("Lettura preferenze in corso...");

        try {
            setMessage("Pulizia vecchia pianificazione...");
            await supabase
                .from("assignments")
                .delete()
                .neq("id", "00000000-0000-0000-0000-000000000000");

            setMessage("Calcolo nuovi incastri...");
            const { data: volunteers, error: fetchError } = await supabase
                .from("volunteers")
                .select(`id, availability(data), preferences(posizione, roles(nome))`);

            if (fetchError) throw fetchError;

            const nuoviTurni = [];

            for (const vol of volunteers || []) {
                const primaScelta = vol.preferences?.find((p: any) => p.posizione === 1);

                if (primaScelta?.roles?.nome && vol.availability && vol.availability.length > 0) {
                    for (const disp of vol.availability) {
                        nuoviTurni.push({
                            volunteer_id: vol.id,
                            ruolo: primaScelta.roles.nome,
                            data: disp.data
                        });
                    }
                }
            }

            if (nuoviTurni.length > 0) {
                setMessage(`Salvataggio di ${nuoviTurni.length} assegnazioni...`);
                const { error: insertError } = await supabase.from("assignments").insert(nuoviTurni);

                if (insertError) throw insertError;
                setMessage(`Successo! Generati ${nuoviTurni.length} turni basati sulla prima scelta.`);
            } else {
                setMessage("Nessun turno da generare. Assicurati che ci siano volontari iscritti con ruoli validi.");
            }
        } catch (error) {
            console.error(error);
            setMessage("Si è verificato un errore durante la generazione.");
        } finally {
            setIsGenerating(false);
        }
    }

    // NUOVA FUNZIONE: Cancella tutto
    async function cancellaPianificazione() {
        if (!window.confirm("ATTENZIONE: Sei sicuro di voler CANCELLARE TUTTO il piano operativo? L'operazione è irreversibile.")) {
            return;
        }

        setIsGenerating(true);
        setMessage("Cancellazione in corso...");

        try {
            const { error } = await supabase
                .from("assignments")
                .delete()
                .neq("id", "00000000-0000-0000-0000-000000000000");

            if (error) throw error;
            setMessage("Piano operativo cancellato completamente.");
        } catch (error) {
            console.error(error);
            setMessage("Errore durante la cancellazione.");
        } finally {
            setIsGenerating(false);
        }
    }

    return (
        <main className="min-h-screen bg-gray-50 p-4 sm:p-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-2 uppercase">Pianificazione Iniziale</h1>
                <p className="text-gray-500 mb-8">
                    Genera una bozza automatica o cancella il piano esistente.
                </p>

                <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm text-center">
                    <div className="mb-6 flex justify-center gap-4">
                        {/* Icona Bozza */}
                        <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    </div>

                    <div className="flex flex-col gap-4 max-w-sm mx-auto">
                        <button
                            onClick={generaBozza}
                            disabled={isGenerating}
                            className={`w-full font-bold py-4 px-8 rounded-xl shadow-md transition-all uppercase ${
                                isGenerating ? "bg-gray-400 text-gray-200 cursor-not-allowed" : "bg-black hover:bg-gray-800 text-white transform hover:-translate-y-1"
                            }`}
                        >
                            Genera Bozza Automatica
                        </button>

                        {/* NUOVO TASTO CANCELLA */}
                        <button
                            onClick={cancellaPianificazione}
                            disabled={isGenerating}
                            className={`w-full font-bold py-4 px-8 rounded-xl transition-all uppercase border-2 ${
                                isGenerating ? "border-gray-200 text-gray-300 cursor-not-allowed" : "border-red-500 text-red-500 hover:bg-red-50"
                            }`}
                        >
                            Svuota Pianificazione
                        </button>
                    </div>

                    {message && (
                        <div className={`mt-6 p-4 text-sm font-bold rounded-xl uppercase ${
                            message.includes("Successo") || message.includes("cancellato") ? "bg-green-50 text-green-700 border border-green-200"
                                : message.includes("errore") ? "bg-red-50 text-red-700 border border-red-200"
                                    : "bg-gray-100 text-gray-700"
                        }`}>
                            {message}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}