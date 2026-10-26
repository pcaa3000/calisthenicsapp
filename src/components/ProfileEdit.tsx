import { useState, type ReactNode } from 'react';
import {
  BODY_TYPES,
  DAY_OPTIONS,
  FOCUSES,
  GOALS,
  LEVELS,
  TIME_OPTIONS,
} from '../data/profileOptions';
import type { BodyType, Focus, Goal, Level, Profile } from '../types';

interface Props {
  initial: Profile;
  onSubmit: (p: Profile) => void;
  onCancel: () => void;
}

export function ProfileEdit({ initial, onSubmit, onCancel }: Props) {
  const [age, setAge] = useState(initial.age);
  const [weightKg, setWeight] = useState(initial.weightKg);
  const [bodyType, setBodyType] = useState<BodyType>(initial.bodyType);
  const [level, setLevel] = useState<Level>(initial.level);
  const [daysPerWeek, setDays] = useState(initial.daysPerWeek);
  const [minutesPerSession, setMinutes] = useState(initial.minutesPerSession);
  const [goal, setGoal] = useState<Goal>(initial.goal);
  const [focuses, setFocuses] = useState<Focus[]>(initial.focuses);
  const [music, setMusic] = useState<boolean | null>(
    initial.musicDownload ?? null,
  );
  const [error, setError] = useState('');

  const toggleFocus = (f: Focus) =>
    setFocuses((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f],
    );

  const save = () => {
    if (age < 15 || age > 100) return setError('Edad entre 15 y 100 años.');
    if (weightKg < 30 || weightKg > 250)
      return setError('Peso entre 30 y 250 kg.');
    if (focuses.length === 0)
      return setError('Elige al menos un enfoque muscular.');
    onSubmit({
      age,
      weightKg,
      daysPerWeek,
      minutesPerSession,
      bodyType,
      goal,
      focuses,
      level,
      musicDownload: music ?? undefined,
    });
  };

  return (
    <div className="form-card">
      <h2>Editar perfil</h2>

      <div className="field-grid">
        <div className="field">
          <label>Edad</label>
          <input
            type="number"
            min={15}
            max={100}
            value={age}
            onChange={(e) => setAge(Number(e.target.value))}
          />
        </div>
        <div className="field">
          <label>Peso (kg)</label>
          <input
            type="number"
            min={30}
            max={250}
            value={weightKg}
            onChange={(e) => setWeight(Number(e.target.value))}
          />
        </div>
      </div>

      <Section label="Tipo de cuerpo">
        {BODY_TYPES.map((b) => (
          <button
            key={b.value}
            className={`chip ${bodyType === b.value ? 'on' : ''}`}
            onClick={() => setBodyType(b.value)}
          >
            {b.label}
          </button>
        ))}
      </Section>

      <Section label="Nivel">
        {LEVELS.map((l) => (
          <button
            key={l.value}
            className={`chip ${level === l.value ? 'on' : ''}`}
            onClick={() => setLevel(l.value)}
          >
            {l.label}
          </button>
        ))}
      </Section>

      <Section label="Días por semana">
        {DAY_OPTIONS.map((d) => (
          <button
            key={d}
            className={`chip ${daysPerWeek === d ? 'on' : ''}`}
            onClick={() => setDays(d)}
          >
            {d}
          </button>
        ))}
      </Section>

      <Section label="Tiempo por sesión">
        {TIME_OPTIONS.map((m) => (
          <button
            key={m}
            className={`chip ${minutesPerSession === m ? 'on' : ''}`}
            onClick={() => setMinutes(m)}
          >
            {m} min
          </button>
        ))}
      </Section>

      <Section label="Objetivo">
        {GOALS.map((g) => (
          <button
            key={g.value}
            className={`chip ${goal === g.value ? 'on' : ''}`}
            onClick={() => setGoal(g.value)}
          >
            {g.label}
          </button>
        ))}
      </Section>

      <Section label="Enfoque muscular (uno o más)">
        {FOCUSES.map((f) => (
          <button
            key={f.value}
            className={`chip ${focuses.includes(f.value) ? 'on' : ''}`}
            onClick={() => toggleFocus(f.value)}
          >
            {f.label}
          </button>
        ))}
      </Section>

      <Section label="Música offline">
        <button
          className={`chip ${music === true ? 'on' : ''}`}
          onClick={() => setMusic(true)}
        >
          Descargar pistas
        </button>
        <button
          className={`chip ${music === false ? 'on' : ''}`}
          onClick={() => setMusic(false)}
        >
          No descargar
        </button>
      </Section>

      {error && <p className="form-error">{error}</p>}
      <div className="btn-row">
        <button className="btn" onClick={save}>
          Guardar cambios
        </button>
        <button className="btn ghost" onClick={onCancel}>
          Volver
        </button>
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="field edit-section">
      <label>{label}</label>
      <div className="chip-row">{children}</div>
    </div>
  );
}
