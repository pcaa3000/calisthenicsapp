import { Figure } from '../figures/Figure';
import type { PlannedExercise } from '../types';

export const videoUrl = (query: string) =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;

interface Props {
  planned: PlannedExercise;
  done: boolean;
  onToggle: () => void;
  onOpen: () => void;
}

export function ExerciseCard({ planned, done, onToggle, onOpen }: Props) {
  const { exercise: ex } = planned;
  const dose =
    planned.seconds !== undefined
      ? `${planned.seconds}s`
      : `${planned.reps} reps`;

  return (
    <div className={`ex-card ${done ? 'done' : ''}`}>
      <div className="fig-wrap clickable" onClick={onOpen}>
        <Figure anim={ex.anim} size={90} />
      </div>
      <div className="info clickable" onClick={onOpen}>
        <h4>{ex.name}</h4>
        <div className="dose">
          {dose}
          {planned.restSeconds > 15 && ` · descanso ${planned.restSeconds}s`}
        </div>
        <div className="desc">{ex.desc}</div>
        <div className="tags">
          {ex.muscles.map((m) => (
            <span key={m} className="tag-pill">
              {m}
            </span>
          ))}
          {ex.impact === 'high' && <span className="tag-pill">impacto</span>}
          {ex.needsFurniture && <span className="tag-pill">silla</span>}
        </div>
      </div>
      <div className="ex-actions">
        <label className="check-done">
          <input type="checkbox" checked={done} onChange={onToggle} />
          Hecho
        </label>
        <a
          className="video-link"
          href={videoUrl(ex.videoQuery)}
          target="_blank"
          rel="noreferrer"
        >
          Ver demo ▸
        </a>
      </div>
    </div>
  );
}
