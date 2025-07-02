'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { type MeasurementSet, type PaymentStatus, type OrderStatus } from "@/lib/types";
import { PlusCircle, Trash2, Save } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Separator } from "./ui/separator";

const formSchema = z.object({
  jobNumber: z.string().optional(),
  requestDate: z.string().optional(),
  paymentStatus: z.enum(['Paid', 'Pending', 'Unpaid']),
  measurements: z.array(
    z.object({
      label: z.string().min(1, "Label is required."),
      value: z.coerce.number().min(0, "Value cannot be negative."),
    })
  ).min(1, "At least one measurement is required."),
});

type MeasurementFormValues = z.infer<typeof formSchema>;

interface MeasurementFormProps {
    onSave: (measurementSet: Omit<MeasurementSet, 'id' | 'date'>) => void;
}

const defaultMeasurements = [
    { label: "Height", value: 0 },
    { label: "Neck Width", value: 0 },
    { label: "Shoulder", value: 0 },
    { label: "Armhole Curve", value: 0 },
    { label: "Upperarm Width", value: 0 },
    { label: "Chest", value: 0 },
    { label: "Underbust", value: 0 },
    { label: "Nipple to Nipple", value: 0 },
    { label: "Waist", value: 0 },
    { label: "Hips", value: 0 },
    { label: "Waist to Knee Length", value: 0 },
    { label: "Waist to Ankle", value: 0 },
    { label: "Thigh Circ", value: 0 },
    { label: "Ankle Circ", value: 0 },
    { label: "Shoulder to Waist", value: 0 },
    { label: "Shoulder to Ankle", value: 0 },
    { label: "Shoulder to Wrist", value: 0 },
    { label: "Shoulder to Elbow", value: 0 },
    { label: "Inner Arm Length", value: 0 },
    { label: "Outseam Length", value: 0 },
    { label: "Inseam Length", value: 0 },
    { label: "Back Rise", value: 0 },
    { label: "Front Rise", value: 0 },
    { label: "Single Shoulder", value: 0 },
    { label: "Front Drop", value: 0 },
    { label: "Back Drop", value: 0 },
    { label: "Armhole Curve Straight", value: 0 },
    { label: "Neck Band Width", value: 0 },
    { label: "Collar Width", value: 0 },
    { label: "Collar Point", value: 0 },
    { label: "Sleeve Length", value: 0 },
    { label: "Sleeve Open", value: 0 },
    { label: "Cuff Height", value: 0 },
    { label: "Waist Band", value: 0 },
    { label: "Leg Open", value: 0 },
    { label: "Seat Length", value: 0 },
];

export function MeasurementForm({ onSave }: MeasurementFormProps) {
  const form = useForm<MeasurementFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        jobNumber: '',
        requestDate: new Date().toISOString().split('T')[0],
        paymentStatus: 'Pending',
        measurements: defaultMeasurements,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "measurements",
  });

  function onSubmit(data: MeasurementFormValues) {
    const newMeasurementSet = {
        measurements: data.measurements,
        jobNumber: data.jobNumber,
        requestDate: data.requestDate,
        paymentStatus: data.paymentStatus as PaymentStatus,
        orderStatus: 'In Progress' as OrderStatus,
    }
    onSave(newMeasurementSet);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
         <Card>
            <CardHeader><CardTitle className="font-headline text-2xl">Job Details</CardTitle></CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="jobNumber"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Job Number</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., A-124" {...field} value={field.value ?? ''} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    <FormField
                        control={form.control}
                        name="requestDate"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Request Date</FormLabel>
                            <FormControl>
                                <Input type="date" {...field} value={field.value ?? ''} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                </div>
                 <FormField
                    control={form.control}
                    name="paymentStatus"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                        <FormLabel>Payment Status</FormLabel>
                        <FormControl>
                            <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-6"
                            >
                            <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl><RadioGroupItem value="Pending" /></FormControl>
                                <FormLabel className="font-normal">Pending</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl><RadioGroupItem value="Paid" /></FormControl>
                                <FormLabel className="font-normal">Paid</FormLabel>
                            </FormItem>
                             <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl><RadioGroupItem value="Unpaid" /></FormControl>
                                <FormLabel className="font-normal">Unpaid</FormLabel>
                            </FormItem>
                            </RadioGroup>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
            </CardContent>
         </Card>
        <Separator />
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Measurements</CardTitle>
            <CardDescription>All measurements should be in inches. This set will be dated today.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 max-h-[40vh] overflow-y-auto p-4 border rounded-md">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-end gap-2">
                <FormField
                  control={form.control}
                  name={`measurements.${index}.label`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel className="text-xs">Type</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Shoulder" {...field} />
                      </FormControl>
                        <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`measurements.${index}.value`}
                  render={({ field }) => (
                    <FormItem className="w-24">
                      <FormLabel className="text-xs">Value (in)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 16.5" {...field} />
                      </FormControl>
                        <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Remove measurement</span>
                </Button>
              </div>
            ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2 md:col-span-2"
                onClick={() => append({ label: "", value: 0 })}
            >
                <PlusCircle className="mr-2 h-4 w-4" /> Add Measurement
            </Button>
          </CardContent>
        </Card>

        <div className="flex justify-end">
            <Button type="submit" size="lg">
                <Save className="mr-2 h-4 w-4" />
                Save Measurement Set
            </Button>
        </div>
      </form>
    </Form>
  );
}
