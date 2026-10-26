import { describe, expect, it } from 'vitest';
import { generateMonth, generateRoutine } from './generateRoutine';
import type { DayPlan, Profile } from '../types';

const baseProfile: Profile = {
  age: 28,
  weightKg: 75,
  daysPerWeek: 3,
  minutesPerSession: 30,
  bodyType: 'medio',
  goal: 'atletico',
  focuses: ['pecho', 'core'],
  level: 'intermedio',
};

const allMain = (plan: { days: DayPlan[] }) => plan.days.flatMap((d) => d.main);
const levelRank = { basico: 0, intermedio: 1, avanzado: 2 };

describe('generateRoutine', () => {
  it('generates exactly one routine per requested training day', () => {
    for (const days of [1, 2, 3, 4, 5, 6]) {
      const plan = generateRoutine({ ...baseProfile, daysPerWeek: days }, 42);
      expect(plan.days).toHaveLength(days);
    }
  });

  it('each day includes warmup, main block and cooldown', () => {
    const plan = generateRoutine(baseProfile, 7);
    for (const day of plan.days) {
      expect(day.warmup.length).toBeGreaterThan(0);
      expect(day.main.length).toBeGreaterThan(0);
      expect(day.cooldown.length).toBeGreaterThan(0);
      expect(day.rounds).toBeGreaterThanOrEqual(2);
      expect(day.estimatedMinutes).toBeGreaterThan(0);
    }
  });

  it('never prescribes exercises above the user level', () => {
    const plan = generateRoutine({ ...baseProfile, level: 'basico' }, 3);
    for (const pe of allMain(plan)) {
      expect(levelRank[pe.exercise.minLevel]).toBeLessThanOrEqual(levelRank.basico);
    }
  });

  it('removes high-impact exercises for obese users', () => {
    const plan = generateRoutine({ ...baseProfile, bodyType: 'obeso', goal: 'bajar_peso' }, 11);
    for (const pe of allMain(plan)) {
      expect(pe.exercise.impact).toBe('low');
    }
  });

  it('removes high-impact exercises for users aged 50+', () => {
    const plan = generateRoutine({ ...baseProfile, age: 55 }, 11);
    for (const pe of allMain(plan)) {
      expect(pe.exercise.impact).toBe('low');
    }
  });

  it('scales the amount of work with available time', () => {
    const short = generateRoutine({ ...baseProfile, minutesPerSession: 15 }, 5);
    const long = generateRoutine({ ...baseProfile, minutesPerSession: 60 }, 5);
    const count = (p: typeof short) => p.days.reduce((n, d) => n + d.main.length * d.rounds, 0);
    expect(count(long)).toBeGreaterThan(count(short));
  });

  it('weights exercise selection toward the requested focus', () => {
    const plan = generateRoutine({ ...baseProfile, focuses: ['pecho'] }, 9);
    const chest = allMain(plan).filter((pe) => pe.exercise.muscles.includes('pecho'));
    expect(chest.length / allMain(plan).length).toBeGreaterThanOrEqual(0.4);
  });

  it('favors cardio exercises when the goal is weight loss', () => {
    const plan = generateRoutine({ ...baseProfile, goal: 'bajar_peso' }, 13);
    const cardio = allMain(plan).filter((pe) => pe.exercise.cardio);
    expect(cardio.length).toBeGreaterThan(0);
  });

  it('is deterministic for the same seed and varies with a different seed', () => {
    const a = generateRoutine(baseProfile, 99);
    const b = generateRoutine(baseProfile, 99);
    expect(JSON.stringify(a.days)).toBe(JSON.stringify(b.days));
    const c = generateRoutine(baseProfile, 100);
    const ids = (p: typeof a) => p.days.flatMap((d) => d.main.map((pe) => pe.exercise.id)).join(',');
    expect(ids(c)).not.toBe(ids(a));
  });

  it('assigns reps or seconds and rest to every main exercise', () => {
    const plan = generateRoutine(baseProfile, 21);
    for (const pe of allMain(plan)) {
      expect(pe.restSeconds).toBeGreaterThan(0);
      expect(pe.reps !== undefined || pe.seconds !== undefined).toBe(true);
    }
  });

  it('reduces work for heavier users', () => {
    const light = generateRoutine({ ...baseProfile, weightKg: 60 }, 5);
    const heavy = generateRoutine({ ...baseProfile, weightKg: 120 }, 5);
    const dose = (p: typeof light) =>
      allMain(p).reduce((n, pe) => n + (pe.reps ?? pe.seconds ?? 0), 0);
    expect(dose(heavy)).toBeLessThan(dose(light));
  });

  it('removes high-impact exercises for very heavy users of any body type', () => {
    const plan = generateRoutine(
      { ...baseProfile, weightKg: 120, bodyType: 'medio' },
      11,
    );
    for (const pe of allMain(plan)) {
      expect(pe.exercise.impact).toBe('low');
    }
  });

  it('estimates session duration close to the requested time', () => {
    for (const m of [15, 30, 60]) {
      const plan = generateRoutine({ ...baseProfile, minutesPerSession: m }, 8);
      for (const day of plan.days) {
        const tolerance = Math.max(4, m * 0.3);
        expect(
          Math.abs(day.estimatedMinutes - m),
          `day ${day.title} at ${m}min target`,
        ).toBeLessThanOrEqual(tolerance);
      }
    }
  });

  it('prefers the hardest exercises the level allows', () => {
    const plan = generateRoutine(
      { ...baseProfile, level: 'avanzado', daysPerWeek: 5 },
      5,
    );
    const hard = allMain(plan).filter(
      (pe) => pe.exercise.minLevel !== 'basico',
    ).length;
    expect(hard).toBeGreaterThan(allMain(plan).length - hard);
  });

  it('varies main exercises across the week', () => {
    const plan = generateRoutine({ ...baseProfile, daysPerWeek: 4 }, 5);
    const ids = allMain(plan).map((pe) => pe.exercise.id);
    // Small muscle groups may recycle once their fresh pool runs dry;
    // repetition must stay the exception, not the rule.
    expect(new Set(ids).size / ids.length).toBeGreaterThanOrEqual(0.8);
  });

  it('spaces same-theme days apart', () => {
    const plan = generateRoutine(
      { ...baseProfile, daysPerWeek: 5, focuses: ['pecho', 'pierna'] },
      5,
    );
    for (let i = 1; i < plan.days.length; i++) {
      expect(plan.days[i].theme).not.toBe(plan.days[i - 1].theme);
    }
  });

  it('programs a 4-week mesocycle ending in a deload', () => {
    const month = generateMonth(baseProfile, 42);
    expect(month.weeks).toHaveLength(4);
    expect(month.weeks.map((w) => w.week)).toEqual([1, 2, 3, 4]);
    expect(month.weeks.map((w) => w.phase)).toEqual([
      'base',
      'progresion',
      'intensificacion',
      'descarga',
    ]);
    const dose = (w: (typeof month.weeks)[number]) =>
      w.days.reduce(
        (n, d) =>
          n + d.rounds * d.main.reduce((s, pe) => s + (pe.reps ?? pe.seconds ?? 0), 0),
        0,
      );
    expect(dose(month.weeks[3])).toBeLessThan(dose(month.weeks[2]));
  });

  it('rotates exercise selection between weeks of the same month', () => {
    const month = generateMonth(baseProfile, 42);
    const ids = (w: (typeof month.weeks)[number]) =>
      w.days.flatMap((d) => d.main.map((pe) => pe.exercise.id)).join(',');
    expect(ids(month.weeks[0])).not.toBe(ids(month.weeks[1]));
  });
});
