import confetti from 'canvas-confetti'
import { Check, ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useBucketItems } from '../hooks/useBucketItems'
import { useCouple } from '../hooks/useCouple'
import { useCoupleMemories } from '../hooks/useCoupleMemories'
import { formatViFullDate } from '../lib/utils'
import type { BucketCategory, BucketItem, BucketPriority, Memory } from '../types'

const CATEGORIES: { key: BucketCategory; emoji: string; label: string }[] = [
  { key: 'travel', emoji: '✈️', label: 'Du lịch' },
  { key: 'food', emoji: '🍜', label: 'Ẩm thực' },
  { key: 'experience', emoji: '🎡', label: 'Trải nghiệm' },
  { key: 'celebration', emoji: '🎉', label: 'Kỉ niệm' },
  { key: 'other', emoji: '⭐', label: 'Khác' },
]

const PRIORITIES: { key: BucketPriority; emoji: string; label: string }[] = [
  { key: 'high', emoji: '🔴', label: 'Cao' },
  { key: 'medium', emoji: '🟡', label: 'Trung bình' },
  { key: 'low', emoji: '🟢', label: 'Thấp' },
]

function categoryLabel(cat: BucketCategory) {
  return CATEGORIES.find((c) => c.key === cat)?.label ?? cat
}

function priorityLabel(p: BucketPriority) {
  return PRIORITIES.find((x) => x.key === p)?.label ?? p
}

function coverThumbForMemory(m: Memory & { id: string }) {
  const ordered = [...(m.mediaItems ?? [])].sort((a, b) => a.order - b.order)
  const cover = (m.coverMediaId
    ? ordered.find((x) => x.id === m.coverMediaId)
    : undefined) ?? ordered[0]
  if (!cover) return null
  if (cover.type === 'photo') return cover.url
  return cover.thumbnailUrl || cover.url
}

type Tab = 'all' | 'todo' | 'done' | BucketCategory

export default function BucketList() {
  const { user } = useAuth()
  const { couple } = useCouple()
  const coupleId = couple?.id ?? ''
  const { memories } = useCoupleMemories(coupleId)
  const {
    items,
    loading,
    addItem,
    removeItem,
    setCompleted,
    setLinkedMemory,
  } = useBucketItems(coupleId)

  const [tab, setTab] = useState<Tab>('all')
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<BucketCategory>('travel')
  const [priority, setPriority] = useState<BucketPriority>('medium')
  const [collapsedDone, setCollapsedDone] = useState(true)

  const filtered = useMemo(() => {
    return items.filter((it) => {
      if (tab === 'all') return true
      if (tab === 'todo') return !it.completed
      if (tab === 'done') return it.completed
      return it.category === tab
    })
  }, [items, tab])

  const active = useMemo(() => filtered.filter((i) => !i.completed), [filtered])
  const done = useMemo(() => filtered.filter((i) => i.completed), [filtered])

  const total = items.length
  const doneCount = items.filter((i) => i.completed).length
  const pct = total ? Math.round((doneCount / total) * 100) : 0

  const onToggleComplete = async (it: BucketItem & { id: string }, next: boolean) => {
    if (next) {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.65 },
        colors: ['#C1506A', '#F5D6DE', '#FAF6F1'],
      })
    }
    await setCompleted(it.id, next)
  }

  const submitNew = async () => {
    if (!user || !coupleId) return
    if (!title.trim()) return
    await addItem({
      coupleId,
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      completed: false,
      completedAt: null,
      linkedMemoryId: null,
      createdBy: user.uid,
    })
    setTitle('')
    setDescription('')
    setShowForm(false)
  }

  if (!coupleId && !loading) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10">
        <p className="text-center text-muted dark:text-cream/70">
          Đăng nhập và ghép cặp để dùng bucket list.
        </p>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl tracking-tight md:text-4xl">Bucket list</h1>
          <p className="mt-2 text-sm text-muted dark:text-cream/70">
            Những điều nhỏ hai định làm cùng nhau.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-2 rounded-full bg-rose px-5 py-2.5 text-sm font-medium text-cream shadow-soft"
        >
          <Plus size={18} />
          Thêm điều ước
        </button>
      </div>

      <div className="mt-8 rounded-[28px] border border-rose/15 bg-white/70 p-6 shadow-soft dark:border-white/10 dark:bg-white/5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-medium text-ink dark:text-cream">
            Đã hoàn thành {doneCount}/{total || 0} điều ước 🎉
          </p>
          <span className="text-sm text-muted">{pct}%</span>
        </div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-rose-light/50 dark:bg-white/10">
          <div
            className="h-full rounded-full bg-rose transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {(
          [
            ['all', 'Tất cả'],
            ['todo', 'Chưa làm'],
            ['done', 'Đã làm'],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            className={[
              'rounded-full px-4 py-2 text-sm font-medium transition',
              tab === k
                ? 'bg-rose text-cream shadow-soft'
                : 'border border-rose/20 bg-white/60 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10',
            ].join(' ')}
          >
            {label}
          </button>
        ))}
        <span className="mx-1 hidden w-px self-stretch bg-rose/20 sm:block" />
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            type="button"
            onClick={() => setTab(c.key)}
            className={[
              'rounded-full px-3 py-2 text-sm transition',
              tab === c.key
                ? 'bg-rose text-cream shadow-soft'
                : 'border border-rose/20 bg-white/60 hover:bg-white dark:border-white/10 dark:bg-white/5',
            ].join(' ')}
          >
            {c.emoji} {c.label}
          </button>
        ))}
      </div>

      {showForm ? (
        <section className="mt-8 rounded-[28px] border border-rose/15 bg-white/70 p-6 shadow-soft dark:border-white/10 dark:bg-white/5">
          <h2 className="font-serif text-xl">Điều ước mới</h2>
          <div className="mt-4 grid gap-4">
            <label className="grid gap-1.5">
              <span className="text-xs font-medium text-muted">Tiêu đề</span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="rounded-2xl border border-rose/15 bg-white/80 px-4 py-3 text-sm outline-none dark:border-white/10 dark:bg-white/5"
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-xs font-medium text-muted">Mô tả</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="resize-none rounded-2xl border border-rose/15 bg-white/80 px-4 py-3 text-sm outline-none dark:border-white/10 dark:bg-white/5"
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1.5">
                <span className="text-xs font-medium text-muted">Danh mục</span>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as BucketCategory)}
                  className="rounded-2xl border border-rose/15 bg-white/80 px-4 py-3 text-sm outline-none dark:border-white/10 dark:bg-white/5"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.key} value={c.key}>
                      {c.emoji} {c.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1.5">
                <span className="text-xs font-medium text-muted">Ưu tiên</span>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as BucketPriority)}
                  className="rounded-2xl border border-rose/15 bg-white/80 px-4 py-3 text-sm outline-none dark:border-white/10 dark:bg-white/5"
                >
                  {PRIORITIES.map((p) => (
                    <option key={p.key} value={p.key}>
                      {p.emoji} {p.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-full border border-rose/25 px-5 py-2 text-sm dark:border-white/10"
              >
                Huỷ
              </button>
              <button
                type="button"
                onClick={() => void submitNew()}
                disabled={!title.trim()}
                className="rounded-full bg-rose px-5 py-2 text-sm font-medium text-cream disabled:opacity-50"
              >
                Lưu
              </button>
            </div>
          </div>
        </section>
      ) : null}

      {loading ? (
        <div className="mt-10 h-40 animate-pulse rounded-[28px] bg-rose-light/40 dark:bg-white/5" />
      ) : total === 0 ? (
        <div className="mt-10 rounded-[28px] border border-dashed border-rose/30 bg-cream/40 p-10 text-center dark:bg-white/5">
          <p className="text-lg font-medium">Chưa có điều ước nào</p>
          <p className="mt-2 text-sm text-muted dark:text-cream/70">
            Thêm chuyến đi, món ăn hay khoảnh khắc hai bạn muốn cùng nhau.
          </p>
        </div>
      ) : (
        <>
          <ul className="mt-8 space-y-4">
            {active.map((it) => (
              <BucketItemCard
                key={it.id}
                item={it}
                memories={memories}
                onToggle={(next) => void onToggleComplete(it, next)}
                onDelete={() => void removeItem(it.id)}
                onLink={(mid) => void setLinkedMemory(it.id, mid)}
              />
            ))}
          </ul>

          {done.length > 0 ? (
            <div className="mt-10">
              <button
                type="button"
                onClick={() => setCollapsedDone((v) => !v)}
                className="flex w-full items-center justify-between rounded-2xl border border-rose/15 bg-white/70 px-4 py-3 text-left dark:border-white/10 dark:bg-white/5"
              >
                <span className="font-medium">
                  Đã hoàn thành ({done.length})
                </span>
                {collapsedDone ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
              </button>
              {!collapsedDone ? (
                <ul className="mt-4 space-y-4">
                  {done.map((it) => (
                    <BucketItemCard
                      key={it.id}
                      item={it}
                      memories={memories}
                      onToggle={(next) => void onToggleComplete(it, next)}
                      onDelete={() => void removeItem(it.id)}
                      onLink={(mid) => void setLinkedMemory(it.id, mid)}
                    />
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}
        </>
      )}
    </main>
  )
}

function BucketItemCard({
  item,
  memories,
  onToggle,
  onDelete,
  onLink,
}: {
  item: BucketItem & { id: string }
  memories: ReturnType<typeof useCoupleMemories>['memories']
  onToggle: (completed: boolean) => void
  onDelete: () => void
  onLink: (memoryId: string | null) => void
}) {
  const [openLink, setOpenLink] = useState(false)
  const linked = item.linkedMemoryId
    ? memories.find((m) => m.id === item.linkedMemoryId)
    : undefined
  const thumb = linked ? coverThumbForMemory(linked) : null

  return (
    <li className="rounded-[24px] border border-rose/15 bg-white/70 p-4 shadow-soft dark:border-white/10 dark:bg-white/5">
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => onToggle(!item.completed)}
          className={[
            'mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 transition',
            item.completed
              ? 'border-rose bg-rose text-cream'
              : 'border-rose/40 hover:border-rose',
          ].join(' ')}
          aria-label={item.completed ? 'Đánh dấu chưa làm' : 'Hoàn thành'}
        >
          {item.completed ? <Check size={16} /> : null}
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h3
              className={[
                'font-serif text-xl transition',
                item.completed ? 'text-muted line-through decoration-rose/60' : 'text-ink dark:text-cream',
              ].join(' ')}
            >
              {item.title}
            </h3>
            <button
              type="button"
              onClick={onDelete}
              className="text-muted hover:text-rose"
              aria-label="Xoá"
            >
              <Trash2 size={18} />
            </button>
          </div>
          {item.description ? (
            <p className="mt-2 text-sm text-muted dark:text-cream/70">{item.description}</p>
          ) : null}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full bg-rose-light/50 px-2 py-1 text-ink dark:bg-white/10 dark:text-cream">
              {CATEGORIES.find((c) => c.key === item.category)?.emoji}{' '}
              {categoryLabel(item.category)}
            </span>
            <span className="text-muted">
              {PRIORITIES.find((p) => p.key === item.priority)?.emoji}{' '}
              {priorityLabel(item.priority)}
            </span>
            {item.completed && item.completedAt ? (
              <span className="text-muted">
                · {formatViFullDate(item.completedAt)}
              </span>
            ) : null}
          </div>

          {thumb ? (
            <img
              src={thumb}
              alt=""
              className="mt-3 h-20 w-full max-w-xs rounded-xl object-cover"
            />
          ) : null}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setOpenLink((v) => !v)}
              className="text-sm font-medium text-rose hover:underline"
            >
              Gắn kỉ niệm
            </button>
            {openLink ? (
              <select
                className="rounded-xl border border-rose/15 bg-white/80 px-2 py-1 text-sm dark:border-white/10 dark:bg-white/5"
                value={item.linkedMemoryId ?? ''}
                onChange={(e) => {
                  const v = e.target.value
                  onLink(v ? v : null)
                  setOpenLink(false)
                }}
              >
                <option value="">— Chọn kỷ niệm —</option>
                {memories.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title}
                  </option>
                ))}
              </select>
            ) : null}
          </div>
        </div>
      </div>
    </li>
  )
}
