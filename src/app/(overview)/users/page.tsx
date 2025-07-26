import { getClerkUsers } from "@/actions/users/get-clerk-users";
import { UsersTable } from "@/components";

export default async function UsersPage() {
    const users = await getClerkUsers();
    return (
        <div>
            <h1 className="text-xl font-medium">Usuarios </h1>
            <UsersTable users={users} />
        </div>
    );
}     