type SSECallback = (event: string) => void

// Map of tournamentId -> Set of subscriber callbacks
const subscribers = new Map<string, Set<SSECallback>>()

export function subscribe(tournamentId: string, callback: SSECallback): () => void {
  if (!subscribers.has(tournamentId)) {
    subscribers.set(tournamentId, new Set())
  }
  subscribers.get(tournamentId)!.add(callback)

  // Return unsubscribe function
  return () => {
    const subs = subscribers.get(tournamentId)
    if (subs) {
      subs.delete(callback)
      if (subs.size === 0) {
        subscribers.delete(tournamentId)
      }
    }
  }
}

export function emitTournamentEvent(tournamentId: string, eventType: string): void {
  const subs = subscribers.get(tournamentId)
  if (subs) {
    for (const callback of subs) {
      callback(eventType)
    }
  }
}
