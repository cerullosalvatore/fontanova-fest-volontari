"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type StrutturaProps = {
    struttura: any;
    ruoliDisponibili: string[];
    panchina: any;
    tuttiVolontari: any[];
};

export default function OperativoView({ struttura, ruoliDisponibili, panchina, tuttiVolontari }: StrutturaProps) {
    const router = useRouter();
    const giorni = Object.keys(struttura).sort();
    const [giornoAttivo, setGiornoAttivo] = useState(giorni[0]);
    const [popupNote, setPopupNote] = useState<{ volontario: string, note: string } | null>(null);
    const [ruoloTarget, setRuoloTarget] = useState<string | null>(null);

    const handleCambioRuolo = async (assignmentId: string, nuovoRuolo: string) => {
        if (nuovoRuolo === "PANCHINA") {
            await supabase.from("assignments").delete().eq("id", assignmentId);
        } else {
            await supabase.from("assignments").update({ ruolo: nuovoRuolo }).eq("id", assignmentId);
        }
        router.refresh();
    };

    const handleAssegnaRapido = async (volunteerId: string, nuovoRuolo: string) => {
        const { data: existingAssignment } = await supabase
            .from("assignments")
            .select("id")
            .eq("volunteer_id", volunteerId)
            .eq("data", giornoAttivo)
            .maybeSingle();

        if (existingAssignment) {
            await supabase.from("assignments").update({ ruolo: nuovoRuolo }).eq("id", existingAssignment.id);
        } else {
            await supabase.from("assignments").insert({ volunteer_id: volunteerId, ruolo: nuovoRuolo, data: giornoAttivo });
        }

        setRuoloTarget(null);
        router.refresh();
    };

    if (!giorni.length) return null;

    return (
        <div className="w-full relative">
            <div className="flex flex-wrap gap-4 mb-8">
                {giorni.map((g) => (
                    <button
                        key={g}
                        onClick={() => setGiornoAttivo(g)}
                        className={`px-6 py-4 rounded-xl font-bold uppercase tracking-wider transition-all shadow-sm flex items-center gap-3 ${
                            giornoAttivo === g
                                ? "bg-black text-white transform scale-105"
                                : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-100"
                        }`}
                    >
                        <span>{g === "2026-07-24" ? "Venerdì 24 Luglio" : g === "2026-07-25" ? "Sabato 25 Luglio" : g}</span>
                    </button>
                ))}
            </div>

            <div className="space-y-8">
                {Object.entries(struttura[giornoAttivo]).map(([categoria, ruoli]: [string, any]) => {
                    // CALCOLO TOTALE CATEGORIA
                    const totaleCategoria = Object.values(ruoli as any).reduce((acc: number, ass: any) => acc + (ass?.length || 0), 0);

                    return (
                        <div key={categoria} className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                            <div className="bg-gray-100 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                                <h2 className="text-xl font-black text-gray-900 uppercase tracking-widest">{categoria}</h2>
                                <span className="bg-black text-white text-sm font-bold px-3 py-1 rounded-full">{totaleCategoria}</span>
                            </div>
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {Object.entries(ruoli).map(([ruolo, assegnazioni]: [string, any]) => (
                                    <div key={ruolo} className="bg-gray-50 rounded-xl p-5 border border-gray-200 shadow-sm flex flex-col">
                                        <div className="flex items-center justify-between mb-4 border-b border-gray-200 pb-2">
                                            <h3 className="text-sm font-extrabold text-gray-500 uppercase tracking-widest text-left">
                                                {ruolo}
                                                <span className="ml-2 bg-gray-200 text-gray-600 text-[10px] px-2 py-0.5 rounded-full">{assegnazioni.length}</span>
                                            </h3>
                                            <button onClick={() => setRuoloTarget(ruolo)} className="bg-black text-white w-6 h-6 rounded-full font-bold">+</button>
                                        </div>
                                        <ul className="space-y-4 flex-1">
                                            {assegnazioni.map((a: any) => (
                                                <li key={a.id} className="flex flex-col p-3 rounded-lg border border-gray-100 bg-white shadow-sm">
                                                    <div className="flex items-start justify-between mb-1">
                                                        <span className="font-bold text-gray-900 uppercase text-sm">{a.volontario}</span>
                                                        {a.note && <button type="button" onClick={() => setPopupNote({ volontario: a.volontario, note: a.note })} className="text-yellow-600">⚠</button>}
                                                    </div>
                                                    {a.preferenze && a.preferenze.length > 0 && (
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase mb-2">Alt: {a.preferenze.filter((p: string) => p !== ruolo).join(" • ")}</p>
                                                    )}
                                                    <select value={ruolo} onChange={(e) => handleCambioRuolo(a.id, e.target.value)} className="w-full text-xs p-2 border border-gray-300 rounded-lg bg-white text-black uppercase font-bold cursor-pointer">
                                                        {ruoliDisponibili.map(r => <option key={r} value={r}>{r}</option>)}
                                                        <option value="PANCHINA" className="text-red-600 font-bold">PANCHINA</option>
                                                    </select>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* MODALE AGGIUNGI RAPIDO */}
            {/* MODALE AGGIUNGI RAPIDO - AGGIORNATA PER LO SCORRIMENTO */}
            {ruoloTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl flex flex-col max-h-[90vh]">
                        <h3 className="font-black uppercase mb-4 text-gray-900 flex-shrink-0">
                            Aggiungi a {ruoloTarget}
                        </h3>

                        {/* Contenitore con scroll */}
                        <div className="space-y-2 overflow-y-auto pr-2 flex-1 scrollbar-thin">
                            {tuttiVolontari
                                ?.filter(v => {
                                    const haPreferenza = v.preferences?.some((p: any) =>
                                        p.roles?.nome?.trim().toLowerCase() === ruoloTarget.trim().toLowerCase()
                                    );

                                    const cat = Object.keys(struttura[giornoAttivo]).find(c => struttura[giornoAttivo][c][ruoloTarget]);
                                    const listaAssegnatiAlRuolo = cat ? struttura[giornoAttivo][cat][ruoloTarget] : [];
                                    const giaAssegnatoAlRuolo = listaAssegnatiAlRuolo.some((a: any) => a.volunteer_id === v.id);

                                    return haPreferenza && !giaAssegnatoAlRuolo;
                                })
                                .map((v: any) => (
                                    <button
                                        key={v.id}
                                        onClick={() => handleAssegnaRapido(v.id, ruoloTarget)}
                                        className="w-full text-left p-4 bg-white border-2 border-gray-200 hover:border-black rounded-xl font-bold uppercase text-sm transition-all text-black"
                                    >
                                        {v.nome} {v.cognome}
                                    </button>
                                ))
                            }
                        </div>

                        {/* Bottone sempre visibile in fondo */}
                        <button
                            onClick={() => setRuoloTarget(null)}
                            className="w-full mt-6 bg-black text-white font-bold py-3 rounded-xl uppercase flex-shrink-0"
                        >
                            Chiudi
                        </button>
                    </div>
                </div>
            )}
            {/* PANCHINA */}
            <div className="w-full bg-gray-900 rounded-2xl p-8 text-white">
                <h2 className="text-2xl font-black uppercase mb-6 border-b border-gray-700 pb-4">Panchina ({panchina[giornoAttivo]?.length || 0})</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {panchina[giornoAttivo]?.map((p: any) => (
                        <div key={p.id} className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                            <span className="font-bold text-sm block mb-4 uppercase">{p.volontario}</span>
                            <select onChange={(e) => handleAssegnaRapido(p.id, e.target.value)} className="w-full text-xs p-2 rounded bg-white text-black font-bold uppercase cursor-pointer">
                                <option value="">ASSEGNA...</option>
                                {ruoliDisponibili.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                    ))}
                </div>
            </div>

            {/* POPUP NOTE - STILE MIGLIORATO */}
            {popupNote && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-gray-100 transform transition-all">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-yellow-100 p-2 rounded-full">
                                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-black uppercase text-gray-900 tracking-tight">
                                Note per {popupNote.volontario}
                            </h3>
                        </div>

                        <div className="bg-gray-50 border border-gray-100 p-5 rounded-2xl text-gray-700 text-sm font-medium leading-relaxed uppercase tracking-wide min-h-[100px]">
                            {popupNote.note || "Nessuna nota aggiuntiva."}
                        </div>

                        <button
                            onClick={() => setPopupNote(null)}
                            className="w-full mt-8 bg-black text-white font-black py-4 rounded-2xl uppercase tracking-widest hover:bg-gray-800 transition-all shadow-lg shadow-black/20"
                        >
                            Chiudi
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}