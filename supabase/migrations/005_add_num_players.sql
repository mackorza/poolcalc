-- Add num_players column to tournaments table
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS num_players integer NOT NULL DEFAULT 0;
