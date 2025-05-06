import { auth, currentUser } from "@clerk/nextjs/server";
import { getProspect } from "@/actions/prospects/get-prospect";
import { ProspectTable } from "@/components";

export default async function ProspectPage() {
    const { userId, redirectToSignIn } = await auth();
    if (!userId) return redirectToSignIn();

    const user = await currentUser()
    const role = user?.publicMetadata?.role
    // const role = sessionClaims?.metadata?.role;

    console.log({ role })
    // console.log({user2})
    const isAdmin = role === "admin";

    const allProspects = await getProspect();

    let prospects = allProspects;

    if (!isAdmin && user?.firstName) {
        const userName = `${user?.firstName} ${user?.lastName}`;
        prospects = allProspects.filter((p: { assignedTo: string; }) => p.assignedTo?.trim() === userName);
    }

    return <ProspectTable prospects={prospects} isAdmin={isAdmin} />;
}