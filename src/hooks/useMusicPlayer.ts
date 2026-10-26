import { useEffect, useRef, useState } from 'react';
import { TRACKS } from '../data/tracks';

export interface MusicPlayer {
  index: number | null;
  playing: boolean;
  select: (i: number) => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  stop: () => void;
}

export function useMusicPlayer(): MusicPlayer {
  const ref = useRef<HTMLAudioElement | null>(null);
  const [index, setIndex] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);

  const audio = () => (ref.current ??= new Audio());

  const select = (i: number) => {
    const a = audio();
    a.src = TRACKS[i].url;
    void a.play().catch(() => setPlaying(false));
    setIndex(i);
    setPlaying(true);
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

  return { index, playing, select, toggle, next, prev, stop };
}
