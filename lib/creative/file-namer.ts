import { FileNameParts, CreativeMediaType } from '@/lib/types/creative.types'
import { Platform } from '@/lib/types/platform.types'

const MEDIUM_MAP: Record<Platform, FileNameParts['medium']> = {
  meta: 'META',
  google: 'GOOGLE',
  naver: 'NAVER',
}

export function buildFileName(parts: FileNameParts): string {
  const desc = sanitizeContentDesc(parts.contentDesc)
  return `${parts.medium}_${parts.type}_${parts.width}x${parts.height}_${parts.creativeType}_${desc}`
}

export function sanitizeContentDesc(desc: string): string {
  return desc
    .toUpperCase()
    .replace(/\s+/g, '_')
    .replace(/[^A-Z0-9가-힣_]/g, '')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 40)
}

export function validateFileName(parts: Partial<FileNameParts>): string[] {
  const errors: string[] = []
  if (!parts.medium) errors.push('매체를 선택해주세요')
  if (!parts.type) errors.push('파일 유형을 선택해주세요')
  if (!parts.width || !parts.height) errors.push('사이즈를 선택해주세요')
  if (!parts.creativeType) errors.push('크리에이티브 유형을 선택해주세요')
  if (!parts.contentDesc || parts.contentDesc.trim().length < 2) {
    errors.push('콘텐츠 설명을 2자 이상 입력해주세요')
  }
  return errors
}

export function platformToMedium(platform: Platform): FileNameParts['medium'] {
  return MEDIUM_MAP[platform]
}

export function parseFileName(filename: string): Partial<FileNameParts> | null {
  // Remove extension if present
  const name = filename.replace(/\.[^.]+$/, '')
  const parts = name.split('_')
  if (parts.length < 5) return null

  const medium = parts[0] as FileNameParts['medium']
  const type = parts[1] as CreativeMediaType
  const sizePart = parts[2]
  const creativeType = parts[3]
  const contentDesc = parts.slice(4).join('_')

  const sizeMatch = sizePart.match(/^(\d+)x(\d+)$/)
  if (!sizeMatch) return null

  return {
    medium,
    type,
    width: parseInt(sizeMatch[1]),
    height: parseInt(sizeMatch[2]),
    creativeType,
    contentDesc,
  }
}
