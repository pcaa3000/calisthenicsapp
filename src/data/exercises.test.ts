import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { EXERCISES } from './exercises';

const css = readFileSync(
  fileURLToPath(new URL('../styles.css', import.meta.url)),
  'utf8',
);
const byId = (id: string) => EXERCISES.find((e) => e.id === id)!;

describe('exercise animations', () => {
  it('every exercise anim key has a CSS rule defined', () => {
    for (const ex of EXERCISES) {
      expect(css, `missing .anim-${ex.anim} for ${ex.id}`).toContain(
        `.anim-${ex.anim}`,
      );
    }
  });

  it('push-up variants use distinct animations', () => {
    const variants = [
      'flexiones_inclinadas',
      'flexiones',
      'flexiones_abiertas',
      'flexiones_declinadas',
      'flexiones_diamante',
      'flexiones_arquero',
    ];
    const anims = new Set(variants.map((id) => byId(id).anim));
    // 'flexiones_pike' already had its own pose and is intentionally excluded
    expect(anims.size).toBe(variants.length);
  });

  it('plank variants use distinct animations', () => {
    const a = byId('plancha').anim;
    expect(byId('plancha_lateral').anim).not.toBe(a);
    expect(byId('plancha_toques_hombro').anim).not.toBe(a);
  });
});
