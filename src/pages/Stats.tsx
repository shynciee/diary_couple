import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useCouple } from '../hooks/useCouple'
import { useCoupleMemories } from '../hooks/useCoupleMemories'
import { formatViMonthYear, toDateKey } from '../lib/utils'
import { MOODS, type Memory, type MoodKey } from '../types'

const ROSE = '#C1506A'

function coverThumb(m: Memory & { id: string }) {
  const ordered = [...(m.mediaItems ?? [])].sort((a, b) => a.order - b.order)
  const cover = (m.coverMediaId
    ? ordered.find((x) => x.id === m.coverMediaId)
    : undefined) ?? ordered[0]
  if (!cover) return null
  if (cover.type === 'photo') return cover.url
  return cover.thumbnailUrl || cover.url
}

function uniqueLocationKey(m: Memory) {
  const loc = m.location?.trim()
  if (loc) return `l:${loc}`
  if (m.lat != null && m.lng != null) return `c:${m.lat},${m.lng}`
  return ''
}

export default function Stats() {
  const { couple } = useCouple()
  const coupleId = couple?.id ?? ''
  const { memories, loading } = useCoupleMemories(coupleId)

  const overview = useMemo(() => {
    let photos = 0
    let videos = 0
    const locs = new Set<string>()
    let firstTs = Infinity
    for (const m of memories) {
      for (const it of m.mediaItems) {
        if (it.type === 'photo') photos += 1
        else videos += 1
      }
      const k = uniqueLocationKey(m)
      if (k) locs.add(k)
      const t = m.date.toMillis()
      if (t < firstTs) firstTs = t
    }
    const firstDate =
      firstTs === Infinity ? null : new Date(firstTs)
    return {
      mediaTotal: photos + videos,
      memoryCount: memories.length,
      uniqueLocations: locs.size,
      firstDate,
      photos,
      videos,
    }
  }, [memories])

  const year = new Date().getFullYear()
  const monthly = useMemo(() => {
    const counts = Array.from({ length: 12 }, (_, i) => ({ month: i + 1, count: 0 }))
    for (const m of memories) {
      const d = m.date.toDate()
      if (d.getFullYear() !== year) continue
      counts[d.getMonth()]!.count += 1
    }
    return counts.map((c) => ({
      name: `T${c.month}`,
      count: c.count,
    }))
  }, [memories, year])

  const moodRows = useMemo(() => {
    const map = new Map<MoodKey, number>()
    for (const k of MOODS.map((m) => m.key)) map.set(k, 0)
    for (const m of memories) {
      map.set(m.mood, (map.get(m.mood) ?? 0) + 1)
    }
    return MOODS.map((m) => ({
      key: m.key,
      name: `${m.emoji} ${m.label}`,
      value: map.get(m.key) ?? 0,
    })).filter((r) => r.value > 0)
  }, [memories])

  const topMood = useMemo(() => {
    if (!moodRows.length) return null
    return [...moodRows].sort((a, b) => b.value - a.value)[0]!
  }, [moodRows])

  const hours = useMemo(() => {
    const h = Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0 }))
    for (const m of memories) {
      const hr = m.createdAt.toDate().getHours()
      h[hr]!.count += 1
    }
    return h
  }, [memories])

  const peakHour = useMemo(() => {
    let max = -1
    let idx = 0
    hours.forEach((x, i) => {
      if (x.count > max) {
        max = x.count
        idx = i
      }
    })
    return max <= 0 ? null : idx
  }, [hours])

  const romanticMonth = useMemo(() => {
    const byMonth = new Map<string, { count: number; key: string }>()
    for (const m of memories) {
      const d = m.date.toDate()
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const cur = byMonth.get(k) ?? { count: 0, key: k }
      cur.count += 1
      byMonth.set(k, cur)
    }
    let best: { count: number; key: string } | null = null
    for (const v of byMonth.values()) {
      if (!best || v.count > best.count) best = v
    }
    if (!best || best.count === 0) return null
    const [y, mo] = best.key.split('-').map(Number)
    const labelDate = new Date(y!, (mo ?? 1) - 1, 1)
    const inMonth = memories.filter((m) => {
      const d = m.date.toDate()
      return d.getFullYear() === y && d.getMonth() === (mo ?? 1) - 1
    })
    const thumbs = inMonth
      .map((m) => coverThumb(m))
      .filter((x): x is string => Boolean(x))
      .slice(0, 8)
    return { label: formatViMonthYear(labelDate), count: best.count, thumbs }
  }, [memories])

  const streaks = useMemo(() => {
    const days = new Set<string>()
    for (const m of memories) {
      days.add(toDateKey(m.date.toDate()))
    }
    const has = (key: string) => days.has(key)

    let current = 0
    const today = new Date()
    let cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    if (!has(toDateKey(cursor))) {
      cursor.setDate(cursor.getDate() - 1)
    }
    while (has(toDateKey(cursor))) {
      current += 1
      cursor.setDate(cursor.getDate() - 1)
    }

    const sorted = [...days].sort()
    let longest = 0
    let run = 0
    let prev: Date | null = null
    for (const s of sorted) {
      const d = new Date(s + 'T12:00:00')
      if (!prev) {
        run = 1
      } else {
        const diff =
          (d.getTime() - prev.getTime()) / (24 * 60 * 60 * 1000)
        if (Math.round(diff) === 1) run += 1
        else run = 1
      }
      longest = Math.max(longest, run)
      prev = d
    }

    return { current, longest }
  }, [memories])

  if (!coupleId && !loading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10">
        <p className="text-center text-muted">Cần đăng nhập để xem thống kê.</p>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-serif text-3xl tracking-tight md:text-4xl">Thống kê tình yêu</h1>
      <p className="mt-2 text-sm text-muted dark:text-cream/70">
        Những con số nhỏ kể chuyện hai bạn đã cùng nhau lưu giữ.
      </p>

      {loading ? (
        <div className="mt-10 h-64 animate-pulse rounded-[28px] bg-rose-light/40 dark:bg-white/5" />
      ) : memories.length === 0 ? (
        <div className="mt-10 rounded-[28px] border border-rose/15 bg-white/70 p-10 text-center dark:border-white/10 dark:bg-white/5">
          <p className="text-lg font-medium">Chưa có dữ liệu</p>
          <p className="mt-2 text-sm text-muted dark:text-cream/70">
            Thêm vài kỷ niệm để xem biểu đồ và thống kê nhé.
          </p>
        </div>
      ) : (
        <>
          <section className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              emoji="📸"
              label="Tổng ảnh & video"
              value={String(overview.mediaTotal)}
            />
            <StatCard
              emoji="📖"
              label="Tổng kỉ niệm"
              value={String(overview.memoryCount)}
            />
            <StatCard
              emoji="📍"
              label="Địa điểm đã đến"
              value={String(overview.uniqueLocations)}
            />
            <StatCard
              emoji="🗓️"
              label="Ngày đầu tiên lưu kỉ niệm"
              value={
                overview.firstDate
                  ? overview.firstDate.toLocaleDateString('vi-VN')
                  : '—'
              }
            />
          </section>

          <section className="mt-10 rounded-[28px] border border-rose/15 bg-white/70 p-6 shadow-soft dark:border-white/10 dark:bg-white/5">
            <h2 className="font-serif text-xl">Kỷ niệm theo tháng ({year})</h2>
            <div className="mt-4 h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthly}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value) => [
                      `${String(value ?? 0)} kỷ niệm`,
                      'Số kỷ niệm',
                    ]}
                    labelFormatter={(label) =>
                      typeof label === 'string' && label.startsWith('T')
                        ? `Tháng ${label.slice(1)}`
                        : String(label ?? '')
                    }
                  />
                  <Bar dataKey="count" fill={ROSE} radius={[6, 6, 0, 0]} name="Số kỷ niệm" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="mt-10 grid gap-8 lg:grid-cols-2">
            <div className="rounded-[28px] border border-rose/15 bg-white/70 p-6 shadow-soft dark:border-white/10 dark:bg-white/5">
              <h2 className="font-serif text-xl">Tâm trạng phổ biến</h2>
              <div className="relative mt-4 h-72">
                {moodRows.length ? (
                  <>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={moodRows}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={56}
                          outerRadius={96}
                          paddingAngle={2}
                        >
                          {moodRows.map((_, i) => (
                            <Cell
                              key={i}
                              fill={
                                ['#C1506A', '#E08BA0', '#F5D6DE', '#8A6E6E', '#C9962A', '#6B8E9B'][
                                  i % 6
                                ]
                              }
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    {topMood ? (
                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-4 text-center">
                        <div>
                          <p className="font-serif text-base leading-snug text-ink line-clamp-2 dark:text-cream">
                            {topMood.name}
                          </p>
                          <p className="mt-1 text-xs text-muted">{topMood.value} kỷ niệm</p>
                        </div>
                      </div>
                    ) : null}
                  </>
                ) : (
                  <div className="grid h-full place-items-center text-sm text-muted">
                    Chưa có dữ liệu tâm trạng
                  </div>
                )}
              </div>
              {topMood ? (
                <p className="mt-2 text-center text-sm text-muted">
                  Tâm trạng phổ biến nhất:{' '}
                  <span className="font-medium text-ink dark:text-cream">{topMood.name}</span>
                </p>
              ) : null}
              <ul className="mt-4 space-y-1 text-sm text-muted">
                {MOODS.map((m) => {
                  const v = memories.filter((x) => x.mood === m.key).length
                  return (
                    <li key={m.key} className="flex justify-between">
                      <span>
                        {m.emoji} {m.label}
                      </span>
                      <span className="text-ink dark:text-cream">{v}</span>
                    </li>
                  )
                })}
              </ul>
            </div>

            <div className="rounded-[28px] border border-rose/15 bg-white/70 p-6 shadow-soft dark:border-white/10 dark:bg-white/5">
              <h2 className="font-serif text-xl">Giờ tạo kỷ niệm (theo lúc lưu)</h2>
              <p className="mt-1 text-xs text-muted">
                Dựa trên thời điểm hai bạn bấm lưu trong app.
              </p>
              <div className="mt-4 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hours}>
                    <XAxis dataKey="hour" tickFormatter={(h) => `${h}h`} tick={{ fontSize: 10 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value) => [`${String(value ?? 0)} lần`, '']}
                      labelFormatter={(h) => `Giờ ${String(h)}`}
                    />
                    <Bar dataKey="count" fill={ROSE} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {peakHour != null ? (
                <p className="mt-2 text-center text-sm text-muted">
                  Hay tạo kỷ niệm lúc <span className="font-medium text-ink dark:text-cream">{peakHour}h</span> nhất 🌙
                </p>
              ) : null}
            </div>
          </section>

          {romanticMonth ? (
            <section className="mt-10 rounded-[28px] border border-rose/15 bg-gradient-to-br from-rose-light/40 to-cream p-6 shadow-soft dark:border-white/10 dark:from-rose/20 dark:to-[#1E1212]">
              <h2 className="font-serif text-xl">Tháng lãng mạn nhất</h2>
              <p className="mt-2 text-2xl font-semibold text-rose">
                {romanticMonth.label}{' '}
                <span className="text-base font-normal text-muted">
                  · {romanticMonth.count} kỷ niệm
                </span>
              </p>
              {romanticMonth.thumbs.length ? (
                <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                  {romanticMonth.thumbs.map((src) => (
                    <img
                      key={src}
                      src={src}
                      alt=""
                      className="h-20 w-28 shrink-0 rounded-xl object-cover"
                    />
                  ))}
                </div>
              ) : null}
            </section>
          ) : null}

          <section className="mt-10 rounded-[28px] border border-rose/15 bg-white/70 p-6 text-center shadow-soft dark:border-white/10 dark:bg-white/5">
            <h2 className="font-serif text-xl">Chuỗi ngày có kỷ niệm</h2>
            <p className="mt-3 text-lg text-ink dark:text-cream">
              Chuỗi hiện tại:{' '}
              <span className="font-semibold text-rose">{streaks.current}</span> ngày liên tiếp 🔥
            </p>
            <p className="mt-2 text-sm text-muted">
              Kỷ lục: {streaks.longest} ngày liên tiếp
            </p>
          </section>
        </>
      )}
    </main>
  )
}

function StatCard({ emoji, label, value }: { emoji: string; label: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-rose/15 bg-white/80 p-5 shadow-soft dark:border-white/10 dark:bg-white/5">
      <div className="text-2xl">{emoji}</div>
      <p className="mt-2 text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 font-serif text-3xl text-rose">{value}</p>
    </div>
  )
}
