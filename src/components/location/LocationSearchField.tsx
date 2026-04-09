import { MapPin, Search } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { searchNominatim, type NominatimHit } from '../../lib/geocode'

export type LocationFieldValue = {
  location: string
  locationName?: string
  lat?: number
  lng?: number
}

type Props = {
  value: LocationFieldValue
  onChange: (next: LocationFieldValue) => void
  disabled?: boolean
}

export function LocationSearchField({ value, onChange, disabled }: Props) {
  const [query, setQuery] = useState(value.location)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [hits, setHits] = useState<NominatimHit[]>([])
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setQuery(value.location)
  }, [value.location])

  const runSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setHits([])
      return
    }
    setLoading(true)
    try {
      const res = await searchNominatim(q)
      setHits(res)
    } catch {
      setHits([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      void runSearch(query)
    }, 450)
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [query, runSearch])

  const pick = (h: NominatimHit) => {
    const lat = Number.parseFloat(h.lat)
    const lng = Number.parseFloat(h.lon)
    onChange({
      location: h.display_name,
      locationName: h.display_name,
      lat: Number.isFinite(lat) ? lat : undefined,
      lng: Number.isFinite(lng) ? lng : undefined,
    })
    setQuery(h.display_name)
    setOpen(false)
  }

  return (
    <div className="relative grid gap-1.5 md:col-span-2">
      <span className="text-xs font-medium text-muted dark:text-cream/70">
        Địa điểm
      </span>
      <p className="text-xs text-muted dark:text-cream/60">
        Gõ để tìm (OpenStreetMap). Chọn một gợi ý để ghim lên bản đồ.
      </p>
      <div className="relative z-10">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          aria-hidden
        />
        <input
          value={query}
          disabled={disabled}
          onChange={(e) => {
            const v = e.target.value
            setQuery(v)
            setOpen(true)
            onChange({
              location: v,
              locationName: undefined,
              lat: undefined,
              lng: undefined,
            })
          }}
          onFocus={() => setOpen(true)}
          placeholder="Tìm địa điểm…"
          className="w-full rounded-2xl border border-rose/15 bg-white/80 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-rose/40 dark:border-white/10 dark:bg-white/5"
          autoComplete="off"
        />
        {value.lat != null && value.lng != null ? (
          <span className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1 text-xs text-rose">
            <MapPin className="h-3.5 w-3.5" />
            Đã ghim
          </span>
        ) : null}
      </div>

      {open && hits.length > 0 ? (
        <ul
          className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-2xl border border-rose/15 bg-cream py-1 text-left text-sm shadow-soft dark:border-white/10 dark:bg-[#1E1212]"
          role="listbox"
        >
          {loading ? (
            <li className="px-3 py-2 text-muted">Đang tìm…</li>
          ) : (
            hits.map((h) => (
              <li key={`${h.lat}-${h.lon}-${h.display_name.slice(0, 24)}`}>
                <button
                  type="button"
                  className="w-full px-3 py-2 text-left transition hover:bg-rose-light/50 dark:hover:bg-white/10"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pick(h)}
                >
                  {h.display_name}
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  )
}
