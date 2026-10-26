import { useEffect, useState } from 'react';
import { cachedCount, clearAll, downloadAll } from './audio/offlineStore';
import { DayRoutine } from './components/DayRoutine';
import { MusicBar, MusicSection } from './components/MusicPlayer';
import { MusicPrompt, type PromptState } from './components/MusicPrompt';
import { ProfileForm } from './components/ProfileForm';
import { TimerBar } from './components/TimerBar';
import { WeeklyPlanView } from './components/WeeklyPlan';
import { OFFLINE_URLS, TRACKS, type Track } from './data/tracks';
import { generateMonth } from './engine/generateRoutine';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useMusicPlayer } from './hooks/useMusicPlayer';
import { BEEP_SECONDS, useWorkoutTimer } from './hooks/useWorkoutTimer';
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
  const [localTracks, setLocalTracks] = useState<Track[]>([]);
  const allTracks = [...TRACKS, ...localTracks];
  const player = useMusicPlayer(allTracks);

  const [dlPref, setDlPref] = useLocalStorage<'ask' | 'yes' | 'no'>(
    'cm:musicdl:v1',
    'ask',
  );
  const [dlDone, setDlDone] = useState(false);
  const [dlPrompt, setDlPrompt] = useState<PromptState>('hidden');
  const [dlProgress, setDlProgress] = useState<[number, number]>([0, 0]);

  useEffect(() => {
    fetch('/audio/index.json')
      .then((r) => (r.ok ? r.json() : null))
      .then((j: { tracks?: Track[] } | null) => {
        if (j?.tracks) {
          setLocalTracks(j.tracks.map((t) => ({ ...t, local: true })));
        }
      })
      .catch(() => setLocalTracks([]));
  }, []);

  const plan = month
    ? month.weeks[Math.min(weekIndex, month.weeks.length - 1)]
    : null;
  const day = plan?.days.find((d) => d.dayIndex === dayIndex) ?? null;
  const timer = useWorkoutTimer(day?.estimatedMinutes ?? 30, () =>
    player.duck(BEEP_SECONDS + 0.5),
  );

  const handleSubmit = (p: Profile) => {
    setProfile(p);
    setMonth(generateMonth(p));
    setWeekIndex(0);
    setDone({});
    setEditing(false);
    setDayIndex(null);
    if (p.musicDownload !== undefined) {
      if (!p.musicDownload) void clearAll();
      setDlPref(p.musicDownload ? 'yes' : 'no');
    }
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
  const screenKey = showForm ? 'form' : day ? `day-${day.dayIndex}` : 'plan';

  useEffect(() => {
    if (showForm || dlDone) return;
    let cancelled = false;
    void (async () => {
      const n = await cachedCount(OFFLINE_URLS);
      if (cancelled) return;
      if (n === OFFLINE_URLS.length) {
        setDlDone(true);
        return;
      }
      if (dlPref === 'ask') {
        setDlPrompt('ask');
      } else if (dlPref === 'yes') {
        setDlPrompt('downloading');
        const ok = await downloadAll(OFFLINE_URLS, (d, t) => {
          if (!cancelled) setDlProgress([d, t]);
        });
        if (cancelled) return;
        if (ok === OFFLINE_URLS.length) {
          setDlDone(true);
          setDlPrompt('hidden');
        } else {
          setDlPrompt('error');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [showForm, dlPref, dlDone]);
  const dockRows = (player.index !== null ? 1 : 0) + (timer.active ? 1 : 0);

  return (
    <div className={`app${dockRows ? ` pad-dock-${dockRows}` : ''}`}>
      <header className="app-header">
        <h1>Calistenia Militar</h1>
        <span className="tag">Rutinas en casa · sin gimnasio</span>
        {!showForm && !timer.active && (
          <button
            className="btn ghost small app-timer-btn"
            onClick={() => timer.activate(day)}
          >
            ⏱ Timer
          </button>
        )}
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
          <>
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
            <MusicSection
              player={player}
              tracks={allTracks}
              downloaded={dlDone}
            />
          </>
        ) : null}
      </div>
      {!showForm && (
        <MusicPrompt
          state={dlPrompt}
          progress={dlProgress}
          onDownload={() => setDlPref('yes')}
          onSkip={() => {
            setDlPref('no');
            setDlPrompt('hidden');
          }}
        />
      )}
      {dockRows > 0 && (
        <div className="bottom-dock">
          <TimerBar timer={timer} />
          <MusicBar player={player} tracks={allTracks} />
        </div>
      )}
    </div>
  );
}
