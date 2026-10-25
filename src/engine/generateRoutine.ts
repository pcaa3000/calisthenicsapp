import { EXERCISES } from '../data/exercises';
import type {
  DayPlan,
  Exercise,
  Level,
  MuscleGroup,
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
  weights: Partial<Record<MuscleGroup, number>>;
  cardioShare: number;
}

const THEMES: Record<string, DayTheme> = {
  pecho: {
    key: 'pecho',
    label: 'Empuje — pecho y brazo',
    weights: { pecho: 0.45, brazo: 0.25, core: 0.15, pierna: 0.15 },
    cardioShare: 0.15,
  },
  pierna: {
    key: 'pierna',
    label: 'Pierna y resistencia',
    weights: { pierna: 0.55, core: 0.2, fullbody: 0.1, pecho: 0.15 },
    cardioShare: 0.2,
  },
  brazo: {
    key: 'brazo',
    label: 'Brazo, hombro y espalda',
    weights: { brazo: 0.3, pecho: 0.25, espalda: 0.2, core: 0.15, pierna: 0.1 },
    cardioShare: 0.15,
  },
  core: {
    key: 'core',
    label: 'Core — abdominales de acero',
    weights: { core: 0.55, fullbody: 0.25, pierna: 0.2 },
    cardioShare: 0.25,
  },
  fullbody: {
    key: 'fullbody',
    label: 'Cuerpo completo',
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
    weights: { fullbody: 0.5, core: 0.25, pierna: 0.25 },
    cardioShare: 0.5,
  },
};

function lowImpactOnly(p: Profile): boolean {
  return p.bodyType === 'obeso' || p.age >= 50 || p.weightKg >= 120;
}

function themeRotation(p: Profile, rand: () => number): DayTheme[] {
  const themes: DayTheme[] = [];
  // Focused muscle groups lead the week, shuffled for variety.
  const focusThemes = p.focuses.map((f) => THEMES[f]).filter(Boolean);
  for (let i = focusThemes.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [focusThemes[i], focusThemes[j]] = [focusThemes[j], focusThemes[i]];
  }
  themes.push(...focusThemes);
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
  return themes.slice(0, p.daysPerWeek);
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
    let candidates = pool.filter(
      (e) =>
        !used.has(e.id) &&
        e.muscles.includes(group) &&
        (wantCardio ? Boolean(e.cardio) : true),
    );
    // Prefer the hardest variants the user can do; fall back to easier ones.
    const userRank = LEVEL_RANK[p.level];
    candidates.sort(
      (a, b) =>
        Math.abs(LEVEL_RANK[b.minLevel] - userRank) -
        Math.abs(LEVEL_RANK[a.minLevel] - userRank),
    );
    if (candidates.length === 0) {
      candidates = pool.filter((e) => !used.has(e.id));
    }
    if (candidates.length === 0) break;
    // Take from the best few to keep variety.
    const top = candidates.slice(0, Math.min(3, candidates.length));
    const ex = top[Math.floor(rand() * top.length)];
    used.add(ex.id);
    chosen.push(ex);
  }
  return chosen;
}

function toPlanned(e: Exercise, p: Profile): PlannedExercise {
  const f = intensityFactor(p);
  const planned: PlannedExercise = {
    exercise: e,
    restSeconds: e.kind === 'main' ? restSeconds(p) : 10,
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

export function generateRoutine(p: Profile, seed = Date.now()): WeeklyPlan {
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

  const days: DayPlan[] = themeRotation(p, rand).map((theme, dayIndex) => {
    const main = pickExercises(pool, theme, Math.min(nEx, pool.length), p, rand).map(
      (e) => toPlanned(e, p),
    );
    const warm = [...warmups]
      .sort(() => rand() - 0.5)
      .slice(0, 2)
      .map((e) => toPlanned(e, p));
    const cool = [...cooldowns]
      .sort(() => rand() - 0.5)
      .slice(0, 3)
      .map((e) => toPlanned(e, p));

    const fixedSec =
      warm.reduce((s, pe) => s + workSeconds(pe) + 10, 0) +
      cool.reduce((s, pe) => s + workSeconds(pe) + 10, 0);
    fitToTarget(main, fixedSec, rounds, p.minutesPerSession * 60);

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

  return { days, generatedAt: seed };
}
