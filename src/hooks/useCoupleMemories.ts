import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { useEffect, useMemo, useState } from 'react'
import { db } from '../lib/firebase'
import type { Memory } from '../types'

/** Tất cả kỷ niệm của cặp đôi (realtime), sắp xếp theo ngày giảm dần. */
export function useCoupleMemories(coupleId: string) {
  const [memories, setMemories] = useState<(Memory & { id: string })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!coupleId) {
      setMemories([])
      setLoading(false)
      return
    }
    setLoading(true)
    const q = query(collection(db, 'memories'), where('coupleId', '==', coupleId))
    const unsub = onSnapshot(
      q,
      (snap) => {
        const rows = snap.docs.map((d) => ({ ...(d.data() as Memory), id: d.id }))
        rows.sort(
          (a, b) => (b.date?.toMillis?.() ?? 0) - (a.date?.toMillis?.() ?? 0),
        )
        setMemories(rows)
        setLoading(false)
      },
      () => setLoading(false),
    )
    return () => unsub()
  }, [coupleId])

  const byDateKey = useMemo(() => {
    const map = new Map<string, (Memory & { id: string })[]>()
    for (const m of memories) {
      const d = m.date.toDate()
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      const arr = map.get(key) ?? []
      arr.push(m)
      map.set(key, arr)
    }
    return map
  }, [memories])

  return { memories, loading, byDateKey }
}
