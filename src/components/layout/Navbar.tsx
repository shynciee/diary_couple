import { Link, NavLink } from 'react-router-dom'
import { ChevronDown, Heart, Map, Moon, Sun } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useAppStore } from '../../store/useAppStore'
import { useAuth } from '../../hooks/useAuth'

const navLinkClass =
  'rounded-full px-3 py-1.5 text-sm transition hover:bg-rose-light/60 hover:text-ink dark:hover:bg-white/10 dark:hover:text-cream'

export function Navbar() {
  const { user } = useAuth()
  const darkMode = useAppStore((s) => s.darkMode)
  const toggleDarkMode = useAppStore((s) => s.toggleDarkMode)
  const [moreOpen, setMoreOpen] = useState(false)
  const moreRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!moreOpen) return
    const onDown = (e: MouseEvent) => {
      if (!moreRef.current?.contains(e.target as Node)) setMoreOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [moreOpen])

  return (
    <header className="sticky top-0 z-40 border-b border-rose/10 bg-cream/80 backdrop-blur dark:border-white/10 dark:bg-[#140C0C]/70">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3">
        <Link to="/" className="group flex shrink-0 items-baseline gap-2">
          <span className="font-serif text-xl tracking-tight text-ink dark:text-cream">
            Nhật Ký
          </span>
          <span className="font-serif text-xl tracking-tight text-rose">
            Đôi Ta
          </span>
        </Link>

        <nav className="flex max-w-[min(100%,calc(100vw-11rem))] flex-wrap items-center justify-end gap-1 md:max-w-none">
          {user ? (
            <>
              <NavLink to="/journal" className={navLinkClass}>
                Nhật ký
              </NavLink>
              <NavLink to="/upload" className={navLinkClass}>
                Thêm kỷ niệm
              </NavLink>
              <NavLink to="/gallery" className={navLinkClass}>
                Thư viện
              </NavLink>
              <div className="relative" ref={moreRef}>
                <button
                  type="button"
                  className={[
                    navLinkClass,
                    'inline-flex items-center gap-1',
                    moreOpen ? 'bg-rose-light/60 dark:bg-white/10' : '',
                  ].join(' ')}
                  aria-expanded={moreOpen}
                  aria-haspopup="menu"
                  onClick={() => setMoreOpen((v) => !v)}
                >
                  Khám phá
                  <ChevronDown size={14} className={moreOpen ? 'rotate-180' : ''} />
                </button>
                {moreOpen ? (
                  <div
                    className="absolute right-0 z-50 mt-1 min-w-[200px] rounded-2xl border border-rose/15 bg-cream/98 p-2 py-2 text-left shadow-soft backdrop-blur dark:border-white/10 dark:bg-[#1E1212]/98"
                    role="menu"
                  >
                    <NavLink
                      to="/map"
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-rose-light/50 dark:hover:bg-white/10"
                      onClick={() => setMoreOpen(false)}
                    >
                      <Map size={16} className="text-rose" />
                      Bản đồ
                    </NavLink>
                    <NavLink
                      to="/calendar"
                      className="block rounded-xl px-3 py-2 text-sm hover:bg-rose-light/50 dark:hover:bg-white/10"
                      onClick={() => setMoreOpen(false)}
                    >
                      Lịch kỷ niệm
                    </NavLink>
                    <NavLink
                      to="/bucketlist"
                      className="block rounded-xl px-3 py-2 text-sm hover:bg-rose-light/50 dark:hover:bg-white/10"
                      onClick={() => setMoreOpen(false)}
                    >
                      Bucket list
                    </NavLink>
                    <NavLink
                      to="/stats"
                      className="block rounded-xl px-3 py-2 text-sm hover:bg-rose-light/50 dark:hover:bg-white/10"
                      onClick={() => setMoreOpen(false)}
                    >
                      Thống kê
                    </NavLink>
                  </div>
                ) : null}
              </div>
              <NavLink to="/anniversary" className={navLinkClass} title="Kỉ niệm">
                <span className="inline-flex items-center gap-1">
                  <Heart size={16} className="text-rose" />
                  <span className="hidden sm:inline">Kỉ niệm</span>
                </span>
              </NavLink>
              <NavLink to="/settings" className={navLinkClass}>
                Cài đặt
              </NavLink>
            </>
          ) : (
            <NavLink to="/login" className={navLinkClass}>
              Đăng nhập
            </NavLink>
          )}
        </nav>

        <button
          type="button"
          onClick={toggleDarkMode}
          className="inline-flex items-center gap-2 rounded-full border border-rose/20 bg-white/60 px-3 py-2 text-sm text-ink shadow-soft transition hover:bg-white dark:border-white/15 dark:bg-white/5 dark:text-cream dark:hover:bg-white/10"
          aria-label={darkMode ? 'Tắt chế độ tối' : 'Bật chế độ tối'}
        >
          {darkMode ? <Moon size={16} /> : <Sun size={16} />}
          <span className="hidden sm:inline">{darkMode ? 'Tối' : 'Sáng'}</span>
        </button>
      </div>
    </header>
  )
}

