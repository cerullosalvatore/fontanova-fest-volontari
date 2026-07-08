"use client";

import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter, usePathname } from "next/navigation";

export default function AdminMenu() {
    const router = useRouter();
    const pathname = usePathname();

    // Nascondi il menu se ci troviamo nella pagina di login
    if (pathname === "/admin/login") {
        return null;
    }

    async function logout() {
        await supabase.auth.signOut();
        router.push("/admin/login");
    }

    const linkStyle = (path: string) => {
        const isActive = pathname === path;
        return `transition-colors pb-1 ${
            isActive
                ? "font-bold text-black border-b-2 border-black"
                : "font-medium text-gray-500 hover:text-black"
        }`;
    };

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
            <div className="max-w-6xl mx-auto px-4 sm:px-8 py-4 flex flex-wrap items-center justify-between gap-y-4">

                <div className="flex items-center gap-6 w-full sm:w-auto">
                    <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto overflow-x-auto">
                        <Link href="/admin" className={linkStyle("/admin")}>
                            Dashboard
                        </Link>
                        <Link href="/admin/candidature" className={linkStyle("/admin/candidature")}>
                            Candidature
                        </Link>
                        <Link href="/admin/pianificazione" className={linkStyle("/admin/pianificazione")}>
                            Pianificazione
                        </Link>
                        <Link href="/admin/operativo" className={linkStyle("/admin/operativo")}>
                            Operativo
                        </Link>
                    </div>
                </div>

                <button
                    onClick={logout}
                    className="text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors ml-auto sm:ml-0"
                >
                    Esci
                </button>

            </div>
        </nav>
    );
}