"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errore, setErrore] = useState("");

    async function login(e: React.FormEvent) {
        e.preventDefault();

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            setErrore("Credenziali non valide. Riprova.");
            return;
        }

        router.push("/admin");
    }

    // Stile condiviso per gli input
    const inputStyle = "w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all";

    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4 sm:p-8">

            <form
                onSubmit={login}
                className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-sm p-8 space-y-6"
            >
                <div className="text-center space-y-2 mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                        Accesso Admin
                    </h1>
                    <p className="text-sm text-gray-500">
                        Inserisci le tue credenziali per gestire il festival
                    </p>
                </div>

                {errore && (
                    <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg text-sm font-medium text-center">
                        {errore}
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            placeholder="admin@email.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            className={inputStyle}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            className={inputStyle}
                        />
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        className="w-full bg-black hover:bg-gray-800 text-white font-bold py-4 px-8 rounded-xl shadow-md transition-all hover:shadow-lg transform hover:-translate-y-1"
                    >
                        Entra nel Pannello
                    </button>
                </div>
            </form>

        </main>
    );
}