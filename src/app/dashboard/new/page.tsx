'use client'

import { CustomerForm } from '@/components/customer-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NewCustomerPage() {
  const router = useRouter();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => router.back()}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
        <Button variant="outline" onClick={() => router.push('/dashboard')}><Home className="mr-2 h-4 w-4" /> Home</Button>
      </div>
      <div className="flex items-center gap-4">
        <UserPlus className="h-8 w-8 text-primary" />
        <div>
            <h1 className="text-3xl lg:text-4xl font-headline font-bold">New Customer Profile</h1>
            <p className="text-muted-foreground mt-1">Add a new customer and their measurements to the system.</p>
        </div>
      </div>
      <CustomerForm />
    </div>
  );
}
