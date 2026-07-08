"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Role = {
    id: string;
    nome: string;
};

export default function VolunteerForm() {
    const [roles, setRoles] = useState<Role[]>([]);

    const [form, setForm] = useState({
        nome: "",
        cognome: "",
        telefono: "",
        email: "",
        disponibilita24: false,
        disponibilita25: false,
        primaScelta: "",
        secondaScelta: "",
        terzaScelta: "",
        note: "",
    });

    // Recupero ruoli da Supabase
    useEffect(() => {
        async function loadRoles() {
            const { data, error } = await supabase
                .from("roles")
                .select("*")
                .order("nome");

            if (error) {
                console.error("Errore caricamento ruoli:", error);
                return;
            }
            setRoles(data ?? []);
        }
        loadRoles();
    }, []);

    function handleChange(
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) {
        const { name, value, type } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
        }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        // --- 1) CONTROLLI PRELIMINARI ---

        // Controllo disponibilità
        if (!form.disponibilita24 && !form.disponibilita25) {
            alert("Seleziona almeno una disponibilità tra il 24 e il 25 luglio");
            return;
        }

        // Controllo compilazione preferenze ruoli
        if (!form.primaScelta || !form.secondaScelta || !form.terzaScelta) {
            alert("Seleziona tutte e tre le preferenze di ruolo");
            return;
        }

        // Controllo duplicati preferenze ruoli
        if (
            form.primaScelta === form.secondaScelta ||
            form.primaScelta === form.terzaScelta ||
            form.secondaScelta === form.terzaScelta
        ) {
            alert("Le tre preferenze di ruolo devono essere diverse");
            return;
        }

        // --- 2) INSERIMENTO SU DATABASE ---

        // Inserimento volontario
        const { data: volunteer, error: volunteerError } = await supabase
            .from("volunteers")
            .insert({
                nome: form.nome,
                cognome: form.cognome,
                telefono: form.telefono,
                email: form.email,
                note: form.note,
            })
            .select()
            .single();

        if (volunteerError || !volunteer) {
            console.error(volunteerError);
            alert("Errore durante l'invio della candidatura");
            return;
        }

        // Salvataggio preferenze ruoli
        const preferences = [
            { volunteer_id: volunteer.id, role_id: form.primaScelta, posizione: 1 },
            { volunteer_id: volunteer.id, role_id: form.secondaScelta, posizione: 2 },
            { volunteer_id: volunteer.id, role_id: form.terzaScelta, posizione: 3 },
        ].filter(item => item.role_id !== "");

        if (preferences.length > 0) {
            const { error: preferencesError } = await supabase
                .from("preferences")
                .insert(preferences);

            if (preferencesError) {
                console.error(preferencesError);
            }
        }

        // Salvataggio disponibilità
        const availability = [];
        if (form.disponibilita24) {
            availability.push({ volunteer_id: volunteer.id, data: "2026-07-24" });
        }
        if (form.disponibilita25) {
            availability.push({ volunteer_id: volunteer.id, data: "2026-07-25" });
        }

        if (availability.length > 0) {
            const { error: availabilityError } = await supabase
                .from("availability")
                .insert(availability);

            if (availabilityError) {
                console.error(availabilityError);
            }
        }

        alert("Candidatura inviata correttamente!");

        // Reset form
        setForm({
            nome: "",
            cognome: "",
            telefono: "",
            email: "",
            disponibilita24: false,
            disponibilita25: false,
            primaScelta: "",
            secondaScelta: "",
            terzaScelta: "",
            note: "",
        });
    }

    // Stile condiviso per gli input di testo e le select
    const inputStyle = "w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all";

    return (
        <form onSubmit={handleSubmit} className="space-y-6">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Nome *</label>
                    <input
                        name="nome"
                        placeholder="Es. Mario"
                        value={form.nome}
                        onChange={handleChange}
                        required
                        className={inputStyle}
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Cognome *</label>
                    <input
                        name="cognome"
                        placeholder="Es. Rossi"
                        value={form.cognome}
                        onChange={handleChange}
                        required
                        className={inputStyle}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Telefono *</label>
                    <input
                        name="telefono"
                        placeholder="Es. 333 1234567"
                        value={form.telefono}
                        onChange={handleChange}
                        required
                        className={inputStyle}
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                    <input
                        name="email"
                        type="email"
                        placeholder="Es. mario.rossi@email.com"
                        value={form.email}
                        onChange={handleChange}
                        className={inputStyle}
                    />
                </div>
            </div>

            <hr className="border-gray-200" />

            {/* SEZIONE DISPONIBILITA' */}
            <div>
                <h2 className="text-lg font-bold text-gray-900 mb-1">Disponibilità *</h2>
                <p className="text-sm text-gray-500 mb-4">Seleziona almeno una delle due serate</p>

                <div className="flex flex-col sm:flex-row gap-4">
                    <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors w-full">
                        <input
                            type="checkbox"
                            name="disponibilita24"
                            checked={form.disponibilita24}
                            onChange={handleChange}
                            className="w-5 h-5 text-black border-gray-300 rounded focus:ring-black"
                        />
                        <span className="ml-3 font-medium text-gray-900">Venerdì 24 Luglio</span>
                    </label>

                    <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors w-full">
                        <input
                            type="checkbox"
                            name="disponibilita25"
                            checked={form.disponibilita25}
                            onChange={handleChange}
                            className="w-5 h-5 text-black border-gray-300 rounded focus:ring-black"
                        />
                        <span className="ml-3 font-medium text-gray-900">Sabato 25 Luglio</span>
                    </label>
                </div>
            </div>

            <hr className="border-gray-200" />

            {/* SEZIONE PREFERENZE RUOLO */}
            <div>
                <h2 className="text-lg font-bold text-gray-900 mb-1">Preferenze ruolo *</h2>
                <p className="text-sm text-gray-500 mb-4">Indica i tre ruoli che preferiresti ricoprire in ordine di preferenza</p>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Prima scelta</label>
                        <select
                            name="primaScelta"
                            value={form.primaScelta}
                            onChange={handleChange}
                            required
                            className={inputStyle}
                        >
                            <option value="">Seleziona...</option>
                            {roles.map(role => (
                                <option key={role.id} value={role.id}>{role.nome}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Seconda scelta</label>
                        <select
                            name="secondaScelta"
                            value={form.secondaScelta}
                            onChange={handleChange}
                            required
                            className={inputStyle}
                        >
                            <option value="">Seleziona...</option>
                            {roles
                                .filter(role => role.id !== form.primaScelta)
                                .map(role => (
                                    <option key={role.id} value={role.id}>{role.nome}</option>
                                ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Terza scelta</label>
                        <select
                            name="terzaScelta"
                            value={form.terzaScelta}
                            onChange={handleChange}
                            required
                            className={inputStyle}
                        >
                            <option value="">Seleziona...</option>
                            {roles
                                .filter(
                                    role =>
                                        role.id !== form.primaScelta &&
                                        role.id !== form.secondaScelta
                                )
                                .map(role => (
                                    <option key={role.id} value={role.id}>{role.nome}</option>
                                ))}
                        </select>
                    </div>
                </div>
            </div>

            <hr className="border-gray-200" />

            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Note (Opzionale)</label>
                <textarea
                    name="note"
                    rows={3}
                    placeholder="Note o esigenze particolari, limitazioni fisiche, ecc."
                    value={form.note}
                    onChange={handleChange}
                    className={inputStyle}
                />
            </div>

            <div className="pt-4">
                <button
                    type="submit"
                    className="w-full bg-black hover:bg-gray-800 text-white font-bold py-4 px-8 rounded-xl shadow-md transition-all hover:shadow-lg transform hover:-translate-y-1"
                >
                    Invia Candidatura
                </button>
            </div>
        </form>
    );
}