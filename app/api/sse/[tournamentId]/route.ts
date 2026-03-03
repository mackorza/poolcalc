import { subscribe } from '@/lib/sse/emitter'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ tournamentId: string }> }
) {
  const { tournamentId } = await params

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder()

      // Send initial connection event
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'connected' })}\n\n`))

      // Heartbeat every 30s to keep connection alive
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: heartbeat\n\n`))
        } catch {
          clearInterval(heartbeat)
        }
      }, 30000)

      // Subscribe to tournament events
      const unsubscribe = subscribe(tournamentId, (eventType) => {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: eventType, tournamentId })}\n\n`)
          )
        } catch {
          unsubscribe()
          clearInterval(heartbeat)
        }
      })

      // Clean up when client disconnects
      request.signal.addEventListener('abort', () => {
        unsubscribe()
        clearInterval(heartbeat)
        controller.close()
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
