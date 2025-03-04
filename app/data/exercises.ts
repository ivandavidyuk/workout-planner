export interface Exercise {
    id: string;
    name: string;
    image: string;
    muscleGroups: string[];
    description: string;
  }
  
  export const EXERCISES: Exercise[] = [
    {
      id: "pushup",
      name: "Отжимания",
      image: "/images/pushup.png",
      muscleGroups: ["Грудь", "Трицепсы", "Плечи"],
      description: "Упражнение с собственным весом для верхней части тела.",
    },
    {
      id: "squat",
      name: "Приседания",
      image: "/images/squat.png",
      muscleGroups: ["Ноги", "Ягодицы"],
      description: "Комплексное упражнение для нижней части тела.",
    },
    {
      id: "bench_press",
      name: "Жим лёжа",
      image: "/images/bench_press.png",
      muscleGroups: ["Грудь", "Трицепсы", "Плечи"],
      description: "Силовое упражнение для развития мышц груди.",
    },
  ];
  