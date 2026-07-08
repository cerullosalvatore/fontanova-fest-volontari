import { supabase } from "@/lib/supabase";
import OperativoView from "@/components/admin/OperativoView";
export const dynamic = 'force-dynamic';
export const revalidate = 0;
const categorie: any = {
    "Addetto griglia": "Cucina",
    "Addetto farcitura panini": "Cucina",
    "Addetto friggitoria": "Cucina",
    "Spillatore birra": "Bevande",
    "Bevande analcoliche": "Bevande",
    "Cassiere": "Servizi",
    "Addetto gadget e merchandising": "Servizi",
    "Accoglienza": "Servizi",
    "Logistica e supporto stand": "Supporto",
    "Jolly": "Supporto",
};

export default async function OperativoPage() {
    const { data: assignments, error } = await supabase
        .from("assignments")
        .select(`
            id,
            ruolo,
            data,
            volunteers!assignments_volunteer_id_fkey (
                nome,
                cognome
            ),
            shifts!assignments_shift_fk (
                nome,
                ora_inizio,
                ora_fine,
                ordine
            )
        `)
        .order("data");

    if (error) {
        console.error("Errore nel recupero assegnazioni:", error);
    }

    const struttura: any = {};

    assignments?.forEach((a: any) => {
        const giorno = a.data;
        const categoria = categorie[a.ruolo] ?? "Altro";

        if (!struttura[giorno]) struttura[giorno] = {};
        if (!struttura[giorno][categoria]) struttura[giorno][categoria] = {};
        if (!struttura[giorno][categoria][a.ruolo]) struttura[giorno][categoria][a.ruolo] = [];

        // In src/app/admin/operativo/page.tsx
        struttura[giorno][categoria][a.ruolo].push({
            id: a.id, // <--- AGGIUNGI QUESTO!
            turno: a.shifts?.nome,
            orario: `${a.shifts?.ora_inizio?.slice(0, 5)} - ${a.shifts?.ora_fine?.slice(0, 5)}`,
            volontario: `${a.volunteers?.nome ?? ""} ${a.volunteers?.cognome ?? ""}`
        });
    });

    return (
        <main className="min-h-screen bg-gray-50 p-4 sm:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-900">Piano operativo festival</h1>
                    <p className="text-gray-500 mt-2">Visualizzazione turni raggruppati per stand e orari.</p>
                </div>

                {Object.keys(struttura).length === 0 ? (
                    <div className="text-center py-20 border-2 border-dashed rounded-2xl bg-white">
                        <p className="text-gray-500">Nessuna assegnazione presente al momento.</p>
                    </div>
                ) : (
                    <OperativoView struttura={struttura} />
                )}
            </div>
        </main>
    );
}