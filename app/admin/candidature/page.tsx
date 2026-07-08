"use client"; // Trasformiamo in Client Component

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function CandidaturePage() {
    const [volunteers, setVolunteers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    async function fetchData() {
        const { data, error } = await supabase
            .from("volunteers")
            .select(`
                id, nome, cognome, telefono, email, note,
                preferences(posizione, roles(nome)),
                availability(data)
            `)
            .order("cognome");

        if (error) console.error(error);
        else setVolunteers(data || []);
        setLoading(false);
    }

    useEffect(() => {
        fetchData();
    }, []);

    async function eliminaCandidatura(id: string) {
        if (!window.confirm("Sei sicuro di voler eliminare questa candidatura? Questa azione è irreversibile.")) return;

        const { error } = await supabase.from("volunteers").delete().eq("id", id);

        if (error) {
            alert("Errore durante l'eliminazione");
            console.error(error);
        } else {
            setVolunteers(volunteers.filter(v => v.id !== id));
        }
    }

    return (
        <main className="min-h-screen bg-gray-50 p-4 sm:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-900">Candidature volontari</h1>
                </div>

                {loading ? <p>Caricamento...</p> : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {volunteers.map((v: any) => (
                            <div key={v.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">{v.nome} {v.cognome}</h2>

                                <div className="space-y-2 text-sm text-gray-600 mb-6">
                                    <p>📞 {v.telefono}</p>
                                    <p>✉️ {v.email || "Non fornita"}</p>
                                </div>

                                {/* Preferenze e Disponibilità (come prima) */}
                                <div className="mb-4">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Preferenze</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {v.preferences?.sort((a: any, b: any) => a.posizione - b.posizione).map((p: any) => (
                                            <span key={p.posizione} className="px-2 py-1 bg-black text-white text-[10px] rounded-full">{p.roles?.nome}</span>
                                        ))}
                                    </div>
                                </div>

                                {/* Pulsante Elimina */}
                                <button
                                    onClick={() => eliminaCandidatura(v.id)}
                                    className="mt-4 w-full text-red-600 hover:bg-red-50 py-2 rounded-lg text-sm font-semibold border border-red-200 transition-colors"
                                >
                                    Elimina Candidatura
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}