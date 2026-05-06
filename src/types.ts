export interface UserProfile {
  age?: number;
  gender?: string;
  heightCm?: number;
  weightKg?: number;
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  dietaryGoals: string[];
  allergies: string[];
  calorieGoal: number;
  waterGoal: number;
}

export interface UserData {
  uid: string;
  email: string;
  displayName?: string;
  profile?: UserProfile;
  createdAt: string;
}

export interface FoodItem {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface MealLog {
  id?: string;
  userId: string;
  timestamp: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  items: FoodItem[];
  totalCalories: number;
  aiNotes?: string;
}

export interface WaterLog {
  id?: string;
  userId: string;
  timestamp: string;
  amountMl: number;
}

export interface DailySummary {
  date: string;
  totalCalories: number;
  totalWater: number;
  healthScore: number;
}
