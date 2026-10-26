export type BodyType = 'delgado' | 'medio' | 'grueso' | 'obeso';
export type Goal = 'bajar_peso' | 'ganar_musculo' | 'atletico';
export type Level = 'basico' | 'intermedio' | 'avanzado';
export type Focus = 'pecho' | 'pierna' | 'brazo' | 'core';
export type MuscleGroup =
  | 'pecho'
  | 'pierna'
  | 'brazo'
  | 'core'
  | 'espalda'
  | 'fullbody';

export interface Profile {
  age: number;
  weightKg: number;
  daysPerWeek: number;
  minutesPerSession: number;
  bodyType: BodyType;
  goal: Goal;
  focuses: Focus[];
  level: Level;
  musicDownload?: boolean;
}

export type Impact = 'low' | 'high';
export type ExerciseKind = 'main' | 'warmup' | 'cooldown';

export interface Exercise {
  id: string;
  name: string;
  muscles: MuscleGroup[];
  minLevel: Level;
  impact: Impact;
  kind: ExerciseKind;
  cardio?: boolean;
  needsFurniture?: boolean;
  baseReps?: number;
  baseSeconds?: number;
  anim: string;
  videoQuery: string;
  desc: string;
}

export interface PlannedExercise {
  exercise: Exercise;
  reps?: number;
  seconds?: number;
  restSeconds: number;
}

export interface DayPlan {
  dayIndex: number;
  title: string;
  theme: string;
  warmup: PlannedExercise[];
  main: PlannedExercise[];
  rounds: number;
  cooldown: PlannedExercise[];
  estimatedMinutes: number;
}

export type Phase = 'base' | 'progresion' | 'intensificacion' | 'descarga';

export interface WeeklyPlan {
  days: DayPlan[];
  generatedAt: number;
  week: number;
  phase: Phase;
  phaseLabel: string;
}

export interface MonthlyPlan {
  weeks: WeeklyPlan[];
  generatedAt: number;
}
