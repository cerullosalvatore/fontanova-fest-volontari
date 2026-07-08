import Link from "next/link";

export default function Home() {
    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50">

            <div className="max-w-2xl text-center space-y-6 bg-white p-10 border border-gray-200 rounded-2xl shadow-sm">

                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
                    Fontanova Fest 2026
                </h1>

                <p className="text-lg text-gray-600 leading-relaxed">
                    Unisciti alla Crew! Candidati per aiutarci a gestire gli stand, la logistica e l'accoglienza durante le due serate del festival. Compila il Form e diventa un membro della Fontanova Crew!
                </p>

                <div className="pt-6">
                    <Link
                        href="/candidatura"
                        className="inline-block bg-black hover:bg-gray-800 text-white font-semibold py-4 px-8 rounded-xl shadow-md transition-all hover:shadow-lg transform hover:-translate-y-1"
                    >
                        Iscriviti
                    </Link>
                </div>

            </div>

        </main>
    );
}