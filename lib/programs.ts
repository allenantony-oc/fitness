export interface ProgramExercise {
  name: string;
  sets: string;
  reps: string;
  notes?: string;
}

export interface ProgramDay {
  name: string;
  exercises: ProgramExercise[];
}

export interface Program {
  slug: string;
  name: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  daysPerWeek: number;
  goal: "Strength" | "Hypertrophy" | "General";
  blurb: string;
  days: ProgramDay[];
  notes: string[];
}

export const PROGRAMS: Program[] = [
  {
    slug: "stronglifts-5x5",
    name: "StrongLifts 5×5",
    level: "Beginner",
    daysPerWeek: 3,
    goal: "Strength",
    blurb: "The classic linear-progression novice strength program. Add 2.5 kg every session you complete all 5 sets.",
    days: [
      {
        name: "Workout A",
        exercises: [
          { name: "Squat", sets: "5", reps: "5" },
          { name: "Bench Press", sets: "5", reps: "5" },
          { name: "Barbell Row", sets: "5", reps: "5" },
        ],
      },
      {
        name: "Workout B",
        exercises: [
          { name: "Squat", sets: "5", reps: "5" },
          { name: "Overhead Press", sets: "5", reps: "5" },
          { name: "Deadlift", sets: "1", reps: "5" },
        ],
      },
    ],
    notes: [
      "Alternate A and B, three days per week (e.g. Mon/Wed/Fri).",
      "Add 2.5 kg per session if all 5×5 completed; deload 10% after 3 stalls.",
      "Rest 90 s between sets early on, up to 5 min on heavy squat/deadlift.",
    ],
  },
  {
    slug: "ppl-6day",
    name: "Push / Pull / Legs (6-day)",
    level: "Intermediate",
    daysPerWeek: 6,
    goal: "Hypertrophy",
    blurb: "High-frequency PPL split. Each muscle hit twice per week — the modern hypertrophy default.",
    days: [
      {
        name: "Push (Mon, Thu)",
        exercises: [
          { name: "Bench Press", sets: "4", reps: "6–8" },
          { name: "Overhead Press", sets: "3", reps: "8–10" },
          { name: "Incline DB Press", sets: "3", reps: "10–12" },
          { name: "Lateral Raise", sets: "4", reps: "12–15" },
          { name: "Tricep Pushdown", sets: "3", reps: "10–12" },
        ],
      },
      {
        name: "Pull (Tue, Fri)",
        exercises: [
          { name: "Deadlift / RDL", sets: "3", reps: "5", notes: "RDL on the second pull day" },
          { name: "Pull-Up", sets: "4", reps: "AMRAP" },
          { name: "Barbell Row", sets: "3", reps: "8–10" },
          { name: "Face Pull", sets: "3", reps: "12–15" },
          { name: "Barbell Curl", sets: "3", reps: "10–12" },
        ],
      },
      {
        name: "Legs (Wed, Sat)",
        exercises: [
          { name: "Back Squat", sets: "4", reps: "6–8" },
          { name: "Leg Press", sets: "3", reps: "10–12" },
          { name: "Romanian Deadlift", sets: "3", reps: "8–10" },
          { name: "Walking Lunge", sets: "3", reps: "12 / leg" },
          { name: "Standing Calf Raise", sets: "4", reps: "12–15" },
        ],
      },
    ],
    notes: [
      "Sunday off. Skip a session if not recovered — fatigue compounds quickly at 6 days.",
      "Rotate compound lifts every 4–6 weeks (e.g. swap bench for incline as the main pressing lift).",
      "Sleep is the limiting factor on this volume. Treat 7–9 hr as non-negotiable.",
    ],
  },
  {
    slug: "upper-lower-4day",
    name: "Upper / Lower 4-Day",
    level: "Intermediate",
    daysPerWeek: 4,
    goal: "General",
    blurb: "Best balance of recovery and frequency for most lifters. Each muscle 2× per week without overreaching.",
    days: [
      {
        name: "Upper A (Strength)",
        exercises: [
          { name: "Bench Press", sets: "4", reps: "5" },
          { name: "Barbell Row", sets: "4", reps: "5" },
          { name: "Overhead Press", sets: "3", reps: "6–8" },
          { name: "Pull-Up", sets: "3", reps: "AMRAP" },
          { name: "Skull Crusher", sets: "3", reps: "10" },
        ],
      },
      {
        name: "Lower A (Strength)",
        exercises: [
          { name: "Back Squat", sets: "4", reps: "5" },
          { name: "Romanian Deadlift", sets: "3", reps: "6–8" },
          { name: "Leg Press", sets: "3", reps: "10" },
          { name: "Standing Calf Raise", sets: "4", reps: "12" },
          { name: "Plank", sets: "3", reps: "60 s" },
        ],
      },
      {
        name: "Upper B (Hypertrophy)",
        exercises: [
          { name: "Incline DB Press", sets: "4", reps: "8–10" },
          { name: "Lat Pulldown", sets: "4", reps: "8–10" },
          { name: "Lateral Raise", sets: "4", reps: "12–15" },
          { name: "Cable Row", sets: "3", reps: "10" },
          { name: "Hammer Curl", sets: "3", reps: "10–12" },
        ],
      },
      {
        name: "Lower B (Hypertrophy)",
        exercises: [
          { name: "Front Squat", sets: "3", reps: "8" },
          { name: "Hip Thrust", sets: "4", reps: "8–10" },
          { name: "Walking Lunge", sets: "3", reps: "12 / leg" },
          { name: "Hanging Leg Raise", sets: "3", reps: "12" },
        ],
      },
    ],
    notes: [
      "Mon / Tue / Thu / Fri is the canonical split.",
      "Strength days use 5-rep work — push the load. Hypertrophy days chase the pump.",
      "Add a calf and ab move to any day where you feel it's missing.",
    ],
  },
  {
    slug: "531-bbb",
    name: "5/3/1 Boring But Big",
    level: "Advanced",
    daysPerWeek: 4,
    goal: "Strength",
    blurb: "Wendler's classic intermediate-advanced template. Slow, sustainable strength gains with built-in volume.",
    days: [
      {
        name: "Day 1 — Press",
        exercises: [
          { name: "Overhead Press", sets: "3", reps: "5/3/1 + AMRAP", notes: "Use Training Max %" },
          { name: "Overhead Press (BBB)", sets: "5", reps: "10", notes: "50–60% TM" },
          { name: "Chin-Up", sets: "5", reps: "10" },
          { name: "Lateral Raise", sets: "5", reps: "15" },
        ],
      },
      {
        name: "Day 2 — Deadlift",
        exercises: [
          { name: "Deadlift", sets: "3", reps: "5/3/1 + AMRAP" },
          { name: "Deadlift (BBB)", sets: "5", reps: "10", notes: "50–60% TM" },
          { name: "Hanging Leg Raise", sets: "5", reps: "15" },
        ],
      },
      {
        name: "Day 3 — Bench",
        exercises: [
          { name: "Bench Press", sets: "3", reps: "5/3/1 + AMRAP" },
          { name: "Bench Press (BBB)", sets: "5", reps: "10", notes: "50–60% TM" },
          { name: "Barbell Row", sets: "5", reps: "10" },
          { name: "Tricep Pushdown", sets: "5", reps: "15" },
        ],
      },
      {
        name: "Day 4 — Squat",
        exercises: [
          { name: "Back Squat", sets: "3", reps: "5/3/1 + AMRAP" },
          { name: "Back Squat (BBB)", sets: "5", reps: "10", notes: "50–60% TM" },
          { name: "Romanian Deadlift", sets: "5", reps: "10" },
          { name: "Plank", sets: "3", reps: "60 s" },
        ],
      },
    ],
    notes: [
      "Calculate Training Max as 90% of true 1RM. Add 2.5 kg upper / 5 kg lower per cycle.",
      "Week 1: 65/75/85% × 5/5/5+. Week 2: 70/80/90% × 3/3/3+. Week 3: 75/85/95% × 5/3/1+. Week 4: deload.",
      "AMRAP set on the top work weight — push hard but stop with 1 rep in reserve.",
    ],
  },
];
