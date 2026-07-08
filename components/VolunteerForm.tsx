"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Role = {
    id: string;
    nome: string;
};

export default function VolunteerForm() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
        const { name, value, type } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
        }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        // Impedisce invii multipli
        if (isSubmitting) return;

        if (!form.disponibilita24 && !form.disponibilita25) {
            alert("Seleziona almeno una disponibilità tra il 24 e il 25 luglio");
            return;
        }

        if (!form.primaScelta || !form.secondaScelta || !form.terzaScelta) {
            alert("Seleziona tutte e tre le preferenze di ruolo");
            return;
        }

        if (form.primaScelta === form.secondaScelta || form.primaScelta === form.terzaScelta || form.secondaScelta === form.terzaScelta) {
            alert("Le tre preferenze di ruolo devono essere diverse");
            return;
        }

        setIsSubmitting(true);

        try {
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

            if (volunteerError || !volunteer) throw volunteerError;

            const preferences = [
                { volunteer_id: volunteer.id, role_id: form.primaScelta, posizione: 1 },
                { volunteer_id: volunteer.id, role_id: form.secondaScelta, posizione: 2 },
                { volunteer_id: volunteer.id, role_id: form.terzaScelta, posizione: 3 },
            ];

            await supabase.from("preferences").insert(preferences);

            const availability = [];
            if (form.disponibilita24) availability.push({ volunteer_id: volunteer.id, data: "2026-07-24" });
            if (form.disponibilita25) availability.push({ volunteer_id: volunteer.id, data: "2026-07-25" });

            await supabase.from("availability").insert(availability);

            alert("Candidatura inviata correttamente!");
            setForm({
                nome: "", cognome: "", telefono: "", email: "",
                disponibilita24: false, disponibilita25: false,
                primaScelta: "", secondaScelta: "", terzaScelta: "", note: "",
            });
        } catch (err) {
            console.error(err);
            alert("Errore durante l'invio della candidatura");
        } finally {
            setIsSubmitting(false);
        }
    }

    const inputStyle = "w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all";

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Nome *</label>
                    <input name="nome" value={form.nome} onChange={handleChange} required className={inputStyle} />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Cognome *</label>
                    <input name="cognome" value={form.cognome} onChange={handleChange} required className={inputStyle} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Telefono *</label>
                    <input name="telefono" value={form.telefono} onChange={handleChange} required className={inputStyle} />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                    <input name="email" type="email" value={form.email} onChange={handleChange} className={inputStyle} />
                </div>
            </div>

            <hr className="border-gray-200" />

            <div>
                <h2 className="text-lg font-bold text-gray-900 mb-1">Disponibilità *</h2>
                <div className="flex flex-col sm:flex-row gap-4">
                    <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors w-full">
                        <input type="checkbox" name="disponibilita24" checked={form.disponibilita24} onChange={handleChange} className="w-5 h-5 text-black" />
                        <span className="ml-3 font-medium text-gray-900">Venerdì 24 Luglio</span>
                    </label>
                    <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors w-full">
                        <input type="checkbox" name="disponibilita25" checked={form.disponibilita25} onChange={handleChange} className="w-5 h-5 text-black" />
                        <span className="ml-3 font-medium text-gray-900">Sabato 25 Luglio</span>
                    </label>
                </div>
            </div>

            <hr className="border-gray-200" />

            <div>
                <h2 className="text-lg font-bold text-gray-900 mb-1">Preferenze ruolo *</h2>
                <div className="space-y-4">
                    {["primaScelta", "secondaScelta", "terzaScelta"].map((campo, index) => (
                        <div key={campo}>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                {index === 0 ? "Prima" : index === 1 ? "Seconda" : "Terza"} scelta
                            </label>
                            <select
                                name={campo}
                                // Usiamo una condizione: se il valore è booleano (disponibilità), lo ignoriamo o convertiamo
                                // In questo caso specifico, poiché mappiamo solo le 3 scelte, forziamo il valore a stringa
                                value={typeof form[campo as keyof typeof form] === 'string' ? (form[campo as keyof typeof form] as string) : ""}
                                onChange={handleChange}
                                required
                                className={inputStyle}
                            >
                                <option value="">Seleziona...</option>
                                {roles.map(role => (
                                    <option key={role.id} value={role.id}>
                                        {role.nome}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ))}
                </div>
            </div>

            <hr className="border-gray-200" />

            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Note (Opzionale)</label>
                <textarea name="note" rows={3} value={form.note} onChange={handleChange} className={inputStyle} />
            </div>

            <div className="pt-4">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full font-bold py-4 px-8 rounded-xl shadow-md transition-all ${isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-black hover:bg-gray-800 text-white"}`}
                >
                    {isSubmitting ? "Invio in corso..." : "Invia Candidatura"}
                </button>
            </div>
        </form>
    );
}