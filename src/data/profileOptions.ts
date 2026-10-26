import type { BodyType, Focus, Goal, Level } from '../types';

export const BODY_TYPES: { value: BodyType; label: string; desc: string }[] = [
  { value: 'delgado', label: 'Delgado', desc: 'Contextura ligera, cuesta subir de peso' },
  { value: 'medio', label: 'Medio', desc: 'Contextura atlética promedio' },
  { value: 'grueso', label: 'Grueso', desc: 'Contextura ancha, masa sólida' },
  { value: 'obeso', label: 'Obeso', desc: 'Sobrepeso alto, prioridad bajar de peso' },
];

export const LEVELS: { value: Level; label: string; desc: string }[] = [
  { value: 'basico', label: 'Básico', desc: 'Sedentario o empezando de cero' },
  { value: 'intermedio', label: 'Intermedio', desc: 'Entreno ocasionalmente' },
  { value: 'avanzado', label: 'Avanzado', desc: 'Entreno con regularidad' },
];

export const GOALS: { value: Goal; label: string; desc: string }[] = [
  { value: 'bajar_peso', label: 'Bajar de peso', desc: 'Quemar grasa con alta intensidad' },
  { value: 'ganar_musculo', label: 'Ganar músculo', desc: 'Fuerza y volumen muscular' },
  { value: 'atletico', label: 'Atlético', desc: 'Resistencia, potencia y agilidad' },
];

export const FOCUSES: { value: Focus; label: string }[] = [
  { value: 'pecho', label: 'Pecho' },
  { value: 'pierna', label: 'Pierna' },
  { value: 'brazo', label: 'Brazo' },
  { value: 'core', label: 'Core (abdomen)' },
];

export const TIME_OPTIONS = [15, 20, 30, 45, 60];
export const DAY_OPTIONS = [1, 2, 3, 4, 5, 6];
