export function SplashScreen() {
  return (
    <div className="grid min-h-[70vh] place-items-center px-6">
      <div className="text-center">
        <div className="mx-auto mb-5 h-10 w-10 animate-pulse rounded-full bg-rose/20" />
        <h1 className="font-serif text-3xl tracking-tight text-ink dark:text-cream">
          Nhật Ký Đôi Ta
        </h1>
        <p className="mt-2 text-sm text-muted dark:text-cream/70">
          Đang mở những ký ức nhỏ…
        </p>
      </div>
    </div>
  )
}

