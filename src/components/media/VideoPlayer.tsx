import { useEffect, useMemo, useRef, useState } from 'react'
import { Pause, Play, Volume2, VolumeX } from 'lucide-react'

function formatTime(s: number) {
  if (!Number.isFinite(s) || s < 0) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

export function VideoPlayer({
  src,
  poster,
}: {
  src: string
  poster?: string
}) {
  const ref = useRef<HTMLVideoElement | null>(null)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(true)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    const v = ref.current
    if (!v) return
    const onTime = () => {
      setProgress(v.currentTime || 0)
      setDuration(v.duration || 0)
    }
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    v.addEventListener('timeupdate', onTime)
    v.addEventListener('loadedmetadata', onTime)
    v.addEventListener('play', onPlay)
    v.addEventListener('pause', onPause)
    return () => {
      v.removeEventListener('timeupdate', onTime)
      v.removeEventListener('loadedmetadata', onTime)
      v.removeEventListener('play', onPlay)
      v.removeEventListener('pause', onPause)
    }
  }, [])

  const pct = useMemo(() => (duration ? (progress / duration) * 100 : 0), [progress, duration])

  const togglePlay = () => {
    const v = ref.current
    if (!v) return
    if (v.paused) void v.play()
    else v.pause()
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-rose/15 bg-black shadow-soft dark:border-white/10">
      <video
        ref={ref}
        src={src}
        poster={poster}
        className="h-full w-full"
        playsInline
        muted={muted}
        controls={false}
      />
      <div className="flex items-center gap-3 bg-ink/70 px-3 py-2 text-cream">
        <button
          type="button"
          onClick={togglePlay}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/15"
          aria-label={playing ? 'Pause' : 'Play'}
        >
          {playing ? <Pause size={18} /> : <Play size={18} />}
        </button>

        <button
          type="button"
          onClick={() => setMuted((m) => !m)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/15"
          aria-label={muted ? 'Unmute' : 'Mute'}
        >
          {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>

        <div className="flex-1">
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full bg-gold" style={{ width: `${pct}%` }} />
          </div>
          <div className="mt-1 flex justify-between text-xs text-white/70">
            <span>{formatTime(progress)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <input
          type="range"
          min={0}
          max={Math.max(0, duration)}
          step={0.1}
          value={progress}
          onChange={(e) => {
            const v = ref.current
            if (!v) return
            const t = Number(e.target.value)
            v.currentTime = t
            setProgress(t)
          }}
          className="hidden w-44 md:block"
        />
      </div>
    </div>
  )
}

