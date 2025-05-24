import { getProspects } from "@/actions";
import { ProspectsTable } from "@/components";
import { validateUser } from "@/utils/auth";

export default async function ProspectsPage() {
  const prospects = await getProspects();
  const { isAdmin } = await validateUser();

  return (
    <section className="relative h-full flex flex-col gap-4">
      <ProspectsTable prospects={prospects} isAdmin={isAdmin} />
    </section>
  );
}
