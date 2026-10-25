import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import App from './App';

describe('App', () => {
  it('renders the profile form when there is no saved profile', () => {
    const html = renderToString(<App />);
    expect(html).toContain('Calistenia Militar');
    expect(html).toContain('¿Cuál es tu edad?');
    expect(html).toContain('18 - 29');
  });
});
