'use client'
import Link from 'next/link'

const methods = [
  {
    href: '/creative/canvas',
    title: '캔버스 에디터',
    desc: '직접 편집 / Fabric.js',
    icon: '✏️',
    sub: '텍스트, 도형, 이미지 레이어 직접 편집',
    tags: ['이미지', '정교한 편집'],
    color: '#7C6AF7',
  },
  {
    href: '/creative/template',
    title: '이미지 템플릿',
    desc: '템플릿 기반 빠른 제작',
    icon: '🎨',
    sub: '매체별 최적화된 템플릿으로 빠르게 생성',
    tags: ['이미지', '빠른 제작'],
    color: '#4285F4',
  },
  {
    href: '/creative/ai-generate',
    title: 'AI 이미지 생성',
    desc: 'DALL-E 3 기반',
    icon: '🤖',
    sub: '프롬프트로 AI가 광고 이미지 자동 생성',
    tags: ['이미지', 'AI 생성'],
    color: '#1877F2',
  },
  {
    href: '/creative/video-template',
    title: '동영상 템플릿',
    desc: 'Remotion 기반',
    icon: '🎬',
    sub: '텍스트 인트로, 슬라이드쇼 등 템플릿 동영상',
    tags: ['동영상', '템플릿'],
    color: '#F59E0B',
  },
  {
    href: '/creative/canvas',
    title: '캔버스 애니메이션',
    desc: 'MediaRecorder 내보내기',
    icon: '⚡',
    sub: '캔버스 애니메이션을 MP4/WebM으로 내보내기',
    tags: ['동영상', '직접 편집'],
    color: '#03C75A',
    query: '?mode=video',
  },
  {
    href: '/creative/ai-video',
    title: 'AI 동영상 생성',
    desc: 'RunwayML / Pika 연동',
    icon: '🎥',
    sub: '이미지 또는 텍스트로 AI 동영상 자동 생성',
    tags: ['동영상', 'AI 생성'],
    color: '#EC4899',
  },
]

export default function CreativePage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-lg font-semibold text-[#F2F2F5]">크리에이티브 제작</h2>
        <p className="text-sm text-[#52525E] mt-1">제작 방식을 선택하세요</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {methods.map((m) => (
          <Link
            key={m.title}
            href={m.href + (m.query ?? '')}
            className="rounded-xl p-5 transition-all hover:scale-[1.02] group"
            style={{ background: '#17171A', border: '1px solid #2A2A35' }}
          >
            <div className="flex items-start gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ background: `${m.color}15` }}
              >
                {m.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-[#F2F2F5] group-hover:text-[#9D8FFF] transition-colors">
                    {m.title}
                  </h3>
                </div>
                <p className="text-xs text-[#52525E] mb-2">{m.desc}</p>
                <p className="text-xs text-[#8E8EA0] leading-relaxed">{m.sub}</p>
                <div className="flex gap-1.5 mt-3">
                  {m.tags.map((t) => (
                    <span
                      key={t}
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: `${m.color}20`, color: m.color }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
