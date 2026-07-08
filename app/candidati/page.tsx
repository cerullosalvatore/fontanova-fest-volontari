"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function ListaCandidati() {
    const [volunteers, setVolunteers] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadVolunteers() {
            // Aggiunto 'email' alla select
            const { data } = await supabase
                .from("volunteers")
                .select("id, nome, cognome, email")
                .order("cognome");
            setVolunteers(data || []);
            setLoading(false);
        }
        loadVolunteers();
    }, []);

    const filtered = volunteers.filter(v =>
        `${v.nome} ${v.cognome} ${v.email || ""}`.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <main className="min-h-screen bg-gray-50 p-4 sm:p-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Candidati</h1>
                <p className="text-gray-500 mb-8">Elenco dei volontari iscritti al festival.</p>

                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-600">Totale Candidati</span>
                    <span className="text-xl font-black text-black">{filtered.length}</span>
                </div>

                <input
                    type="text"
                    placeholder="Cerca per nome, cognome o email..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-400 bg-white text-gray-900 placeholder-gray-400 shadow-sm focus:ring-2 focus:ring-black focus:border-black outline-none mb-6"
                    onChange={(e) => setSearch(e.target.value)}
                />

                {loading ? (
                    <div className="text-center py-10">Caricamento in corso...</div>
                ) : (
                    <div className="bg-white border  border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                        <ul className="divide-y divide-gray-100">
                            {filtered.map(v => (
                                <li key={v.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-gray-900 uppercase">{v.nome} {v.cognome}</span>
                                        <span className="text-xs text-gray-500 uppercase">{v.email || "Nessuna email"}</span>
                                    </div>
                                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-green-50 text-green-700 rounded-full border border-green-100">
                                        Registrato
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </main>
    );
}