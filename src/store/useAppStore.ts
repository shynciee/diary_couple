import { create } from 'zustand'

type AppState = {
  darkMode: boolean
  setDarkMode: (value: boolean) => void
  toggleDarkMode: () => void
}

function applyDarkClass(enabled: boolean) {
  const root = document.documentElement
  if (enabled) root.classList.add('dark')
  else root.classList.remove('dark')
}

const initialDark =
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-color-scheme: dark)')?.matches

if (typeof document !== 'undefined') applyDarkClass(Boolean(initialDark))

export const useAppStore = create<AppState>((set, get) => ({
  darkMode: Boolean(initialDark),
  setDarkMode: (value) => {
    applyDarkClass(value)
    set({ darkMode: value })
  },
  toggleDarkMode: () => {
    const next = !get().darkMode
    applyDarkClass(next)
    set({ darkMode: next })
  },
}))

