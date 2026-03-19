'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const navItems = [
  {
    group: '분석',
    items: [
      { href: '/analysis/meta', label: 'Meta 분석', icon: 'M', color: '#1877F2' },
      { href: '/analysis/google', label: 'Google 분석', icon: 'G', color: '#4285F4' },
      { href: '/analysis/naver', label: 'Naver 분석', icon: 'N', color: '#03C75A' },
    ],
  },
  {
    group: '제작',
    items: [
      { href: '/creative', label: '크리에이티브 제작', icon: '✦', color: '#7C6AF7' },
    ],
  },
  {
    group: '관리',
    items: [
      { href: '/matching', label: '소재 매칭', icon: '⇄', color: '#8E8EA0' },
      { href: '/settings', label: '설정', icon: '⚙', color: '#8E8EA0' },
    ],
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className="fixed left-0 top-0 h-full flex flex-col z-40 transition-all duration-300"
      style={{
        width: collapsed ? '64px' : '240px',
        background: '#17171A',
        borderRight: '1px solid #2A2A35',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-14 border-b border-[#2A2A35]">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #7C6AF7 0%, #9D8FFF 100%)' }}
        >
          S
        </div>
        {!collapsed && (
          <span className="font-semibold text-[#F2F2F5] text-base whitespace-nowrap">
            사브리나
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto text-[#52525E] hover:text-[#F2F2F5] transition-colors flex-shrink-0"
          aria-label="사이드바 토글"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d={collapsed ? 'M6 4l4 4-4 4' : 'M10 4L6 8l4 4'}
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* Home */}
      <div className="px-2 pt-3">
        <Link
          href="/"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
            pathname === '/'
              ? 'bg-[#7C6AF7]/15 text-[#9D8FFF]'
              : 'text-[#8E8EA0] hover:text-[#F2F2F5] hover:bg-[#1E1E24]'
          }`}
        >
          <span className="text-base flex-shrink-0 w-5 text-center">⌂</span>
          {!collapsed && <span>대시보드</span>}
        </Link>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-4">
        {navItems.map((group) => (
          <div key={group.group}>
            {!collapsed && (
              <p className="px-3 mb-1 text-xs font-medium text-[#52525E] uppercase tracking-wider">
                {group.group}
              </p>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = pathname.startsWith(item.href)
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                        active
                          ? 'bg-[#7C6AF7]/15 text-[#9D8FFF]'
                          : 'text-[#8E8EA0] hover:text-[#F2F2F5] hover:bg-[#1E1E24]'
                      }`}
                      title={collapsed ? item.label : undefined}
                    >
                      <span
                        className="text-sm flex-shrink-0 w-5 h-5 flex items-center justify-center rounded font-bold"
                        style={{ color: active ? '#9D8FFF' : item.color }}
                      >
                        {item.icon}
                      </span>
                      {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-[#2A2A35]">
        {!collapsed && (
          <p className="text-xs text-[#52525E] text-center">v1.0.0</p>
        )}
      </div>
    </aside>
  )
}
