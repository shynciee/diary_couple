export type ParsedSong = {
  songType: 'youtube' | 'spotify' | null
  embedId: string | null
}

/** Parse YouTube or Spotify track URL for embedding. */
export function parseSongUrl(url: string): ParsedSong {
  const trimmed = url.trim()
  if (!trimmed) return { songType: null, embedId: null }

  const yt =
    trimmed.match(
      /(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    ) ?? trimmed.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/)
  if (yt?.[1]) return { songType: 'youtube', embedId: yt[1] }

  const sp = trimmed.match(/open\.spotify\.com\/(?:[\w-]+\/)?track\/([a-zA-Z0-9]+)/)
  if (sp?.[1]) return { songType: 'spotify', embedId: sp[1] }

  return { songType: null, embedId: null }
}

export function youtubeEmbedSrc(videoId: string) {
  return `https://www.youtube.com/embed/${videoId}?autoplay=0&controls=1`
}

export function spotifyEmbedSrc(trackId: string) {
  return `https://open.spotify.com/embed/track/${trackId}`
}
