import type { WeeklyPlan } from '../types';

interface Props {
  plan: WeeklyPlan;
  onSelectDay: (dayIndex: number) => void;
  onEdit: () => void;
  onRegenerate: () => void;
}

export function WeeklyPlanView({ plan, onSelectDay, onEdit, onRegenerate }: Props) {
  return (
    <div>
      <div className="plan-head">
        <h2>Tu plan semanal</h2>
        <div className="btn-row" style={{ marginTop: 0 }}>
          <button className="btn ghost small" onClick={onEdit}>
            Editar perfil
          </button>
          <button className="btn ghost small" onClick={onRegenerate}>
            Regenerar
          </button>
        </div>
      </div>
      <div className="day-grid">
        {plan.days.map((d) => (
          <button
            key={d.dayIndex}
            className="day-card"
            onClick={() => onSelectDay(d.dayIndex)}
          >
            <h3>{d.title}</h3>
            <div className="meta">
              ≈ {d.estimatedMinutes} min · {d.rounds} rondas
            </div>
            <div className="count">{d.main.length} ejercicios</div>
          </button>
        ))}
      </div>
    </div>
  );
}
