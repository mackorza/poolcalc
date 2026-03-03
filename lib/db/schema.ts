import {
  pgTable,
  uuid,
  text,
  date,
  time,
  integer,
  timestamp,
  check,
  index,
} from 'drizzle-orm/pg-core'
import { relations, sql } from 'drizzle-orm'

// ── tournaments ──────────────────────────────────────────────

export const tournaments = pgTable('tournaments', {
  id: uuid('id').primaryKey().defaultRandom(),
  venue_name: text('venue_name').notNull(),
  venue_location: text('venue_location'),
  tournament_date: date('tournament_date').notNull(),
  start_time: time('start_time'),
  num_tables: integer('num_tables').notNull(),
  num_rounds: integer('num_rounds').notNull(),
  num_players: integer('num_players').notNull().default(0),
  status: text('status', {
    enum: ['setup', 'in_progress', 'completed'],
  }).notNull().default('setup'),
  tournament_format: text('tournament_format', {
    enum: ['round_robin', 'pool_playoff'],
  }).notNull().default('round_robin'),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  check('num_tables_positive', sql`${table.num_tables} > 0`),
  check('num_rounds_positive', sql`${table.num_rounds} > 0`),
])

// ── teams ────────────────────────────────────────────────────

export const teams = pgTable('teams', {
  id: uuid('id').primaryKey().defaultRandom(),
  tournament_id: uuid('tournament_id')
    .notNull()
    .references(() => tournaments.id, { onDelete: 'cascade' }),
  player1_name: text('player1_name').notNull(),
  player2_name: text('player2_name').notNull(),
  points: integer('points').notNull().default(0),
  wins: integer('wins').notNull().default(0),
  losses: integer('losses').notNull().default(0),
  pool_group: text('pool_group'),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('idx_teams_tournament').on(table.tournament_id),
  index('idx_teams_points').on(table.tournament_id, table.points),
])

// ── matches ──────────────────────────────────────────────────

export const matches = pgTable('matches', {
  id: uuid('id').primaryKey().defaultRandom(),
  tournament_id: uuid('tournament_id')
    .notNull()
    .references(() => tournaments.id, { onDelete: 'cascade' }),
  round_number: integer('round_number').notNull(),
  table_number: integer('table_number').notNull(),
  team1_id: uuid('team1_id')
    .notNull()
    .references(() => teams.id, { onDelete: 'cascade' }),
  team2_id: uuid('team2_id')
    .notNull()
    .references(() => teams.id, { onDelete: 'cascade' }),
  winner_id: uuid('winner_id')
    .references(() => teams.id, { onDelete: 'set null' }),
  completed_at: timestamp('completed_at', { withTimezone: true }),
  stage: text('stage', {
    enum: ['pool', 'quarterfinal', 'semifinal', 'final', 'third_place', 'tiebreaker'],
  }).notNull().default('pool'),
  bracket_position: integer('bracket_position'),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  check('round_number_positive', sql`${table.round_number} > 0`),
  check('table_number_positive', sql`${table.table_number} > 0`),
  check('different_teams', sql`${table.team1_id} != ${table.team2_id}`),
  check('winner_must_be_participant',
    sql`${table.winner_id} IS NULL OR ${table.winner_id} = ${table.team1_id} OR ${table.winner_id} = ${table.team2_id}`
  ),
  index('idx_matches_tournament').on(table.tournament_id),
  index('idx_matches_round').on(table.tournament_id, table.round_number),
  index('idx_matches_completed').on(table.tournament_id, table.completed_at),
  index('idx_matches_stage').on(table.tournament_id, table.stage),
])

// ── relations ────────────────────────────────────────────────

export const tournamentsRelations = relations(tournaments, ({ many }) => ({
  teams: many(teams),
  matches: many(matches),
}))

export const teamsRelations = relations(teams, ({ one, many }) => ({
  tournament: one(tournaments, {
    fields: [teams.tournament_id],
    references: [tournaments.id],
  }),
  matchesAsTeam1: many(matches, { relationName: 'team1' }),
  matchesAsTeam2: many(matches, { relationName: 'team2' }),
  matchesAsWinner: many(matches, { relationName: 'winner' }),
}))

export const matchesRelations = relations(matches, ({ one }) => ({
  tournament: one(tournaments, {
    fields: [matches.tournament_id],
    references: [tournaments.id],
  }),
  team1: one(teams, {
    fields: [matches.team1_id],
    references: [teams.id],
    relationName: 'team1',
  }),
  team2: one(teams, {
    fields: [matches.team2_id],
    references: [teams.id],
    relationName: 'team2',
  }),
  winner: one(teams, {
    fields: [matches.winner_id],
    references: [teams.id],
    relationName: 'winner',
  }),
}))
