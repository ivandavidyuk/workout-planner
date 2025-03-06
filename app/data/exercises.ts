export interface Exercise {
  id: string;
  name: string;
  image: string;
  muscleGroups: string[];
  description: string;
}

export const EXERCISES: Exercise[] = [
  {
    id: "overhead_block_pull",
    name: "Тяга верхнего блока обратным хватом",
    image: "/images/overhead_block_pull.png",
    muscleGroups: ["Спина", "Бицепс"],
    description: "Силовое упражнение для развития мышц спины.",
  },
  {
    id: "horizontal_block_pull",
    name: "Тяга горизонтального блока одной рукой",
    image: "/images/horizontal_block_pull.png",
    muscleGroups: ["Спина"],
    description: "Силовое упражнение для развития мышц спины.",
  },
  {
    id: "dumbbell_swings",
    name: "Махи гантелями",
    image: "/images/dumbbell_swings.png",
    muscleGroups: ["Плечи"],
    description: "Силовое упражнение для развития мышц плеч.",
  },
  {
    id: "smith_incline_bench_press",
    name: "Жим штанги на наклонной скамье Смита",
    image: "/images/smith_incline_bench_press.png",
    muscleGroups: ["Грудь", "Трицепс"],
    description: "Силовое упражнение для развития мышц груди.",
  },
  {
    id: "butterfly",
    name: "Сведение на грудь в тренажере бабочка",
    image: "/images/butterfly.png",
    muscleGroups: ["Грудь"],
    description: "Силовое упражнение для развития мышц груди.",
  },
  {
    id: "leg_extension",
    name: "Разгибания ног в тренажере",
    image: "/images/leg_extension.png",
    muscleGroups: ["Ноги"],
    description: "Силовое упражнение для развития мышц ног.",
  },
  {
    id: "leg_curls",
    name: "Cгибания ног в тренажере",
    image: "/images/leg_curls.png",
    muscleGroups: ["Ноги"],
    description: "Силовое упражнение для развития мышц ног.",
  },
];
