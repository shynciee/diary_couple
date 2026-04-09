import L from 'leaflet'
import { Filter, MapPin } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import { useCouple } from '../hooks/useCouple'
import { useCoupleMemories } from '../hooks/useCoupleMemories'
import { formatViFullDate } from '../lib/utils'
import { MOODS, type Memory, type MoodKey } from '../types'

const HEART_ICON = L.divIcon({
  className: 'leaflet-heart-marker',
  html: `<div style="width:40px;height:40px;display:flex;align-items:center;justify-content:center;transform:translateY(-4px)"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="34" height="34" fill="#C1506A" stroke="#FAF6F1" stroke-width="1.2"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg></div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 36],
  popupAnchor: [0, -32],
})

function coverThumb(m: Memory & { id: string }) {
  const ordered = [...(m.mediaItems ?? [])].sort((a, b) => a.order - b.order)
  const cover = (m.coverMediaId
    ? ordered.find((x) => x.id === m.coverMediaId)
    : undefined) ?? ordered[0]
  if (!cover) return null
  if (cover.type === 'photo') return cover.url
  return cover.thumbnailUrl || cover.url
}

function memoryYear(m: Memory & { id: string }) {
  return m.date.toDate().getFullYear()
}

function MapFit({ points }: { points: [number, number][] }) {
  const map = useMap()
  useEffect(() => {
    if (points.length === 0) {
      map.setView([16.2, 106.8], 5.2)
      return
    }
    if (points.length === 1) {
      const p = points[0]!
      map.setView(p, 12)
      return
    }
    const b = L.latLngBounds(points.map((pt) => L.latLng(pt[0], pt[1])))
    map.fitBounds(b, { padding: [52, 52], maxZoom: 14 })
  }, [map, points])
  return null
}

export default function MemoryMap() {
  const { couple } = useCouple()
  const coupleId = couple?.id ?? ''
  const { memories, loading } = useCoupleMemories(coupleId)

  const [q, setQ] = useState('')
  const [mood, setMood] = useState<'all' | MoodKey>('all')
  const [year, setYear] = useState<'all' | number>('all')

  const years = useMemo(() => {
    const ys = new Set<number>()
    for (const m of memories) ys.add(memoryYear(m))
    return [...ys].sort((a, b) => b - a)
  }, [memories])

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase()
    return memories.filter((m) => {
      if (m.lat == null || m.lng == null) return false
      if (Number.isNaN(m.lat) || Number.isNaN(m.lng)) return false
      if (mood !== 'all' && m.mood !== mood) return false
      if (year !== 'all' && memoryYear(m) !== year) return false
      if (qq && !m.title.toLowerCase().includes(qq)) return false
      return true
    })
  }, [memories, mood, year, q])

  const points = useMemo(
    () => filtered.map((m) => [m.lat!, m.lng!] as [number, number]),
    [filtered],
  )

  const totalPins = filtered.length

  return (
    <main className="relative h-[calc(100dvh-56px)] w-full overflow-hidden bg-[#E8DDD6] dark:bg-[#140C0C]">
      {loading ? (
        <div className="absolute inset-0 z-[500] grid place-items-center bg-cream/80 text-ink backdrop-blur dark:bg-[#140C0C]/80 dark:text-cream">
          <p className="font-serif text-xl">Đang tải bản đồ…</p>
        </div>
      ) : null}

      {!coupleId ? (
        <div className="absolute inset-0 z-[500] grid place-items-center px-4 text-center">
          <p className="max-w-md text-muted dark:text-cream/70">
            Bạn cần ghép cặp để xem bản đồ kỷ niệm.
          </p>
        </div>
      ) : null}

      <div className="pointer-events-none absolute left-3 top-3 z-[800] flex max-w-[min(100%-24px,380px)] flex-col gap-2 rounded-2xl border border-rose/20 bg-cream/95 p-3 shadow-soft backdrop-blur dark:border-white/10 dark:bg-[#1E1212]/95 md:left-4 md:top-4">
        <div className="pointer-events-auto flex items-center gap-2 text-sm font-medium text-ink dark:text-cream">
          <Filter size={16} className="text-rose" />
          Lọc kỷ niệm
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Tìm theo tiêu đề…"
          className="pointer-events-auto w-full rounded-xl border border-rose/15 bg-white/90 px-3 py-2 text-sm outline-none dark:border-white/10 dark:bg-white/5"
        />
        <div className="pointer-events-auto grid gap-2 sm:grid-cols-2">
          <label className="grid gap-1 text-xs text-muted dark:text-cream/60">
            Cảm xúc
            <select
              value={mood}
              onChange={(e) => setMood(e.target.value as 'all' | MoodKey)}
              className="rounded-xl border border-rose/15 bg-white/90 px-2 py-2 text-sm text-ink outline-none dark:border-white/10 dark:bg-white/5 dark:text-cream"
            >
              <option value="all">Tất cả</option>
              {MOODS.map((m) => (
                <option key={m.key} value={m.key}>
                  {m.emoji} {m.label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-xs text-muted dark:text-cream/60">
            Năm
            <select
              value={year === 'all' ? 'all' : String(year)}
              onChange={(e) =>
                setYear(e.target.value === 'all' ? 'all' : Number(e.target.value))
              }
              className="rounded-xl border border-rose/15 bg-white/90 px-2 py-2 text-sm text-ink outline-none dark:border-white/10 dark:bg-white/5 dark:text-cream"
            >
              <option value="all">Tất cả</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="text-xs text-muted dark:text-cream/60">
          Chỉ hiển thị kỷ niệm đã chọn vị trí trên bản đồ.
        </p>
      </div>

      <div className="pointer-events-none absolute right-3 top-3 z-[800] max-w-[220px] rounded-2xl border border-rose/20 bg-cream/95 p-3 text-sm shadow-soft backdrop-blur dark:border-white/10 dark:bg-[#1E1212]/95 md:right-4 md:top-4">
        <div className="pointer-events-auto flex items-start gap-2">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-rose" />
          <div>
            <p className="font-medium text-ink dark:text-cream">Đã ghim</p>
            <p className="mt-1 text-2xl font-semibold text-rose">
              {totalPins}{' '}
              <span className="text-base font-normal text-muted dark:text-cream/70">
                địa điểm
              </span>
            </p>
          </div>
        </div>
      </div>

      {coupleId && !loading && memories.length > 0 && filtered.length === 0 ? (
        <div className="pointer-events-none absolute bottom-6 left-1/2 z-[800] w-[min(92%,420px)] -translate-x-1/2 rounded-2xl border border-rose/20 bg-cream/95 px-4 py-3 text-center text-sm text-ink shadow-soft backdrop-blur dark:border-white/10 dark:bg-[#1E1212]/95 dark:text-cream">
          Không có kỷ niệm nào khớp bộ lọc. Thử đổi năm/cảm xúc hoặc thêm vị trí khi
          sửa kỷ niệm.
        </div>
      ) : null}

      {coupleId &&
      !loading &&
      memories.length > 0 &&
      memories.every((m) => m.lat == null || m.lng == null) ? (
        <div className="pointer-events-none absolute bottom-6 left-1/2 z-[800] w-[min(92%,480px)] -translate-x-1/2 rounded-2xl border border-rose/20 bg-cream/95 px-4 py-4 text-center text-sm text-muted shadow-soft backdrop-blur dark:border-white/10 dark:bg-[#1E1212]/95 dark:text-cream/80">
          <p className="font-medium text-ink dark:text-cream">Chưa có điểm nào trên bản đồ</p>
          <p className="mt-2">
            Hãy chỉnh sửa kỷ niệm và chọn địa điểm từ ô tìm kiếm để ghim tọa độ.
          </p>
        </div>
      ) : null}

      <MapContainer
        center={[16.2, 106.8]}
        zoom={5.5}
        className="h-full w-full"
        scrollWheelZoom
        style={{ background: '#d9cfc7' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapFit points={points} />
        {filtered.map((m) => {
          const thumb = coverThumb(m)
          const moodOpt = MOODS.find((x) => x.key === m.mood)
          return (
            <Marker key={m.id} position={[m.lat!, m.lng!]} icon={HEART_ICON}>
              <Popup className="map-memory-popup">
                <div className="min-w-[200px] max-w-[240px]">
                  {thumb ? (
                    <img
                      src={thumb}
                      alt=""
                      className="mb-2 h-24 w-full rounded-lg object-cover"
                    />
                  ) : null}
                  <p className="font-medium text-ink line-clamp-2">{m.title}</p>
                  <p className="mt-1 text-xs text-muted">
                    {formatViFullDate(m.date)} · {moodOpt?.emoji} {moodOpt?.label}
                  </p>
                  <Link
                    to={`/journal/${m.id}`}
                    className="mt-3 inline-flex text-sm font-medium text-rose hover:underline"
                  >
                    Xem kỉ niệm →
                  </Link>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </main>
  )
}
