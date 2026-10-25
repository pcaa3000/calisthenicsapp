import { useState, type ReactNode } from 'react';
import type { BodyType, Focus, Goal, Level, Profile } from '../types';

const AGE_RANGES = [
  { label: '18 - 29', age: 24 },
  { label: '30 - 39', age: 35 },
  { label: '40 - 49', age: 45 },
  { label: '50+', age: 58 },
];

const BODY_TYPES: { value: BodyType; label: string; desc: string }[] = [
  { value: 'delgado', label: 'Delgado', desc: 'Contextura ligera, cuesta subir de peso' },
  { value: 'medio', label: 'Medio', desc: 'Contextura atlética promedio' },
  { value: 'grueso', label: 'Grueso', desc: 'Contextura ancha, masa sólida' },
  { value: 'obeso', label: 'Obeso', desc: 'Sobrepeso alto, prioridad bajar de peso' },
];

const LEVELS: { value: Level; label: string; desc: string }[] = [
  { value: 'basico', label: 'Básico', desc: 'Sedentario o empezando de cero' },
  { value: 'intermedio', label: 'Intermedio', desc: 'Entreno ocasionalmente' },
  { value: 'avanzado', label: 'Avanzado', desc: 'Entreno con regularidad' },
];

const GOALS: { value: Goal; label: string; desc: string }[] = [
  { value: 'bajar_peso', label: 'Bajar de peso', desc: 'Quemar grasa con alta intensidad' },
  { value: 'ganar_musculo', label: 'Ganar músculo', desc: 'Fuerza y volumen muscular' },
  { value: 'atletico', label: 'Atlético', desc: 'Resistencia, potencia y agilidad' },
];

const FOCUSES: { value: Focus; label: string }[] = [
  { value: 'pecho', label: 'Pecho' },
  { value: 'pierna', label: 'Pierna' },
  { value: 'brazo', label: 'Brazo' },
  { value: 'core', label: 'Core (abdomen)' },
];

const TIME_OPTIONS = [15, 20, 30, 45, 60];
const STEP_COUNT = 8;

interface Props {
  initial: Profile | null;
  onSubmit: (p: Profile) => void;
}

const ageToRange = (age: number) =>
  age < 30 ? 0 : age < 40 ? 1 : age < 50 ? 2 : 3;

export function ProfileForm({ initial, onSubmit }: Props) {
  const [step, setStep] = useState(0);
  const [ageRange, setAgeRange] = useState(initial ? ageToRange(initial.age) : -1);
  const [weightKg, setWeight] = useState(initial?.weightKg ?? 70);
  const [bodyType, setBodyType] = useState<BodyType | null>(initial?.bodyType ?? null);
  const [level, setLevel] = useState<Level | null>(initial?.level ?? null);
  const [daysPerWeek, setDays] = useState(initial?.daysPerWeek ?? 0);
  const [minutesPerSession, setMinutes] = useState(initial?.minutesPerSession ?? 0);
  const [goal, setGoal] = useState<Goal | null>(initial?.goal ?? null);
  const [focuses, setFocuses] = useState<Focus[]>(initial?.focuses ?? []);
  const [error, setError] = useState('');

  const advance = () => {
    setError('');
    setStep((s) => Math.min(s + 1, STEP_COUNT - 1));
  };

  const back = () => {
    setError('');
    setStep((s) => Math.max(s - 1, 0));
  };

  const toggleFocus = (f: Focus) =>
    setFocuses((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f],
    );

  const submit = () => {
    if (focuses.length === 0)
      return setError('Elige al menos un enfoque muscular.');
    onSubmit({
      age: AGE_RANGES[ageRange].age,
      weightKg,
      daysPerWeek,
      minutesPerSession,
      bodyType: bodyType!,
      goal: goal!,
      focuses,
      level: level!,
    });
  };

  const single = (pick: () => void) => () => {
    pick();
    setError('');
    setStep((s) => s + 1);
  };

  const weightNext = () => {
    if (weightKg < 30 || weightKg > 250)
      return setError('Ingresa un peso entre 30 y 250 kg.');
    advance();
  };

  return (
    <div className="form-card">
      <div className="steps">
        {Array.from({ length: STEP_COUNT }, (_, i) => (
          <span key={i} className={i <= step ? 'done' : ''} />
        ))}
      </div>

      {step === 0 && (
        <Step q="¿Cuál es tu edad?">
          <div className="opt-grid">
            {AGE_RANGES.map((r, i) => (
              <button key={r.label} className={`opt-card ${ageRange === i ? 'on' : ''}`} onClick={single(() => setAgeRange(i))}>
                <strong>Edad: {r.label}</strong>
              </button>
            ))}
          </div>
        </Step>
      )}

      {step === 1 && (
        <Step q="¿Cuánto pesas?">
          <div className="field" style={{ maxWidth: 220 }}>
            <label>Peso (kg)</label>
            <input
              type="number"
              min={30}
              max={250}
              value={weightKg}
              autoFocus
              onChange={(e) => setWeight(Number(e.target.value))}
              onKeyDown={(e) => e.key === 'Enter' && weightNext()}
            />
          </div>
          <div className="btn-row">
            <button className="btn" onClick={weightNext}>Siguiente</button>
          </div>
        </Step>
      )}

      {step === 2 && (
        <Step q="¿Cuál es tu tipo de cuerpo?">
          <div className="opt-grid">
            {BODY_TYPES.map((b) => (
              <button key={b.value} className={`opt-card ${bodyType === b.value ? 'on' : ''}`} onClick={single(() => setBodyType(b.value))}>
                <strong>{b.label}</strong>
                <span>{b.desc}</span>
              </button>
            ))}
          </div>
        </Step>
      )}

      {step === 3 && (
        <Step q="¿Cuál es tu nivel actual?">
          <div className="opt-grid">
            {LEVELS.map((l) => (
              <button key={l.value} className={`opt-card ${level === l.value ? 'on' : ''}`} onClick={single(() => setLevel(l.value))}>
                <strong>{l.label}</strong>
                <span>{l.desc}</span>
              </button>
            ))}
          </div>
        </Step>
      )}

      {step === 4 && (
        <Step q="¿Cuántos días por semana puedes entrenar?">
          <div className="opt-grid cols-3">
            {[1, 2, 3, 4, 5, 6].map((d) => (
              <button key={d} className={`opt-card ${daysPerWeek === d ? 'on' : ''}`} onClick={single(() => setDays(d))}>
                <strong>{d}</strong>
                <span>{d === 1 ? 'día' : 'días'}</span>
              </button>
            ))}
          </div>
        </Step>
      )}

      {step === 5 && (
        <Step q="¿Cuánto tiempo por sesión?">
          <div className="opt-grid cols-3">
            {TIME_OPTIONS.map((m) => (
              <button key={m} className={`opt-card ${minutesPerSession === m ? 'on' : ''}`} onClick={single(() => setMinutes(m))}>
                <strong>{m} min</strong>
              </button>
            ))}
          </div>
        </Step>
      )}

      {step === 6 && (
        <Step q="¿Cuál es tu objetivo?">
          <div className="opt-grid">
            {GOALS.map((g) => (
              <button key={g.value} className={`opt-card ${goal === g.value ? 'on' : ''}`} onClick={single(() => setGoal(g.value))}>
                <strong>{g.label}</strong>
                <span>{g.desc}</span>
              </button>
            ))}
          </div>
        </Step>
      )}

      {step === 7 && (
        <Step q="¿En qué quieres enfocarte? (uno o más)">
          <div className="chip-row">
            {FOCUSES.map((f) => (
              <button key={f.value} className={`chip ${focuses.includes(f.value) ? 'on' : ''}`} onClick={() => toggleFocus(f.value)}>
                {f.label}
              </button>
            ))}
          </div>
          <div className="btn-row">
            <button className="btn" onClick={submit}>Generar rutina</button>
          </div>
        </Step>
      )}

      {step > 0 && (
        <button className="btn ghost small back-btn" onClick={back}>‹ Atrás</button>
      )}
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}

function Step({ q, children }: { q: string; children: ReactNode }) {
  return (
    <div>
      <h2 className="step-q">{q}</h2>
      {children}
    </div>
  );
}
