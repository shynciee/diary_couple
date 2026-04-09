import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  startAfter,
  updateDoc,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { db } from '../lib/firebase'
import type { Memory } from '../types'
import { serverNow } from '../lib/firestore'

export async function createMemory(params: {
  memoryId: string
  data: Omit<Memory, 'createdAt' | 'updatedAt'> & {
    createdAt: any
    updatedAt: any
  }
}) {
  const { memoryId, data } = params
  console.log('[Memory] before Firestore write', { memoryId, data })
  const ref = doc(db, 'memories', memoryId)
  try {
    await setDoc(ref, data as any)
    console.log('[Memory] Firestore write success', { memoryId })
  } catch (e) {
    console.error('[Memory] Firestore write error', e)
    throw e
  }
}

export function useMemories(params: { coupleId: string; pageSize?: number }) {
  const { coupleId, pageSize = 10 } = params
  const [memories, setMemories] = useState<(Memory & { id: string })[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const lastDocRef = useRef<QueryDocumentSnapshot<DocumentData> | null>(null)
  const [indexMissing, setIndexMissing] = useState(false)

  useEffect(() => {
    if (!coupleId) {
      setMemories([])
      setLoading(false)
      setHasMore(false)
      lastDocRef.current = null
      setIndexMissing(false)
      return
    }
    setLoading(true)
    lastDocRef.current = null
    setHasMore(true)
    setIndexMissing(false)

    let unsubFallback: null | (() => void) = null

    const q = query(
      collection(db, 'memories'),
      where('coupleId', '==', coupleId),
      orderBy('date', 'desc'),
      limit(pageSize),
    )

    const unsubPrimary = onSnapshot(
      q,
      (snap) => {
        const docs = snap.docs
        lastDocRef.current = docs.length ? docs[docs.length - 1]! : null
        setHasMore(docs.length === pageSize)
        setMemories(docs.map((d) => ({ ...(d.data() as Memory), id: d.id })))
        setLoading(false)
      },
      (err) => {
        console.error(err)
        const msg = String((err as any)?.message ?? '')
        const code = String((err as any)?.code ?? '')
        if (
          code === 'failed-precondition' ||
          msg.toLowerCase().includes('requires an index')
        ) {
          setIndexMissing(true)
          toast.error('Firestore cần tạo index (memories: coupleId + date).')

          // Stop the failing indexed listener to avoid repeated console spam.
          try {
            unsubPrimary()
          } catch {
            // ignore
          }

          // Fallback: no orderBy (works without composite index), then sort client-side.
          const q2 = query(
            collection(db, 'memories'),
            where('coupleId', '==', coupleId),
            limit(pageSize),
          )
          unsubFallback = onSnapshot(
            q2,
            (snap2) => {
              const docs2 = snap2.docs
              lastDocRef.current = null
              setHasMore(false)
              const sorted = docs2
                .map((d) => ({ ...(d.data() as Memory), id: d.id }))
                .sort(
                  (a, b) =>
                    (b.date?.toMillis?.() ?? 0) - (a.date?.toMillis?.() ?? 0),
                )
              setMemories(sorted)
              setLoading(false)
            },
            (err2) => {
              console.error(err2)
              setLoading(false)
            },
          )
          return
        }

        setLoading(false)
      },
    )

    return () => {
      unsubPrimary()
      unsubFallback?.()
    }
  }, [coupleId, pageSize])

  const loadMore = useCallback(async () => {
    if (!coupleId) return
    if (!hasMore) return
    if (!lastDocRef.current) return

    try {
      setLoadingMore(true)
      const q = query(
        collection(db, 'memories'),
        where('coupleId', '==', coupleId),
        orderBy('date', 'desc'),
        startAfter(lastDocRef.current),
        limit(pageSize),
      )
      const snap = await getDocs(q)
      const docs = snap.docs
      lastDocRef.current = docs.length ? docs[docs.length - 1]! : lastDocRef.current
      setHasMore(docs.length === pageSize)
      setMemories((prev) => [
        ...prev,
        ...docs.map((d) => ({ ...(d.data() as Memory), id: d.id })),
      ])
    } catch (e) {
      console.error(e)
      toast.error('Không thể tải thêm')
    } finally {
      setLoadingMore(false)
    }
  }, [coupleId, hasMore, pageSize])

  const deleteMemory = useCallback(async (id: string) => {
    try {
      await deleteDoc(doc(db, 'memories', id))
      toast.success('Đã xoá kỷ niệm')
    } catch (e) {
      console.error(e)
      toast.error('Không thể xoá')
    }
  }, [])

  const updateMemory = useCallback(
    async (id: string, patch: Partial<Memory>) => {
      try {
        await updateDoc(doc(db, 'memories', id), {
          ...patch,
          updatedAt: serverNow(),
        } as any)
        toast.success('Đã cập nhật')
      } catch (e) {
        console.error(e)
        toast.error('Không thể cập nhật')
      }
    },
    [],
  )

  return useMemo(
    () => ({
      memories,
      loading,
      loadingMore,
      hasMore,
      indexMissing,
      loadMore,
      deleteMemory,
      updateMemory,
    }),
    [
      memories,
      loading,
      loadingMore,
      hasMore,
      indexMissing,
      loadMore,
      deleteMemory,
      updateMemory,
    ],
  )
}

export function useMemory(id: string) {
  const [memory, setMemory] = useState<(Memory & { id: string }) | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) {
      setMemory(null)
      setLoading(false)
      return
    }
    setLoading(true)
    const ref = doc(db, 'memories', id)
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (!snap.exists()) {
          setMemory(null)
          setLoading(false)
          return
        }
        setMemory({ ...(snap.data() as Memory), id: snap.id })
        setLoading(false)
      },
      () => setLoading(false),
    )
    return () => unsub()
  }, [id])

  const refresh = useCallback(async () => {
    const ref = doc(db, 'memories', id)
    const snap = await getDoc(ref)
    if (snap.exists()) setMemory({ ...(snap.data() as Memory), id: snap.id })
  }, [id])

  return { memory, loading, refresh }
}

