'use client'

import { useEffect, useRef } from 'react'

interface UseTournamentSSEOptions {
  tournamentId: string
  onEvent: () => void
}

export function useTournamentSSE({ tournamentId, onEvent }: UseTournamentSSEOptions) {
  const onEventRef = useRef(onEvent)

  // Keep callback ref up to date without triggering reconnection
  useEffect(() => {
    onEventRef.current = onEvent
  }, [onEvent])

  useEffect(() => {
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
    const eventSource = new EventSource(`${basePath}/api/sse/${tournamentId}`)

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.type !== 'connected') {
        onEventRef.current()
      }
    }

    eventSource.onerror = () => {
      console.warn('SSE connection error, will auto-reconnect')
    }

    return () => {
      eventSource.close()
    }
  }, [tournamentId])
}
