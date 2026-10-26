export const videoUrl = (query: string) =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;

export function beep(seconds = 2) {
  if (typeof AudioContext === 'undefined') return;
  const ctx = new AudioContext();
  const t = ctx.currentTime;
  const pulses = Math.max(1, Math.round(seconds / 0.5));
  for (let i = 0; i < pulses; i++) {
    const start = t + i * 0.5;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.value = 880;
    g.gain.setValueAtTime(0.3, start);
    g.gain.exponentialRampToValueAtTime(0.001, start + 0.4);
    o.connect(g).connect(ctx.destination);
    o.start(start);
    o.stop(start + 0.4);
  }
  window.setTimeout(() => void ctx.close(), (seconds + 1) * 1000);
}
