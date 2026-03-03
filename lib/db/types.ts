import type { InferSelectModel, InferInsertModel } from 'drizzle-orm'
import type { tournaments, teams, matches } from './schema'

// Row types (SELECT)
export type Tournament = InferSelectModel<typeof tournaments>
export type Team = InferSelectModel<typeof teams>
export type Match = InferSelectModel<typeof matches>

// Insert types
export type NewTournament = InferInsertModel<typeof tournaments>
export type NewTeam = InferInsertModel<typeof teams>
export type NewMatch = InferInsertModel<typeof matches>

// Composite type: match with joined team objects
export type MatchWithTeams = Match & {
  team1: Team
  team2: Team
  winner: Team | null
}
