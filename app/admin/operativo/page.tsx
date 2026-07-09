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
    // 1. Recupera assegnazioni
    const { data: assignments, error } = await supabase
        .from("assignments")
        .select(`
            id,
            ruolo,
            data,
            volunteer_id,
            volunteers!assignments_volunteer_id_fkey (
                nome,
                cognome,
                note,
                preferences (posizione, roles (nome))
            )
        `)
        .order("data");

    // 2. Recupera TUTTI i volontari con le loro disponibilità
    const { data: allVolunteers } = await supabase
        .from("volunteers")
        .select(`
            id, 
            nome, 
            cognome, 
            note,
            availability (data),
            preferences (posizione, roles (nome))
        `);

    // 3. Recupera Ruoli
    const { data: rolesData } = await supabase.from("roles").select("nome").order("nome");
    const ruoliDisponibili = rolesData?.map(r => r.nome) || Object.keys(categorie);

    if (error) console.error("Errore nel recupero assegnazioni:", error);

    const struttura: any = {};
    const panchina: any = {};

    const giorniPresenti = ["2026-07-24", "2026-07-25"];

    giorniPresenti.forEach((giorno: any) => {
        struttura[giorno] = {};
        panchina[giorno] = [];

        Object.entries(categorie).forEach(([ruolo, cat]: [string, any]) => {
            if (!struttura[giorno][cat]) struttura[giorno][cat] = {};
            if (!struttura[giorno][cat][ruolo]) struttura[giorno][cat][ruolo] = [];
        });

        const assignedIdsForDay = assignments?.filter(a => a.data === giorno).map(a => a.volunteer_id) || [];

        allVolunteers?.forEach(v => {
            const isAvailableToday = v.availability?.some((disp: any) => disp.data === giorno);
            if (isAvailableToday && !assignedIdsForDay.includes(v.id)) {
                panchina[giorno].push({
                    id: v.id,
                    volontario: `${v.nome} ${v.cognome}`.trim(),
                    note: v.note,
                    preferenze: v.preferences?.sort((x: any, y: any) => x.posizione - y.posizione).map((p: any) => p.roles?.nome).filter(Boolean) || []
                });
            }
        });
    });

    assignments?.forEach((a: any) => {
        const giorno = a.data;
        const categoria = categorie[a.ruolo] ?? "Altro";

        if (!struttura[giorno]) struttura[giorno] = {};
        if (!struttura[giorno][categoria]) struttura[giorno][categoria] = {};
        if (!struttura[giorno][categoria][a.ruolo]) struttura[giorno][categoria][a.ruolo] = [];

        const preferenze = a.volunteers?.preferences
            ?.sort((x: any, y: any) => x.posizione - y.posizione)
            ?.map((p: any) => p.roles?.nome)
            .filter(Boolean) || [];

        struttura[giorno][categoria][a.ruolo].push({
            id: a.id,
            volunteer_id: a.volunteer_id,
            volontario: `${a.volunteers?.nome ?? ""} ${a.volunteers?.cognome ?? ""}`.trim(),
            preferenze: preferenze,
            note: a.volunteers?.note || null
        });
    });

    return (
        <main className="min-h-screen bg-gray-50 p-4 sm:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8 print:mb-4">
                    <h1 className="text-3xl font-extrabold text-gray-900 uppercase">Piano operativo festival</h1>
                    <p className="text-gray-500 mt-2 uppercase print:hidden">Visualizzazione turni e modifica incastri.</p>
                </div>

                {/* Ho aggiunto la prop tuttiVolontari qui sotto */}
                <OperativoView
                    struttura={struttura}
                    ruoliDisponibili={ruoliDisponibili}
                    panchina={panchina}
                    tuttiVolontari={allVolunteers || []}
                />
            </div>
        </main>
    );
}