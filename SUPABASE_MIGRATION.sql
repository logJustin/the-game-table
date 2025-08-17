-- Migration to add current_selection table for collaborative spinner
-- Run this in your Supabase SQL Editor

-- Create current_selection table to store the globally selected game
CREATE TABLE IF NOT EXISTS current_selection (
  id INTEGER PRIMARY KEY DEFAULT 1,
  selected_game_id TEXT,
  selected_game_name TEXT,
  selected_game_image TEXT,
  selected_game_bgg_id TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- Insert the initial row (there will always be exactly one row)
INSERT INTO current_selection (id, selected_game_id, selected_game_name, selected_game_image, selected_game_bgg_id)
VALUES (1, NULL, NULL, NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE current_selection ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (since this is anonymous/collaborative)
DROP POLICY IF EXISTS "Allow all operations on current_selection" ON current_selection;
CREATE POLICY "Allow all operations on current_selection" 
ON current_selection FOR ALL 
USING (true) 
WITH CHECK (true);

-- Add index for performance (though with only one row, it's not critical)
CREATE INDEX IF NOT EXISTS idx_current_selection_updated_at ON current_selection(updated_at);