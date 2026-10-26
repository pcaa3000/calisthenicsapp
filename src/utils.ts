export const videoUrl = (query: string) =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;

export function beep() {
  if (typeof AudioContext === 'undefined') return;
  const ctx = new AudioContext();
  const t = ctx.currentTime;
  for (let i = 0; i < 3; i++) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.value = 880;
    g.gain.setValueAtTime(0.25, t + i * 0.25);
    g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.25 + 0.2);
    o.connect(g).connect(ctx.destination);
    o.start(t + i * 0.25);
    o.stop(t + i * 0.25 + 0.2);
  }
}
