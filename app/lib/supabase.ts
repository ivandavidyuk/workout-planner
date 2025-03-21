import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface WorkoutPlan {
  id: string;
  user_id: string;
  date: string;
  exercises: {
    id: string;
    name: string;
    sets: {
      weight: number;
      reps: number;
    }[];
  }[];
  created_at: string;
} 