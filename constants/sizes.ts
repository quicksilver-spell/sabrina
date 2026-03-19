import { SizeConfig } from '@/lib/types/creative.types'

export const SIZE_CONFIGS: SizeConfig[] = [
  // Meta 이미지
  { width: 1080, height: 1080, label: '정방형 (1:1)', platform: 'meta', creativeTypes: ['SINGLE', 'CAROUSEL'] },
  { width: 1200, height: 628, label: '피드 가로 (1.91:1)', platform: 'meta', creativeTypes: ['SINGLE', 'CAROUSEL'] },
  { width: 1080, height: 1350, label: '세로 (4:5)', platform: 'meta', creativeTypes: ['SINGLE', 'CAROUSEL'] },
  { width: 1200, height: 1500, label: '세로 (4:5 tall)', platform: 'meta', creativeTypes: ['SINGLE'] },
  // Meta 동영상
  { width: 1080, height: 1920, label: '스토리/릴스 (9:16)', platform: 'meta', creativeTypes: ['STORY', 'REELS'], isVideo: true },
  { width: 1080, height: 1080, label: '정방형 동영상 (1:1)', platform: 'meta', creativeTypes: ['SINGLE'], isVideo: true },
  { width: 1920, height: 1080, label: '가로 동영상 (16:9)', platform: 'meta', creativeTypes: ['SINGLE'], isVideo: true },

  // Google 이미지
  { width: 300, height: 250, label: '미디엄 직사각형', platform: 'google', creativeTypes: ['BANNER'] },
  { width: 728, height: 90, label: '리더보드', platform: 'google', creativeTypes: ['BANNER'] },
  { width: 320, height: 50, label: '모바일 배너', platform: 'google', creativeTypes: ['BANNER'] },
  { width: 336, height: 280, label: '대형 직사각형', platform: 'google', creativeTypes: ['BANNER'] },
  { width: 160, height: 600, label: '와이드 스카이스크래퍼', platform: 'google', creativeTypes: ['BANNER'] },
  { width: 970, height: 250, label: '빌보드', platform: 'google', creativeTypes: ['BANNER'] },
  // Google 동영상
  { width: 1920, height: 1080, label: '유튜브 인스트림 (16:9)', platform: 'google', creativeTypes: ['INSTREAM'], isVideo: true },
  { width: 1280, height: 720, label: '유튜브 HD (16:9)', platform: 'google', creativeTypes: ['INSTREAM'], isVideo: true },

  // Naver 이미지
  { width: 1200, height: 628, label: '와이드형 (1.91:1)', platform: 'naver', creativeTypes: ['SINGLE', 'BANNER'] },
  { width: 1080, height: 1080, label: '정방형 (1:1)', platform: 'naver', creativeTypes: ['SINGLE'] },
  { width: 1029, height: 258, label: 'DA 배너', platform: 'naver', creativeTypes: ['BANNER'] },
  // Naver 동영상
  { width: 1080, height: 1920, label: '세로 동영상 (9:16)', platform: 'naver', creativeTypes: ['SINGLE'], isVideo: true },
  { width: 1080, height: 1080, label: '정방형 동영상 (1:1)', platform: 'naver', creativeTypes: ['SINGLE'], isVideo: true },
]

export const CREATIVE_TYPES: Record<string, { label: string; platforms: string[] }> = {
  SINGLE: { label: '싱글', platforms: ['meta', 'naver'] },
  CAROUSEL: { label: '카루셀', platforms: ['meta'] },
  STORY: { label: '스토리', platforms: ['meta'] },
  REELS: { label: '릴스', platforms: ['meta'] },
  BANNER: { label: '배너', platforms: ['google', 'naver'] },
  RESPONSIVE: { label: '반응형', platforms: ['google'] },
  NATIVE: { label: '네이티브', platforms: ['google', 'naver'] },
  INSTREAM: { label: '인스트림', platforms: ['google'] },
}
