import { useState } from 'react';
import { DayRoutine } from './components/DayRoutine';
import { ProfileForm } from './components/ProfileForm';
import { WeeklyPlanView } from './components/WeeklyPlan';
import { generateRoutine } from './engine/generateRoutine';
import { useLocalStorage } from './hooks/useLocalStorage';
import type { Profile, WeeklyPlan } from './types';

export default function App() {
  const [profile, setProfile] = useLocalStorage<Profile | null>(
    'cm:profile',
    null,
  );
  const [plan, setPlan] = useLocalStorage<WeeklyPlan | null>('cm:plan', null);
  const [done, setDone] = useLocalStorage<Record<string, boolean>>(
    'cm:done',
    {},
  );
  const [editing, setEditing] = useState(false);
  const [dayIndex, setDayIndex] = useState<number | null>(null);

  const handleSubmit = (p: Profile) => {
    setProfile(p);
    setPlan(generateRoutine(p));
    setDone({});
    setEditing(false);
    setDayIndex(null);
  };

  const regenerate = () => {
    if (profile) {
      setPlan(generateRoutine(profile));
      setDone({});
      setDayIndex(null);
    }
  };

  const toggle = (key: string) =>
    setDone((prev) => ({ ...prev, [key]: !prev[key] }));

  const showForm = !profile || editing;
  const day = plan?.days.find((d) => d.dayIndex === dayIndex) ?? null;

  return (
    <div className="app">
      <header className="app-header">
        <h1>Calistenia Militar</h1>
        <span className="tag">Rutinas en casa · sin gimnasio</span>
      </header>

      {showForm ? (
        <ProfileForm initial={profile} onSubmit={handleSubmit} />
      ) : day ? (
        <DayRoutine
          day={day}
          done={done}
          onToggle={toggle}
          onBack={() => setDayIndex(null)}
        />
      ) : plan ? (
        <WeeklyPlanView
          plan={plan}
          onSelectDay={setDayIndex}
          onEdit={() => setEditing(true)}
          onRegenerate={regenerate}
        />
      ) : null}
    </div>
  );
}
