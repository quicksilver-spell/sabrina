'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { SizeConfig } from '@/lib/types/creative.types'

// Fabric.js must be dynamically imported (no SSR)
let fabric: typeof import('fabric') | null = null

interface CanvasEditorProps {
  size: SizeConfig
  onExport?: (dataUrl: string) => void
}

const TOOLS = [
  { id: 'select', label: '선택', icon: '↖' },
  { id: 'text', label: '텍스트', icon: 'T' },
  { id: 'rect', label: '사각형', icon: '□' },
  { id: 'circle', label: '원', icon: '○' },
  { id: 'image', label: '이미지', icon: '🖼' },
]

export default function CanvasEditor({ size, onExport }: CanvasEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const fabricRef = useRef<import('fabric').Canvas | null>(null)
  const historyRef = useRef<string[]>([])
  const [activeTool, setActiveTool] = useState('select')
  const [bgColor, setBgColor] = useState('#ffffff')
  const [isReady, setIsReady] = useState(false)
  const imageInputRef = useRef<HTMLInputElement>(null)

  // Initialize fabric.js
  useEffect(() => {
    let mounted = true
    async function init() {
      fabric = await import('fabric')
      if (!mounted || !canvasRef.current || !containerRef.current) return

      const container = containerRef.current
      const containerWidth = container.clientWidth
      const scale = Math.min(containerWidth / size.width, 500 / size.height, 1)

      const canvas = new fabric.Canvas(canvasRef.current, {
        width: size.width,
        height: size.height,
        backgroundColor: '#ffffff',
      })

      // Scale for display
      canvas.setZoom(scale)
      canvas.setDimensions({
        width: size.width * scale,
        height: size.height * scale,
      })

      // History snapshots
      const saveHistory = () => {
        historyRef.current = [...historyRef.current.slice(-19), JSON.stringify(canvas.toJSON())]
      }
      canvas.on('object:added', saveHistory)
      canvas.on('object:modified', saveHistory)
      canvas.on('object:removed', saveHistory)

      fabricRef.current = canvas
      setIsReady(true)
    }
    init()
    return () => {
      mounted = false
      fabricRef.current?.dispose()
    }
  }, [size])

  const addText = useCallback(() => {
    if (!fabric || !fabricRef.current) return
    const text = new fabric.IText('텍스트를 입력하세요', {
      left: 50,
      top: 50,
      fontSize: 32,
      fill: '#333333',
      fontFamily: 'Arial',
    })
    fabricRef.current.add(text)
    fabricRef.current.setActiveObject(text)
    setActiveTool('select')
  }, [])

  const addRect = useCallback(() => {
    if (!fabric || !fabricRef.current) return
    const rect = new fabric.Rect({
      left: 50,
      top: 50,
      width: 200,
      height: 120,
      fill: '#7C6AF7',
      rx: 8,
      ry: 8,
    })
    fabricRef.current.add(rect)
    fabricRef.current.setActiveObject(rect)
    setActiveTool('select')
  }, [])

  const addCircle = useCallback(() => {
    if (!fabric || !fabricRef.current) return
    const circle = new fabric.Circle({
      left: 50,
      top: 50,
      radius: 60,
      fill: '#7C6AF7',
    })
    fabricRef.current.add(circle)
    fabricRef.current.setActiveObject(circle)
    setActiveTool('select')
  }, [])

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!fabric || !fabricRef.current) return
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    const img = await fabric.Image.fromURL(url)
    const canvas = fabricRef.current
    const canvasWidth = canvas.width ?? 800
    const canvasHeight = canvas.height ?? 600
    const scale = Math.min(canvasWidth / (img.width ?? 1), canvasHeight / (img.height ?? 1), 1)
    img.scale(scale / canvas.getZoom())
    canvas.add(img)
    canvas.setActiveObject(img)
    e.target.value = ''
  }, [])

  const handleToolClick = (toolId: string) => {
    setActiveTool(toolId)
    if (toolId === 'text') addText()
    else if (toolId === 'rect') addRect()
    else if (toolId === 'circle') addCircle()
    else if (toolId === 'image') imageInputRef.current?.click()
  }

  const handleDelete = useCallback(() => {
    const canvas = fabricRef.current
    if (!canvas) return
    const obj = canvas.getActiveObject()
    if (obj) canvas.remove(obj)
  }, [])

  const handleUndo = useCallback(() => {
    const canvas = fabricRef.current
    if (!canvas || historyRef.current.length < 2) return
    historyRef.current = historyRef.current.slice(0, -1)
    const prev = historyRef.current[historyRef.current.length - 1]
    if (prev) canvas.loadFromJSON(JSON.parse(prev), () => canvas.renderAll())
  }, [])

  const handleBgChange = useCallback((color: string) => {
    setBgColor(color)
    fabricRef.current?.set('backgroundColor', color)
    fabricRef.current?.renderAll()
  }, [])

  const handleExport = useCallback(() => {
    const canvas = fabricRef.current
    if (!canvas) return
    const zoom = canvas.getZoom()
    canvas.setZoom(1)
    canvas.setDimensions({ width: size.width, height: size.height })
    const dataUrl = canvas.toDataURL({ format: 'png', multiplier: 1 })
    // Restore zoom
    const containerWidth = containerRef.current?.clientWidth ?? size.width
    const scale = Math.min(containerWidth / size.width, 500 / size.height, 1)
    canvas.setZoom(scale)
    canvas.setDimensions({ width: size.width * scale, height: size.height * scale })
    onExport?.(dataUrl)
    return dataUrl
  }, [size, onExport])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') handleDelete()
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') handleUndo()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleDelete, handleUndo])

  return (
    <div className="flex gap-4 h-full">
      {/* Toolbar */}
      <div
        className="flex flex-col gap-2 p-2 rounded-xl w-12"
        style={{ background: '#17171A', border: '1px solid #2A2A35' }}
      >
        {TOOLS.map((tool) => (
          <button
            key={tool.id}
            onClick={() => handleToolClick(tool.id)}
            title={tool.label}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all"
            style={{
              background: activeTool === tool.id ? '#7C6AF720' : 'transparent',
              color: activeTool === tool.id ? '#9D8FFF' : '#8E8EA0',
              border: `1px solid ${activeTool === tool.id ? '#7C6AF7' : 'transparent'}`,
            }}
          >
            {tool.icon}
          </button>
        ))}
        <div className="border-t border-[#2A2A35] my-1" />
        <button onClick={handleUndo} title="실행 취소 (⌘Z)" className="w-8 h-8 rounded-lg flex items-center justify-center text-sm text-[#8E8EA0] hover:text-[#F2F2F5] transition-colors">
          ↩
        </button>
        <button onClick={handleDelete} title="삭제 (Delete)" className="w-8 h-8 rounded-lg flex items-center justify-center text-sm text-[#8E8EA0] hover:text-red-400 transition-colors">
          ✕
        </button>
        <div className="border-t border-[#2A2A35] my-1" />
        <div className="relative">
          <input
            type="color"
            value={bgColor}
            onChange={(e) => handleBgChange(e.target.value)}
            title="배경색"
            className="w-8 h-8 rounded-lg cursor-pointer opacity-0 absolute inset-0"
          />
          <div
            className="w-8 h-8 rounded-lg border border-[#2A2A35]"
            style={{ background: bgColor }}
            title="배경색"
          />
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 flex items-center justify-center">
        <div ref={containerRef} className="w-full">
          {!isReady && (
            <div className="flex items-center justify-center h-64 text-[#52525E] text-sm">
              <div className="w-6 h-6 rounded-full border-2 border-t-transparent border-[#7C6AF7] animate-spin mr-2" />
              에디터 로딩 중...
            </div>
          )}
          <canvas
            ref={canvasRef}
            style={{ display: isReady ? 'block' : 'none' }}
          />
        </div>
      </div>

      {/* Export button */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />
    </div>
  )
}
