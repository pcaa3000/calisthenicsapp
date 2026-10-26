import { TRACKS } from '../data/tracks';
import type { MusicPlayer } from '../hooks/useMusicPlayer';

interface Props {
  player: MusicPlayer;
  downloaded?: boolean;
}

export function MusicSection({ player, downloaded = false }: Props) {
  return (
    <section className="music-section">
      <p className="block-label">Música libre para entrenar</p>
      <div className="music-list">
        {TRACKS.map((t, i) => {
          const active = player.index === i;
          return (
            <button
              key={t.url}
              className={`track-row${active ? ' on' : ''}`}
              onClick={() =>
                active ? player.toggle() : player.select(i)
              }
            >
              <span className="track-ico">
                {active && player.playing ? '❚❚' : '▶'}
              </span>
              <span className="track-name">{t.title}</span>
              {t.dl && downloaded && <span className="dl-badge">⤓ offline</span>}
              <span className="track-artist">{t.artist}</span>
            </button>
          );
        })}
      </div>
      <p className="music-credit">
        Kevin MacLeod (incompetech.com) · CC BY 4.0 · Mixkit (mixkit.co) ·
        Licencia gratuita
      </p>
    </section>
  );
}

export function MusicBar({ player }: Props) {
  if (player.index === null) return null;
  const t = TRACKS[player.index];
  return (
    <div className="music-bar" role="region" aria-label="Reproductor">
      <div className="music-bar-inner">
        <button className="mb-btn" onClick={player.prev} aria-label="Anterior">
          ⏮
        </button>
        <button
          className="mb-btn mb-play"
          onClick={player.toggle}
          aria-label={player.playing ? 'Pausar' : 'Reproducir'}
        >
          {player.playing ? '❚❚' : '▶'}
        </button>
        <button className="mb-btn" onClick={player.next} aria-label="Siguiente">
          ⏭
        </button>
        <span className="mb-title">
          {t.title} <span className="mb-artist">· {t.artist}</span>
        </span>
        <button className="mb-btn mb-close" onClick={player.stop} aria-label="Cerrar">
          ✕
        </button>
      </div>
    </div>
  );
}
