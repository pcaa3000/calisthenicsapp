import { useState } from 'react';
import type { DayPlan } from '../types';
import { ExerciseCard } from './ExerciseCard';
import { ExerciseModal } from './ExerciseModal';

interface Props {
  day: DayPlan;
  done: Record<string, boolean>;
  onToggle: (key: string) => void;
  onBack: () => void;
}

export function DayRoutine({ day, done, onToggle, onBack }: Props) {
  const [openIdx, setOpenIdx] = useState<string | null>(null);

  const key = (block: string, i: number) => `${day.dayIndex}:${block}:${i}`;
  const open = (block: string, i: number) => setOpenIdx(key(block, i));

  const openPlanned = (() => {
    if (!openIdx) return null;
    const [, block, i] = openIdx.split(':');
    const list =
      block === 'w' ? day.warmup : block === 'm' ? day.main : day.cooldown;
    return list[Number(i)] ?? null;
  })();

  return (
    <div>
      <div className="routine-head">
        <button className="btn ghost small" onClick={onBack}>
          ← Semana
        </button>
        <h2>{day.title}</h2>
        <span className="meta" style={{ color: 'var(--muted)' }}>
          ≈ {day.estimatedMinutes} min
        </span>
      </div>

      <p className="block-label">Calentamiento</p>
      <div className="ex-list">
        {day.warmup.map((pe, i) => (
          <ExerciseCard
            key={pe.exercise.id}
            planned={pe}
            index={i}
            done={Boolean(done[key('w', i)])}
            onToggle={() => onToggle(key('w', i))}
            onOpen={() => open('w', i)}
          />
        ))}
      </div>

      <p className="block-label">Bloque principal</p>
      <div className="rounds-banner">
        Completa el circuito <strong>{day.rounds} rondas</strong>. Descansa el
        tiempo indicado entre ejercicios y 60–90s entre rondas.
      </div>
      <div className="ex-list">
        {day.main.map((pe, i) => (
          <ExerciseCard
            key={pe.exercise.id}
            planned={pe}
            index={i}
            done={Boolean(done[key('m', i)])}
            onToggle={() => onToggle(key('m', i))}
            onOpen={() => open('m', i)}
          />
        ))}
      </div>

      <p className="block-label">Vuelta a la calma</p>
      <div className="ex-list">
        {day.cooldown.map((pe, i) => (
          <ExerciseCard
            key={pe.exercise.id}
            planned={pe}
            index={i}
            done={Boolean(done[key('c', i)])}
            onToggle={() => onToggle(key('c', i))}
            onOpen={() => open('c', i)}
          />
        ))}
      </div>

      {openPlanned && (
        <ExerciseModal planned={openPlanned} onClose={() => setOpenIdx(null)} />
      )}
    </div>
  );
}
