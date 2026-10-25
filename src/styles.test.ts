import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const css = readFileSync(
  fileURLToPath(new URL('./styles.css', import.meta.url)),
  'utf8',
);

const keyframes = (name: string) => {
  const start = css.indexOf(`@keyframes ${name} {`);
  if (start === -1) return '';
  return css.slice(start, css.indexOf('\n}', start));
};

describe('figure animation quality', () => {
  it('alternating limb cycles interpolate instead of snapping between poses', () => {
    for (const name of [
      'kf-climb-a',
      'kf-climb-b',
      'kf-crawl-a',
      'kf-crawl-b',
      'kf-knees-a',
      'kf-knees-b',
      'kf-march-a',
      'kf-march-b',
      'kf-stepj-a',
      'kf-stepj-b',
    ]) {
      expect(keyframes(name), name).not.toContain('49%');
    }
  });

  it('jump keyframes include squash and stretch', () => {
    for (const name of ['kf-squatjump', 'kf-jack-body', 'kf-burpee']) {
      expect(keyframes(name), name).toContain('scale');
    }
  });

  it('airborne exercises animate the ground shadow', () => {
    for (const anim of ['squatjump', 'burpee', 'jack', 'skater']) {
      expect(css, anim).toContain(`.anim-${anim} .fig-shadow`);
    }
  });

  it('figure anims share a per-card phase offset', () => {
    expect(css).toContain('animation-delay: var(--dly');
  });
});
