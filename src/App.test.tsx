import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import App from './App';
import { WeeklyPlanView } from './components/WeeklyPlan';
import { generateRoutine } from './engine/generateRoutine';
import type { Profile } from './types';

const profile: Profile = {
  age: 30,
  weightKg: 75,
  daysPerWeek: 3,
  minutesPerSession: 30,
  bodyType: 'medio',
  goal: 'atletico',
  focuses: ['pecho'],
  level: 'intermedio',
};

describe('App', () => {
  it('renders the profile form when there is no saved profile', () => {
    const html = renderToString(<App />);
    expect(html).toContain('Calistenia Militar');
    expect(html).toContain('¿Cuál es tu edad?');
    expect(html).toContain('18 - 29');
  });

  it('renders day cards as keyboard-accessible buttons', () => {
    const plan = generateRoutine(profile, 1);
    const html = renderToString(
      <WeeklyPlanView
        plan={plan}
        onSelectDay={() => {}}
        onEdit={() => {}}
        onRegenerate={() => {}}
      />,
    );
    expect(html).toMatch(/<button[^>]*day-card/);
  });
});
