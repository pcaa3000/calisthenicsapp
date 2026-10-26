import type { WorkoutTimer } from '../hooks/useWorkoutTimer';

const fmt = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

export function TimerBar({ timer }: { timer: WorkoutTimer }) {
  if (!timer.active) return null;

  const stepMode = timer.steps !== null;

  return (
    <div
      className={`timer-bar${timer.finished ? ' finished' : ''}`}
      role="region"
      aria-label="Temporizador"
    >
      <div className="timer-bar-inner">
        {stepMode ? (
          <>
            <span className="timer-step-info">
              <span className="timer-step-name">
                {timer.finished
                  ? '¡Rutina completa!'
                  : (timer.currentStep?.label ?? '')}
              </span>
              <span className="meta">
                {timer.finished
                  ? ''
                  : `${timer.atGate ? (timer.currentStep?.dose ?? '') : fmt(timer.remaining)} · paso ${timer.stepIndex + 1}/${timer.steps?.length ?? 0}`}
              </span>
            </span>
            <span className="timer-modes">
              <button
                className={`mode-chip${timer.mode === 'auto' ? ' on' : ''}`}
                onClick={() => timer.setMode('auto')}
              >
                Auto
              </button>
              <button
                className={`mode-chip${timer.mode === 'semi' ? ' on' : ''}`}
                onClick={() => timer.setMode('semi')}
              >
                Semi
              </button>
            </span>
            {!timer.finished && (
              <span className="timer-time">
                {timer.atGate ? '⏸' : fmt(timer.remaining)}
              </span>
            )}
          </>
        ) : (
          <>
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
          </>
        )}

        <button
          className="mb-btn mb-play"
          onClick={timer.toggle}
          aria-label={
            timer.atGate
              ? 'Continuar'
              : timer.running
                ? 'Pausar'
                : timer.finished
                  ? 'Repetir'
                  : 'Iniciar'
          }
        >
          {timer.atGate ? '⏭' : timer.running ? '❚❚' : '▶'}
        </button>
        {stepMode && !timer.finished && (
          <button
            className="mb-btn"
            onClick={timer.next}
            aria-label="Saltar paso"
          >
            ⏭
          </button>
        )}
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
