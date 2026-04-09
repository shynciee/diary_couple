import { Timestamp, deleteDoc, doc, updateDoc } from 'firebase/firestore'
import { Pencil, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate, useParams } from 'react-router-dom'
import { LightboxViewer } from '../components/media/LightboxViewer'
import { MediaGrid } from '../components/media/MediaGrid'
import { useMemory } from '../hooks/useMemories'
import { db } from '../lib/firebase'
import { formatViFullDate } from '../lib/utils'
import { MOODS, type MoodKey } from '../types'

export default function MemoryDetail() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { memory, loading } = useMemory(id)
  const [edit, setEdit] = useState(false)
  const [busy, setBusy] = useState(false)

  const ordered = useMemo(
    () => (memory ? [...memory.mediaItems].sort((a, b) => a.order - b.order) : []),
    [memory],
  )
  const cover = ordered[0]
  const mood = MOODS.find((m) => m.key === memory?.mood)

  const photoSlides = useMemo(() => {
    const photos = ordered.filter((m) => m.type === 'photo')
    return photos.map((p) => ({
      src: p.url,
      type: 'image' as const,
      description: p.caption || '',
    }))
  }, [ordered])

  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [moodKey, setMoodKey] = useState<MoodKey>('romantic')

  const enterEdit = () => {
    if (!memory) return
    setTitle(memory.title)
    setDate(memory.date.toDate().toISOString().slice(0, 10))
    setLocation(memory.location)
    setDescription(memory.description)
    setMoodKey(memory.mood)
    setEdit(true)
  }

  const saveEdit = async () => {
    if (!memory) return
    try {
      setBusy(true)
      await updateDoc(doc(db, 'memories', memory.id), {
        title: title.trim(),
        date: Timestamp.fromDate(new Date(date)),
        location: location.trim(),
        description: description.trim(),
        mood: moodKey,
        updatedAt: Timestamp.now(),
      })
      toast.success('Đã lưu thay đổi')
      setEdit(false)
    } catch (e) {
      console.error(e)
      toast.error('Không thể lưu')
    } finally {
      setBusy(false)
    }
  }

  const onDelete = async () => {
    if (!memory) return
    const ok = window.confirm('Xoá kỷ niệm này? Thao tác không thể hoàn tác.')
    if (!ok) return
    try {
      setBusy(true)
      await deleteDoc(doc(db, 'memories', memory.id))
      toast.success('Đã xoá')
      navigate('/journal')
    } catch {
      toast.error('Không thể xoá')
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="aspect-video animate-pulse rounded-[28px] bg-rose-light/50 dark:bg-white/5" />
        <div className="mt-6 h-8 w-2/3 animate-pulse rounded bg-rose-light/50 dark:bg-white/5" />
        <div className="mt-3 h-4 w-1/2 animate-pulse rounded bg-rose-light/50 dark:bg-white/5" />
      </main>
    )
  }

  if (!memory) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="font-serif text-4xl tracking-tight">Không tìm thấy</h1>
        <p className="mt-2 text-muted dark:text-cream/70">
          Kỷ niệm này có thể đã bị xoá.
        </p>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="overflow-hidden rounded-[28px] border border-rose/15 bg-white/70 shadow-soft dark:border-white/10 dark:bg-white/5">
        <div className="relative aspect-video bg-cream/60 dark:bg-white/5">
          {cover ? (
            cover.type === 'photo' ? (
              <img src={cover.url} alt={memory.title} className="h-full w-full object-cover" />
            ) : (
              <video
                src={cover.url}
                className="h-full w-full object-cover"
                autoPlay
                muted
                loop
                playsInline
              />
            )
          ) : null}
          <div className="absolute left-4 top-4 rounded-full bg-cream/80 px-3 py-1 text-xs text-ink shadow-soft dark:bg-black/35 dark:text-cream">
            {mood?.emoji} {mood?.label}
          </div>
        </div>

        <div className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-muted dark:text-cream/60">
                {formatViFullDate(memory.date)}
              </p>
              {edit ? (
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-rose/15 bg-white/70 px-4 py-3 font-serif text-2xl outline-none dark:border-white/10 dark:bg-white/5"
                />
              ) : (
                <h1 className="mt-2 font-serif text-4xl tracking-tight">
                  {memory.title}
                </h1>
              )}
              {edit ? (
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="rounded-2xl border border-rose/15 bg-white/70 px-4 py-3 text-sm outline-none dark:border-white/10 dark:bg-white/5"
                  />
                  <select
                    value={moodKey}
                    onChange={(e) => setMoodKey(e.target.value as MoodKey)}
                    className="rounded-2xl border border-rose/15 bg-white/70 px-4 py-3 text-sm outline-none dark:border-white/10 dark:bg-white/5"
                  >
                    {MOODS.map((m) => (
                      <option key={m.key} value={m.key}>
                        {m.emoji} {m.label}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}
            </div>

            <div className="flex items-center gap-2">
              {edit ? (
                <>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={saveEdit}
                    className="rounded-full bg-rose px-5 py-2.5 text-sm font-medium text-cream shadow-soft transition hover:brightness-95 disabled:opacity-60"
                  >
                    Lưu
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => setEdit(false)}
                    className="rounded-full border border-rose/25 bg-white/60 px-5 py-2.5 text-sm font-medium text-ink transition hover:bg-white disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-cream dark:hover:bg-white/10"
                  >
                    Huỷ
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={enterEdit}
                    className="inline-flex items-center gap-2 rounded-full border border-rose/25 bg-white/60 px-5 py-2.5 text-sm font-medium text-ink transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-cream dark:hover:bg-white/10"
                  >
                    <Pencil size={16} />
                    Sửa
                  </button>
                  <button
                    type="button"
                    onClick={onDelete}
                    className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-cream transition hover:brightness-95"
                  >
                    <Trash2 size={16} />
                    Xoá
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="mt-4">
            {edit ? (
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Địa điểm"
                className="w-full rounded-2xl border border-rose/15 bg-white/70 px-4 py-3 text-sm outline-none dark:border-white/10 dark:bg-white/5"
              />
            ) : memory.location ? (
              <p className="text-sm text-muted dark:text-cream/70">
                {memory.location}
              </p>
            ) : null}
          </div>

          <div className="mt-4">
            {edit ? (
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full resize-none rounded-2xl border border-rose/15 bg-white/70 px-4 py-3 text-sm outline-none dark:border-white/10 dark:bg-white/5"
              />
            ) : memory.description ? (
              <p className="prose-editorial text-muted dark:text-cream/70">
                {memory.description}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <MediaGrid
          items={memory.mediaItems}
          onPhotoClick={(photoIndex) => {
            setLightboxIndex(photoIndex)
            setLightboxOpen(true)
          }}
        />
      </div>

      <LightboxViewer
        open={lightboxOpen}
        index={lightboxIndex}
        slides={photoSlides}
        onClose={() => setLightboxOpen(false)}
      />
    </main>
  )
}

