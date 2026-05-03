import { createClient } from '@supabase/supabase-js'

export type BookingStatus = 'Booking Confirmed' | 'Phlebotomist Assigned' | 'Sample Collected' | 'Testing' | 'Report Ready';

export interface BookingRecord {
  id: string;
  patient_name: string;
  test_name: string;
  date: string;
  status: BookingStatus;
  phlebotomist_name?: string;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Initialize Supabase only if keys exist.
export const supabase = (supabaseUrl && supabaseAnonKey) 
    ? createClient(supabaseUrl, supabaseAnonKey) 
    : null;

export const DEMO_BOOKING_DB: BookingRecord[] = [
  {
    id: "ARUSH-4201",
    patient_name: "John Doe",
    test_name: "Complete Blood Count",
    date: new Date().toISOString(),
    status: "Phlebotomist Assigned",
    phlebotomist_name: "Rahul S."
  },
  {
    id: "ARUSH-4202",
    patient_name: "Priya Singh",
    test_name: "Lipid Profile",
    date: new Date(Date.now() - 86400000).toISOString(),
    status: "Sample Collected",
    phlebotomist_name: "Amit K."
  },
  {
    id: "ARUSH-4203",
    patient_name: "Amit Kumar",
    test_name: "Thyroid Panel",
    date: new Date(Date.now() - 172800000).toISOString(),
    status: "Testing"
  },
  {
    id: "ARUSH-4204",
    patient_name: "Sarah Chen",
    test_name: "Vitamin/B12 Profile",
    date: new Date(Date.now() - 259200000).toISOString(),
    status: "Report Ready"
  }
];
