"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { supabase, WorkoutPlan as SupabaseWorkoutPlan, SupabaseExercise, SupabaseExerciseSet } from "../lib/supabase";

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
}

const WorkoutContext = createContext<WorkoutContextType>({
  workoutPlan: null,
  setWorkoutPlan: () => {},
  userId: null,
  setUserId: () => {},
});

export const WorkoutProvider = ({ children }: { children: ReactNode }) => {
  const [workoutPlan, setWorkoutPlanState] = useState<WorkoutPlan | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Загружаем сохраненный план тренировки при монтировании
  useEffect(() => {
    const loadWorkoutPlan = async () => {
      if (!userId) return;

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
        const plan: WorkoutPlan = {
          date: data.date,
          exercises: data.exercises.map((ex: SupabaseExercise) => ({
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
    };

    loadWorkoutPlan();
  }, [userId]);

  // Сохраняем план тренировки при изменении
  useEffect(() => {
    const saveWorkoutPlan = async () => {
      if (!workoutPlan || !userId) return;

      const supabasePlan: Omit<SupabaseWorkoutPlan, 'id' | 'created_at'> = {
        user_id: userId,
        date: workoutPlan.date,
        exercises: workoutPlan.exercises.map(ex => ({
          id: ex.id,
          name: ex.name,
          sets: ex.sets.map(set => ({
            weight: typeof set.weight === 'string' ? parseFloat(set.weight) : set.weight,
            reps: typeof set.reps === 'string' ? parseInt(set.reps) : set.reps,
          })),
        })),
      };

      const { error } = await supabase
        .from('workout_plans')
        .insert([supabasePlan]);

      if (error) {
        console.error("Error saving workout plan:", error);
      }
    };

    saveWorkoutPlan();
  }, [workoutPlan, userId]);

  const setWorkoutPlan = (plan: WorkoutPlan) => {
    console.log("Setting new workout plan:", plan);
    setWorkoutPlanState(plan);
  };

  return (
    <WorkoutContext.Provider value={{ workoutPlan, setWorkoutPlan, userId, setUserId }}>
      {children}
    </WorkoutContext.Provider>
  );
};

export const useWorkout = () => useContext(WorkoutContext);
