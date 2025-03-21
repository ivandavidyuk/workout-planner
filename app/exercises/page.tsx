"use client";

import Link from "next/link";
import { EXERCISES } from "../data/exercises";

const ExercisesPage = () => {
  return (
    <div className="min-h-screen bg-white text-black p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Справочник упражнений</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {EXERCISES.map((exercise) => (
          <Link key={exercise.id} href={`/exercises/${exercise.id}`}>
            <div className="border rounded p-4 flex items-center space-x-4 hover:bg-gray-100">
              <img src={exercise.image} alt={exercise.name} className="w-16 h-16 object-cover rounded" />
              <span className="text-lg font-medium">{exercise.name}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ExercisesPage;
