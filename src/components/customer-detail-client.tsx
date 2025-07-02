'use client'

import { type Customer, type MeasurementSet, type OrderStatus, type PaymentStatus } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, FileText, Phone, Calendar, Trash2, Edit, PlusCircle, Briefcase, DollarSign, Hand, CalendarCheck, CheckCircle, ChevronDown, Home, ArrowLeft } from 'lucide-react';
import { StyleRecommender } from '@/components/style-recommender';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from "@/hooks/use-toast";
import { CustomerForm } from '@/components/customer-form';
import { MeasurementForm } from '@/components/measurement-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { deleteCustomer, addMeasurementSet, updateOrderStatus, updatePaymentStatus, getCustomerById } from '@/app/actions';

interface CustomerDetailClientPageProps {
    customer: Customer;
}

export function CustomerDetailClientPage({ customer: initialCustomer }: CustomerDetailClientPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [customer, setCustomer] = useState<Customer>(initialCustomer);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isMeasurementDialogOpen, setIsMeasurementDialogOpen] = useState(false);

  useEffect(() => {
    setCustomer(initialCustomer);
  }, [initialCustomer]);

  const handleDelete = async () => {
    if (!customer) return;
    const result = await deleteCustomer(customer.id);
    if(result.error) {
        toast({
            variant: "destructive",
            title: "Error",
            description: result.error,
        });
    } else {
        toast({
            title: "Customer Deleted",
            description: `${customer?.name} has been removed from your records.`,
        });
    }
  };

  const handleSave = async () => {
    setIsEditDialogOpen(false);
    const updatedCustomer = await getCustomerById(customer.id);
    if (updatedCustomer) setCustomer(updatedCustomer);
  }

  const handleMeasurementSave = async (newMeasurementSet: Omit<MeasurementSet, 'id' | 'date'>) => {
    if (!customer) return;

    const result = await addMeasurementSet(customer.id, newMeasurementSet);

    if (result.error) {
         toast({
            variant: "destructive",
            title: "Error adding measurements",
            description: result.error,
        });
    } else {
        toast({
            title: "Measurements Added!",
            description: `A new set of measurements has been saved for ${customer.name}.`,
        });
        const updatedCustomer = await getCustomerById(customer.id);
        if (updatedCustomer) setCustomer(updatedCustomer);
    }
    
    setIsMeasurementDialogOpen(false);
  }

  const handleUpdateStatus = async (setId: string, newStatus: OrderStatus) => {
    if (!customer) return;

    const result = await updateOrderStatus(setId, customer.id, newStatus);
     if (result.error) {
         toast({
            variant: "destructive",
            title: "Error",
            description: result.error,
        });
    } else {
        toast({
            title: "Order Status Updated!",
            description: `The job has been marked as ${newStatus}.`,
        });
        const updatedCustomer = await getCustomerById(customer.id);
        if (updatedCustomer) setCustomer(updatedCustomer);
    }
  };

  const handleUpdatePaymentStatus = async (setId: string, newStatus: PaymentStatus) => {
    if (!customer) return;

    const result = await updatePaymentStatus(setId, customer.id, newStatus);

    if (result.error) {
         toast({
            variant: "destructive",
            title: "Error",
            description: result.error,
        });
    } else {
       toast({
            title: "Payment Status Updated!",
            description: `The job's payment has been marked as ${newStatus}.`,
        });
        const updatedCustomer = await getCustomerById(customer.id);
        if (updatedCustomer) setCustomer(updatedCustomer);
    }
  };
  
  const sortedMeasurementSets = customer.measurementSets
    ? [...customer.measurementSets].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    : [];

  const getPaymentStatusVariant = (status: string) => {
    switch (status) {
        case 'Paid': return 'default';
        case 'Pending': return 'secondary';
        case 'Unpaid': return 'destructive';
        default: return 'outline';
    }
  }

  const getOrderStatusVariant = (status: OrderStatus) => {
    switch (status) {
        case 'Completed': return 'default';
        case 'In Progress': return 'secondary';
        case 'Handed Over': return 'outline';
        default: 'secondary';
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => router.back()}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
        <Button variant="outline" onClick={() => router.push('/dashboard')}><Home className="mr-2 h-4 w-4" /> Home</Button>
      </div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-full text-primary">
            <User className="h-8 w-8"/>
          </div>
          <div>
            <h1 className="text-3xl lg:text-4xl font-headline font-bold">{customer.name}</h1>
            <p className="text-muted-foreground">Customer Profile</p>
          </div>
        </div>
        <div className="flex gap-2">
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline"><Edit className="mr-2 h-4 w-4" /> Edit Profile</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[800px]">
                    <DialogHeader>
                    <DialogTitle className="font-headline text-2xl">Edit {customer.name}</DialogTitle>
                    </DialogHeader>
                    <div className="max-h-[70vh] overflow-y-auto p-1">
                        <CustomerForm customer={customer} onSave={handleSave} />
                    </div>
                </DialogContent>
            </Dialog>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                <Button variant="destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete {customer.name}'s profile and all their associated data.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
                </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
            <CardHeader><CardTitle className="font-headline">Contact Info</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
                <p className="flex items-start gap-3"><FileText className="h-5 w-5 mt-0.5 text-accent" /> <span><span className="font-semibold">NIC:</span> {customer.nic}</span></p>
                <p className="flex items-start gap-3"><Phone className="h-5 w-5 mt-0.5 text-accent" /> <span><span className="font-semibold">Contact:</span> {customer.contact}</span></p>
                <p className="flex items-start gap-3"><Calendar className="h-5 w-5 mt-0.5 text-accent" /> <span><span className="font-semibold">Member Since:</span> {new Date(customer.createdAt).toLocaleDateString()}</span></p>
            </CardContent>
        </Card>
        <Card className="md:col-span-2">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="font-headline">Job History</CardTitle>
                    <Dialog open={isMeasurementDialogOpen} onOpenChange={setIsMeasurementDialogOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm"><PlusCircle className="mr-2 h-4 w-4"/> Add New Job</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-4xl">
                            <DialogHeader>
                                <DialogTitle className="font-headline text-2xl">Add New Job & Measurements for {customer.name}</DialogTitle>
                            </DialogHeader>
                            <div className="max-h-[80vh] overflow-y-auto p-1 pr-2">
                                <MeasurementForm onSave={handleMeasurementSave} />
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
                <CardDescription>View measurement and job history. Each entry is dated.</CardDescription>
            </CardHeader>
            <CardContent>
                {sortedMeasurementSets.length > 0 ? (
                      <Accordion type="single" collapsible defaultValue="item-0" className="w-full">
                        {sortedMeasurementSets.map((set, index) => (
                            <AccordionItem value={`item-${index}`} key={set.id}>
                            <AccordionTrigger>
                                <div className="flex flex-col sm:flex-row sm:items-center text-left gap-x-4 gap-y-1">
                                    <span className="font-semibold">{set.jobNumber || `Job from ${new Date(set.date).toLocaleDateString()}`}</span>
                                    <span className="text-xs text-muted-foreground">{set.requestDate ? `Requested: ${new Date(set.requestDate).toLocaleDateString()}` : ''}</span>
                                </div>
                                <div className="flex items-center gap-2 ml-auto pl-4 flex-wrap justify-end">
                                    <Badge variant={getOrderStatusVariant(set.orderStatus)}>{set.orderStatus}</Badge>
                                    <Badge variant={getPaymentStatusVariant(set.paymentStatus)}>{set.paymentStatus}</Badge>
                                    {index === 0 && <Badge variant="outline" className="shrink-0 bg-primary/10 text-primary border-primary/20 font-normal">Latest</Badge>}
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="space-y-4">
                                    <div className="flex flex-col gap-4 text-sm pt-2">
                                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                                            <div className="flex items-center gap-2">
                                                <Briefcase className="w-4 h-4 text-accent" /> 
                                                <span className="font-semibold">Job Number:</span> {set.jobNumber || 'N/A'}
                                            </div>
                                             <div className="flex items-center gap-2">
                                                <DollarSign className="w-4 h-4 text-accent" /> 
                                                <span className="font-semibold">Payment:</span> 
                                                <Badge variant={getPaymentStatusVariant(set.paymentStatus)}>{set.paymentStatus}</Badge>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-muted-foreground">
                                            {set.completionDate && (
                                                <div className="flex items-center gap-2">
                                                    <CalendarCheck className="w-4 h-4 text-accent" />
                                                    <span>Completed: {new Date(set.completionDate).toLocaleDateString()}</span>
                                                </div>
                                            )}
                                            {set.handoverDate && (
                                                <div className="flex items-center gap-2">
                                                    <Hand className="w-4 h-4 text-accent" />
                                                    <span>Handed Over: {new Date(set.handoverDate).toLocaleDateString()}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pt-2">
                                        {set.measurements.map(m => (
                                            <div key={m.label} className="p-3 bg-secondary rounded-lg text-center">
                                                <p className="text-xs text-muted-foreground truncate">{m.label}</p>
                                                <p className="text-lg font-semibold text-primary">{m.value}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-4 pt-4 border-t">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-semibold">Order Status:</span>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="outline" size="sm">
                                                        Update <ChevronDown className="ml-2 h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuItem onClick={() => handleUpdateStatus(set.id, 'In Progress')}>
                                                        In Progress
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleUpdateStatus(set.id, 'Completed')}>
                                                        Completed
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleUpdateStatus(set.id, 'Handed Over')}>
                                                        Handed Over
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-semibold">Payment:</span>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="outline" size="sm">
                                                        Update <ChevronDown className="ml-2 h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuItem onClick={() => handleUpdatePaymentStatus(set.id, 'Paid')}>
                                                        Mark as Paid
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleUpdatePaymentStatus(set.id, 'Pending')}>
                                                        Mark as Pending
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleUpdatePaymentStatus(set.id, 'Unpaid')}>
                                                        Mark as Unpaid
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                </div>
                            </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                ) : (
                    <div className="text-center py-10 border-2 border-dashed rounded-lg">
                        <p className="text-sm text-muted-foreground">No jobs or measurements recorded yet.</p>
                          <Button size="sm" className="mt-4" onClick={() => setIsMeasurementDialogOpen(true)}>
                            <PlusCircle className="mr-2 h-4 w-4"/> Add Job & Measurements
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
      </div>

       <div className="grid md:grid-cols-2 gap-6">
         <Card>
            <CardHeader><CardTitle className="font-headline">Order History</CardTitle></CardHeader>
            <CardContent><p className="text-sm whitespace-pre-wrap">{customer.orderHistory || 'No history recorded.'}</p></CardContent>
        </Card>
         <Card>
            <CardHeader><CardTitle className="font-headline">Style Preferences</CardTitle></CardHeader>
            <CardContent><p className="text-sm whitespace-pre-wrap">{customer.preferences || 'No preferences recorded.'}</p></CardContent>
        </Card>
       </div>

      <StyleRecommender customer={customer} />

    </div>
  );
}
