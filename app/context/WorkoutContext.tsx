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
  saveStatus: {
    isLoading: boolean;
    error: string | null;
    success: boolean;
  };
}

const WorkoutContext = createContext<WorkoutContextType>({
  workoutPlan: null,
  setWorkoutPlan: () => {},
  userId: null,
  setUserId: () => {},
  saveStatus: {
    isLoading: false,
    error: null,
    success: false,
  },
});

export const WorkoutProvider = ({ children }: { children: ReactNode }) => {
  const [workoutPlan, setWorkoutPlanState] = useState<WorkoutPlan | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState({
    isLoading: false,
    error: null as string | null,
    success: false,
  });

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
        setSaveStatus({
          isLoading: false,
          error: "Не удалось сохранить тренировку: отсутствуют данные",
          success: false,
        });
        return;
      }

      setSaveStatus({
        isLoading: true,
        error: null,
        success: false,
      });

      try {
        const supabase = getSupabaseClient();
        
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
          .insert([supabasePlan])
          .select();

        if (error) {
          setSaveStatus({
            isLoading: false,
            error: `Ошибка сохранения: ${error.message}`,
            success: false,
          });
        } else {
          setSaveStatus({
            isLoading: false,
            error: null,
            success: true,
          });
        }
      } catch (error) {
        setSaveStatus({
          isLoading: false,
          error: error instanceof Error ? error.message : "Произошла ошибка при сохранении тренировки",
          success: false,
        });
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
