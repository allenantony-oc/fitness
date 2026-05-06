// MET (metabolic equivalent) values for common activities.
// Source: 2011 Compendium of Physical Activities (Ainsworth et al.).

export interface Activity {
  name: string;
  met: number;
  category: "cardio" | "strength" | "sport" | "daily";
}

export const ACTIVITIES: Activity[] = [
  // Cardio
  { name: "Walking (3 mph / 4.8 km/h)", met: 3.5, category: "cardio" },
  { name: "Walking (4 mph / 6.4 km/h, brisk)", met: 5.0, category: "cardio" },
  { name: "Hiking (cross-country)", met: 6.0, category: "cardio" },
  { name: "Running (6 mph / 9.7 km/h, 10 min/mi)", met: 9.8, category: "cardio" },
  { name: "Running (7.5 mph / 12 km/h, 8 min/mi)", met: 11.5, category: "cardio" },
  { name: "Running (10 mph / 16 km/h, 6 min/mi)", met: 16.0, category: "cardio" },
  { name: "Cycling (12–14 mph, moderate)", met: 8.0, category: "cardio" },
  { name: "Cycling (16–19 mph, vigorous)", met: 12.0, category: "cardio" },
  { name: "Indoor cycling / spin (vigorous)", met: 8.5, category: "cardio" },
  { name: "Rowing machine (vigorous)", met: 8.5, category: "cardio" },
  { name: "Swimming (freestyle, moderate)", met: 8.3, category: "cardio" },
  { name: "Swimming (freestyle, vigorous)", met: 9.8, category: "cardio" },
  { name: "Elliptical trainer (moderate)", met: 5.0, category: "cardio" },
  { name: "Stair climbing (moderate)", met: 8.8, category: "cardio" },
  { name: "Jump rope (moderate)", met: 11.8, category: "cardio" },

  // Strength
  { name: "Weight training (light/moderate)", met: 3.5, category: "strength" },
  { name: "Weight training (vigorous, free weights)", met: 6.0, category: "strength" },
  { name: "Powerlifting / heavy training", met: 6.5, category: "strength" },
  { name: "CrossFit / circuit training", met: 8.0, category: "strength" },
  { name: "Bodyweight calisthenics (vigorous)", met: 8.0, category: "strength" },
  { name: "Yoga (Hatha)", met: 2.5, category: "strength" },
  { name: "Yoga (power / vinyasa)", met: 4.0, category: "strength" },
  { name: "Pilates", met: 3.0, category: "strength" },

  // Sport
  { name: "Basketball (game)", met: 8.0, category: "sport" },
  { name: "Soccer (competitive)", met: 10.0, category: "sport" },
  { name: "Tennis (singles)", met: 7.3, category: "sport" },
  { name: "Boxing (sparring)", met: 7.8, category: "sport" },
  { name: "Martial arts (moderate)", met: 5.3, category: "sport" },
  { name: "Rock climbing", met: 8.0, category: "sport" },

  // Daily
  { name: "House cleaning (moderate)", met: 3.3, category: "daily" },
  { name: "Gardening (moderate)", met: 3.8, category: "daily" },
  { name: "Mowing the lawn", met: 5.5, category: "daily" },
  { name: "Carrying groceries upstairs", met: 7.5, category: "daily" },
];

export const CATEGORY_LABELS: Record<Activity["category"], string> = {
  cardio: "Cardio",
  strength: "Strength",
  sport: "Sport",
  daily: "Daily",
};
