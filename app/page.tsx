"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Calendar from "./components/Calendar";
import TelegramIntegration from "./TelegramIntegration";
import {
  useWorkout,
  WorkoutPlan,
  PlannedExercise,
  ExerciseSet,
} from "./context/WorkoutContext";
import { EXERCISES } from "./data/exercises";
import { getSupabaseClient } from "./lib/supabase";

interface ExerciseForm {
  exerciseId: string;
  sets: ExerciseSet[];
}

interface SupabaseExercise {
  id: string;
  name: string;
  sets: Array<{
    weight: number;
    reps: number;
  }>;
}

interface SupabaseWorkoutData {
  id: string;
  user_id: string;
  date: string;
  exercises: SupabaseExercise[];
  created_at: string;
}

const HomePage = () => {
  const router = useRouter();
  const { setWorkoutPlan, setUserId: setContextUserId, saveStatus } = useWorkout();
  const [date, setDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [exerciseForms, setExerciseForms] = useState<ExerciseForm[]>([]);
  const [user, setUser] = useState<{
    first_name: string;
    last_name?: string;
    id?: number;
  } | null>(null);
  const [telegramError, setTelegramError] = useState<string | null>(null);

  const loadWorkoutForDate = useCallback(async (selectedDate: string) => {
    if (!user?.id) return;

    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('workout_plans')
        .select('*')
        .eq('date', selectedDate)
        .eq('user_id', user.id.toString())
        .single();

      if (error) {
        console.error("Error loading workout:", error);
        setExerciseForms([]);
        return;
      }

      if (data && 
          typeof data === 'object' && 
          'exercises' in data && 
          Array.isArray(data.exercises)) {
        const typedData = data as unknown as SupabaseWorkoutData;
        const exercises = typedData.exercises.map((ex) => ({
          exerciseId: ex.id,
          sets: Array.isArray(ex.sets) ? ex.sets.map((set) => ({
            weight: (set.weight ?? 0).toString(),
            reps: (set.reps ?? 0).toString(),
          })) : [],
        }));
        setExerciseForms(exercises);
      } else {
        setExerciseForms([]);
      }
    } catch (error) {
      console.error("Error in loadWorkoutForDate:", error);
      setExerciseForms([]);
    }
  }, [user?.id]);

  // Загружаем сохраненные тренировки при монтировании компонента
  useEffect(() => {
    loadWorkoutForDate(date);
  }, [date, loadWorkoutForDate]);

  const addExercise = () => {
    setExerciseForms([
      ...exerciseForms,
      { exerciseId: EXERCISES[0].id, sets: [{ weight: "", reps: "" }] },
    ]);
  };

  const updateExercise = (index: number, updated: Partial<ExerciseForm>) => {
    const newForms = [...exerciseForms];
    newForms[index] = { ...newForms[index], ...updated };
    setExerciseForms(newForms);
  };

  const addSet = (exerciseIndex: number) => {
    const newForms = [...exerciseForms];
    newForms[exerciseIndex].sets.push({ weight: "", reps: "" });
    setExerciseForms(newForms);
  };

  const updateSet = (
    exerciseIndex: number,
    setIndex: number,
    field: "weight" | "reps",
    value: string
  ) => {
    const newForms = [...exerciseForms];
    newForms[exerciseIndex].sets[setIndex] = {
      ...newForms[exerciseIndex].sets[setIndex],
      [field]: value,
    };
    setExerciseForms(newForms);
  };

  const startWorkout = () => {
    if (!user?.id) {
      console.log("No user ID found");
      return;
    }

    if (exerciseForms.length === 0) {
      console.log("No exercises found");
      return;
    }

    const plannedExercises = exerciseForms.map((form) => {
      const exerciseData = EXERCISES.find((ex) => ex.id === form.exerciseId);
      return {
        id: form.exerciseId,
        name: exerciseData ? exerciseData.name : form.exerciseId,
        sets: form.sets.map((set) => ({
          weight: set.weight === "" ? 0 : parseFloat(set.weight.toString()),
          reps: set.reps === "" ? 0 : parseInt(set.reps.toString()),
        })),
      } as PlannedExercise;
    });

    const plan: WorkoutPlan = {
      date,
      exercises: plannedExercises,
    };

    setWorkoutPlan(plan);
    router.push("/workout");
  };

  return (
    <div className="min-h-screen bg-white text-black p-4 flex flex-col justify-center items-center">
      <TelegramIntegration 
        onAuth={(user) => {
          console.log("onAuth called with user:", user);
          setUser(user);
          if (user.id) {
            setContextUserId(user.id.toString());
          }
        }}
        onReady={() => {
          console.log("onReady called");
        }}
        onError={(error) => {
          console.log("onError called with error:", error);
          setTelegramError(error.message);
        }}
      />
      {user && (
        <h2 className="text-xl font-bold mb-4 text-center">
          Привет, {user.first_name} {user.last_name}
        </h2>
      )}
      {telegramError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {telegramError}
        </div>
      )}
      <h1 className="text-2xl font-bold mb-4 text-center">
        Дневник тренировок
      </h1>

      <div className="mb-4 flex flex-col justify-center items-center">
        <label className="block mb-2">Выберите дату тренировки:</label>
        <Calendar selectedDate={date} onDateChange={setDate} />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
          onClick={addExercise}
        >
          Добавить упражнение
        </button>
        {exerciseForms.length > 0 && (
          <button
            className="bg-red-500 text-white px-4 py-2 rounded mt-4"
            onClick={() => setExerciseForms([])}
          >
            Удалить все упражнения
          </button>
        )}
      </div>

      <div className="mb-4">
        {exerciseForms.map((form, index) => (
          <div key={index} className="border p-4 mb-4 rounded shadow relative">
            <div className="mb-2">
              <label className="block mb-1">Упражнение:</label>
              <button
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                onClick={() => {
                  const newForms = exerciseForms.filter((_, i) => i !== index);
                  setExerciseForms(newForms);
                }}
              >
                ×
              </button>
              <select
                value={form.exerciseId}
                onChange={(e) =>
                  updateExercise(index, { exerciseId: e.target.value })
                }
                className="border rounded p-2 w-full"
              >
                {EXERCISES.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-2 flex flex-col">
              <h3 className="font-semibold">Подходы:</h3>
              {form.sets.map((set, setIndex) => (
                <div key={setIndex} className="flex space-x-2 mb-2">
                  <input
                    type="number"
                    value={set.weight}
                    onChange={(e) =>
                      updateSet(index, setIndex, "weight", e.target.value)
                    }
                    placeholder="Вес"
                    className="border rounded p-2 w-1/2"
                  />
                  <input
                    type="number"
                    value={set.reps}
                    onChange={(e) =>
                      updateSet(index, setIndex, "reps", e.target.value)
                    }
                    placeholder="Повторения"
                    className="border rounded p-2 w-1/2"
                  />
                </div>
              ))}
              <button
                className="bg-green-500 text-white px-4 py-2 rounded mt-2"
                onClick={() => addSet(index)}
              >
                Добавить подход
              </button>
            </div>
          </div>
        ))}
      </div>

      {exerciseForms.length > 0 && (
        <div className="flex flex-col items-center">
          <button
            className="bg-blue-500 text-white px-6 py-3 rounded text-lg font-semibold"
            onClick={startWorkout}
          >
            Начать тренировку
          </button>
          {saveStatus === 'saving' && (
            <p className="text-blue-500 mt-2">Сохранение...</p>
          )}
          {saveStatus === 'success' && (
            <p className="text-green-500 mt-2">Сохранено!</p>
          )}
          {saveStatus === 'error' && (
            <p className="text-red-500 mt-2">Ошибка при сохранении</p>
          )}
        </div>
      )}
    </div>
  );
};

export default HomePage;
