import { type CSSProperties, useEffect, useMemo, useState } from 'react'

const START_DATE = new Date(2026, 0, 19, 0, 0, 0, 0)
const DAY_MS = 24 * 60 * 60 * 1000
const MILESTONES = [100, 200, 365, 500, 1000]
const QUOTES = [
  'Có thể em tự ti với chính bản thân, nhưng hãy nhớ, trong mắt anh, em hoàn hảo nhất.',
  'Mỗi ngày bên em là một ngày anh càng yêu em nhiều hơn.',
  'Em là lý do anh mỉm cười mỗi sáng thức dậy.',
  'Tình yêu không đếm bằng thời gian, nhưng thời gian đủ để biết anh yêu em nhiều đến đâu.',
  'Cảm ơn em đã xuất hiện và ở bên anh, để anh có thể yêu em hơn mỗi ngày.',
  'Dù mai sau thế nào, anh vẫn chọn yêu em hôm nay, ngày mai và mãi mãi.',
]

function addMonthsSafe(date: Date, months: number) {
  const next = new Date(date)
  next.setMonth(next.getMonth() + months)
  return next
}

function getDetailedDiff(start: Date, end: Date) {
  let years = 0
  while (addMonthsSafe(start, (years + 1) * 12) <= end) years += 1

  const afterYears = addMonthsSafe(start, years * 12)
  let months = 0
  while (addMonthsSafe(afterYears, months + 1) <= end) months += 1

  const anchor = addMonthsSafe(afterYears, months)
  let remaining = Math.max(0, end.getTime() - anchor.getTime())

  const days = Math.floor(remaining / DAY_MS)
  remaining -= days * DAY_MS
  const hours = Math.floor(remaining / (60 * 60 * 1000))
  remaining -= hours * 60 * 60 * 1000
  const minutes = Math.floor(remaining / (60 * 1000))
  remaining -= minutes * 60 * 1000
  const seconds = Math.floor(remaining / 1000)

  return { years, months, days, hours, minutes, seconds }
}

export default function Anniversary() {
  const [now, setNow] = useState(() => new Date())
  const [displayDays, setDisplayDays] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(id)
  }, [])

  const totalDays = useMemo(
    () => Math.max(0, Math.floor((now.getTime() - START_DATE.getTime()) / DAY_MS)),
    [now],
  )

  useEffect(() => {
    const startValue = displayDays
    const endValue = totalDays
    if (startValue === endValue) return

    const startAt = performance.now()
    const duration = 900
    let rafId = 0

    const tick = (t: number) => {
      const p = Math.min(1, (t - startAt) / duration)
      const eased = 1 - (1 - p) * (1 - p)
      const value = Math.round(startValue + (endValue - startValue) * eased)
      setDisplayDays(value)
      if (p < 1) rafId = window.requestAnimationFrame(tick)
    }

    rafId = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(rafId)
  }, [totalDays])

  const breakdown = useMemo(() => getDetailedDiff(START_DATE, now), [now])

  const milestone = useMemo(() => {
    const next = MILESTONES.find((m) => totalDays < m)
    if (next) {
      return {
        text: `Còn ${next - totalDays} ngày đến ${next} ngày 🎉`,
      }
    }
    const last = MILESTONES[MILESTONES.length - 1]
    return {
      text: `Đã ${totalDays - last} ngày kể từ mốc ${last} ngày`,
    }
  }, [totalDays])

  const quoteIndex = Math.floor(now.getTime() / 10000) % QUOTES.length

  const units = [
    { label: 'năm', value: breakdown.years },
    { label: 'tháng', value: breakdown.months },
    { label: 'ngày', value: breakdown.days },
    { label: 'giờ', value: breakdown.hours },
    { label: 'phút', value: breakdown.minutes },
    { label: 'giây', value: breakdown.seconds },
  ]

  return (
    <main className="relative min-h-[calc(100vh-65px)] overflow-hidden bg-[#1A0A0A] text-cream">
      <div className="anniversary-particles" aria-hidden>
        {Array.from({ length: 16 }).map((_, i) => (
          <span
            key={i}
            className="anniversary-particle"
            style={
              {
                '--left': `${(i * 17) % 100}%`,
                '--duration': `${12 + (i % 7) * 2}s`,
                '--delay': `${(i % 6) * 1.2}s`,
                '--size': `${10 + (i % 5) * 4}px`,
              } as CSSProperties
            }
          >
            {i % 3 === 0 ? '♥' : '❀'}
          </span>
        ))}
      </div>

      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-65px)] w-full max-w-5xl flex-col items-center justify-center px-4 py-12 text-center">
        <p
          className="text-sm uppercase tracking-[0.32em] text-rose-light/80"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Tình yêu của chúng mình
        </p>

        <div className="mt-4">
          <div
            className="text-[84px] font-semibold leading-none text-rose-light drop-shadow-[0_0_30px_rgba(255,180,205,0.35)] md:text-[140px]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {displayDays}
          </div>
          <p className="-mt-1 text-lg text-cream/85 md:text-2xl">ngày bên nhau</p>
        </div>

        <div className="mt-8 grid w-full max-w-4xl grid-cols-2 gap-3 md:grid-cols-6">
          {units.map((unit) => (
            <div
              key={unit.label}
              className="rounded-2xl border border-rose/20 bg-white/5 px-3 py-4 backdrop-blur"
            >
              <div
                className="text-3xl font-semibold text-rose-light md:text-4xl"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {unit.value}
              </div>
              <div className="mt-1 text-xs uppercase tracking-[0.2em] text-cream/65">
                {unit.label}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-7 rounded-full border border-rose/25 bg-rose/10 px-6 py-3 text-sm text-rose-light shadow-soft md:text-base">
          {milestone.text}
        </div>

        <div className="mt-10 max-w-3xl px-2">
          <p
            key={quoteIndex}
            className="anniversary-quote text-lg italic text-cream/90 md:text-2xl"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            "{QUOTES[quoteIndex]}"
          </p>
        </div>
      </section>
    </main>
  )
}

