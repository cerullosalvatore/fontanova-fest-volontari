"use client";

import { supabase } from "@/lib/supabase";

export default function AssignmentList({ assignments }: any) {

    async function elimina(id: string) {
        if (!window.confirm("Eliminare questa assegnazione?")) return;

        const { error } = await supabase
            .from("assignments")
            .delete()
            .eq("id", id);

        if (error) {
            console.error(error);
            alert("Errore eliminazione");
            return;
        }

        window.location.reload();
    }

    return (
        // La griglia viene gestita dal genitore (PianificazionePage),
        // qui manteniamo le singole card coerenti
        <>
            {assignments.map((a: any) => (
                <div key={a.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">

                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {a.volunteers?.nome} {a.volunteers?.cognome}
                    </h3>

                    <div className="space-y-1 text-sm text-gray-600">
                        <p className="flex items-center gap-2">
                            <span>📅</span> {new Date(a.data).toLocaleDateString("it-IT")}
                        </p>
                        <p className="flex items-center gap-2">
                            <span>🕒</span> {a.shifts?.nome || "Turno non specificato"}
                            <span className="text-gray-400 text-xs">
                                ({a.shifts?.ora_inizio?.slice(0, 5)} - {a.shifts?.ora_fine?.slice(0, 5)})
                            </span>
                        </p>
                        <p className="flex items-center gap-2 font-medium text-gray-900">
                            <span>🎯</span> {a.ruolo}
                        </p>
                    </div>

                    <button
                        onClick={() => elimina(a.id)}
                        className="mt-4 w-full text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 font-semibold text-sm py-2 px-3 rounded-lg transition-colors"
                    >
                        Elimina assegnazione
                    </button>
                </div>
            ))}
        </>
    );
}