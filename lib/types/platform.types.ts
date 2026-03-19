export type Platform = 'meta' | 'google' | 'naver'

export interface PlatformConfig {
  id: Platform
  name: string
  color: string
  bgColor: string
  textColor: string
  icon: string
}

export const PLATFORMS: Record<Platform, PlatformConfig> = {
  meta: {
    id: 'meta',
    name: 'Meta',
    color: '#1877F2',
    bgColor: 'bg-blue-600',
    textColor: 'text-blue-400',
    icon: 'M',
  },
  google: {
    id: 'google',
    name: 'Google',
    color: '#4285F4',
    bgColor: 'bg-sky-500',
    textColor: 'text-sky-400',
    icon: 'G',
  },
  naver: {
    id: 'naver',
    name: 'Naver',
    color: '#03C75A',
    bgColor: 'bg-green-500',
    textColor: 'text-green-400',
    icon: 'N',
  },
}
