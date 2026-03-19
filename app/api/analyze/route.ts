import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { buildAnalysisPrompt } from '@/lib/analyzers/claude-prompt-builder'
import { PlatformMetrics } from '@/lib/types/report.types'

export async function POST(req: NextRequest) {
  try {
    const { metrics }: { metrics: PlatformMetrics } = await req.json()

    if (!metrics) {
      return new Response('metrics 데이터가 필요합니다', { status: 400 })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return new Response('ANTHROPIC_API_KEY가 설정되지 않았습니다', { status: 500 })
    }

    const client = new Anthropic({ apiKey })
    const prompt = buildAnalysisPrompt(metrics)

    const stream = await client.messages.stream({
      model: 'claude-opus-4-6',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    })

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (
              chunk.type === 'content_block_delta' &&
              chunk.delta.type === 'text_delta'
            ) {
              controller.enqueue(new TextEncoder().encode(chunk.delta.text))
            }
          }
          controller.close()
        } catch (err) {
          controller.error(err)
        }
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Transfer-Encoding': 'chunked',
      },
    })
  } catch (err) {
    console.error('analyze error:', err)
    return new Response('분석 중 오류가 발생했습니다', { status: 500 })
  }
}
