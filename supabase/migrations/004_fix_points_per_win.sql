-- Update the trigger function to give 2 points per win instead of 1
CREATE OR REPLACE FUNCTION update_team_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.winner_id IS NOT NULL AND (OLD.winner_id IS NULL OR OLD.winner_id != NEW.winner_id) THEN
    -- Update winner stats (2 points per win)
    UPDATE teams
    SET
      points = points + 2,
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
        points = points - 2,
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
