// Genera public/audio/index.json con los mp3 sueltos en public/audio/.
// Convención de nombre: "Artista - Titulo.mp3" (sin " - " → artista "Local").
// Corre automáticamente en predev/prebuild; los mp3 están excluidos de git.
import { mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = fileURLToPath(new URL('../public/audio/', import.meta.url));
mkdirSync(dir, { recursive: true });

const files = readdirSync(dir)
  .filter((f) => f.toLowerCase().endsWith('.mp3'))
  .sort((a, b) => a.localeCompare(b, 'es'));

const tracks = files.map((f) => {
  const base = f.replace(/\.mp3$/i, '');
  const [artist, title] = base.includes(' - ')
    ? base.split(' - ', 2)
    : ['Local', base];
  return {
    title: title.trim(),
    artist: artist.trim(),
    url: `/audio/${encodeURIComponent(f)}`,
  };
});

writeFileSync(
  join(dir, 'index.json'),
  JSON.stringify({ tracks }, null, 2) + '\n',
);
console.log(`audio-index: ${tracks.length} pista(s) local(es)`);
