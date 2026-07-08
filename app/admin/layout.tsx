import AdminGuard from "@/components/admin/AdminGuard";
import AdminMenu from "@/components/admin/AdminMenu";


export default function AdminLayout({
                                        children,
                                    }: {
    children: React.ReactNode;
}) {


    return (

        <AdminGuard>

            <AdminMenu />

            {children}

        </AdminGuard>

    );

}