import Masonry from 'react-masonry-css'
import type { MediaItem } from '../../types'
import { VideoPlayer } from './VideoPlayer'

const breakpoints = {
  default: 4,
  1024: 3,
  768: 2,
  0: 2,
}

export function MediaGrid({
  items,
  onPhotoClick,
}: {
  items: MediaItem[]
  onPhotoClick: (photoIndex: number) => void
}) {
  const ordered = [...items].sort((a, b) => a.order - b.order)
  const photos = ordered.filter((m) => m.type === 'photo')

  return (
    <Masonry
      breakpointCols={breakpoints}
      className="flex w-auto -ml-4"
      columnClassName="pl-4 bg-clip-padding"
    >
      {ordered.map((m) => {
        if (m.type === 'video') {
          return (
            <div key={m.id} className="mb-4">
              <VideoPlayer src={m.url} poster={m.thumbnailUrl} />
              {m.caption ? (
                <p className="mt-2 text-sm text-muted dark:text-cream/70">
                  {m.caption}
                </p>
              ) : null}
            </div>
          )
        }

        const idx = photos.findIndex((p) => p.id === m.id)
        return (
          <button
            key={m.id}
            type="button"
            className="mb-4 w-full overflow-hidden rounded-2xl border border-rose/15 bg-white/60 shadow-soft transition hover:brightness-[0.98] dark:border-white/10 dark:bg-white/5"
            onClick={() => onPhotoClick(Math.max(0, idx))}
          >
            <img
              src={m.url}
              alt={m.caption || 'photo'}
              className="h-auto w-full"
              loading="lazy"
            />
            {m.caption ? (
              <div className="px-3 py-2 text-left text-sm text-muted dark:text-cream/70">
                {m.caption}
              </div>
            ) : null}
          </button>
        )
      })}
    </Masonry>
  )
}

