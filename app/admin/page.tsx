import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default async function AdminDashboard() {

    // Recupero statistiche chiave tramite count
    const { count: volunteersCount } = await supabase
        .from("volunteers")
        .select("*", { count: "exact", head: true });

    const { count: assignmentsCount } = await supabase
        .from("assignments")
        .select("*", { count: "exact", head: true });

    const { count: avail24Count } = await supabase
        .from("availability")
        .select("*", { count: "exact", head: true })
        .eq("data", "2026-07-24");

    const { count: avail25Count } = await supabase
        .from("availability")
        .select("*", { count: "exact", head: true })
        .eq("data", "2026-07-25");

    return (
        <main className="min-h-screen bg-gray-50 p-4 sm:p-8">
            <div className="max-w-6xl mx-auto">

                <div className="mb-10">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                        Dashboard Festival 2026
                    </h1>
                    <p className="text-lg text-gray-600 mt-2">
                        Panoramica generale sulle candidature e l'organizzazione dei turni.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">

                    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Volontari Iscritti</h2>
                        <p className="text-5xl font-black mt-4 text-gray-900">{volunteersCount ?? 0}</p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Assegnazioni</h2>
                        <p className="text-5xl font-black mt-4 text-gray-900">{assignmentsCount ?? 0}</p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Disp. 24 Luglio</h2>
                        <p className="text-5xl font-black mt-4 text-blue-600">{avail24Count ?? 0}</p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Disp. 25 Luglio</h2>
                        <p className="text-5xl font-black mt-4 text-green-600">{avail25Count ?? 0}</p>
                    </div>

                </div>

                <div className="flex flex-col sm:flex-row gap-4">

                    <Link
                        href="/admin/candidature"
                        className="flex-1 text-center bg-black hover:bg-gray-800 text-white font-bold py-4 px-6 rounded-xl shadow-md transition-all hover:shadow-lg transform hover:-translate-y-1"
                    >
                        Gestisci Candidature
                    </Link>

                    <Link
                        href="/admin/pianificazione"
                        className="flex-1 text-center bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-900 font-bold py-4 px-6 rounded-xl shadow-sm transition-all hover:shadow-md transform hover:-translate-y-1"
                    >
                        Apri Pianificazione
                    </Link>

                    <Link
                        href="/admin/operativo"
                        className="flex-1 text-center bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-900 font-bold py-4 px-6 rounded-xl shadow-sm transition-all hover:shadow-md transform hover:-translate-y-1"
                    >
                        Vista Operativa
                    </Link>

                </div>

            </div>
        </main>
    );
}