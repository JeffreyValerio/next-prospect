import { auth, currentUser } from "@clerk/nextjs/server";
import { getProspect } from "@/actions/prospects/get-prospect";
import { ProspectTable } from "@/components";
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
        <Suspense fallback={`cargando...`}>
            <ProspectTable prospects={prospects} isAdmin={isAdmin} />
        </Suspense>
    );
}