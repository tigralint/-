export interface Macros {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export interface FoodEntry {
  id: string;
  name: string;
  macros: Macros;
  timestamp: Date;
  micronutrients?: string[];
  notes?: string;
}

export interface CustomHabit {
  id: string;
  name: string;
  completed: boolean;
}

export interface HabitState {
  omega3: number; // 0 to 4
  multivitamin: boolean;
  waterIntakeMl: number;
  steps: number;
  gymWorkout: boolean;
  sleepStart: string; // "23:00"
  sleepEnd: string;   // "07:00"
  customHabits: CustomHabit[];
}

export interface DayState {
  date: string;
  entries: FoodEntry[];
  habits: HabitState;
}

export interface UserProfile {
  startDate: string;
  targetDate: string;
  heightCm: number;
  startWeight: number;
  currentWeight: number;
  targetWeight: number;
  age: number;
  gender: 'male' | 'female';
}

export interface DayLog {
  date: string;
  score: number; // 0-100
  weight: number;
  status: 'perfect' | 'good' | 'bad' | 'pending';
  detailedStats?: {
    macros: Macros;
    habits: HabitState;
  };
}

export enum MacroType {
  PROTEIN = 'PROTEIN',
  FAT = 'FAT',
  CARBS = 'CARBS',
  CALORIES = 'CALORIES'
}