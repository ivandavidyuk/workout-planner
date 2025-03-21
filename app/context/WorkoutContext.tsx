"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { getSupabaseClient, WorkoutPlan as SupabaseWorkoutPlan, SupabaseExercise, SupabaseExerciseSet } from "../lib/supabase";

export interface ExerciseSet {
  weight: number | string;
  reps: number | string;
}

export interface PlannedExercise {
  id: string;
  name: string;
  sets: ExerciseSet[];
}

export interface WorkoutPlan {
  date: string;
  exercises: PlannedExercise[];
}

interface WorkoutContextType {
  workoutPlan: WorkoutPlan | null;
  setWorkoutPlan: (plan: WorkoutPlan) => void;
  userId: string | null;
  setUserId: (id: string | null) => void;
  saveStatus: 'idle' | 'saving' | 'success' | 'error';
}

const WorkoutContext = createContext<WorkoutContextType>({
  workoutPlan: null,
  setWorkoutPlan: () => {},
  userId: null,
  setUserId: () => {},
  saveStatus: 'idle',
});

export const WorkoutProvider = ({ children }: { children: ReactNode }) => {
  const [workoutPlan, setWorkoutPlanState] = useState<WorkoutPlan | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  // Загружаем сохраненный план тренировки при монтировании
  useEffect(() => {
    const loadWorkoutPlan = async () => {
      if (!userId) return;

      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
          .from('workout_plans')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error) {
          console.error("Error loading workout plan:", error);
          return;
        }

        if (data) {
          const supabaseData = data as unknown as SupabaseWorkoutPlan;
          const plan: WorkoutPlan = {
            date: supabaseData.date,
            exercises: supabaseData.exercises.map((ex: SupabaseExercise) => ({
              id: ex.id,
              name: ex.name,
              sets: ex.sets.map((set: SupabaseExerciseSet) => ({
                weight: set.weight,
                reps: set.reps,
              })),
            })),
          };
          setWorkoutPlanState(plan);
        }
      } catch (error) {
        console.error("Error initializing Supabase:", error);
      }
    };

    loadWorkoutPlan();
  }, [userId]);

  // Сохраняем план тренировки при изменении
  useEffect(() => {
    const saveWorkoutPlan = async () => {
      if (!workoutPlan || !userId) {
        console.log('Cannot save workout plan:', { workoutPlan, userId });
        return;
      }

      try {
        setSaveStatus('saving');
        const supabase = getSupabaseClient();
        
        const { data, error } = await supabase
          .from('workout_plans')
          .insert([{
            user_id: userId,
            date: new Date().toISOString(),
            exercises: workoutPlan.exercises
          }])
          .select()
          .single();

        if (error) {
          console.error('Error saving workout plan:', error);
          setSaveStatus('error');
          return;
        }

        console.log('Successfully saved workout plan:', data);
        setSaveStatus('success');
      } catch (error) {
        console.error('Error in saveWorkoutPlan:', error);
        setSaveStatus('error');
      }
    };

    saveWorkoutPlan();
  }, [workoutPlan, userId]);

  const setWorkoutPlan = (plan: WorkoutPlan) => {
    setWorkoutPlanState(plan);
  };

  return (
    <WorkoutContext.Provider value={{ workoutPlan, setWorkoutPlan, userId, setUserId, saveStatus }}>
      {children}
    </WorkoutContext.Provider>
  );
};

export const useWorkout = () => useContext(WorkoutContext);
