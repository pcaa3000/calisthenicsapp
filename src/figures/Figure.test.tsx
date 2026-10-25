import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Figure } from './Figure';

describe('Figure', () => {
  it('renders a ground shadow under the figure', () => {
    const html = renderToString(<Figure anim="squatjump" />);
    expect(html).toContain('fig-shadow');
  });
});
