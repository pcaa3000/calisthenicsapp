import type { WorkoutTimer } from '../hooks/useWorkoutTimer';

const fmt = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

export function TimerBar({ timer }: { timer: WorkoutTimer }) {
  if (!timer.active) return null;
  return (
    <div
      className={`timer-bar${timer.finished ? ' finished' : ''}`}
      role="region"
      aria-label="Temporizador"
    >
      <div className="timer-bar-inner">
        <span className="timer-time">{fmt(timer.remaining)}</span>
        <label className="timer-min">
          <input
            className="timer-min-input"
            type="number"
            min={1}
            max={240}
            value={timer.minutes}
            disabled={timer.running}
            onChange={(e) => timer.setMinutes(Number(e.target.value))}
            aria-label="Minutos"
          />
          <span className="meta">min</span>
        </label>
        <button
          className="mb-btn mb-play"
          onClick={timer.toggle}
          aria-label={timer.running ? 'Pausar' : 'Iniciar'}
        >
          {timer.running ? '❚❚' : '▶'}
        </button>
        <button className="mb-btn" onClick={timer.reset} aria-label="Reiniciar">
          ↺
        </button>
        <button
          className="mb-btn mb-close"
          onClick={timer.close}
          aria-label="Cerrar"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
