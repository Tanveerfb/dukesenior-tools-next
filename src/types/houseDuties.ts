// Types for house duties checklist tool

export interface Duty {
  id: string;
  name: string;
  order: number;
}

export interface Person {
  id: string;
  name: string;
  order: number;
}

export interface DayAssignment {
  day: string; // e.g., "Monday", "Tuesday", etc.
  dutyId: string;
  personId: string;
}

export interface Checklist {
  id: string;
  name: string;
  description?: string;
  duties: Duty[];
  people: Person[];
  assignments: DayAssignment[];
  createdAt: number;
  updatedAt: number;
  createdBy: string; // UID
  createdByName: string;
  isTemplate: boolean; // Whether this is saved as a template
}

export interface NewChecklistInput {
  name: string;
  description?: string;
  duties: Duty[];
  people: Person[];
  assignments: DayAssignment[];
  isTemplate: boolean;
}

export interface UpdateChecklistInput {
  id: string;
  name?: string;
  description?: string;
  duties?: Duty[];
  people?: Person[];
  assignments?: DayAssignment[];
  isTemplate?: boolean;
}

export const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

export type DayOfWeek = typeof DAYS_OF_WEEK[number];
