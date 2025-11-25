-- Add 'tiebreaker' to the stage constraint for matches table
-- First drop the existing constraint, then add the new one with tiebreaker included

ALTER TABLE matches DROP CONSTRAINT IF EXISTS matches_stage_check;
ALTER TABLE matches ADD CONSTRAINT matches_stage_check CHECK (stage IN ('pool', 'quarterfinal', 'semifinal', 'final', 'third_place', 'tiebreaker'));
