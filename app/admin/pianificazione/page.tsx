import AssignmentForm from "@/components/admin/AssignmentForm";
import AssignmentList from "@/components/admin/AssignmentList";
import { supabase } from "@/lib/supabase";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PianificazionePage() {

    const { data: roles, error: rolesError } = await supabase
        .from("roles")
        .select("id,nome")
        .order("nome");

    const { data: shifts, error: shiftsError } = await supabase
        .from("shifts")
        .select("*")
        .order("ordine");

    const { data: volunteers, error: volunteersError } = await supabase
        .from("volunteers")
        .select(`
            id,
            nome,
            cognome,
            availability!availability_volunteer_id_fkey (
                data
            )
        `)
        .order("cognome");

    const { data: assignments, error: assignmentsError } = await supabase
        .from("assignments")
        .select(`
            id,
            ruolo,
            data,
            confermato,
            volunteers!assignments_volunteer_id_fkey (
                nome,
                cognome
            ),
            shifts!assignments_shift_fk (
                nome,
                ora_inizio,
                ora_fine
            )
        `)
        .order("data")
        .order("shift_id");

    // Logging errori (omesso per brevità, resta la logica che avevi)

    return (
        <main className="min-h-screen bg-gray-50 p-4 sm:p-8">
            <div className="max-w-6xl mx-auto">

                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-900">Pianificazione Festival</h1>
                    <p className="text-gray-500 mt-2">Assegna i volontari ai turni e gestisci i ruoli.</p>
                </div>

                <section className="mb-12">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Nuova assegnazione</h2>
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                        <AssignmentForm
                            roles={roles ?? []}
                            shifts={shifts ?? []}
                            volunteers={volunteers ?? []}
                        />
                    </div>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Assegnazioni create</h2>
                    {assignments && assignments.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <AssignmentList assignments={assignments} />
                        </div>
                    ) : (
                        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl bg-white">
                            <p className="text-gray-500">Nessuna assegnazione presente.</p>
                        </div>
                    )}
                </section>

            </div>
        </main>
    );
}