// Pure calculator functions. All inputs in metric (kg, cm, years).
// UI components handle imperial <-> metric conversion before calling.

export type Sex = "male" | "female";

export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "very-active";

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  "very-active": 1.9,
};

export const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: "Sedentary (desk job, no exercise)",
  light: "Light (1–3 workouts/week)",
  moderate: "Moderate (3–5 workouts/week)",
  active: "Active (6–7 workouts/week)",
  "very-active": "Very active (2x/day or physical job)",
};

// ---------- BMI ----------

export type BmiCategory =
  | "Underweight"
  | "Normal"
  | "Overweight"
  | "Obese (Class I)"
  | "Obese (Class II)"
  | "Obese (Class III)";

export function bmi(weightKg: number, heightCm: number): number {
  const m = heightCm / 100;
  return weightKg / (m * m);
}

export function bmiCategory(value: number): BmiCategory {
  if (value < 18.5) return "Underweight";
  if (value < 25) return "Normal";
  if (value < 30) return "Overweight";
  if (value < 35) return "Obese (Class I)";
  if (value < 40) return "Obese (Class II)";
  return "Obese (Class III)";
}

// ---------- BMR (Mifflin-St Jeor) & TDEE ----------

export function bmrMifflin(
  sex: Sex,
  weightKg: number,
  heightCm: number,
  ageYears: number,
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * ageYears;
  return sex === "male" ? base + 5 : base - 161;
}

export function tdee(bmr: number, level: ActivityLevel): number {
  return bmr * ACTIVITY_MULTIPLIERS[level];
}

// ---------- Macros ----------

export type Goal = "cut" | "maintain" | "bulk";

export const GOAL_CALORIE_DELTA: Record<Goal, number> = {
  cut: -0.2, // -20%
  maintain: 0,
  bulk: 0.15, // +15%
};

export interface MacroSplit {
  calories: number;
  proteinG: number;
  fatG: number;
  carbsG: number;
}

export function macros(
  tdeeKcal: number,
  goal: Goal,
  weightKg: number,
): MacroSplit {
  const calories = Math.round(tdeeKcal * (1 + GOAL_CALORIE_DELTA[goal]));
  // Protein: 2.0 g/kg cut, 1.8 g/kg maintain, 1.8 g/kg bulk
  const proteinPerKg = goal === "cut" ? 2.2 : 1.8;
  const proteinG = Math.round(weightKg * proteinPerKg);
  // Fat: 25% of calories
  const fatG = Math.round((calories * 0.25) / 9);
  // Remainder → carbs
  const carbsG = Math.max(
    0,
    Math.round((calories - proteinG * 4 - fatG * 9) / 4),
  );
  return { calories, proteinG, fatG, carbsG };
}

// ---------- One Rep Max ----------

export function oneRepMaxEpley(weight: number, reps: number): number {
  if (reps <= 0) return 0;
  if (reps === 1) return weight;
  return weight * (1 + reps / 30);
}

export function oneRepMaxBrzycki(weight: number, reps: number): number {
  if (reps <= 0 || reps >= 37) return 0;
  return weight * (36 / (37 - reps));
}

// Coefficients of 1RM for percent-of-1RM working sets.
export const ONE_RM_PERCENT_TABLE: { reps: number; percent: number }[] = [
  { reps: 1, percent: 100 },
  { reps: 2, percent: 95 },
  { reps: 3, percent: 93 },
  { reps: 4, percent: 90 },
  { reps: 5, percent: 87 },
  { reps: 6, percent: 85 },
  { reps: 8, percent: 80 },
  { reps: 10, percent: 75 },
  { reps: 12, percent: 70 },
  { reps: 15, percent: 65 },
];

// ---------- Body Fat (US Navy) ----------

export interface NavyInputs {
  sex: Sex;
  heightCm: number;
  neckCm: number;
  waistCm: number;
  hipCm?: number; // required for female
}

export function bodyFatNavy(input: NavyInputs): number | null {
  const { sex, heightCm, neckCm, waistCm, hipCm } = input;
  if (heightCm <= 0 || neckCm <= 0 || waistCm <= 0) return null;
  const log10 = (n: number) => Math.log(n) / Math.LN10;
  if (sex === "male") {
    if (waistCm <= neckCm) return null;
    return (
      495 /
        (1.0324 -
          0.19077 * log10(waistCm - neckCm) +
          0.15456 * log10(heightCm)) -
      450
    );
  }
  if (!hipCm || hipCm <= 0) return null;
  if (waistCm + hipCm <= neckCm) return null;
  return (
    495 /
      (1.29579 -
        0.35004 * log10(waistCm + hipCm - neckCm) +
        0.221 * log10(heightCm)) -
    450
  );
}

export function bodyFatCategory(sex: Sex, pct: number): string {
  if (sex === "male") {
    if (pct < 6) return "Essential fat";
    if (pct < 14) return "Athlete";
    if (pct < 18) return "Fitness";
    if (pct < 25) return "Average";
    return "Obese";
  }
  if (pct < 14) return "Essential fat";
  if (pct < 21) return "Athlete";
  if (pct < 25) return "Fitness";
  if (pct < 32) return "Average";
  return "Obese";
}
