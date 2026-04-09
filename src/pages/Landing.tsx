import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <div className="grid gap-10 md:grid-cols-2 md:items-center">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-rose/20 bg-white/70 px-4 py-2 text-xs text-muted shadow-soft dark:border-white/10 dark:bg-white/5 dark:text-cream/70">
            Một nơi riêng tư cho hai người
          </p>
          <h1 className="font-serif text-5xl tracking-tight text-ink dark:text-cream sm:text-6xl">
            Nhật Ký <span className="text-rose">Đôi Ta</span>
          </h1>
          <p className="prose-editorial mt-5 max-w-prose text-lg text-muted dark:text-cream/70">
            Lưu giữ kỷ niệm bằng ảnh và video theo dòng thời gian — ấm áp, tinh
            tế, và chỉ dành cho hai bạn.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/login"
              className="rounded-full bg-rose px-6 py-3 font-medium text-cream shadow-soft transition hover:brightness-95"
            >
              Đăng nhập để bắt đầu
            </Link>
            <Link
              to="/journal"
              className="rounded-full border border-rose/25 bg-white/60 px-6 py-3 font-medium text-ink transition hover:bg-white dark:border-white/15 dark:bg-white/5 dark:text-cream dark:hover:bg-white/10"
            >
              Xem nhật ký
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="relative"
        >
          <div className="absolute inset-0 -rotate-2 rounded-[28px] bg-rose-light/70 blur-xl dark:bg-rose/15" />
          <div className="relative overflow-hidden rounded-[28px] border border-rose/15 bg-white/70 p-8 shadow-soft dark:border-white/10 dark:bg-white/5">
            <div className="grid gap-5">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted dark:text-cream/60">
                  Timeline
                </p>
                <p className="mt-2 font-serif text-2xl text-ink dark:text-cream">
                  Những ngày mình thương nhau
                </p>
              </div>
              <div className="grid gap-3">
                {[
                  ['🥰', 'Kỷ niệm lãng mạn', 'Ảnh bìa 16:9, chú thích tinh tế'],
                  ['🌊', 'Chuyến đi xa', 'Video + thumbnail, xem như lightbox'],
                  ['🎉', 'Ngày đặc biệt', 'Gắn thẻ, lọc theo cảm xúc'],
                ].map(([emoji, title, desc]) => (
                  <div
                    key={title}
                    className="rounded-2xl border border-rose/10 bg-cream/60 p-4 dark:border-white/10 dark:bg-white/5"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 text-xl">{emoji}</div>
                      <div>
                        <p className="font-medium text-ink dark:text-cream">
                          {title}
                        </p>
                        <p className="mt-1 text-sm text-muted dark:text-cream/70">
                          {desc}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  )
}

