import { useCallback, useMemo, type CSSProperties } from 'react'
import { useDropzone } from 'react-dropzone'
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ImageIcon, Loader2, Trash2, XCircle } from 'lucide-react'
import type { UploadItem } from '../../hooks/useUpload'

function SortableMediaCard({
  item,
  onRemove,
  onCancel,
  onCaption,
}: {
  item: UploadItem
  onRemove: () => void
  onCancel: () => void
  onCaption: (v: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id })

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group overflow-hidden rounded-2xl border border-rose/15 bg-white/70 shadow-soft dark:border-white/10 dark:bg-white/5"
    >
      <div
        className="relative aspect-[16/10] cursor-grab select-none bg-cream/70 dark:bg-white/5"
        {...attributes}
        {...listeners}
      >
        {item.type === 'photo' ? (
          <img
            src={item.previewUrl}
            alt={item.file.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <video
            src={item.previewUrl}
            className="h-full w-full object-cover"
            muted
            playsInline
          />
        )}

        {item.type === 'video' ? (
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <div className="rounded-full bg-ink/50 px-3 py-1 text-xs font-medium text-cream">
              VIDEO
            </div>
          </div>
        ) : null}

        <div className="absolute left-2 top-2 rounded-full bg-cream/80 px-2 py-1 text-[11px] text-ink shadow-soft dark:bg-black/40 dark:text-cream">
          {Math.round(item.progress)}%
        </div>

        <div className="absolute right-2 top-2 flex gap-2 opacity-100 transition md:opacity-0 md:group-hover:opacity-100">
          {item.status === 'uploading' || item.status === 'compressing' ? (
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-cream/80 text-ink shadow-soft transition hover:bg-cream dark:bg-black/40 dark:text-cream"
              aria-label="Cancel upload"
            >
              <XCircle size={18} />
            </button>
          ) : null}
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-cream/80 text-ink shadow-soft transition hover:bg-cream dark:bg-black/40 dark:text-cream"
            aria-label="Remove"
          >
            <Trash2 size={18} />
          </button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-1 bg-rose-light/70 dark:bg-white/10">
          <div
            className="h-full bg-rose transition-[width]"
            style={{ width: `${Math.max(0, Math.min(100, item.progress))}%` }}
          />
        </div>
      </div>

      <div className="p-3">
        <div className="flex items-center justify-between gap-3">
          <p className="truncate text-xs text-muted dark:text-cream/70">
            {item.file.name}
          </p>
          {item.status === 'compressing' || item.status === 'uploading' ? (
            <Loader2 className="shrink-0 animate-spin text-rose" size={16} />
          ) : null}
        </div>
        <input
          value={item.caption}
          onChange={(e) => onCaption(e.target.value)}
          placeholder="Chú thích…"
          className="mt-2 w-full rounded-xl border border-rose/15 bg-white/70 px-3 py-2 text-sm outline-none focus:border-rose/40 dark:border-white/10 dark:bg-white/5"
        />
        {item.status === 'error' ? (
          <p className="mt-2 text-xs text-rose">{item.error}</p>
        ) : null}
      </div>
    </div>
  )
}

export function UploadZone({
  items,
  onAddFiles,
  onRemove,
  onCancel,
  onReorder,
  onCaption,
}: {
  items: UploadItem[]
  onAddFiles: (files: File[]) => void
  onRemove: (id: string) => void
  onCancel: (id: string) => void
  onReorder: (orderedIds: string[]) => void
  onCaption: (id: string, caption: string) => void
}) {
  const onDrop = useCallback(
    (accepted: File[]) => {
      const allowed = accepted.filter((f) => f.type.startsWith('image/') || f.type.startsWith('video/'))
      onAddFiles(allowed)
    },
    [onAddFiles],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
  })

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const ordered = useMemo(
    () => [...items].sort((a, b) => a.order - b.order),
    [items],
  )
  const ids = useMemo(() => ordered.map((i) => i.id), [ordered])

  const onDragEnd = (e: DragEndEvent) => {
    if (!e.active?.id || !e.over?.id) return
    if (e.active.id === e.over.id) return
    const from = ids.indexOf(String(e.active.id))
    const to = ids.indexOf(String(e.over.id))
    if (from < 0 || to < 0) return
    const next = [...ids]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    onReorder(next)
  }

  return (
    <section className="rounded-[28px] border border-rose/15 bg-white/70 p-6 shadow-soft dark:border-white/10 dark:bg-white/5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl">Ảnh & Video</h2>
          <p className="mt-1 text-sm text-muted dark:text-cream/70">
            Kéo thả để thêm. Kéo để sắp xếp lại. Caption hiển thị trong lightbox.
          </p>
        </div>
        <div className="hidden items-center gap-2 text-xs text-muted dark:text-cream/60 md:flex">
          <ImageIcon size={16} />
          <span>image/*, video/* · tối đa 100MB</span>
        </div>
      </div>

      <div
        {...getRootProps()}
        className={[
          'mt-5 cursor-pointer rounded-2xl border border-dashed p-8 text-center transition',
          isDragActive
            ? 'border-rose bg-rose-light/60 dark:bg-white/5'
            : 'border-rose/25 hover:border-rose/40 hover:bg-cream/60 dark:border-white/15 dark:hover:bg-white/5',
        ].join(' ')}
      >
        <input {...getInputProps()} />
        <p className="font-medium text-ink dark:text-cream">
          {isDragActive ? 'Thả vào đây' : 'Kéo thả hoặc bấm để chọn file'}
        </p>
        <p className="mt-2 text-sm text-muted dark:text-cream/70">
          Ảnh sẽ được nén tự động (max 1920px). Video giữ nguyên + tạo thumbnail.
        </p>
      </div>

      {ordered.length ? (
        <div className="mt-6">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
          >
            <SortableContext items={ids} strategy={rectSortingStrategy}>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {ordered.map((item) => (
                  <SortableMediaCard
                    key={item.id}
                    item={item}
                    onRemove={() => onRemove(item.id)}
                    onCancel={() => onCancel(item.id)}
                    onCaption={(v) => onCaption(item.id, v)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      ) : null}
    </section>
  )
}

