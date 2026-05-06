import { createClient } from '@supabase/supabase-js'

export type BookingStatus = 'Booking Confirmed' | 'Phlebotomist Assigned' | 'Sample Collected' | 'Testing' | 'Report Ready';

export interface BookingRecord {
  id: string;
  patient_name: string;
  test_name: string;
  date: string;
  status: BookingStatus;
  phlebotomist_name?: string;
  phone?: string;
  address?: string;
  report_url?: string;
  report_uploaded_at?: string;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Initialize Supabase only if keys exist.
export const supabase = (supabaseUrl && supabaseAnonKey) 
    ? createClient(supabaseUrl, supabaseAnonKey) 
    : null;

export const DEMO_BOOKING_DB: BookingRecord[] = [];
