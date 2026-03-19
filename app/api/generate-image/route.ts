import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { Platform } from '@/lib/types/platform.types'

type DalleSize = '1024x1024' | '1792x1024' | '1024x1792'

function getDalleSize(width: number, height: number): DalleSize {
  const ratio = width / height
  if (ratio > 1.5) return '1792x1024'
  if (ratio < 0.67) return '1024x1792'
  return '1024x1024'
}

const platformStyleHints: Record<Platform, string> = {
  meta: 'social media advertisement, clean and engaging, vibrant colors',
  google: 'display advertisement, professional, clear call-to-action, minimal',
  naver: 'Korean digital advertisement, modern, clean design',
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, platform, width, height, style } = await req.json()

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'OPENAI_API_KEY가 설정되지 않았습니다' }, { status: 500 })
    }

    const openai = new OpenAI({ apiKey })
    const styleHint = platformStyleHints[platform as Platform] ?? ''
    const enhancedPrompt = `${prompt}. Style: ${styleHint}${style ? ', ' + style : ''}. High quality, professional advertising creative.`

    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: enhancedPrompt,
      size: getDalleSize(width ?? 1024, height ?? 1024),
      quality: 'hd',
      n: 1,
    })

    const imageUrl = response.data?.[0]?.url
    const revisedPrompt = response.data?.[0]?.revised_prompt

    return NextResponse.json({ imageUrl, revisedPrompt })
  } catch (err: unknown) {
    console.error('generate-image error:', err)
    const message = err instanceof Error ? err.message : '이미지 생성 중 오류가 발생했습니다'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
