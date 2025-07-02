import { getCustomerById } from '@/app/actions';
import { CustomerDetailClientPage } from '@/components/customer-detail-client';

export default async function CustomerDetailPage({ params }: { params: { id: string } }) {
  const customer = await getCustomerById(params.id);

  if (!customer) {
    return <div className="text-center p-10">Customer not found.</div>;
  }
  
  return <CustomerDetailClientPage customer={customer} />;
}
