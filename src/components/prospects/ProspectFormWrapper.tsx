// app/components/prospects/ProspectFormWrapper.tsx
import { getClerkUsers } from '@/actions/users/get-clerk-users';
import { ProspectForm } from './ProspectForm';
import { IProspect } from '@/interfaces/prospect.interface';

interface Props {
  prospect: Partial<IProspect>;
  title: string;
}

export default async function ProspectFormWrapper({ prospect, title }: Props) {
  const users = await getClerkUsers();

  return <ProspectForm prospect={prospect} title={title} users={users} />;
}
