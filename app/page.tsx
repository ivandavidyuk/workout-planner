"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import Calendar from "./components/Calendar";
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

  const addExercise = () => {
    setExerciseForms([
      ...exerciseForms,
      { exerciseId: EXERCISES[0].id, sets: [{ weight: 0, reps: 0 }] },
    ]);
  };

  const updateExercise = (index: number, updated: Partial<ExerciseForm>) => {
    const newForms = [...exerciseForms];
    newForms[index] = { ...newForms[index], ...updated };
    setExerciseForms(newForms);
  };

  const addSet = (exerciseIndex: number) => {
    const newForms = [...exerciseForms];
    newForms[exerciseIndex].sets.push({ weight: 0, reps: 0 });
    setExerciseForms(newForms);
  };

  const updateSet = (
    exerciseIndex: number,
    setIndex: number,
    field: "weight" | "reps",
    value: number
  ) => {
    const newForms = [...exerciseForms];
    newForms[exerciseIndex].sets[setIndex] = {
      ...newForms[exerciseIndex].sets[setIndex],
      [field]: value,
    };
    setExerciseForms(newForms);
  };

  const startWorkout = () => {
    if (exerciseForms.length === 0) {
      alert("Добавьте хотя бы одно упражнение");
      return;
    }

    const plannedExercises = exerciseForms.map((form) => {
      const exerciseData = EXERCISES.find((ex) => ex.id === form.exerciseId);
      return {
        id: form.exerciseId,
        name: exerciseData ? exerciseData.name : form.exerciseId,
        sets: form.sets,
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
    <div className="min-h-screen bg-white text-black p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">
        Дневник тренировок
      </h1>

      <div className="mb-4">
        <label className="block mb-2">Выберите дату тренировки:</label>
        <Calendar selectedDate={date} onDateChange={setDate} />
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Составьте тренировку</h2>
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

            <div className="mb-2">
              <h3 className="font-semibold">Подходы:</h3>
              {form.sets.map((set, setIndex) => (
                <div key={setIndex} className="flex space-x-2 mb-2">
                  <input
                    type="number"
                    value={set.weight}
                    onChange={(e) =>
                      updateSet(
                        index,
                        setIndex,
                        "weight",
                        parseFloat(e.target.value)
                      )
                    }
                    placeholder="Вес"
                    className="border rounded p-2 w-1/2"
                  />
                  <input
                    type="number"
                    value={set.reps}
                    onChange={(e) =>
                      updateSet(
                        index,
                        setIndex,
                        "reps",
                        parseInt(e.target.value)
                      )
                    }
                    placeholder="Повторы"
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

        <button
          onClick={addExercise}
          className="bg-green-500 text-white px-4 py-2 rounded mb-4"
        >
          Добавить упражнение
        </button>
      </div>

      <div className="text-center">
        <button
          onClick={startWorkout}
          className="bg-indigo-500 text-white px-6 py-3 rounded font-semibold"
        >
          Начать тренировку
        </button>
      </div>
    </div>
  );
};

export default HomePage;
