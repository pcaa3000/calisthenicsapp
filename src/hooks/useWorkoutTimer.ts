import { useEffect, useRef, useState } from 'react';
import type { DayPlan, PlannedExercise } from '../types';
import { beep } from '../utils';

export interface TimerStep {
  kind: 'work' | 'rest';
  label: string;
  dose: string;
  seconds: number | null;
  est: number | null;
}

export type TimerMode = 'auto' | 'semi';

const repSeconds = (reps: number) => Math.max(5, Math.round(reps * 2.5));
const duration = (st: TimerStep) => st.seconds ?? st.est ?? 0;

function workStep(pe: PlannedExercise): TimerStep {
  if (pe.seconds !== undefined) {
    return {
      kind: 'work',
      label: pe.exercise.name,
      dose: `${pe.seconds}s`,
      seconds: pe.seconds,
      est: null,
    };
  }
  const reps = pe.reps ?? 0;
  return {
    kind: 'work',
    label: pe.exercise.name,
    dose: `${reps} reps`,
    seconds: null,
    est: repSeconds(reps),
  };
}

export function buildSteps(day: DayPlan): TimerStep[] {
  const steps: TimerStep[] = [];
  const push = (pe: PlannedExercise) => {
    steps.push(workStep(pe));
    if (pe.restSeconds > 0) {
      steps.push({
        kind: 'rest',
        label: 'Descanso',
        dose: `${pe.restSeconds}s`,
        seconds: pe.restSeconds,
        est: null,
      });
    }
  };
  day.warmup.forEach(push);
  for (let r = 0; r < day.rounds; r++) day.main.forEach(push);
  day.cooldown.forEach(push);
  if (steps[steps.length - 1]?.kind === 'rest') steps.pop();
  return steps;
}

export interface WorkoutTimer {
  active: boolean;
  running: boolean;
  finished: boolean;
  mode: TimerMode;
  setMode: (m: TimerMode) => void;
  steps: TimerStep[] | null;
  stepIndex: number;
  currentStep: TimerStep | null;
  atGate: boolean;
  minutes: number;
  remaining: number;
  activate: (day: DayPlan | null) => void;
  close: () => void;
  toggle: () => void;
  next: () => void;
  reset: () => void;
  setMinutes: (m: number) => void;
}

export function useWorkoutTimer(presetMinutes: number): WorkoutTimer {
  const [active, setActive] = useState(false);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [mode, setModeState] = useState<TimerMode>('auto');
  const [steps, setSteps] = useState<TimerStep[] | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [minutes, setMin] = useState(presetMinutes);
  const [remaining, setRemaining] = useState(presetMinutes * 60);
  const [prevPreset, setPrevPreset] = useState(presetMinutes);

  if (prevPreset !== presetMinutes) {
    setPrevPreset(presetMinutes);
    if (!running && !steps) {
      setMin(presetMinutes);
      setRemaining(presetMinutes * 60);
      setFinished(false);
    }
  }

  const currentStep = steps?.[stepIndex] ?? null;
  const atGate =
    currentStep !== null && currentStep.seconds === null && mode === 'semi';

  const goTo = (n: number, keepRunning: boolean, list = steps) => {
    if (!list) return;
    if (n >= list.length) {
      setRunning(false);
      setFinished(true);
      return;
    }
    setStepIndex(n);
    const gate = list[n].seconds === null && modeRef.current === 'semi';
    setRemaining(gate ? 0 : duration(list[n]));
    setRunning(keepRunning && !gate);
  };

  const remainingRef = useRef(remaining);
  const stepIdxRef = useRef(stepIndex);
  const modeRef = useRef(mode);
  const stepsRef = useRef(steps);
  const tickRef = useRef<() => void>(() => {});

  useEffect(() => {
    remainingRef.current = remaining;
    stepIdxRef.current = stepIndex;
    modeRef.current = mode;
    stepsRef.current = steps;
    tickRef.current = () => {
      const v = Math.max(0, remainingRef.current - 1);
      remainingRef.current = v;
      setRemaining(v);
      if (v !== 0) return;
      beep();
      if (!stepsRef.current) {
        setRunning(false);
        setFinished(true);
      } else {
        goTo(stepIdxRef.current + 1, true, stepsRef.current);
      }
    };
  });

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => tickRef.current(), 1000);
    return () => clearInterval(id);
  }, [running]);

  const setMinutes = (m: number) => {
    if (running) return;
    const v = Math.min(240, Math.max(1, Math.round(m) || 1));
    setMin(v);
    setRemaining(v * 60);
    setFinished(false);
  };

  const activate = (day: DayPlan | null) => {
    setActive(true);
    setFinished(false);
    if (day) {
      const list = buildSteps(day);
      setSteps(list);
      const gate = list[0].seconds === null && modeRef.current === 'semi';
      setStepIndex(0);
      setRemaining(gate ? 0 : duration(list[0]));
      setRunning(!gate);
    } else {
      setSteps(null);
      setRemaining(minutes * 60);
      setRunning(false);
    }
  };

  const close = () => {
    setRunning(false);
    setActive(false);
    setSteps(null);
  };

  const toggle = () => {
    if (finished) {
      reset();
      setRunning(true);
      return;
    }
    if (atGate) {
      goTo(stepIndex + 1, true);
      return;
    }
    setRunning(!running);
  };

  const next = () => goTo(stepIndex + 1, running || atGate);

  const reset = () => {
    setFinished(false);
    if (steps) {
      const gate = steps[0].seconds === null && mode === 'semi';
      setStepIndex(0);
      setRemaining(gate ? 0 : duration(steps[0]));
    } else {
      setRemaining(minutes * 60);
    }
    setRunning(false);
  };

  const setMode = (m: TimerMode) => {
    setModeState(m);
    if (!currentStep || currentStep.seconds !== null) return;
    if (m === 'auto') {
      setRemaining(duration(currentStep));
      setRunning(true);
    } else {
      setRunning(false);
      setRemaining(0);
    }
  };

  return {
    active,
    running,
    finished,
    mode,
    setMode,
    steps,
    stepIndex,
    currentStep,
    atGate,
    minutes,
    remaining,
    activate,
    close,
    toggle,
    next,
    reset,
    setMinutes,
  };
}
