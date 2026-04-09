import {
  parseSongUrl,
  spotifyEmbedSrc,
  youtubeEmbedSrc,
} from '../../lib/song'

export function SongFields({
  songUrl,
  onSongUrlChange,
  disabled,
}: {
  songUrl: string
  onSongUrlChange: (v: string) => void
  disabled?: boolean
}) {
  const parsed = parseSongUrl(songUrl)
  const showInvalid = Boolean(songUrl.trim()) && !parsed.embedId

  return (
    <div className="grid gap-3 md:col-span-2">
      <h3 className="text-sm font-medium text-ink dark:text-cream">Bài hát</h3>
      <p className="text-xs text-muted dark:text-cream/60">
        Dán link YouTube hoặc Spotify (một bài hát).
      </p>
      <input
        value={songUrl}
        disabled={disabled}
        onChange={(e) => onSongUrlChange(e.target.value)}
        placeholder="https://www.youtube.com/watch?v=… hoặc https://open.spotify.com/track/…"
        className="w-full rounded-2xl border border-rose/15 bg-white/80 px-4 py-3 text-sm outline-none transition focus:border-rose/40 dark:border-white/10 dark:bg-white/5"
      />
      {showInvalid ? (
        <p className="text-sm text-rose">URL không hợp lệ</p>
      ) : null}
      {parsed.embedId && parsed.songType === 'youtube' ? (
        <div className="overflow-hidden rounded-2xl border border-rose/15">
          <iframe
            title="YouTube preview"
            src={youtubeEmbedSrc(parsed.embedId)}
            className="h-[200px] w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      ) : null}
      {parsed.embedId && parsed.songType === 'spotify' ? (
        <div className="overflow-hidden rounded-2xl border border-rose/15">
          <iframe
            title="Spotify preview"
            src={spotifyEmbedSrc(parsed.embedId)}
            className="h-[152px] w-full border-0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          />
        </div>
      ) : null}
    </div>
  )
}
