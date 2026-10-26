import type { WeeklyPlan } from '../types';

interface Props {
  plan: WeeklyPlan;
  totalWeeks: number;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onSelectDay: (dayIndex: number) => void;
  onEdit: () => void;
  onRegenerate: () => void;
}

export function WeeklyPlanView({
  plan,
  totalWeeks,
  onPrevWeek,
  onNextWeek,
  onSelectDay,
  onEdit,
  onRegenerate,
}: Props) {
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

      {totalWeeks > 1 && (
        <div className="week-nav">
          <button
            className="btn ghost small"
            onClick={onPrevWeek}
            disabled={plan.week <= 1}
            aria-label="Semana anterior"
          >
            ‹
          </button>
          <span className="meta">
            Semana {plan.week} de {totalWeeks} · {plan.phaseLabel}
          </span>
          <button
            className="btn ghost small"
            onClick={onNextWeek}
            disabled={plan.week >= totalWeeks}
            aria-label="Semana siguiente"
          >
            ›
          </button>
        </div>
      )}

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
