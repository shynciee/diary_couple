import {
  doc,
  getCountFromServer,
  getDocs,
  limit,
  onSnapshot,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import type { Couple } from '../types'
import { db } from '../lib/firebase'
import { couplesCol, memoriesCol, serverNow, tsNow } from '../lib/firestore'
import { useAuth } from './useAuth'

function randomToken() {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

type UseCoupleResult = {
  couple: (Couple & { id: string }) | null
  loading: boolean
  memoriesCount: number | null
  createInviteLink: () => Promise<string>
  acceptInvite: (token: string) => Promise<void>
  setStartDate: (date: Date) => Promise<void>
}

export function useCouple(): UseCoupleResult {
  const { user } = useAuth()
  const [couple, setCouple] = useState<(Couple & { id: string }) | null>(null)
  const [loading, setLoading] = useState(true)
  const [memoriesCount, setMemoriesCount] = useState<number | null>(null)

  useEffect(() => {
    if (!user) {
      setCouple(null)
      setMemoriesCount(null)
      setLoading(false)
      return
    }

    setLoading(true)

    let user1Found = false
    let user2Found = false

    const q1 = query(
      couplesCol(),
      where('user1', '==', user.uid),
      limit(1),
    )

    const q2 = query(
      couplesCol(),
      where('user2', '==', user.uid),
      limit(1),
    )

    const maybeSetEmpty = () => {
      if (!user1Found && !user2Found) {
        setCouple(null)
        setLoading(false)
      }
    }

    const unsub1 = onSnapshot(
      q1,
      (snap) => {
        user1Found = !snap.empty
        if (!snap.empty) {
          const d = snap.docs[0]!
          setCouple({ ...(d.data() as Couple), id: d.id })
          setLoading(false)
        } else {
          maybeSetEmpty()
        }
      },
      () => setLoading(false),
    )

    const unsub2 = onSnapshot(
      q2,
      (snap) => {
        user2Found = !snap.empty
        if (!snap.empty) {
          const d = snap.docs[0]!
          setCouple({ ...(d.data() as Couple), id: d.id })
          setLoading(false)
        } else {
          maybeSetEmpty()
        }
      },
      () => setLoading(false),
    )

    return () => {
      unsub1()
      unsub2()
    }
  }, [user])

  // Auto-create couple for brand-new users (no couple found yet)
  useEffect(() => {
    if (!user) return
    if (loading) return
    if (couple) return

    ;(async () => {
      try {
        setLoading(true)
        const createdAt = tsNow()
        const startDate = tsNow()
        const docRef = doc(couplesCol())
        const payload = {
          coupleId: docRef.id,
          user1: user.uid,
          user2: null,
          createdAt,
          startDate,
        } as unknown as Couple
        console.log('[Couple] creating couple doc', payload)
        await setDoc(docRef, payload)
        console.log('[Couple] couple created', { coupleId: docRef.id })
      } catch (e) {
        console.error(e)
        toast.error('Không thể tạo hồ sơ đôi')
      } finally {
        setLoading(false)
      }
    })()
  }, [user, loading, couple])

  useEffect(() => {
    if (!couple?.id) {
      setMemoriesCount(null)
      return
    }
    ;(async () => {
      try {
        const q = query(memoriesCol(), where('coupleId', '==', couple.id))
        const agg = await getCountFromServer(q)
        setMemoriesCount(agg.data().count)
      } catch {
        setMemoriesCount(null)
      }
    })()
  }, [couple?.id])

  const api = useMemo<UseCoupleResult>(
    () => ({
      couple,
      loading,
      memoriesCount,
      createInviteLink: async () => {
        if (!user) throw new Error('Chưa đăng nhập')
        if (!couple) throw new Error('Chưa có couple')
        const token = randomToken()
        await updateDoc(doc(db, 'couples', couple.id), {
          inviteToken: token,
          inviteTokenCreatedAt: serverNow(),
        })
        return `${window.location.origin}/settings?invite=${token}`
      },
      acceptInvite: async (token: string) => {
        if (!user) throw new Error('Chưa đăng nhập')
        if (!token) throw new Error('Thiếu token')

        const q = query(
          couplesCol(),
          where('inviteToken', '==', token),
          limit(1),
        )

        const snap = await getDocs(q)
        if (snap.empty) throw new Error('Link mời không hợp lệ hoặc đã hết hạn')
        const d = snap.docs[0]!
        const data = d.data() as Couple
        if (data.user1 === user.uid) throw new Error('Bạn đã là chủ cặp đôi này')
        if (data.user2 && data.user2 !== user.uid)
          throw new Error('Cặp đôi này đã đủ 2 người')

        await updateDoc(doc(db, 'couples', d.id), {
          user2: user.uid,
          inviteToken: null,
        })
      },
      setStartDate: async (date: Date) => {
        if (!couple) throw new Error('Chưa có couple')
        await updateDoc(doc(db, 'couples', couple.id), {
          startDate: Timestamp.fromDate(date),
        })
      },
    }),
    [couple, loading, memoriesCount, user],
  )

  return api
}

