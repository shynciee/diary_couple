import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails'
import 'yet-another-react-lightbox/plugins/thumbnails.css'
import Captions from 'yet-another-react-lightbox/plugins/captions'
import 'yet-another-react-lightbox/plugins/captions.css'
import Download from 'yet-another-react-lightbox/plugins/download'
import Video from 'yet-another-react-lightbox/plugins/video'
import { useEffect, useState } from 'react'

export type LightboxSlide = {
  src: string
  type?: 'image' | 'video'
  title?: string
  description?: string
  poster?: string
  sources?: { src: string; type: string }[]
}

export function LightboxViewer({
  open,
  index,
  slides,
  onClose,
}: {
  open: boolean
  index: number
  slides: LightboxSlide[]
  onClose: () => void
}) {
  const [current, setCurrent] = useState(index)

  useEffect(() => {
    if (open) setCurrent(index)
  }, [open, index])

  return (
    <Lightbox
      open={open}
      close={onClose}
      index={index}
      slides={slides as any}
      plugins={[Zoom, Thumbnails, Captions, Download, Video]}
      carousel={{ finite: false }}
      controller={{ closeOnBackdropClick: true, closeOnPullDown: true }}
      on={{ view: ({ index: i }) => setCurrent(i) }}
      render={{
        slideFooter: ({ slide }) => (
          <div className="px-4 pb-3 pt-2 text-center text-sm text-white/80">
            <div className="text-white/70">
              {current + 1} / {slides.length}
            </div>
            {(slide as any).description ? (
              <div className="mt-1 text-white">{(slide as any).description}</div>
            ) : null}
          </div>
        ),
      }}
    />
  )
}

