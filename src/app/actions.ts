// This file is a central place for all server actions.
'use server'

import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { z } from 'zod';
import { type Customer, type MeasurementSet, type OrderStatus, type PaymentStatus } from '@/lib/types';
import { revalidatePath } from 'next/cache';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function login(formData: FormData) {
  const supabase = createClient()
  const validatedFields = loginSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return { error: 'Invalid fields' };
  }
  
  const { email, password } = validatedFields.data;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: 'Could not authenticate user' };
  }

  return redirect('/dashboard');
}

export async function signup(formData: FormData) {
  const origin = headers().get('origin')
  const supabase = createClient()
  const validatedFields = signupSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return { error: 'Invalid fields' };
  }

  const { email, password } = validatedFields.data;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    return { error: 'Could not authenticate user' };
  }

  // For this app, we'll just log them in directly after sign up.
  // In a real app, you'd likely want email confirmation.
  await supabase.auth.signInWithPassword({ email, password });

  return redirect('/dashboard');
}

export async function logout() {
  const supabase = createClient();
  await supabase.auth.signOut();
  return redirect('/login');
}

// Customer Actions
const customerFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  nic: z.string().min(5, "NIC must be at least 5 characters."),
  contact: z.string().min(5, "Contact information is required."),
  orderHistory: z.string().optional(),
  preferences: z.string().optional(),
});

export async function createCustomer(formData: FormData) {
    const supabase = createClient();
    const validatedFields = customerFormSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return { error: 'Invalid fields', fields: validatedFields.error.flatten().fieldErrors };
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'You must be logged in to create a customer.' };

    const { error, data } = await supabase.from('customers').insert({
        ...validatedFields.data,
        user_id: user.id
    }).select('id').single();

    if (error) {
        return { error: 'Failed to create customer.' };
    }
    
    revalidatePath('/dashboard');
    return redirect(`/dashboard/customer/${data.id}`);
}

export async function updateCustomer(customerId: string, formData: FormData) {
    const supabase = createClient();
    const validatedFields = customerFormSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return { error: 'Invalid fields', fields: validatedFields.error.flatten().fieldErrors };
    }
    
    const { error } = await supabase
        .from('customers')
        .update(validatedFields.data)
        .eq('id', customerId);

    if (error) {
        return { error: 'Failed to update customer.' };
    }

    revalidatePath('/dashboard');
    revalidatePath(`/dashboard/customer/${customerId}`);
    return { success: true };
}

export async function deleteCustomer(customerId: string) {
    const supabase = createClient();
    const { error } = await supabase.from('customers').delete().eq('id', customerId);

    if (error) {
        return { error: 'Failed to delete customer.' };
    }

    revalidatePath('/dashboard');
    return redirect('/dashboard');
}


// Measurement Actions
export async function addMeasurementSet(customerId: string, measurementSet: Omit<MeasurementSet, 'id' | 'date'>) {
    const supabase = createClient();

    const { error } = await supabase.from('measurement_sets').insert({
        customer_id: customerId,
        date: new Date().toISOString(),
        measurements: measurementSet.measurements,
        job_number: measurementSet.jobNumber,
        request_date: measurementSet.requestDate,
        payment_status: measurementSet.paymentStatus,
        order_status: measurementSet.orderStatus,
    });

    if (error) {
        console.error('Supabase error:', error);
        return { error: 'Failed to add measurement set.' };
    }
    
    revalidatePath(`/dashboard/customer/${customerId}`);
    return { success: true };
}

export async function updateOrderStatus(setId: string, customerId: string, newStatus: OrderStatus) {
    const supabase = createClient();

    const updateData: { order_status: OrderStatus; completion_date?: string; handover_date?: string } = {
        order_status: newStatus
    };
    if (newStatus === 'Completed') {
        updateData.completion_date = new Date().toISOString();
    } else if (newStatus === 'Handed Over') {
        updateData.handover_date = new Date().toISOString();
    }

    const { error } = await supabase.from('measurement_sets').update(updateData).eq('id', setId);

    if (error) {
        return { error: 'Failed to update order status.' };
    }

    revalidatePath(`/dashboard/customer/${customerId}`);
    return { success: true };
}


export async function updatePaymentStatus(setId: string, customerId: string, newStatus: PaymentStatus) {
    const supabase = createClient();

    const { error } = await supabase.from('measurement_sets').update({ payment_status: newStatus }).eq('id', setId);

    if (error) {
        return { error: 'Failed to update payment status.' };
    }

    revalidatePath(`/dashboard/customer/${customerId}`);
    return { success: true };
}


// Data Fetching
export async function getCustomers() {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('customers')
        .select(`*, measurement_sets(job_number, order_status)`)
        .order('created_at', { ascending: false });
    
    if (error) {
        console.error(error);
        return [];
    }

    // This is a bit of a hack to match the previous data structure for the search to work.
    return data.map(c => ({
        ...c,
        measurementSets: c.measurement_sets
    })) as Customer[];
}

export async function getCustomerById(id: string): Promise<Customer | null> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('customers')
        .select(`
            *,
            measurement_sets (
                id,
                date,
                measurements,
                job_number,
                request_date,
                payment_status,
                order_status,
                completion_date,
                handover_date
            )
        `)
        .eq('id', id)
        .single();

    if (error) {
        console.error(error);
        return null;
    }

    const customer: Customer = {
      id: data.id,
      createdAt: data.created_at,
      name: data.name,
      nic: data.nic,
      contact: data.contact,
      orderHistory: data.order_history || '',
      preferences: data.preferences || '',
      measurementSets: data.measurement_sets.map(ms => ({
        id: ms.id,
        date: ms.date,
        measurements: ms.measurements as any,
        jobNumber: ms.job_number || undefined,
        requestDate: ms.request_date || undefined,
        paymentStatus: ms.payment_status as PaymentStatus,
        orderStatus: ms.order_status as OrderStatus,
        completionDate: ms.completion_date || undefined,
        handoverDate: ms.handover_date || undefined,
      }))
    }
    
    return customer;
}
