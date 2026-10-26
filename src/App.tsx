import { useState } from 'react';
import { DayRoutine } from './components/DayRoutine';
import { ProfileForm } from './components/ProfileForm';
import { WeeklyPlanView } from './components/WeeklyPlan';
import { generateMonth } from './engine/generateRoutine';
import { useLocalStorage } from './hooks/useLocalStorage';
import type { MonthlyPlan, Profile } from './types';

export default function App() {
  const [profile, setProfile] = useLocalStorage<Profile | null>(
    'cm:profile:v1',
    null,
  );
  const [month, setMonth] = useLocalStorage<MonthlyPlan | null>(
    'cm:month:v1',
    null,
  );
  const [weekIndex, setWeekIndex] = useLocalStorage<number>('cm:week:v1', 0);
  const [done, setDone] = useLocalStorage<Record<string, boolean>>(
    'cm:done:v1',
    {},
  );
  const [editing, setEditing] = useState(false);
  const [dayIndex, setDayIndex] = useState<number | null>(null);

  const plan = month
    ? month.weeks[Math.min(weekIndex, month.weeks.length - 1)]
    : null;

  const handleSubmit = (p: Profile) => {
    setProfile(p);
    setMonth(generateMonth(p));
    setWeekIndex(0);
    setDone({});
    setEditing(false);
    setDayIndex(null);
  };

  const regenerate = () => {
    if (profile) {
      setMonth(generateMonth(profile));
      setWeekIndex(0);
      setDone({});
      setDayIndex(null);
    }
  };

  const toggle = (key: string) =>
    setDone((prev) => ({ ...prev, [key]: !prev[key] }));

  const showForm = !profile || editing;
  const day = plan?.days.find((d) => d.dayIndex === dayIndex) ?? null;
  const screenKey = showForm ? 'form' : day ? `day-${day.dayIndex}` : 'plan';

  return (
    <div className="app">
      <header className="app-header">
        <h1>Calistenia Militar</h1>
        <span className="tag">Rutinas en casa · sin gimnasio</span>
      </header>

      <div className="screen" key={screenKey}>
        {showForm ? (
          <ProfileForm initial={profile} onSubmit={handleSubmit} />
        ) : day ? (
          <DayRoutine
            day={day}
            ns={`w${weekIndex}:`}
            done={done}
            onToggle={toggle}
            onBack={() => setDayIndex(null)}
          />
        ) : plan ? (
          <WeeklyPlanView
            plan={plan}
            totalWeeks={month?.weeks.length ?? 1}
            onPrevWeek={() => setWeekIndex((i) => Math.max(0, i - 1))}
            onNextWeek={() =>
              setWeekIndex((i) =>
                Math.min((month?.weeks.length ?? 1) - 1, i + 1),
              )
            }
            onSelectDay={setDayIndex}
            onEdit={() => setEditing(true)}
            onRegenerate={regenerate}
          />
        ) : null}
      </div>
    </div>
  );
}
