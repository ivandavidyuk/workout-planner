import { createClient } from '@supabase/supabase-js';

export interface SupabaseExerciseSet {
  weight: number;
  reps: number;
}

export interface SupabaseExercise {
  id: string;
  name: string;
  sets: SupabaseExerciseSet[];
}

export interface WorkoutPlan {
  id: string;
  user_id: string;
  date: string;
  exercises: SupabaseExercise[];
  created_at: string;
}

let supabase: ReturnType<typeof createClient>;

export const getSupabaseClient = () => {
  if (!supabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables');
    }

    supabase = createClient(supabaseUrl, supabaseAnonKey);
  }

  return supabase;
}; 