export interface Profile {
  id: string;
  display_name: string;
  timezone: string;
  created_at: string;
}

export interface MoodEntry {
  id: string;
  user_id: string;
  mood: 1 | 2 | 3 | 4 | 5;
  note: string;
  date: string;
}

export interface HabitDefinition {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  order_index: number;
  is_active: boolean;
}

export interface HabitLog {
  id: string;
  user_id: string;
  habit_id: string;
  date: string;
  completed: boolean;
}

export interface JournalEntry {
  id: string;
  user_id: string;
  date: string;
  food_log: string;
  workout_log: string;
  affirmations: string;
  reflections: string;
  tomorrow_plan: string;
  future_goals: string;
}

export interface Photo {
  id: string;
  user_id: string;
  date: string;
  storage_path: string;
  caption: string;
  created_at: string;
}

export interface Todo {
  id: string;
  user_id: string;
  title: string;
  due_date: string | null;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  created_at: string;
}

export interface HabitWithStats extends HabitDefinition {
  streak: number;
  completedToday: boolean;
}
