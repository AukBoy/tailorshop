import { getCustomers } from '@/app/actions';
import { DashboardClientPage } from '@/components/dashboard-client';

export default async function DashboardPage() {
  const customers = await getCustomers();
  return <DashboardClientPage customers={customers} />;
}
