export type Frequency = 'Daily' | 'Weekdays' | 'Weekly';
export type Unit = 'times' | 'mins' | 'pages' | 'liters';
export type DurationUnit = 'days' | 'weeks' | 'months' | 'indefinite';

export type GoalType = 'counter' | 'binary';

export interface Goal {
  id: string;
  title: string;
  type: GoalType;
  frequency: Frequency;
  targetValue: number;
  targetUnit: Unit;
  durationValue?: number;
  durationUnit?: DurationUnit;
  smartReminders: boolean;
  extendDurationIfMissed: boolean;
  createdAt: string;
  completions: string[]; // Array of ISO date strings (YYYY-MM-DD)
  failures: string[]; // Array of ISO date strings (YYYY-MM-DD) for binary goals
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
  encouragement: boolean;
  startOfWeek: 'Monday' | 'Sunday';
  language?: 'en' | 'he';
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}
