"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, usePathname } from "next/navigation";


export default function AdminGuard({
                                       children
                                   }: {
    children: React.ReactNode;
}) {


    const router = useRouter();
    const pathname = usePathname();

    const [checking, setChecking] = useState(true);



    useEffect(() => {


        async function check() {


            // La pagina login deve essere pubblica

            if (pathname === "/admin/login") {

                setChecking(false);

                return;

            }



            const {
                data
            } = await supabase.auth.getSession();



            if (!data.session) {

                router.push("/admin/login");

                return;

            }



            setChecking(false);


        }



        check();


    }, [pathname, router]);





    if (checking) {

        return (

            <main className="min-h-screen flex items-center justify-center">

                <p>
                    Verifica accesso...
                </p>

            </main>

        );

    }



    return (

        <>
            {children}
        </>

    );

}