import { parseSongUrl, spotifyEmbedSrc, youtubeEmbedSrc } from '../../lib/song'

export function SongEmbed({ songUrl }: { songUrl: string }) {
  const parsed = parseSongUrl(songUrl)
  if (!parsed.embedId || !parsed.songType) return null

  if (parsed.songType === 'youtube') {
    return (
      <div className="overflow-hidden rounded-2xl border border-rose/15 bg-black/5">
        <iframe
          title="YouTube"
          src={youtubeEmbedSrc(parsed.embedId)}
          className="h-[200px] w-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-rose/15 bg-black/5">
      <iframe
        title="Spotify"
        src={spotifyEmbedSrc(parsed.embedId)}
        className="h-[152px] w-full border-0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
      />
    </div>
  )
}
