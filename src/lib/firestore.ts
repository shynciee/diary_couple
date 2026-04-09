import {
  collection,
  doc,
  serverTimestamp,
  Timestamp,
  type CollectionReference,
} from 'firebase/firestore'
import { db } from './firebase'
import type { Couple, Memory } from '../types'

export const tsNow = () => Timestamp.now()
export const serverNow = () => serverTimestamp()

export function couplesCol(): CollectionReference<Couple> {
  return collection(db, 'couples') as CollectionReference<Couple>
}

export function coupleDoc(coupleId: string) {
  return doc(db, 'couples', coupleId) as ReturnType<typeof doc>
}

export function memoriesCol(): CollectionReference<Memory> {
  return collection(db, 'memories') as CollectionReference<Memory>
}

export function memoryDoc(memoryId: string) {
  return doc(db, 'memories', memoryId) as ReturnType<typeof doc>
}

