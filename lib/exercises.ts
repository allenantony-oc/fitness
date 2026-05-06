export type Muscle =
  | "chest"
  | "back"
  | "shoulders"
  | "biceps"
  | "triceps"
  | "quads"
  | "hamstrings"
  | "glutes"
  | "calves"
  | "core"
  | "full-body";

export type Equipment =
  | "barbell"
  | "dumbbell"
  | "machine"
  | "cable"
  | "bodyweight"
  | "kettlebell"
  | "band";

export interface Exercise {
  slug: string;
  name: string;
  primary: Muscle;
  secondary: Muscle[];
  equipment: Equipment;
  cue: string;
}

export const MUSCLE_LABELS: Record<Muscle, string> = {
  chest: "Chest",
  back: "Back",
  shoulders: "Shoulders",
  biceps: "Biceps",
  triceps: "Triceps",
  quads: "Quads",
  hamstrings: "Hamstrings",
  glutes: "Glutes",
  calves: "Calves",
  core: "Core",
  "full-body": "Full body",
};

export const EQUIPMENT_LABELS: Record<Equipment, string> = {
  barbell: "Barbell",
  dumbbell: "Dumbbell",
  machine: "Machine",
  cable: "Cable",
  bodyweight: "Bodyweight",
  kettlebell: "Kettlebell",
  band: "Band",
};

export const EXERCISES: Exercise[] = [
  // Chest
  { slug: "bench-press", name: "Barbell Bench Press", primary: "chest", secondary: ["triceps", "shoulders"], equipment: "barbell", cue: "Tuck elbows ~45°, bar to sternum, drive feet into the floor." },
  { slug: "incline-db-press", name: "Incline Dumbbell Press", primary: "chest", secondary: ["shoulders", "triceps"], equipment: "dumbbell", cue: "30–45° bench, dumbbells over upper chest, control the eccentric." },
  { slug: "dips", name: "Dips", primary: "chest", secondary: ["triceps", "shoulders"], equipment: "bodyweight", cue: "Lean forward for chest emphasis, full ROM at the bottom." },
  { slug: "push-up", name: "Push-Up", primary: "chest", secondary: ["triceps", "core"], equipment: "bodyweight", cue: "Plank position, elbows ~45°, full lockout at the top." },
  { slug: "cable-fly", name: "Cable Fly", primary: "chest", secondary: [], equipment: "cable", cue: "Slight elbow bend, hug-a-tree arc, squeeze at lockout." },

  // Back
  { slug: "deadlift", name: "Barbell Deadlift", primary: "back", secondary: ["hamstrings", "glutes", "core"], equipment: "barbell", cue: "Bar over mid-foot, lats engaged, push the floor away." },
  { slug: "pullup", name: "Pull-Up", primary: "back", secondary: ["biceps"], equipment: "bodyweight", cue: "Dead hang, drive elbows down to ribs, chin past the bar." },
  { slug: "barbell-row", name: "Bent-Over Barbell Row", primary: "back", secondary: ["biceps"], equipment: "barbell", cue: "Hinge to ~45°, row to lower ribs, control the lower." },
  { slug: "lat-pulldown", name: "Lat Pulldown", primary: "back", secondary: ["biceps"], equipment: "cable", cue: "Lean back ~10°, drive elbows down, pause at chest." },
  { slug: "seated-row", name: "Seated Cable Row", primary: "back", secondary: ["biceps"], equipment: "cable", cue: "Chest tall, retract scapulae, row to lower sternum." },

  // Shoulders
  { slug: "ohp", name: "Overhead Press", primary: "shoulders", secondary: ["triceps", "core"], equipment: "barbell", cue: "Grip just outside shoulders, glutes squeezed, press over ears." },
  { slug: "db-shoulder-press", name: "Dumbbell Shoulder Press", primary: "shoulders", secondary: ["triceps"], equipment: "dumbbell", cue: "Neutral or pronated grip, press to lockout, no flare at the bottom." },
  { slug: "lateral-raise", name: "Dumbbell Lateral Raise", primary: "shoulders", secondary: [], equipment: "dumbbell", cue: "Lean slightly forward, lead with elbows, stop at shoulder height." },
  { slug: "rear-delt-fly", name: "Rear Delt Fly", primary: "shoulders", secondary: ["back"], equipment: "dumbbell", cue: "Hinge at hips, thumbs up, pull to a wide T." },
  { slug: "face-pull", name: "Cable Face Pull", primary: "shoulders", secondary: ["back"], equipment: "cable", cue: "Rope to forehead, externally rotate, elbows high." },

  // Arms
  { slug: "barbell-curl", name: "Barbell Curl", primary: "biceps", secondary: [], equipment: "barbell", cue: "Elbows pinned, no swing, full stretch at the bottom." },
  { slug: "hammer-curl", name: "Hammer Curl", primary: "biceps", secondary: [], equipment: "dumbbell", cue: "Neutral grip, control eccentric, hits brachialis." },
  { slug: "skull-crusher", name: "Skull Crusher", primary: "triceps", secondary: [], equipment: "barbell", cue: "Elbows stationary, lower to forehead/behind head, lockout strong." },
  { slug: "tricep-pushdown", name: "Cable Tricep Pushdown", primary: "triceps", secondary: [], equipment: "cable", cue: "Elbows tucked, full lockout, slow the eccentric." },

  // Legs
  { slug: "back-squat", name: "Barbell Back Squat", primary: "quads", secondary: ["glutes", "hamstrings", "core"], equipment: "barbell", cue: "Brace, sit between hips, knees track over toes, hit depth." },
  { slug: "front-squat", name: "Front Squat", primary: "quads", secondary: ["core", "glutes"], equipment: "barbell", cue: "Elbows up, upright torso, drive knees forward at bottom." },
  { slug: "leg-press", name: "Leg Press", primary: "quads", secondary: ["glutes", "hamstrings"], equipment: "machine", cue: "Feet shoulder-width, control descent, don't lock the knees." },
  { slug: "rdl", name: "Romanian Deadlift", primary: "hamstrings", secondary: ["glutes", "back"], equipment: "barbell", cue: "Soft knees, hinge at hips, bar drags down the legs." },
  { slug: "lunge", name: "Walking Lunge", primary: "quads", secondary: ["glutes", "hamstrings"], equipment: "dumbbell", cue: "Long step, drop the back knee, drive through front heel." },
  { slug: "hip-thrust", name: "Barbell Hip Thrust", primary: "glutes", secondary: ["hamstrings"], equipment: "barbell", cue: "Shoulders on bench, ribs down, full hip lockout, pause at top." },
  { slug: "calf-raise", name: "Standing Calf Raise", primary: "calves", secondary: [], equipment: "machine", cue: "Full stretch at the bottom, full plantarflex at the top." },

  // Core
  { slug: "plank", name: "Plank", primary: "core", secondary: [], equipment: "bodyweight", cue: "Hollow body, glutes squeezed, no hip sag, breathe." },
  { slug: "hanging-leg-raise", name: "Hanging Leg Raise", primary: "core", secondary: [], equipment: "bodyweight", cue: "No swing, posterior tilt, raise legs to parallel or higher." },
  { slug: "ab-wheel", name: "Ab Wheel Rollout", primary: "core", secondary: ["shoulders"], equipment: "bodyweight", cue: "Brace hard, ribs down, roll only as far as you can return." },

  // Full body
  { slug: "kb-swing", name: "Kettlebell Swing", primary: "full-body", secondary: ["glutes", "back", "core"], equipment: "kettlebell", cue: "Hinge, hike the bell, snap the hips, weightless float at top." },
  { slug: "clean", name: "Power Clean", primary: "full-body", secondary: ["back", "quads", "shoulders"], equipment: "barbell", cue: "Triple extension, fast elbows, catch in a quarter squat." },
  { slug: "thruster", name: "Thruster", primary: "full-body", secondary: ["quads", "shoulders"], equipment: "barbell", cue: "Front squat into overhead press, one continuous motion." },
];
