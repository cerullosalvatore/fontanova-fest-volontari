"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function CandidaturePage() {
    const [volunteers, setVolunteers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState(""); // Stato per la barra di ricerca

    async function fetchData() {
        const { data, error } = await supabase
            .from("volunteers")
            .select(`
                id, nome, cognome, telefono, email, note,
                preferences(posizione, roles(nome)),
                availability(data)
            `)
            .order("cognome")
            .neq("id", "00000000-0000-0000-0000-000000000000");

        if (error) console.error(error);
        else setVolunteers(data || []);
        setLoading(false);
    }

    useEffect(() => {
        fetchData();
    }, []);

    async function eliminaCandidatura(id: string) {
        if (!window.confirm("Sei sicuro? Questa azione eliminerà anche le disponibilità e preferenze associate.")) return;

        const { error } = await supabase.from("volunteers").delete().eq("id", id);
        if (error) alert("Errore durante l'eliminazione");
        else setVolunteers(volunteers.filter(v => v.id !== id));
    }

    // Filtra i volontari in base a nome, cognome o email
    const filteredVolunteers = volunteers.filter((v: any) => {
        const query = searchQuery.toLowerCase();
        return (
            v.nome?.toLowerCase().includes(query) ||
            v.cognome?.toLowerCase().includes(query) ||
            v.email?.toLowerCase().includes(query)
        );
    });

    return (
        <main className="min-h-screen bg-gray-50 p-4 sm:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-900">Candidature volontari</h1>

                    {/* Barra di ricerca */}
                    <div className="w-full md:w-80">
                        <input
                            type="text"
                            placeholder="Cerca per nome, cognome o email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white text-gray-900"
                        />
                    </div>
                </div>

                {loading ? (
                    <p>Caricamento...</p>
                ) : filteredVolunteers.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 shadow-sm">
                        <p className="text-gray-500 text-sm">Nessun candidato corrisponde ai criteri di ricerca.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredVolunteers.map((v: any) => (
                            <div key={v.id}
                                 className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                <h2 className="text-xl font-bold text-gray-900">{v.nome} {v.cognome}</h2>
                                <p className="text-gray-500 text-sm mb-4">{v.email} • {v.telefono}</p>

                                {/* Disponibilità */}
                                <div className="mb-4">
                                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Disponibilità</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {v.availability?.map((a: any) => (
                                            <span key={a.data}
                                                  className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-lg border border-blue-100">
                                                {new Date(a.data).toLocaleDateString("it-IT", {
                                                    day: 'numeric',
                                                    month: 'short'
                                                })}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Preferenze */}
                                <div className="mb-4">
                                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Ruoli preferiti</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {v.preferences?.sort((a: any, b: any) => a.posizione - b.posizione).map((p: any) => (
                                            <span key={p.posizione}
                                                  className="px-2 py-1 bg-black text-white text-[10px] rounded-full">
                                                {p.roles?.nome}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Note */}
                                {v.note && (
                                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4">
                                        <p className="text-xs text-yellow-800 italic">"{v.note}"</p>
                                    </div>
                                )}

                                <button
                                    onClick={() => eliminaCandidatura(v.id)}
                                    className="w-full text-red-600 hover:bg-red-50 py-2 rounded-lg text-xs font-bold border border-red-100 transition-colors"
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