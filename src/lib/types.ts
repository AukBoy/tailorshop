export interface Measurement {
  label: string;
  value: number;
}

export type PaymentStatus = 'Paid' | 'Pending' | 'Unpaid';
export type OrderStatus = 'In Progress' | 'Completed' | 'Handed Over';

export interface MeasurementSet {
  id: string;
  date: string;
  measurements: Measurement[];
  jobNumber?: string;
  requestDate?: string;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  completionDate?: string;
  handoverDate?: string;
}

export interface Customer {
  id: string;
  nic: string;
  name: string;
  contact: string;
  orderHistory: string;
  preferences: string;
  measurementSets: MeasurementSet[];
  createdAt: string;
}
