import { useRouter } from "next/router";
import { useWorkout } from "../context/WorkoutContext";
import { useState } from "react";
import Timer from "../components/Timer";

const WorkoutPage = () => {
  const { workoutPlan } = useWorkout();
  const router = useRouter();

  const [actualResults, setActualResults] = useState(
    workoutPlan?.exercises.map((ex) => ({
      id: ex.id,
      name: ex.name,
      sets: ex.sets.map(() => ({ weight: 0, reps: 0 })),
    })) || []
  );

  if (!workoutPlan) {
    return (
      <div className="p-4">
        <p>Нет запланированной тренировки.</p>
        <button onClick={() => router.push("/")} className="text-blue-500">Назад</button>
      </div>
    );
  }

  const updateActualSet = (
    exerciseIndex: number,
    setIndex: number,
    field: "weight" | "reps",
    value: number
  ) => {
    const newResults = [...actualResults];
    newResults[exerciseIndex].sets[setIndex] = {
      ...newResults[exerciseIndex].sets[setIndex],
      [field]: value,
    };
    setActualResults(newResults);
  };

  const finishWorkout = () => {
    console.log("Результаты тренировки:", actualResults);
    alert("Тренировка завершена! Проверьте консоль для результатов.");
  };

  return (
    <div className="min-h-screen bg-white text-black p-4">
      <button onClick={() => router.back()} className="text-blue-500 mb-4">
        &larr; Назад
      </button>
      <h1 className="text-2xl font-bold mb-4 text-center">Выполнение тренировки</h1>

      <div className="mb-6">
        <Timer initialTime={120} onComplete={() => alert("Время отдыха истекло")} />
      </div>

      {workoutPlan.exercises.map((exercise, exIndex) => (
        <div key={exercise.id} className="border p-4 mb-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">{exercise.name}</h2>
          {exercise.sets.map((set, setIndex) => (
            <div key={setIndex} className="flex space-x-2 mb-2">
              <input
                type="number"
                placeholder="Вес выполнено"
                value={actualResults[exIndex]?.sets[setIndex]?.weight || 0}
                onChange={(e) =>
                  updateActualSet(exIndex, setIndex, "weight", parseFloat(e.target.value))
                }
                className="border rounded p-2 w-1/2"
              />
              <input
                type="number"
                placeholder="Повторы выполнено"
                value={actualResults[exIndex]?.sets[setIndex]?.reps || 0}
                onChange={(e) =>
                  updateActualSet(exIndex, setIndex, "reps", parseInt(e.target.value))
                }
                className="border rounded p-2 w-1/2"
              />
            </div>
          ))}
        </div>
      ))}

      <div className="text-center">
        <button
          onClick={finishWorkout}
          className="bg-indigo-500 text-white px-6 py-3 rounded font-semibold"
        >
          Завершить тренировку
        </button>
      </div>
    </div>
  );
};

export default WorkoutPage;
