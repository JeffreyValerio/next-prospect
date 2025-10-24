export const revalidate = 300; // cachea por 5 minutos

import { auth, currentUser } from "@clerk/nextjs/server";
import { getProspect } from "@/actions/prospects/get-prospect";
import { ProspectTableWithContext } from "@/components/prospects/ProspectTableWithContext";
import { Suspense } from "react";

export default async function ProspectPage() {
    const { userId, redirectToSignIn } = await auth();
    if (!userId) return redirectToSignIn();

    const user = await currentUser()
    const role = user?.publicMetadata?.role
   
    const isAdmin = role === "admin";

    const allProspects = await getProspect();

    let prospects = allProspects;

    if (!isAdmin && user?.firstName) {
        const userName = `${user?.firstName} ${user?.lastName}`;
        prospects = allProspects.filter((p: { assignedTo: string; }) => p.assignedTo?.trim() === userName);
    }
 
    return (
        <div className="p-6">
            <div className="mb-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Gestión de Prospectos</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Administra y supervisa todos los prospectos del sistema
                        </p>
                    </div>
                </div>
            </div>
            <Suspense fallback={`cargando...`}>
                <ProspectTableWithContext prospects={prospects} isAdmin={isAdmin} />
            </Suspense>
        </div>
    );
}