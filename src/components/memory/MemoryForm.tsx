import { useEffect, useMemo, useState } from 'react'
import { Timestamp, doc } from 'firebase/firestore'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import type { MoodKey } from '../../types'
import { MOODS } from '../../types'
import { useAuth } from '../../hooks/useAuth'
import { useCouple } from '../../hooks/useCouple'
import { db } from '../../lib/firebase'
import { parseSongUrl } from '../../lib/song'
import { serverNow } from '../../lib/firestore'
import {
  LocationSearchField,
  type LocationFieldValue,
} from '../location/LocationSearchField'
import { UploadZone } from '../media/UploadZone'
import { useUpload } from '../../hooks/useUpload'
import { createMemory } from '../../hooks/useMemories'
import { SongFields } from './SongFields'

function toMoodKey(v: string): MoodKey {
  return (MOODS.find((m) => m.key === v)?.key ?? 'romantic') as MoodKey
}

export function MemoryForm() {
  const { user } = useAuth()
  const { couple, loading: coupleLoading } = useCouple()
  const navigate = useNavigate()

  const [memoryId, setMemoryId] = useState<string>('')
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [loc, setLoc] = useState<LocationFieldValue>({ location: '' })
  const [description, setDescription] = useState('')
  const [mood, setMood] = useState<MoodKey>('romantic')
  const [tagsText, setTagsText] = useState('')
  const [songUrl, setSongUrl] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const id = doc(db, 'memories', crypto.randomUUID()).id
    setMemoryId(id)
  }, [])

  const coupleId = couple?.id ?? ''
  const uploader = useUpload({
    coupleId: coupleId || 'unknown',
    memoryId: memoryId || 'unknown',
  })

  const tags = useMemo(
    () =>
      tagsText
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    [tagsText],
  )

  const canSubmit =
    Boolean(user) &&
    Boolean(coupleId) &&
    Boolean(memoryId) &&
    Boolean(title.trim()) &&
    uploader.items.length > 0 &&
    uploader.allDone &&
    !busy &&
    !coupleLoading

  const onSubmit = async () => {
    if (!user) return
    if (!coupleId) return
    if (!memoryId) return
    if (!uploader.allDone) {
      toast.error('Vui lòng chờ upload hoàn tất')
      return
    }
    try {
      setBusy(true)
      const parsedSong = parseSongUrl(songUrl)
      const payload = {
        coupleId,
        title: title.trim(),
        date: Timestamp.fromDate(new Date(date)),
        location: loc.location.trim(),
        locationName: loc.locationName ?? null,
        lat: loc.lat ?? null,
        lng: loc.lng ?? null,
        description: description.trim(),
        mood,
        mediaItems: uploader.toMediaItems(),
        tags,
        songUrl: songUrl.trim(),
        songType: parsedSong.embedId ? parsedSong.songType : null,
        createdBy: user.uid,
        createdAt: serverNow(),
        updatedAt: serverNow(),
      }

      console.log('[MemoryForm] submit', {
        memoryId,
        coupleId,
        mediaCount: payload.mediaItems.length,
        firstMediaUrl: payload.mediaItems[0]?.url,
      })

      await createMemory({ memoryId, data: payload as any })
      toast.success('Đã lưu kỷ niệm')
      navigate(`/journal/${memoryId}`)
    } catch (e: unknown) {
      console.error(e)
      toast.error(e instanceof Error ? e.message : 'Không thể lưu kỷ niệm')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid gap-6">
      <section className="rounded-[28px] border border-rose/15 bg-white/70 p-6 shadow-soft dark:border-white/10 dark:bg-white/5">
        <h2 className="font-serif text-2xl">Thông tin kỷ niệm</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="grid gap-1.5 md:col-span-2">
            <span className="text-xs font-medium text-muted dark:text-cream/70">
              Tiêu đề
            </span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Một ngày thật đẹp…"
              className="w-full rounded-2xl border border-rose/15 bg-white/80 px-4 py-3 text-sm outline-none transition focus:border-rose/40 dark:border-white/10 dark:bg-white/5"
            />
          </label>

          <label className="grid gap-1.5">
            <span className="text-xs font-medium text-muted dark:text-cream/70">
              Ngày
            </span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-2xl border border-rose/15 bg-white/80 px-4 py-3 text-sm outline-none transition focus:border-rose/40 dark:border-white/10 dark:bg-white/5"
            />
          </label>

          <label className="grid gap-1.5">
            <span className="text-xs font-medium text-muted dark:text-cream/70">
              Cảm xúc
            </span>
            <select
              value={mood}
              onChange={(e) => setMood(toMoodKey(e.target.value))}
              className="w-full rounded-2xl border border-rose/15 bg-white/80 px-4 py-3 text-sm outline-none transition focus:border-rose/40 dark:border-white/10 dark:bg-white/5"
            >
              {MOODS.map((m) => (
                <option key={m.key} value={m.key}>
                  {m.emoji} {m.label}
                </option>
              ))}
            </select>
          </label>

          <LocationSearchField
            value={loc}
            onChange={setLoc}
            disabled={busy}
          />

          <label className="grid gap-1.5 md:col-span-2">
            <span className="text-xs font-medium text-muted dark:text-cream/70">
              Mô tả
            </span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Viết vài dòng để sau này mình đọc lại…"
              className="w-full resize-none rounded-2xl border border-rose/15 bg-white/80 px-4 py-3 text-sm outline-none transition focus:border-rose/40 dark:border-white/10 dark:bg-white/5"
            />
          </label>

          <SongFields songUrl={songUrl} onSongUrlChange={setSongUrl} disabled={busy} />

          <label className="grid gap-1.5 md:col-span-2">
            <span className="text-xs font-medium text-muted dark:text-cream/70">
              Tags (phân cách bằng dấu phẩy)
            </span>
            <input
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
              placeholder="đà lạt, kỷ niệm, 2026"
              className="w-full rounded-2xl border border-rose/15 bg-white/80 px-4 py-3 text-sm outline-none transition focus:border-rose/40 dark:border-white/10 dark:bg-white/5"
            />
          </label>
        </div>
      </section>

      {memoryId && coupleId ? (
        <UploadZone
          items={uploader.items}
          onAddFiles={uploader.addFiles}
          onRemove={uploader.removeItem}
          onCancel={uploader.cancelUpload}
          onReorder={uploader.reorder}
          onCaption={uploader.setCaption}
        />
      ) : (
        <section className="rounded-[28px] border border-rose/15 bg-white/70 p-6 shadow-soft dark:border-white/10 dark:bg-white/5">
          <div className="h-28 animate-pulse rounded-2xl bg-rose-light/50 dark:bg-white/5" />
        </section>
      )}

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          disabled={!canSubmit}
          onClick={onSubmit}
          className="rounded-full bg-rose px-7 py-3 text-sm font-medium text-cream shadow-soft transition hover:brightness-95 disabled:opacity-60"
        >
          Lưu kỷ niệm
        </button>
      </div>
    </div>
  )
}

