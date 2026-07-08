"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AssignmentForm({
                                           roles,
                                           shifts,
                                           volunteers
                                       }: any) {

    const [giorno, setGiorno] = useState("2026-07-24");
    const [roleId, setRoleId] = useState("");
    const [shiftId, setShiftId] = useState("");
    const [volunteerId, setVolunteerId] = useState("");

    const availableVolunteers = volunteers.filter(
        (v: any) => v.availability?.some((a: any) => a.data === giorno)
    );

    // Stile comune per select e input
    const inputStyle = "w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all";

    async function salvaAssegnazione() {
        if (!volunteerId || !roleId || !shiftId) {
            alert("Completa tutti i campi");
            return;
        }

        const role = roles.find((r: any) => r.id === roleId);

        const { error } = await supabase
            .from("assignments")
            .insert({
                volunteer_id: volunteerId,
                ruolo: role?.nome,
                data: giorno,
                shift_id: shiftId,
                confermato: false
            });

        if (error) {
            console.error("Errore Supabase:", error);
            alert("Errore salvataggio: " + error.message);
            return;
        }

        alert("Assegnazione salvata!");
        window.location.reload(); // Ricarica per mostrare subito la nuova assegnazione
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Giorno</label>
                    <select
                        className={inputStyle}
                        value={giorno}
                        onChange={e => setGiorno(e.target.value)}
                    >
                        <option value="2026-07-24">24 luglio</option>
                        <option value="2026-07-25">25 luglio</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Turno</label>
                    <select
                        className={inputStyle}
                        value={shiftId}
                        onChange={e => setShiftId(e.target.value)}
                    >
                        <option value="">Seleziona turno...</option>
                        {shifts.map((s: any) => (
                            <option key={s.id} value={s.id}>
                                {s.nome} ({s.ora_inizio.slice(0,5)} - {s.ora_fine.slice(0,5)})
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Ruolo</label>
                    <select
                        className={inputStyle}
                        value={roleId}
                        onChange={e => setRoleId(e.target.value)}
                    >
                        <option value="">Seleziona ruolo...</option>
                        {roles.map((r: any) => (
                            <option key={r.id} value={r.id}>{r.nome}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Volontario</label>
                    <select
                        className={inputStyle}
                        value={volunteerId}
                        onChange={e => setVolunteerId(e.target.value)}
                    >
                        <option value="">Seleziona volontario...</option>
                        {availableVolunteers.map((v: any) => (
                            <option key={v.id} value={v.id}>
                                {v.nome} {v.cognome}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <button
                className="w-full bg-black hover:bg-gray-800 text-white font-bold py-4 px-6 rounded-xl shadow-md transition-all hover:shadow-lg transform hover:-translate-y-1"
                onClick={salvaAssegnazione}
            >
                Salva assegnazione
            </button>
        </div>
    );
}