'use client';

import { useState, useMemo, useEffect } from 'react';
import type { Customer } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle, User, Search, FileText, Phone, Users, LogOut } from 'lucide-react';
import { logout } from '@/app/actions';

interface DashboardClientPageProps {
  customers: Customer[];
}

export function DashboardClientPage({ customers: initialCustomers }: DashboardClientPageProps) {
  const [customers, setCustomers] = useState(initialCustomers);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setCustomers(initialCustomers);
  }, [initialCustomers]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  const filteredCustomers = useMemo(() => {
    if (!customers) return [];
    const lowercasedTerm = searchTerm.toLowerCase();
    return customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(lowercasedTerm) ||
        customer.nic.toLowerCase().includes(lowercasedTerm) ||
        (customer.measurementSets && customer.measurementSets.some(set => 
            (set.jobNumber && set.jobNumber.toLowerCase().includes(lowercasedTerm)) ||
            (set.orderStatus && set.orderStatus.toLowerCase().includes(lowercasedTerm))
        ))
    );
  }, [searchTerm, customers]);

  if (!isMounted) {
    return (
       <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-9 bg-gray-200 rounded w-1/3 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-44 animate-pulse"></div>
        </div>
        <div className="h-40 bg-gray-200 rounded-lg animate-pulse"></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
             <div key={i} className="h-40 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 className="text-3xl lg:text-4xl font-headline font-bold">Customer Dashboard</h1>
            <p className="text-muted-foreground mt-1">Search, view, and manage your customers.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href="/dashboard/new">
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Customer
            </Link>
          </Button>
          <form action={logout}>
            <Button variant="outline" type="submit">
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          </form>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center">
            <Search className="mr-2 h-5 w-5" /> Find a Customer
          </CardTitle>
          <CardDescription>Search by name, NIC, job number, or order status (e.g. "In Progress").</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="e.g., John Doe, 123456789V, A-123 or Completed"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>
      
      {filteredCustomers.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredCustomers.map((customer) => (
            <Link href={`/dashboard/customer/${customer.id}`} key={customer.id} className="block">
              <Card className="hover:shadow-lg hover:border-primary transition-all h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl font-headline">
                    <div className="p-2 bg-primary/10 rounded-full text-primary">
                        <User className="h-5 w-5"/>
                    </div>
                     {customer.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm font-body">
                   <p className="flex items-center gap-2 text-muted-foreground"><FileText className="w-4 h-4 text-accent" /> NIC: {customer.nic}</p>
                   <p className="flex items-center gap-2 text-muted-foreground"><Phone className="w-4 h-4 text-accent" /> Contact: {customer.contact}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="col-span-full text-center py-16 border-2 border-dashed rounded-lg">
          <Users className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium font-headline">No Customers Found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {searchTerm ? "Try a different search term." : "Get started by adding a new customer."}
          </p>
          {!searchTerm && 
            <Button asChild className="mt-4">
              <Link href="/dashboard/new">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Customer
              </Link>
            </Button>
          }
        </div>
      )}
    </div>
  );
}
