import { OFFLINE_SIZE_MB, OFFLINE_URLS } from '../data/tracks';

export type PromptState = 'ask' | 'downloading' | 'error' | 'hidden';

interface Props {
  state: PromptState;
  progress: [number, number];
  onDownload: () => void;
  onSkip: () => void;
}

export function MusicPrompt({ state, progress, onDownload, onSkip }: Props) {
  if (state === 'hidden') return null;
  const [done, total] = progress;

  return (
    <div className="modal-bg">
      <div className="modal" role="dialog" aria-label="Música offline">
        <h3>Música para entrenar</h3>
        {state === 'downloading' ? (
          <>
            <p className="desc">
              Descargando pistas… {done}/{total}
            </p>
            <div className="dl-progress">
              <span style={{ width: `${(done / Math.max(1, total)) * 100}%` }} />
            </div>
            <div className="btn-row">
              <button className="btn ghost" onClick={onSkip}>
                Omitir
              </button>
            </div>
          </>
        ) : state === 'error' ? (
          <>
            <p className="desc">
              No se pudieron descargar todas las pistas. Revisa tu conexión.
            </p>
            <div className="btn-row">
              <button className="btn" onClick={onDownload}>
                Reintentar
              </button>
              <button className="btn ghost" onClick={onSkip}>
                Omitir
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="desc">
              Descarga {OFFLINE_URLS.length} pistas libres (electrónica y rock,
              ~{OFFLINE_SIZE_MB} MB) para reproducirlas sin conexión.
            </p>
            <div className="btn-row">
              <button className="btn" onClick={onDownload}>
                Descargar
              </button>
              <button className="btn ghost" onClick={onSkip}>
                Omitir
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
