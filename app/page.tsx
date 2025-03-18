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
  const [user, setUser] = useState<{
    first_name: string;
    last_name: string;
  } | null>(null);
  const [isTelegramReady, setIsTelegramReady] = useState(false);
  const [telegramError, setTelegramError] = useState<string | null>(null);

  // Загружаем сохраненные тренировки при монтировании компонента
  useEffect(() => {
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
    console.log("startWorkout called");
    console.log("isTelegramReady:", isTelegramReady);
    console.log("exerciseForms:", exerciseForms);

    // Проверяем, что у нас есть упражнения
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

    console.log("Setting workout plan:", plan);
    setWorkoutPlan(plan);
    console.log("Navigating to /workout");
    router.push("/workout");
  };

  return (
    <div className="min-h-screen bg-white text-black p-4 flex flex-col justify-center items-center">
      <TelegramIntegration 
        onAuth={(user) => {
          console.log("onAuth called with user:", user);
          setUser(user);
          setIsTelegramReady(true);
        }}
        onReady={() => {
          console.log("onReady called");
          setIsTelegramReady(true);
        }}
        onError={(error) => {
          console.log("onError called with error:", error);
          setTelegramError(error.message);
          setIsTelegramReady(false);
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
                Х
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
            onClick={() => {
              console.log("Button clicked");
              console.log("Current isTelegramReady:", isTelegramReady);
              startWorkout();
            }}
            disabled={!isTelegramReady}
            className={`px-6 py-3 rounded font-semibold ${
              isTelegramReady
                ? "bg-indigo-500 text-white hover:bg-indigo-600"
                : "bg-gray-400 text-white cursor-not-allowed"
            }`}
          >
            {isTelegramReady ? "Начать тренировку" : "Загрузка..."}
          </button>
        </div>
      )}
    </div>
  );
};

export default HomePage;
