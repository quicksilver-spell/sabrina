'use client'
import { create } from 'zustand'
import { CreativeLibraryItem } from '@/lib/types/creative.types'

interface LibraryStore {
  items: CreativeLibraryItem[]
  isLoaded: boolean
  addItem: (item: CreativeLibraryItem) => void
  removeItem: (id: string) => void
  loadItems: (items: CreativeLibraryItem[]) => void
}

export const useLibraryStore = create<LibraryStore>((set) => ({
  items: [],
  isLoaded: false,

  addItem: (item) =>
    set((s) => ({ items: [item, ...s.items] })),

  removeItem: (id) =>
    set((s) => ({ items: s.items.filter((i) => i.id !== id) })),

  loadItems: (items) => set({ items, isLoaded: true }),
}))
