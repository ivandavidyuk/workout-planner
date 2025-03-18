"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

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
  date: string; // ISO-строка даты
  exercises: PlannedExercise[];
}

interface WorkoutContextType {
  workoutPlan: WorkoutPlan | null;
  setWorkoutPlan: (plan: WorkoutPlan) => void;
}

const WorkoutContext = createContext<WorkoutContextType>({
  workoutPlan: null,
  setWorkoutPlan: () => {},
});

export const WorkoutProvider = ({ children }: { children: ReactNode }) => {
  const [workoutPlan, setWorkoutPlanState] = useState<WorkoutPlan | null>(null);

  // Загружаем сохраненный план тренировки при монтировании
  useEffect(() => {
    const savedPlan = localStorage.getItem("currentWorkoutPlan");
    if (savedPlan) {
      try {
        setWorkoutPlanState(JSON.parse(savedPlan));
      } catch (error) {
        console.error("Error loading saved workout plan:", error);
        localStorage.removeItem("currentWorkoutPlan");
      }
    }
  }, []);

  // Сохраняем план тренировки при изменении
  useEffect(() => {
    if (workoutPlan) {
      localStorage.setItem("currentWorkoutPlan", JSON.stringify(workoutPlan));
    } else {
      localStorage.removeItem("currentWorkoutPlan");
    }
  }, [workoutPlan]);

  const setWorkoutPlan = (plan: WorkoutPlan) => {
    console.log("Setting new workout plan:", plan);
    setWorkoutPlanState(plan);
  };

  return (
    <WorkoutContext.Provider value={{ workoutPlan, setWorkoutPlan }}>
      {children}
    </WorkoutContext.Provider>
  );
};

export const useWorkout = () => useContext(WorkoutContext);
