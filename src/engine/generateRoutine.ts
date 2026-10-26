import { EXERCISES } from '../data/exercises';
import type {
  DayPlan,
  Exercise,
  Level,
  MonthlyPlan,
  MuscleGroup,
  Phase,
  PlannedExercise,
  Profile,
  WeeklyPlan,
} from '../types';

const LEVEL_RANK: Record<Level, number> = { basico: 0, intermedio: 1, avanzado: 2 };

// Deterministic RNG (mulberry32) so the same profile+seed reproduces a plan.
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface DayTheme {
  key: string;
  label: string;
  // Dominant muscle group for recovery spacing: no two consecutive days
  // should hammer the same primary group.
  primary: MuscleGroup;
  weights: Partial<Record<MuscleGroup, number>>;
  cardioShare: number;
}

const THEMES: Record<string, DayTheme> = {
  pecho: {
    key: 'pecho',
    label: 'Empuje — pecho y brazo',
    primary: 'pecho',
    weights: { pecho: 0.45, brazo: 0.25, core: 0.15, pierna: 0.15 },
    cardioShare: 0.15,
  },
  pierna: {
    key: 'pierna',
    label: 'Pierna y resistencia',
    primary: 'pierna',
    weights: { pierna: 0.55, core: 0.2, fullbody: 0.1, pecho: 0.15 },
    cardioShare: 0.2,
  },
  brazo: {
    key: 'brazo',
    label: 'Brazo, hombro y espalda',
    primary: 'espalda',
    weights: { brazo: 0.3, pecho: 0.25, espalda: 0.2, core: 0.15, pierna: 0.1 },
    cardioShare: 0.15,
  },
  core: {
    key: 'core',
    label: 'Core — abdominales de acero',
    primary: 'core',
    weights: { core: 0.55, fullbody: 0.25, pierna: 0.2 },
    cardioShare: 0.25,
  },
  fullbody: {
    key: 'fullbody',
    label: 'Cuerpo completo',
    primary: 'fullbody',
    weights: {
      pecho: 0.15,
      pierna: 0.25,
      brazo: 0.1,
      espalda: 0.15,
      core: 0.2,
      fullbody: 0.15,
    },
    cardioShare: 0.25,
  },
  cardio: {
    key: 'cardio',
    label: 'Cardio militar — quema total',
    primary: 'fullbody',
    weights: { fullbody: 0.5, core: 0.25, pierna: 0.25 },
    cardioShare: 0.5,
  },
};

function shuffle<T>(arr: T[], rand: () => number): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function lowImpactOnly(p: Profile): boolean {
  return p.bodyType === 'obeso' || p.age >= 50 || p.weightKg >= 120;
}

function themeRotation(p: Profile, rand: () => number): DayTheme[] {
  const themes: DayTheme[] = [];
  // Focused muscle groups lead the week, shuffled for variety.
  themes.push(
    ...shuffle(
      p.focuses.map((f) => THEMES[f]).filter(Boolean),
      rand,
    ),
  );
  // Fill remaining days rotating supporting themes.
  const fillers: DayTheme[] =
    p.goal === 'bajar_peso'
      ? [THEMES.cardio, THEMES.fullbody, THEMES.core]
      : p.goal === 'ganar_musculo'
        ? [THEMES.fullbody, THEMES.pecho, THEMES.pierna]
        : [THEMES.fullbody, THEMES.cardio, THEMES.core];
  let i = 0;
  while (themes.length < p.daysPerWeek) {
    themes.push(fillers[i % fillers.length]);
    i++;
  }
  return orderWeek(themes.slice(0, p.daysPerWeek));
}

// A muscle needs ~48h before being hit hard again. Greedy pass: each slot
// takes the first remaining theme whose primary group differs from the
// previous day's; repeats are only allowed when nothing else remains.
function orderWeek(themes: DayTheme[]): DayTheme[] {
  const remaining = [...themes];
  const ordered: DayTheme[] = [];
  while (remaining.length > 0) {
    const prev = ordered[ordered.length - 1]?.primary;
    const idx = remaining.findIndex((t) => t.primary !== prev);
    ordered.push(remaining.splice(idx === -1 ? 0 : idx, 1)[0]);
  }
  return ordered;
}

function workScale(minutes: number): { exercises: number; rounds: number } {
  if (minutes <= 15) return { exercises: 4, rounds: 2 };
  if (minutes <= 20) return { exercises: 5, rounds: 3 };
  if (minutes <= 30) return { exercises: 6, rounds: 3 };
  if (minutes <= 45) return { exercises: 7, rounds: 4 };
  return { exercises: 8, rounds: 4 };
}

function intensityFactor(p: Profile): number {
  let f = { basico: 0.75, intermedio: 1, avanzado: 1.25 }[p.level];
  if (p.goal === 'ganar_musculo') f *= 1.1;
  if (p.goal === 'bajar_peso') f *= 0.9;
  if (p.age >= 65) f *= 0.6;
  else if (p.age >= 50) f *= 0.8;
  else if (p.age >= 40) f *= 0.9;
  if (p.bodyType === 'obeso') f *= 0.75;
  else if (p.bodyType === 'delgado' && p.goal === 'ganar_musculo') f *= 1.05;
  if (p.weightKg >= 110) f *= 0.8;
  else if (p.weightKg >= 95) f *= 0.9;
  else if (p.weightKg <= 50) f *= 1.05;
  return f;
}

function restSeconds(p: Profile): number {
  const base =
    p.goal === 'bajar_peso' ? 20 : p.goal === 'ganar_musculo' ? 60 : 40;
  const lvlAdj = { basico: 15, intermedio: 0, avanzado: -5 }[p.level];
  const ageAdj = p.age >= 50 ? 10 : 0;
  return Math.max(15, base + lvlAdj + ageAdj);
}

function pickExercises(
  pool: Exercise[],
  theme: DayTheme,
  count: number,
  p: Profile,
  rand: () => number,
  weeklyUsed: Set<string>,
): Exercise[] {
  // Focused muscle groups get a bonus weight on every day, not only their theme day.
  const weights = { ...theme.weights };
  for (const f of p.focuses) {
    weights[f] = (weights[f] ?? 0) + 0.4;
  }
  const groups = Object.entries(weights) as [MuscleGroup, number][];
  const chosen: Exercise[] = [];
  const used = new Set<string>();
  let guard = 0;

  while (chosen.length < count && guard++ < 200) {
    // Weighted muscle-group pick.
    let r = rand();
    let group: MuscleGroup = groups[0][0];
    for (const [g, w] of groups) {
      r -= w;
      if (r <= 0) {
        group = g;
        break;
      }
    }
    const wantCardio = rand() < theme.cardioShare;
    // A coach varies the stimulus: prefer exercises not yet programmed this
    // week; recycle only when the fresh pool for the group runs dry.
    let candidates = pool.filter(
      (e) =>
        !used.has(e.id) &&
        !weeklyUsed.has(e.id) &&
        e.muscles.includes(group) &&
        (wantCardio ? Boolean(e.cardio) : true),
    );
    if (candidates.length === 0) {
      candidates = pool.filter(
        (e) =>
          !used.has(e.id) &&
          e.muscles.includes(group) &&
          (wantCardio ? Boolean(e.cardio) : true),
      );
    }
    if (candidates.length === 0) {
      candidates = pool.filter((e) => !used.has(e.id));
    }
    if (candidates.length === 0) break;
    // Prefer the hardest variants the user can do; fall back to easier ones.
    const userRank = LEVEL_RANK[p.level];
    candidates.sort(
      (a, b) =>
        Math.abs(LEVEL_RANK[a.minLevel] - userRank) -
        Math.abs(LEVEL_RANK[b.minLevel] - userRank),
    );
    // Take from the best few to keep variety.
    const top = candidates.slice(0, Math.min(3, candidates.length));
    const ex = top[Math.floor(rand() * top.length)];
    used.add(ex.id);
    weeklyUsed.add(ex.id);
    chosen.push(ex);
  }
  return chosen;
}

// How well an exercise fits the day's theme: sum of the theme weights of the
// muscles it trains.
function themeScore(e: Exercise, theme: DayTheme): number {
  return e.muscles.reduce((s, m) => s + (theme.weights[m] ?? 0), 0);
}

// Circuit order: lead with the most on-theme exercises and alternate muscle
// groups so each muscle rests while the next one works.
function orderCircuit(main: Exercise[], theme: DayTheme): Exercise[] {
  const remaining = [...main].sort(
    (a, b) => themeScore(b, theme) - themeScore(a, theme),
  );
  const ordered: Exercise[] = [];
  while (remaining.length > 0) {
    const prev = ordered[ordered.length - 1]?.muscles[0];
    const idx = remaining.findIndex((e) => e.muscles[0] !== prev);
    ordered.push(remaining.splice(idx === -1 ? 0 : idx, 1)[0]);
  }
  return ordered;
}

// Warmup/cooldown: shuffled, then on-theme exercises float to the front.
function pickSupport(
  list: Exercise[],
  theme: DayTheme,
  n: number,
  rand: () => number,
): Exercise[] {
  return shuffle([...list], rand)
    .sort((a, b) => themeScore(b, theme) - themeScore(a, theme))
    .slice(0, n);
}

function toPlanned(e: Exercise, f: number, rest: number): PlannedExercise {
  const planned: PlannedExercise = {
    exercise: e,
    restSeconds: e.kind === 'main' ? rest : 10,
  };
  if (e.baseSeconds !== undefined) {
    planned.seconds = Math.max(10, Math.round((e.baseSeconds * f) / 5) * 5);
  } else {
    planned.reps = Math.max(3, Math.round((e.baseReps ?? 10) * f));
  }
  return planned;
}

const workSeconds = (pe: PlannedExercise) => pe.seconds ?? (pe.reps ?? 0) * 2.5;

// Rescale main-block doses so the estimated duration tracks the requested time.
function fitToTarget(
  main: PlannedExercise[],
  fixedSec: number,
  rounds: number,
  targetSec: number,
): void {
  const rest = rounds * main.reduce((s, pe) => s + pe.restSeconds, 0);
  const work = rounds * main.reduce((s, pe) => s + workSeconds(pe), 0);
  const desired = targetSec - fixedSec - rest;
  if (work <= 0 || desired <= 0) return;
  const scale = Math.min(1.6, Math.max(0.6, desired / work));
  if (Math.abs(scale - 1) < 0.05) return;
  for (const pe of main) {
    if (pe.seconds !== undefined) {
      pe.seconds = Math.max(10, Math.round((pe.seconds * scale) / 5) * 5);
    } else {
      pe.reps = Math.max(3, Math.round((pe.reps ?? 0) * scale));
    }
  }
}

// Mesocycle of 4 weeks: progressive overload for three weeks, then a deload
// so connective tissue and CNS recover before the next cycle.
const PHASES: {
  key: Phase;
  label: string;
  dose: number;
  roundsDelta: number;
}[] = [
  { key: 'base', label: 'Adaptación', dose: 1.0, roundsDelta: 0 },
  { key: 'progresion', label: 'Sobrecarga progresiva', dose: 1.07, roundsDelta: 0 },
  { key: 'intensificacion', label: 'Intensificación', dose: 1.15, roundsDelta: 0 },
  { key: 'descarga', label: 'Descarga activa', dose: 0.7, roundsDelta: -1 },
];

// Applied after fitToTarget: overload weeks pack more work into the same time
// budget (density), the deload week deliberately cuts volume.
function scaleDose(main: PlannedExercise[], k: number): void {
  if (Math.abs(k - 1) < 0.01) return;
  for (const pe of main) {
    if (pe.seconds !== undefined) {
      pe.seconds = Math.max(10, Math.round((pe.seconds * k) / 5) * 5);
    } else {
      pe.reps = Math.max(3, Math.round((pe.reps ?? 0) * k));
    }
  }
}

export function generateRoutine(
  p: Profile,
  seed = Date.now(),
  week = 1,
): WeeklyPlan {
  const phase = PHASES[Math.max(1, Math.min(PHASES.length, week)) - 1];
  const rand = mulberry32(seed);
  const lowOnly = lowImpactOnly(p);
  const rank = LEVEL_RANK[p.level];

  const pool = EXERCISES.filter(
    (e) =>
      e.kind === 'main' &&
      LEVEL_RANK[e.minLevel] <= rank &&
      (!lowOnly || e.impact === 'low'),
  );
  const warmups = EXERCISES.filter(
    (e) => e.kind === 'warmup' && (!lowOnly || e.impact === 'low'),
  );
  const cooldowns = EXERCISES.filter((e) => e.kind === 'cooldown');

  let { exercises: nEx, rounds } = workScale(p.minutesPerSession);
  if (p.level === 'avanzado') rounds += 1;
  if (p.level === 'basico') rounds = Math.max(2, rounds - 1);
  if (p.goal === 'bajar_peso') rounds += 1;
  if (p.daysPerWeek <= 2) nEx = Math.min(nEx + 1, pool.length); // fewer days → more per session
  rounds = Math.max(1, rounds + phase.roundsDelta);

  const f = intensityFactor(p);
  const rest = restSeconds(p);
  const weeklyUsed = new Set<string>();

  const days: DayPlan[] = themeRotation(p, rand).map((theme, dayIndex) => {
    const picked = pickExercises(
      pool,
      theme,
      Math.min(nEx, pool.length),
      p,
      rand,
      weeklyUsed,
    );
    const main = orderCircuit(picked, theme).map((e) => toPlanned(e, f, rest));
    const warm = pickSupport(warmups, theme, 2, rand).map((e) =>
      toPlanned(e, f, rest),
    );
    const cool = pickSupport(cooldowns, theme, 3, rand).map((e) =>
      toPlanned(e, f, rest),
    );

    const fixedSec =
      warm.reduce((s, pe) => s + workSeconds(pe) + 10, 0) +
      cool.reduce((s, pe) => s + workSeconds(pe) + 10, 0);
    fitToTarget(main, fixedSec, rounds, p.minutesPerSession * 60);
    scaleDose(main, phase.dose);

    const estSec =
      fixedSec +
      rounds * main.reduce((s, pe) => s + workSeconds(pe) + pe.restSeconds, 0);

    return {
      dayIndex,
      title: `Día ${dayIndex + 1} — ${theme.label}`,
      theme: theme.key,
      warmup: warm,
      main,
      rounds,
      cooldown: cool,
      estimatedMinutes: Math.round(estSec / 60),
    };
  });

  return {
    days,
    generatedAt: seed,
    week,
    phase: phase.key,
    phaseLabel: phase.label,
  };
}

// One mesocycle: four weeks sharing the same profile. Each week gets a
// different seed so the exercise selection rotates, while the phase scales
// the total dose.
export function generateMonth(p: Profile, seed = Date.now()): MonthlyPlan {
  return {
    weeks: PHASES.map((_, i) => generateRoutine(p, seed + (i + 1) * 7919, i + 1)),
    generatedAt: seed,
  };
}
