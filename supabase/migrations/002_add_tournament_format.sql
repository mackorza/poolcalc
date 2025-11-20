-- Add tournament_format column to tournaments table
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS tournament_format TEXT NOT NULL DEFAULT 'round_robin' CHECK (tournament_format IN ('round_robin', 'pool_playoff'));

-- Add stage column to matches table (pool, quarterfinal, semifinal, final)
ALTER TABLE matches ADD COLUMN IF NOT EXISTS stage TEXT NOT NULL DEFAULT 'pool' CHECK (stage IN ('pool', 'quarterfinal', 'semifinal', 'final', 'third_place'));

-- Add pool_group column to teams table (for pool stage grouping)
ALTER TABLE teams ADD COLUMN IF NOT EXISTS pool_group TEXT;

-- Add bracket_position for knockout stage ordering
ALTER TABLE matches ADD COLUMN IF NOT EXISTS bracket_position INTEGER;

-- Create index for stage queries
CREATE INDEX IF NOT EXISTS idx_matches_stage ON matches(tournament_id, stage);
