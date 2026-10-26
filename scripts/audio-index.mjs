// Genera public/audio/index.json con los mp3 sueltos en public/audio/.
// Convención de nombre: "Artista - Titulo.mp3" (sin " - " → artista "Local").
// Corre automáticamente en predev/prebuild y vía /api/audio-rescan en dev;
// los mp3 están excluidos de git.
import { mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = fileURLToPath(new URL('../public/audio/', import.meta.url));

export function scanAudio() {
  mkdirSync(DIR, { recursive: true });
  const files = readdirSync(DIR)
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
  return { tracks };
}

export function writeIndex() {
  const data = scanAudio();
  writeFileSync(
    join(DIR, 'index.json'),
    JSON.stringify(data, null, 2) + '\n',
  );
  return data;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const d = writeIndex();
  console.log(`audio-index: ${d.tracks.length} pista(s) local(es)`);
}
