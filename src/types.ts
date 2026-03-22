export type Frequency = 'Daily' | 'Weekdays' | 'Weekly';
export type Unit = 'times' | 'mins' | 'pages' | 'liters';
export type DurationUnit = 'days' | 'weeks' | 'months' | 'indefinite';

export interface Goal {
  id: string;
  title: string;
  frequency: Frequency;
  targetValue: number;
  targetUnit: Unit;
  durationValue?: number;
  durationUnit?: DurationUnit;
  smartReminders: boolean;
  extendDurationIfMissed: boolean;
  createdAt: string;
  completions: string[]; // Array of ISO date strings (YYYY-MM-DD)
  isSuspended: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl: string;
}

export interface AppSettings {
  darkMode: boolean;
  notifications: boolean;
  startOfWeek: 'Monday' | 'Sunday';
}
