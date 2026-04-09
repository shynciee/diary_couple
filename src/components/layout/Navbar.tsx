import { Link, NavLink } from 'react-router-dom'
import { Moon, Sun } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { useAuth } from '../../hooks/useAuth'

const navLinkClass =
  'rounded-full px-3 py-1.5 text-sm transition hover:bg-rose-light/60 hover:text-ink dark:hover:bg-white/10 dark:hover:text-cream'

export function Navbar() {
  const { user } = useAuth()
  const darkMode = useAppStore((s) => s.darkMode)
  const toggleDarkMode = useAppStore((s) => s.toggleDarkMode)

  return (
    <header className="sticky top-0 z-40 border-b border-rose/10 bg-cream/80 backdrop-blur dark:border-white/10 dark:bg-[#140C0C]/70">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="group flex items-baseline gap-2">
          <span className="font-serif text-xl tracking-tight text-ink dark:text-cream">
            Nhật Ký
          </span>
          <span className="font-serif text-xl tracking-tight text-rose">
            Đôi Ta
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
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

