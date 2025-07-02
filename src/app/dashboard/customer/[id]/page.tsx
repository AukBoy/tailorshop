import { getCustomerById } from '@/app/actions';
import { CustomerDetailClientPage } from '@/components/customer-detail-client';

interface CustomerDetailPageProps {
  params: { id: string };
}

export default async function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  const customer = await getCustomerById(params.id);

  if (!customer) {
    return <div className="text-center p-10">Customer not found.</div>;
  }
  
  return <CustomerDetailClientPage customer={customer} />;
}
