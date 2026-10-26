import type { Track } from '../data/tracks';
import type { MusicPlayer } from '../hooks/useMusicPlayer';

interface Props {
  player: MusicPlayer;
  tracks: Track[];
  downloaded?: boolean;
  onSync?: () => void;
}

export function MusicSection({
  player,
  tracks,
  downloaded = false,
  onSync,
}: Props) {
  return (
    <section className="music-section">
      <div className="music-head">
        <p className="block-label">Música libre para entrenar</p>
        {onSync && (
          <button
            className="mb-btn"
            onClick={onSync}
            aria-label="Sincronizar mp3 locales"
            title="Sincronizar mp3 de public/audio"
          >
            ↻
          </button>
        )}
      </div>
      <div className="music-list">
        {tracks.map((t, i) => {
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
              {t.local ? (
                <span className="dl-badge">local</span>
              ) : (
                t.dl &&
                downloaded && <span className="dl-badge">⤓ offline</span>
              )}
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

export function MusicBar({ player, tracks }: Props) {
  if (player.index === null) return null;
  const t = tracks[player.index];
  if (!t) return null;
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
