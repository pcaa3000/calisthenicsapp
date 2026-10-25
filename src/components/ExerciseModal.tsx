import { useCallback, useEffect, useRef, useState } from 'react';
import { Figure } from '../figures/Figure';
import type { PlannedExercise } from '../types';
import { videoUrl } from './ExerciseCard';

interface Props {
  planned: PlannedExercise;
  onClose: () => void;
}

export function ExerciseModal({ planned, onClose }: Props) {
  const { exercise: ex } = planned;
  const dose =
    planned.seconds !== undefined
      ? `${planned.seconds} segundos`
      : `${planned.reps} repeticiones`;

  const [closing, setClosing] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const requestClose = useCallback(() => {
    if (closing) return;
    setClosing(true);
    timer.current = window.setTimeout(onClose, 160);
  }, [closing, onClose]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && requestClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [requestClose]);

  return (
    <div
      className={`modal-bg${closing ? ' closing' : ''}`}
      onClick={requestClose}
    >
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={ex.name}
        onClick={(e) => e.stopPropagation()}
      >
        <h3>{ex.name}</h3>
        <Figure anim={ex.anim} size={200} />
        <p className="desc">{ex.desc}</p>
        <p className="dose">
          {dose}
          {planned.restSeconds > 15 && ` · descanso ${planned.restSeconds}s`}
        </p>
        <div className="btn-row" style={{ justifyContent: 'center' }}>
          <a
            className="btn small"
            href={videoUrl(ex.videoQuery)}
            target="_blank"
            rel="noreferrer"
            style={{ textDecoration: 'none' }}
          >
            Ver demostración
          </a>
          <button className="btn ghost small" onClick={requestClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
