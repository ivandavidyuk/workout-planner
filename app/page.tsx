"use client";

import { useState, useEffect } from "react";
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

interface ExerciseForm {
  exerciseId: string;
  sets: ExerciseSet[];
}

const HomePage = () => {
  const router = useRouter();
  const { setWorkoutPlan } = useWorkout();
  const [date, setDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [exerciseForms, setExerciseForms] = useState<ExerciseForm[]>([]);
  const [user, setUser] = useState<{ first_name: string; last_name: string } | null>(null);

  // Загружаем сохраненные тренировки при монтировании компонента
  useEffect(() => {
    const storedUser = localStorage.getItem("telegramUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Загружаем тренировку для выбранной даты
    loadWorkoutForDate(date);
  }, [date]);

  // Сохраняем тренировку при изменении упражнений
  useEffect(() => {
    if (exerciseForms.length > 0) {
      const workouts = JSON.parse(localStorage.getItem("workouts") || "{}");
      workouts[date] = exerciseForms;
      localStorage.setItem("workouts", JSON.stringify(workouts));
    }
  }, [exerciseForms, date]);

  const loadWorkoutForDate = (selectedDate: string) => {
    const workouts = JSON.parse(localStorage.getItem("workouts") || "{}");
    const savedWorkout = workouts[selectedDate];
    if (savedWorkout) {
      setExerciseForms(savedWorkout);
    } else {
      setExerciseForms([]); // Очищаем формы, если для выбранной даты нет сохраненной тренировки
    }
  };

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
      <TelegramIntegration onAuth={(user) => setUser(user)} />
      {user && (
        <h2 className="text-xl font-bold mb-4 text-center">
          Привет, {user.first_name} {user.last_name}
        </h2>
      )}
      <h1 className="text-2xl font-bold mb-4 text-center">
        Дневник тренировок
      </h1>

      <div className="mb-4 flex flex-col justify-center items-center">
        <label className="block mb-2">Выберите дату тренировки:</label>
        <Calendar selectedDate={date} onDateChange={setDate} />
      </div>

      <div className="mb-4">
        {exerciseForms.map((form, index) => (
          <div key={index} className="border p-4 mb-4 rounded shadow">
            <div className="mb-2">
              <label className="block mb-1">Упражнение:</label>
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
                onClick={() => addSet(index)}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Добавить подход
              </button>
            </div>
          </div>
        ))}
        <div className="text-center">
          <button
            onClick={addExercise}
            className="bg-green-500 text-white px-4 py-2 rounded mb-4"
          >
            Добавить упражнение
          </button>
        </div>
      </div>

      {exerciseForms.length > 0 && (
        <div className="text-center">
          <button
            onClick={startWorkout}
            className="bg-indigo-500 text-white px-6 py-3 rounded font-semibold"
          >
            Начать тренировку
          </button>
        </div>
      )}
    </div>
  );
};

export default HomePage;
