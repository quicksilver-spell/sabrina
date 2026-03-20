'use client'
import { usePathname } from 'next/navigation'

const pageTitles: Record<string, { title: string; description: string }> = {
  '/': { title: '대시보드', description: '광고 성과 개요' },
  '/analysis/meta': { title: 'Meta 분석', description: 'Meta 광고 성과 리포트' },
  '/analysis/google': { title: 'Google 분석', description: 'Google 광고 성과 리포트' },
  '/analysis/naver': { title: 'Naver 분석', description: 'Naver 광고 성과 리포트' },
  '/creative': { title: '크리에이티브 제작', description: '소재 제작 및 내보내기' },
  '/creative/canvas': { title: '캔버스 에디터', description: '직접 편집' },
  '/creative/ai-generate': { title: 'AI 이미지 생성', description: 'DALL-E 기반 이미지 생성' },
  '/creative/ai-video': { title: 'AI 동영상 생성', description: 'AI 기반 동영상 생성' },
  '/creative/template': { title: '이미지 템플릿', description: '템플릿 기반 제작' },
  '/creative/video-template': { title: '동영상 템플릿', description: 'Remotion 기반 동영상 제작' },
  '/matching': { title: '소재 매칭', description: '리포트 소재명 vs 크리에이티브 파일' },
  '/settings': { title: '설정', description: 'API 키 및 환경 설정' },
}

export default function Header() {
  const pathname = usePathname()
  const page = pageTitles[pathname] ?? { title: '사브리나', description: '' }

  return (
    <header
      className="fixed top-0 right-0 z-30 flex items-center px-6 gap-4"
      style={{
        left: 'var(--sidebar-width, 240px)',
        height: '56px',
        background: 'rgba(15, 15, 17, 0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #2A2A35',
      }}
    >
      <div className="flex-1 min-w-0">
        <h1 className="text-base font-bold text-[#F2F2F5] truncate">{page.title}</h1>
        {page.description && (
          <p className="text-xs text-[#52525E] truncate">{page.description}</p>
        )}
      </div>

      {/* Sabrina badge */}
      <div
        className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
        style={{
          background: 'linear-gradient(90deg, rgba(92,79,217,0.15) 0%, rgba(157,143,255,0.08) 100%)',
          border: '1px solid rgba(124,106,247,0.3)',
        }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#9D8FFF] animate-pulse" style={{ boxShadow: '0 0 6px #7C6AF7' }} />
        <span
          style={{
            background: 'linear-gradient(90deg, #C4B5FD 0%, #F2F2F5 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '0.08em',
          }}
        >
          SABRINA
        </span>
      </div>
    </header>
  )
}
