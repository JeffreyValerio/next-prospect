import { getClerkUsers } from "@/actions/users/get-clerk-users";
import { UsersTable } from "@/components";
import { auth, currentUser } from "@clerk/nextjs/server";
import { Suspense } from "react";

export default async function UsersPage() {
    const { userId, redirectToSignIn } = await auth();
    if (!userId) return redirectToSignIn();

    const user = await currentUser()
    const role = user?.publicMetadata?.role
    const isAdmin = role === "admin";

    const users = await getClerkUsers();

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Gestión de Usuarios</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Administra y supervisa todos los usuarios del sistema
                </p>
            </div>
            
            <Suspense fallback={<div className="text-gray-600 dark:text-gray-400">Cargando usuarios...</div>}>
                <UsersTable users={users} isAdmin={isAdmin} />
            </Suspense>
        </div>
    );
}  