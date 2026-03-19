'use client'
import { create } from 'zustand'
import { CreativeMethod, SizeConfig, FileNameParts, GeneratedImage } from '@/lib/types/creative.types'
import { Platform } from '@/lib/types/platform.types'

interface CreativeStore {
  activeMethod: CreativeMethod | null
  selectedPlatform: Platform | null
  selectedSize: SizeConfig | null
  generatedImages: GeneratedImage[]
  canvasHistory: string[]
  pendingFilename: Partial<FileNameParts>
  setMethod: (method: CreativeMethod) => void
  setPlatform: (platform: Platform) => void
  setSize: (size: SizeConfig) => void
  addGeneratedImage: (img: GeneratedImage) => void
  pushCanvasHistory: (json: string) => void
  popCanvasHistory: () => string | null
  setFilenameField: <K extends keyof FileNameParts>(field: K, value: FileNameParts[K]) => void
  clearPendingFilename: () => void
}

export const useCreativeStore = create<CreativeStore>((set, get) => ({
  activeMethod: null,
  selectedPlatform: null,
  selectedSize: null,
  generatedImages: [],
  canvasHistory: [],
  pendingFilename: {},

  setMethod: (method) => set({ activeMethod: method }),
  setPlatform: (platform) => set({ selectedPlatform: platform }),
  setSize: (size) => set({ selectedSize: size }),

  addGeneratedImage: (img) =>
    set((s) => ({ generatedImages: [img, ...s.generatedImages] })),

  pushCanvasHistory: (json) =>
    set((s) => ({
      canvasHistory: [...s.canvasHistory.slice(-19), json],
    })),

  popCanvasHistory: () => {
    const history = get().canvasHistory
    if (history.length < 2) return null
    const prev = history[history.length - 2]
    set((s) => ({ canvasHistory: s.canvasHistory.slice(0, -1) }))
    return prev
  },

  setFilenameField: (field, value) =>
    set((s) => ({ pendingFilename: { ...s.pendingFilename, [field]: value } })),

  clearPendingFilename: () => set({ pendingFilename: {} }),
}))
