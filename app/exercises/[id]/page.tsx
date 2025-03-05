import { useRouter } from "next/router";
import { EXERCISES } from "../../data/exercises";

const ExerciseDetail = () => {
  const router = useRouter();
  const { id } = router.query;

  const exercise = EXERCISES.find((ex) => ex.id === id);

  if (!exercise) {
    return <div className="p-4">Упражнение не найдено</div>;
  }

  return (
    <div className="min-h-screen bg-white text-black p-4">
      <button onClick={() => router.back()} className="text-blue-500 mb-4">
        &larr; Назад
      </button>
      <div className="border rounded p-4 shadow">
        <img src={exercise.image} alt={exercise.name} className="w-full h-64 object-cover rounded mb-4" />
        <h1 className="text-2xl font-bold mb-2">{exercise.name}</h1>
        <p className="mb-2">
          <strong>Задействованные группы мышц:</strong> {exercise.muscleGroups.join(", ")}
        </p>
        <p>{exercise.description}</p>
      </div>
    </div>
  );
};

export default ExerciseDetail;
