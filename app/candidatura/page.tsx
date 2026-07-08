import VolunteerForm from "@/components/VolunteerForm";

export default function CandidaturaPage() {
    return (
        <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto space-y-6">

                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                        Unisciti alla Crew
                    </h1>
                    <p className="text-lg text-gray-600">
                        Fontanova Fest 2026 - 24 e 25 luglio
                    </p>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 md:p-8">
                    <VolunteerForm />
                </div>

            </div>
        </main>
    );
}