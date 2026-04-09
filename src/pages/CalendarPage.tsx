import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns'
import { vi } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Modal } from '../components/ui/Modal'
import { useCouple } from '../hooks/useCouple'
import { useCoupleMemories } from '../hooks/useCoupleMemories'
import { formatViFullDate, toDateKey } from '../lib/utils'
import { MOODS, type Memory } from '../types'

const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

function coverThumb(m: Memory & { id: string }) {
  const ordered = [...(m.mediaItems ?? [])].sort((a, b) => a.order - b.order)
  const cover = (m.coverMediaId
    ? ordered.find((x) => x.id === m.coverMediaId)
    : undefined) ?? ordered[0]
  if (!cover) return null
  if (cover.type === 'photo') return cover.url
  return cover.thumbnailUrl || cover.url
}

export default function CalendarPage() {
  const { couple } = useCouple()
  const coupleId = couple?.id ?? ''
  const { memories, loading, byDateKey } = useCoupleMemories(coupleId)

  const [view, setView] = useState(() => startOfMonth(new Date()))
  const [dayModal, setDayModal] = useState<string | null>(null)
  const [yearOpen, setYearOpen] = useState(false)

  const monthStart = startOfMonth(view)
  const monthEnd = endOfMonth(view)
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd })

  const monthStats = useMemo(() => {
    const inMonth = memories.filter((m) => isSameMonth(m.date.toDate(), view))
    let photos = 0
    let videos = 0
    const locs = new Set<string>()
    for (const m of inMonth) {
      for (const it of m.mediaItems) {
        if (it.type === 'photo') photos += 1
        else videos += 1
      }
      const loc = m.location?.trim()
      if (loc) locs.add(loc)
    }
    return {
      count: inMonth.length,
      photos,
      videos,
      locations: locs.size,
    }
  }, [memories, view])

  const monthsWithMemories = useMemo(() => {
    const y = view.getFullYear()
    const flags = Array.from({ length: 12 }, () => false)
    for (const m of memories) {
      const d = m.date.toDate()
      if (d.getFullYear() !== y) continue
      flags[d.getMonth()] = true
    }
    return flags
  }, [memories, view])

  const selectedDayMemories = dayModal ? byDateKey.get(dayModal) ?? [] : []

  if (!coupleId && !loading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10">
        <p className="text-center text-muted dark:text-cream/70">
          Bạn cần đăng nhập và ghép cặp để xem lịch kỷ niệm.
        </p>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl tracking-tight md:text-4xl">Lịch kỷ niệm</h1>
          <p className="mt-2 text-sm text-muted dark:text-cream/70">
            Mỗi ô là một ngày — có kỷ niệm sẽ có dấu chấm hồng.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setYearOpen(true)}
          className="rounded-full border border-rose/25 bg-white/70 px-4 py-2 text-sm font-medium text-ink shadow-soft dark:border-white/10 dark:bg-white/5 dark:text-cream"
        >
          Tổng quan năm {view.getFullYear()}
        </button>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => setView((v) => subMonths(v, 1))}
          className="inline-flex items-center gap-1 rounded-full border border-rose/20 px-3 py-2 text-sm hover:bg-rose-light/40 dark:hover:bg-white/10"
          aria-label="Tháng trước"
        >
          <ChevronLeft size={18} />
          Tháng trước
        </button>
        <div className="min-w-[200px] text-center font-serif text-xl capitalize">
          {format(view, 'MMMM yyyy', { locale: vi })}
        </div>
        <button
          type="button"
          onClick={() => setView((v) => addMonths(v, 1))}
          className="inline-flex items-center gap-1 rounded-full border border-rose/20 px-3 py-2 text-sm hover:bg-rose-light/40 dark:hover:bg-white/10"
          aria-label="Tháng sau"
        >
          Tháng sau
          <ChevronRight size={18} />
        </button>
      </div>

      {loading ? (
        <div className="mt-10 h-96 animate-pulse rounded-[28px] bg-rose-light/40 dark:bg-white/5" />
      ) : memories.length === 0 ? (
        <div className="mt-10 rounded-[28px] border border-rose/15 bg-white/70 p-10 text-center shadow-soft dark:border-white/10 dark:bg-white/5">
          <p className="text-lg font-medium text-ink dark:text-cream">Chưa có kỷ niệm nào</p>
          <p className="mt-2 text-sm text-muted dark:text-cream/70">
            Thêm kỷ niệm đầu tiên để lịch của hai bạn bắt đầu tỏa sáng.
          </p>
          <Link
            to="/upload"
            className="mt-6 inline-flex rounded-full bg-rose px-6 py-3 text-sm font-medium text-cream shadow-soft"
          >
            Thêm kỷ niệm
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-8 overflow-x-auto rounded-[28px] border border-rose/15 bg-white/70 p-4 shadow-soft dark:border-white/10 dark:bg-white/5">
            <div className="grid min-w-[640px] grid-cols-7 gap-1 text-center text-xs font-medium uppercase tracking-wide text-muted dark:text-cream/60">
              {WEEKDAYS.map((d) => (
                <div key={d} className="py-2">
                  {d}
                </div>
              ))}
            </div>
            <div className="mt-1 grid min-w-[640px] grid-cols-7 gap-1">
              {days.map((day) => {
                const key = toDateKey(day)
                const dayMems = byDateKey.get(key) ?? []
                const inMonth = isSameMonth(day, view)
                const thumb = dayMems[0] ? coverThumb(dayMems[0]) : null
                const has = dayMems.length > 0

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => has && setDayModal(key)}
                    disabled={!has}
                    title={
                      has
                        ? dayMems.map((m) => m.title).join(' · ')
                        : format(day, 'd/M/yyyy', { locale: vi })
                    }
                    className={[
                      'relative flex min-h-[72px] flex-col items-center justify-start rounded-xl border p-1 text-sm transition',
                      !inMonth && 'opacity-35',
                      isToday(day)
                        ? 'border-2 border-rose bg-rose-light/30 dark:border-rose dark:bg-rose/15'
                        : has
                          ? 'border-rose/25 bg-rose-light/20 dark:border-white/10 dark:bg-white/10'
                          : 'border-transparent bg-cream/30 dark:bg-white/5',
                      has ? 'cursor-pointer hover:brightness-95' : 'cursor-default',
                    ].join(' ')}
                  >
                    {thumb ? (
                      <div
                        className="pointer-events-none absolute inset-0 rounded-lg bg-cover bg-center opacity-25"
                        style={{ backgroundImage: `url(${thumb})` }}
                      />
                    ) : null}
                    <span className="relative z-[1] font-medium">{format(day, 'd')}</span>
                    {has ? (
                      <span className="relative z-[1] mt-auto mb-1 h-2 w-2 rounded-full bg-rose shadow-sm" />
                    ) : null}
                  </button>
                )
              })}
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-muted dark:text-cream/70">
            Tháng này:{' '}
            <span className="font-medium text-ink dark:text-cream">{monthStats.count}</span> kỉ
            niệm ·{' '}
            <span className="font-medium text-ink dark:text-cream">
              {monthStats.photos + monthStats.videos}
            </span>{' '}
            ảnh & video ·{' '}
            <span className="font-medium text-ink dark:text-cream">{monthStats.locations}</span>{' '}
            địa điểm
          </p>
        </>
      )}

      <Modal
        open={Boolean(dayModal)}
        title={dayModal ? formatViFullDate(new Date(dayModal + 'T12:00:00')) : undefined}
        onClose={() => setDayModal(null)}
      >
        <ul className="max-h-[60vh] space-y-3 overflow-auto">
          {selectedDayMemories.map((m) => {
            const mood = MOODS.find((x) => x.key === m.mood)
            const thumb = coverThumb(m)
            return (
              <li
                key={m.id}
                className="flex gap-3 rounded-2xl border border-rose/15 bg-cream/50 p-3 dark:border-white/10 dark:bg-white/5"
              >
                {thumb ? (
                  <img
                    src={thumb}
                    alt=""
                    className="h-16 w-24 shrink-0 rounded-xl object-cover"
                  />
                ) : (
                  <div className="h-16 w-24 shrink-0 rounded-xl bg-rose-light/40 dark:bg-white/10" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-ink line-clamp-2 dark:text-cream">{m.title}</p>
                  <p className="mt-1 text-xs text-muted">
                    {mood?.emoji} {mood?.label}
                  </p>
                  <Link
                    to={`/journal/${m.id}`}
                    className="mt-2 inline-block text-sm font-medium text-rose hover:underline"
                  >
                    Xem chi tiết →
                  </Link>
                </div>
              </li>
            )
          })}
        </ul>
      </Modal>

      <Modal open={yearOpen} title={`Năm ${view.getFullYear()}`} onClose={() => setYearOpen(false)}>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {Array.from({ length: 12 }, (_, i) => {
            const has = monthsWithMemories[i]
            const label = format(new Date(view.getFullYear(), i, 1), 'MMM', { locale: vi })
            return (
              <div
                key={i}
                className={[
                  'rounded-2xl border px-3 py-4 text-center text-sm',
                  has
                    ? 'border-rose/40 bg-rose-light/30 dark:border-rose/40 dark:bg-rose/10'
                    : 'border-rose/10 bg-white/50 dark:border-white/10 dark:bg-white/5',
                ].join(' ')}
              >
                <span className="capitalize">{label}</span>
                {has ? (
                  <div className="mt-2 flex justify-center">
                    <span className="h-2 w-2 rounded-full bg-rose" />
                  </div>
                ) : (
                  <div className="mt-2 h-2" />
                )}
              </div>
            )
          })}
        </div>
      </Modal>
    </main>
  )
}
