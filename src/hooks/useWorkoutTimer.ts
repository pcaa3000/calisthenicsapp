import { useEffect, useRef, useState } from 'react';
import { beep } from '../utils';

export interface WorkoutTimer {
  active: boolean;
  running: boolean;
  finished: boolean;
  minutes: number;
  remaining: number;
  activate: () => void;
  close: () => void;
  toggle: () => void;
  reset: () => void;
  setMinutes: (m: number) => void;
}

export function useWorkoutTimer(presetMinutes: number): WorkoutTimer {
  const [active, setActive] = useState(false);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [minutes, setMin] = useState(presetMinutes);
  const [remaining, setRemaining] = useState(presetMinutes * 60);
  const [prevPreset, setPrevPreset] = useState(presetMinutes);

  if (prevPreset !== presetMinutes) {
    setPrevPreset(presetMinutes);
    if (!running) {
      setMin(presetMinutes);
      setRemaining(presetMinutes * 60);
      setFinished(false);
    }
  }

  const remainingRef = useRef(remaining);
  useEffect(() => {
    remainingRef.current = remaining;
  });

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      const v = Math.max(0, remainingRef.current - 1);
      setRemaining(v);
      if (v === 0) {
        setRunning(false);
        setFinished(true);
        beep();
      }
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  const setMinutes = (m: number) => {
    if (running) return;
    const v = Math.min(240, Math.max(1, Math.round(m) || 1));
    setMin(v);
    setRemaining(v * 60);
    setFinished(false);
  };

  const activate = () => setActive(true);
  const close = () => {
    setRunning(false);
    setActive(false);
  };
  const toggle = () => {
    if (!running && finished) {
      setRemaining(minutes * 60);
      setFinished(false);
    }
    setRunning(!running);
  };
  const reset = () => {
    setRunning(false);
    setFinished(false);
    setRemaining(minutes * 60);
  };

  return {
    active,
    running,
    finished,
    minutes,
    remaining,
    activate,
    close,
    toggle,
    reset,
    setMinutes,
  };
}
