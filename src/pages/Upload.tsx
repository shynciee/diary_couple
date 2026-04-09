import { MemoryForm } from '../components/memory/MemoryForm'

export default function Upload() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-serif text-4xl tracking-tight">Thêm kỷ niệm</h1>
      <p className="mt-2 text-muted dark:text-cream/70">
        Tải ảnh/video, sắp xếp thứ tự, thêm caption, rồi lưu vào nhật ký.
      </p>
      <div className="mt-8">
        <MemoryForm />
      </div>
    </main>
  )
}

