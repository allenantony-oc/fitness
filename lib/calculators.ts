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

// ---------- Calories burned (MET) ----------

// kcal = MET * weightKg * hours
export function caloriesBurned(
  met: number,
  weightKg: number,
  minutes: number,
): number {
  return met * weightKg * (minutes / 60);
}

// ---------- Water intake ----------

// Baseline 35 ml / kg, +500 ml per hour of training, +500 ml in hot climate.
export function waterIntakeMl(
  weightKg: number,
  trainingMinutes: number,
  hotClimate: boolean,
): number {
  const base = 35 * weightKg;
  const training = (trainingMinutes / 60) * 500;
  const climate = hotClimate ? 500 : 0;
  return Math.round(base + training + climate);
}

// ---------- Protein intake ----------

export type ProteinGoal = "sedentary" | "endurance" | "strength" | "cut";

export const PROTEIN_GRAMS_PER_KG: Record<ProteinGoal, [number, number]> = {
  sedentary: [0.8, 1.0],
  endurance: [1.2, 1.6],
  strength: [1.6, 2.0],
  cut: [2.0, 2.4],
};

export const PROTEIN_GOAL_LABELS: Record<ProteinGoal, string> = {
  sedentary: "Sedentary maintenance",
  endurance: "Endurance training",
  strength: "Strength / hypertrophy",
  cut: "Cutting (preserve muscle)",
};

// ---------- Ideal weight ----------

export interface IdealWeightSet {
  devine: number;
  robinson: number;
  hamwi: number;
  bmiLow: number;
  bmiHigh: number;
}

// Most ideal-weight formulas accept inches over 5 ft.
export function idealWeights(sex: Sex, heightCm: number): IdealWeightSet {
  const inchesOver5ft = Math.max(0, heightCm / 2.54 - 60);
  const m = heightCm / 100;
  if (sex === "male") {
    return {
      devine: 50 + 2.3 * inchesOver5ft,
      robinson: 52 + 1.9 * inchesOver5ft,
      hamwi: 48 + 2.7 * inchesOver5ft,
      bmiLow: 18.5 * m * m,
      bmiHigh: 24.9 * m * m,
    };
  }
  return {
    devine: 45.5 + 2.3 * inchesOver5ft,
    robinson: 49 + 1.7 * inchesOver5ft,
    hamwi: 45.5 + 2.2 * inchesOver5ft,
    bmiLow: 18.5 * m * m,
    bmiHigh: 24.9 * m * m,
  };
}

// ---------- Lean body mass ----------

export interface LeanMassSet {
  boer: number;
  james: number;
  hume: number;
}

export function leanMass(
  sex: Sex,
  weightKg: number,
  heightCm: number,
): LeanMassSet {
  if (sex === "male") {
    return {
      boer: 0.407 * weightKg + 0.267 * heightCm - 19.2,
      james: 1.1 * weightKg - 128 * (weightKg / heightCm) ** 2,
      hume: 0.32810 * weightKg + 0.33929 * heightCm - 29.5336,
    };
  }
  return {
    boer: 0.252 * weightKg + 0.473 * heightCm - 48.3,
    james: 1.07 * weightKg - 148 * (weightKg / heightCm) ** 2,
    hume: 0.29569 * weightKg + 0.41813 * heightCm - 43.2933,
  };
}

// ---------- Pace ----------

// All times stored as seconds; distances as kilometers.
export function paceFromTime(seconds: number, km: number): number {
  if (km <= 0) return 0;
  return seconds / km; // sec per km
}

export function timeFromPace(secPerKm: number, km: number): number {
  return secPerKm * km;
}

export function distanceFromPace(secPerKm: number, seconds: number): number {
  if (secPerKm <= 0) return 0;
  return seconds / secPerKm;
}

export function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds <= 0) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.round(seconds % 60);
  if (h > 0)
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function formatPace(secPerKm: number, unit: "km" | "mi"): string {
  if (!isFinite(secPerKm) || secPerKm <= 0) return "—";
  const sec = unit === "mi" ? secPerKm * 1.609344 : secPerKm;
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}:${String(s).padStart(2, "0")} /${unit}`;
}

export const RACE_DISTANCES_KM: { name: string; km: number }[] = [
  { name: "1 km", km: 1 },
  { name: "1 mile", km: 1.609344 },
  { name: "5 km", km: 5 },
  { name: "10 km", km: 10 },
  { name: "Half marathon", km: 21.0975 },
  { name: "Marathon", km: 42.195 },
];

// ---------- Heart rate zones (Karvonen) ----------

export interface HrZone {
  name: string;
  pctLow: number;
  pctHigh: number;
  hrLow: number;
  hrHigh: number;
  purpose: string;
}

const ZONE_DEFS: { name: string; pctLow: number; pctHigh: number; purpose: string }[] = [
  { name: "Zone 1 · Recovery", pctLow: 50, pctHigh: 60, purpose: "Active recovery, warmup" },
  { name: "Zone 2 · Aerobic base", pctLow: 60, pctHigh: 70, purpose: "Fat burning, conversational pace" },
  { name: "Zone 3 · Aerobic", pctLow: 70, pctHigh: 80, purpose: "Cardiovascular efficiency" },
  { name: "Zone 4 · Threshold", pctLow: 80, pctHigh: 90, purpose: "Lactate threshold, hard intervals" },
  { name: "Zone 5 · VO2 max", pctLow: 90, pctHigh: 100, purpose: "Anaerobic, max effort" },
];

export function heartRateZones(age: number, restingHr: number): HrZone[] {
  const maxHr = 220 - age;
  const reserve = maxHr - restingHr;
  return ZONE_DEFS.map((z) => ({
    ...z,
    hrLow: Math.round(restingHr + (reserve * z.pctLow) / 100),
    hrHigh: Math.round(restingHr + (reserve * z.pctHigh) / 100),
  }));
}

// ---------- Plate loading ----------

export interface PlateBreakdown {
  perSide: { plate: number; count: number }[];
  loadable: number; // total weight actually loaded
  remainder: number; // unloadable amount
}

export function platesPerSide(
  targetWeight: number,
  barWeight: number,
  available: number[],
): PlateBreakdown {
  const totalToLoad = targetWeight - barWeight;
  if (totalToLoad <= 0) {
    return { perSide: [], loadable: barWeight, remainder: 0 };
  }
  let perSideWeight = totalToLoad / 2;
  const sortedPlates = [...available].sort((a, b) => b - a);
  const result: { plate: number; count: number }[] = [];
  for (const p of sortedPlates) {
    const count = Math.floor(perSideWeight / p);
    if (count > 0) {
      result.push({ plate: p, count });
      perSideWeight -= p * count;
    }
  }
  const loadedPerSide = totalToLoad / 2 - perSideWeight;
  return {
    perSide: result,
    loadable: barWeight + loadedPerSide * 2,
    remainder: targetWeight - (barWeight + loadedPerSide * 2),
  };
}

export const STANDARD_PLATES_KG = [25, 20, 15, 10, 5, 2.5, 1.25];
export const STANDARD_PLATES_LB = [45, 35, 25, 10, 5, 2.5];

// ---------- Wilks / DOTS ----------

// Wilks 2020 coefficients (5th-degree polynomial). Inputs in kg.
const WILKS_COEFF_M = [-0.0000010538, 0.0008341, -0.2811, 36.7338, -1262.78, 47.4617];
const WILKS_COEFF_F = [-0.0000010706, 0.0007474, -0.21746, 13.7871, -371.4476, 9.69];

function polyEval(coeff: number[], x: number) {
  return coeff.reduce((acc, c) => acc * x + c, 0);
}

export function wilksScore(
  sex: Sex,
  bodyweightKg: number,
  liftedKg: number,
): number {
  if (bodyweightKg <= 0) return 0;
  const coeff = sex === "male" ? WILKS_COEFF_M : WILKS_COEFF_F;
  // Clamp polynomial input range to avoid blowups
  const bw = Math.min(Math.max(bodyweightKg, 40), 200);
  const denom = polyEval(coeff, bw);
  if (denom <= 0) return 0;
  return (liftedKg * 500) / denom;
}

// DOTS coefficients (used by IPF since 2020 for its own format; this is the open DOTS).
const DOTS_COEFF_M = [-0.000001093, 0.0007391293, -0.1918759221, 24.0900756, -307.75076];
const DOTS_COEFF_F = [-0.0000010706, 0.0005158568, -0.1126655495, 13.6175032, -57.96288];

export function dotsScore(
  sex: Sex,
  bodyweightKg: number,
  liftedKg: number,
): number {
  if (bodyweightKg <= 0) return 0;
  const coeff = sex === "male" ? DOTS_COEFF_M : DOTS_COEFF_F;
  const bw = Math.min(Math.max(bodyweightKg, 40), 200);
  const denom = polyEval(coeff, bw);
  if (denom <= 0) return 0;
  return (liftedKg * 500) / denom;
}

export function strengthLevel(score: number): string {
  if (score < 200) return "Beginner";
  if (score < 300) return "Novice";
  if (score < 400) return "Intermediate";
  if (score < 500) return "Advanced";
  return "Elite";
}

// ---------- Recomp timeline ----------

// 1 kg of fat ≈ 7700 kcal. Linear projection.
export function recompTimeline(
  currentKg: number,
  goalKg: number,
  dailyKcalDelta: number,
): { weeks: number; weeklyChangeKg: number; totalChangeKg: number } | null {
  const totalChange = goalKg - currentKg; // negative = lose
  if (dailyKcalDelta === 0) return null;
  const dailyKgChange = dailyKcalDelta / 7700; // negative deficit = loss
  // Want sign(dailyKgChange) to match sign(totalChange)
  if (Math.sign(dailyKgChange) !== Math.sign(totalChange)) return null;
  const weeks = totalChange / (dailyKgChange * 7);
  return {
    weeks: Math.abs(weeks),
    weeklyChangeKg: dailyKgChange * 7,
    totalChangeKg: totalChange,
  };
}
