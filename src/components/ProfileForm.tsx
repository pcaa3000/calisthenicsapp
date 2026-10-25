import { useState } from 'react';
import type { BodyType, Focus, Goal, Level, Profile } from '../types';

const BODY_TYPES: { value: BodyType; label: string }[] = [
  { value: 'delgado', label: 'Delgado' },
  { value: 'medio', label: 'Medio' },
  { value: 'grueso', label: 'Grueso' },
  { value: 'obeso', label: 'Obeso' },
];

const LEVELS: { value: Level; label: string }[] = [
  { value: 'basico', label: 'Básico' },
  { value: 'intermedio', label: 'Intermedio' },
  { value: 'avanzado', label: 'Avanzado' },
];

const GOALS: { value: Goal; label: string }[] = [
  { value: 'bajar_peso', label: 'Bajar de peso' },
  { value: 'ganar_musculo', label: 'Ganar músculo' },
  { value: 'atletico', label: 'Atlético' },
];

const FOCUSES: { value: Focus; label: string }[] = [
  { value: 'pecho', label: 'Pecho' },
  { value: 'pierna', label: 'Pierna' },
  { value: 'brazo', label: 'Brazo' },
  { value: 'core', label: 'Core (abdomen)' },
];

const TIME_OPTIONS = [15, 20, 30, 45, 60];

interface Props {
  initial: Profile | null;
  onSubmit: (p: Profile) => void;
}

export function ProfileForm({ initial, onSubmit }: Props) {
  const [step, setStep] = useState(0);
  const [age, setAge] = useState(initial?.age ?? 25);
  const [weightKg, setWeight] = useState(initial?.weightKg ?? 70);
  const [bodyType, setBodyType] = useState<BodyType>(initial?.bodyType ?? 'medio');
  const [level, setLevel] = useState<Level>(initial?.level ?? 'basico');
  const [daysPerWeek, setDays] = useState(initial?.daysPerWeek ?? 3);
  const [minutesPerSession, setMinutes] = useState(initial?.minutesPerSession ?? 30);
  const [goal, setGoal] = useState<Goal>(initial?.goal ?? 'atletico');
  const [focuses, setFocuses] = useState<Focus[]>(initial?.focuses ?? ['pecho']);
  const [error, setError] = useState('');

  const toggleFocus = (f: Focus) =>
    setFocuses((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f],
    );

  const next = () => {
    if (age < 10 || age > 90) return setError('Ingresa una edad entre 10 y 90 años.');
    if (weightKg < 30 || weightKg > 250)
      return setError('Ingresa un peso entre 30 y 250 kg.');
    setError('');
    setStep(1);
  };

  const submit = () => {
    if (focuses.length === 0)
      return setError('Elige al menos un enfoque muscular.');
    setError('');
    onSubmit({
      age,
      weightKg,
      daysPerWeek,
      minutesPerSession,
      bodyType,
      goal,
      focuses,
      level,
    });
  };

  return (
    <div className="form-card">
      <div className="steps">
        <span className="done" />
        <span className={step === 1 ? 'done' : ''} />
      </div>

      {step === 0 && (
        <>
          <h2>Tus datos</h2>
          <div className="field-grid">
            <div className="field">
              <label>Edad</label>
              <input
                type="number"
                min={10}
                max={90}
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
            <div className="field">
              <label>Tipo de cuerpo</label>
              <div className="chip-row">
                {BODY_TYPES.map((b) => (
                  <button
                    key={b.value}
                    className={`chip ${bodyType === b.value ? 'on' : ''}`}
                    onClick={() => setBodyType(b.value)}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="field">
              <label>Nivel de dificultad</label>
              <div className="chip-row">
                {LEVELS.map((l) => (
                  <button
                    key={l.value}
                    className={`chip ${level === l.value ? 'on' : ''}`}
                    onClick={() => setLevel(l.value)}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="btn-row">
            <button className="btn" onClick={next}>
              Siguiente
            </button>
          </div>
        </>
      )}

      {step === 1 && (
        <>
          <h2>Tu plan</h2>
          <div className="field-grid">
            <div className="field">
              <label>Días por semana</label>
              <select
                value={daysPerWeek}
                onChange={(e) => setDays(Number(e.target.value))}
              >
                {[1, 2, 3, 4, 5, 6].map((d) => (
                  <option key={d} value={d}>
                    {d} {d === 1 ? 'día' : 'días'}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Tiempo por rutina</label>
              <select
                value={minutesPerSession}
                onChange={(e) => setMinutes(Number(e.target.value))}
              >
                {TIME_OPTIONS.map((m) => (
                  <option key={m} value={m}>
                    {m} minutos
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Objetivo</label>
              <div className="chip-row">
                {GOALS.map((g) => (
                  <button
                    key={g.value}
                    className={`chip ${goal === g.value ? 'on' : ''}`}
                    onClick={() => setGoal(g.value)}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="field">
              <label>Enfoque (elige uno o más)</label>
              <div className="chip-row">
                {FOCUSES.map((f) => (
                  <button
                    key={f.value}
                    className={`chip ${focuses.includes(f.value) ? 'on' : ''}`}
                    onClick={() => toggleFocus(f.value)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="btn-row">
            <button className="btn ghost" onClick={() => setStep(0)}>
              Atrás
            </button>
            <button className="btn" onClick={submit}>
              Generar rutina
            </button>
          </div>
        </>
      )}

      {error && <p className="form-error">{error}</p>}
    </div>
  );
}
