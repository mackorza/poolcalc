-- Create tournaments table
CREATE TABLE IF NOT EXISTS tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_name TEXT NOT NULL,
  venue_location TEXT,
  tournament_date DATE NOT NULL,
  start_time TIME,
  num_tables INTEGER NOT NULL CHECK (num_tables > 0),
  num_rounds INTEGER NOT NULL CHECK (num_rounds > 0),
  status TEXT NOT NULL DEFAULT 'setup' CHECK (status IN ('setup', 'in_progress', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  player1_name TEXT NOT NULL,
  player2_name TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  wins INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create matches table
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL CHECK (round_number > 0),
  table_number INTEGER NOT NULL CHECK (table_number > 0),
  team1_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  team2_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  winner_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CONSTRAINT different_teams CHECK (team1_id != team2_id),
  CONSTRAINT winner_must_be_participant CHECK (winner_id IS NULL OR winner_id = team1_id OR winner_id = team2_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_teams_tournament ON teams(tournament_id);
CREATE INDEX idx_teams_points ON teams(tournament_id, points DESC);
CREATE INDEX idx_matches_tournament ON matches(tournament_id);
CREATE INDEX idx_matches_round ON matches(tournament_id, round_number);
CREATE INDEX idx_matches_completed ON matches(tournament_id, completed_at);

-- Enable Row Level Security (RLS)
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Anyone can view tournaments" ON tournaments FOR SELECT USING (true);
CREATE POLICY "Anyone can view teams" ON teams FOR SELECT USING (true);
CREATE POLICY "Anyone can view matches" ON matches FOR SELECT USING (true);

-- Create policies for insert/update (we'll handle auth later)
CREATE POLICY "Anyone can create tournaments" ON tournaments FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update tournaments" ON tournaments FOR UPDATE USING (true);
CREATE POLICY "Anyone can create teams" ON teams FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update teams" ON teams FOR UPDATE USING (true);
CREATE POLICY "Anyone can create matches" ON matches FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update matches" ON matches FOR UPDATE USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_tournaments_updated_at BEFORE UPDATE ON tournaments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to update team stats when match is completed
CREATE OR REPLACE FUNCTION update_team_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.winner_id IS NOT NULL AND (OLD.winner_id IS NULL OR OLD.winner_id != NEW.winner_id) THEN
    -- Update winner stats
    UPDATE teams
    SET
      points = points + 1,
      wins = wins + 1
    WHERE id = NEW.winner_id;

    -- Update loser stats
    UPDATE teams
    SET
      losses = losses + 1
    WHERE id = CASE
      WHEN NEW.team1_id = NEW.winner_id THEN NEW.team2_id
      ELSE NEW.team1_id
    END;

    -- If winner changed, revert old winner/loser stats
    IF OLD.winner_id IS NOT NULL THEN
      UPDATE teams
      SET
        points = points - 1,
        wins = wins - 1
      WHERE id = OLD.winner_id;

      UPDATE teams
      SET
        losses = losses - 1
      WHERE id = CASE
        WHEN NEW.team1_id = OLD.winner_id THEN NEW.team2_id
        ELSE NEW.team1_id
      END;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to update team stats
CREATE TRIGGER update_team_stats_on_match_complete
  AFTER UPDATE ON matches
  FOR EACH ROW
  EXECUTE FUNCTION update_team_stats();
