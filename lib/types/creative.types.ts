import { Platform } from './platform.types'

export type CreativeMediaType = 'IMG' | 'VIDEO' | 'GIF'
export type CreativeMethod = 'canvas' | 'ai-generate' | 'template' | 'ai-video' | 'video-template'

export interface SizeConfig {
  width: number
  height: number
  label: string
  platform: Platform
  creativeTypes: string[]
  isVideo?: boolean
}

export interface FileNameParts {
  medium: 'META' | 'GOOGLE' | 'NAVER'
  type: CreativeMediaType
  width: number
  height: number
  creativeType: string
  contentDesc: string
}

export interface CreativeLibraryItem {
  id: string
  filename: string
  medium: string
  type: CreativeMediaType
  width: number
  height: number
  creativeType: string
  contentDesc: string
  thumbnail: string
  source: 'local' | 'drive' | 'app'
  createdAt: string
  fileSize?: number
  platform: Platform
}

export interface TemplateDefinition {
  id: string
  name: string
  platform: Platform
  size: SizeConfig
  thumbnail: string
  slots: SlotDefinition[]
  isVideo: boolean
}

export interface SlotDefinition {
  key: string
  label: string
  type: 'text' | 'image' | 'color'
  defaultValue: string
  maxLength?: number
}

export interface GeneratedImage {
  id: string
  url: string
  prompt: string
  width: number
  height: number
  platform: Platform
  createdAt: string
}

export interface MatchResult {
  adName: string
  platform: Platform
  campaign: string
  impressions: number
  clicks: number
  ctr: number
  spend: number
  roas?: number
  exact: CreativeLibraryItem | null
  partial: CreativeLibraryItem[]
  status: 'matched' | 'partial' | 'missing'
}
