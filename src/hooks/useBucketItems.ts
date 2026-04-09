import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from 'firebase/firestore'
import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { db } from '../lib/firebase'
import { serverNow } from '../lib/firestore'
import type { BucketItem } from '../types'

export function useBucketItems(coupleId: string) {
  const [items, setItems] = useState<(BucketItem & { id: string })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!coupleId) {
      setItems([])
      setLoading(false)
      return
    }
    setLoading(true)
    const q = query(collection(db, 'bucketItems'), where('coupleId', '==', coupleId))
    const unsub = onSnapshot(
      q,
      (snap) => {
        const rows = snap.docs.map((d) => ({ ...(d.data() as BucketItem), id: d.id }))
        rows.sort(
          (a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0),
        )
        setItems(rows)
        setLoading(false)
      },
      (err) => {
        console.error(err)
        setLoading(false)
        toast.error('Không tải được bucket list')
      },
    )
    return () => unsub()
  }, [coupleId])

  const addItem = useCallback(
    async (data: Omit<BucketItem, 'createdAt'>) => {
      await addDoc(collection(db, 'bucketItems'), {
        ...data,
        createdAt: serverNow(),
      })
      toast.success('Đã thêm điều ước')
    },
    [],
  )

  const removeItem = useCallback(async (id: string) => {
    await deleteDoc(doc(db, 'bucketItems', id))
    toast.success('Đã xoá')
  }, [])

  const setCompleted = useCallback(
    async (id: string, completed: boolean) => {
      const ref = doc(db, 'bucketItems', id)
      await updateDoc(ref, {
        completed,
        completedAt: completed ? serverNow() : null,
      } as Record<string, unknown>)
    },
    [],
  )

  const setLinkedMemory = useCallback(async (id: string, linkedMemoryId: string | null) => {
    await updateDoc(doc(db, 'bucketItems', id), { linkedMemoryId })
  }, [])

  return { items, loading, addItem, removeItem, setCompleted, setLinkedMemory }
}
