import { useEffect, useRef, useState } from 'react';
import { resolveUrl } from '../audio/offlineStore';
import { TRACKS } from '../data/tracks';

export interface MusicPlayer {
  index: number | null;
  playing: boolean;
  select: (i: number) => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  stop: () => void;
  duck: (seconds: number) => void;
}

export function useMusicPlayer(): MusicPlayer {
  const ref = useRef<HTMLAudioElement | null>(null);
  const [index, setIndex] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);

  const audio = () => (ref.current ??= new Audio());

  const selToken = useRef(0);
  const select = (i: number) => {
    const t = TRACKS[i];
    const my = ++selToken.current;
    void (async () => {
      const src = t.dl ? await resolveUrl(t.url) : t.url;
      if (my !== selToken.current) return;
      const a = audio();
      a.src = src;
      void a.play().catch(() => setPlaying(false));
      setIndex(i);
      setPlaying(true);
    })();
  };

  const toggle = () => {
    if (index === null) {
      select(0);
      return;
    }
    const a = audio();
    if (playing) {
      a.pause();
      setPlaying(false);
    } else {
      void a.play().catch(() => setPlaying(false));
      setPlaying(true);
    }
  };

  const next = () => select(((index ?? -1) + 1) % TRACKS.length);
  const prev = () => select(((index ?? 1) - 1 + TRACKS.length) % TRACKS.length);

  const stop = () => {
    ref.current?.pause();
    setPlaying(false);
    setIndex(null);
  };

  const savedVol = useRef<number | null>(null);
  const duckTimer = useRef<number | null>(null);
  const duck = (seconds: number) => {
    const a = ref.current;
    if (!a || a.paused) return;
    if (duckTimer.current !== null) clearTimeout(duckTimer.current);
    if (savedVol.current === null) savedVol.current = a.volume;
    a.volume = Math.min(savedVol.current, 0.18);
    duckTimer.current = window.setTimeout(() => {
      a.volume = savedVol.current ?? 1;
      savedVol.current = null;
      duckTimer.current = null;
    }, seconds * 1000);
  };

  const nextRef = useRef(next);
  useEffect(() => {
    nextRef.current = next;
  });

  useEffect(() => {
    const a = audio();
    const onEnd = () => nextRef.current();
    a.addEventListener('ended', onEnd);
    return () => a.removeEventListener('ended', onEnd);
  }, []);

  useEffect(() => () => ref.current?.pause(), []);

  return { index, playing, select, toggle, next, prev, stop, duck };
}
