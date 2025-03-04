import React, { createContext, useContext, useState, ReactNode } from "react";

export interface ExerciseSet {
  weight: number;
  reps: number;
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
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);

  return (
    <WorkoutContext.Provider value={{ workoutPlan, setWorkoutPlan }}>
      {children}
    </WorkoutContext.Provider>
  );
};

export const useWorkout = () => useContext(WorkoutContext);
