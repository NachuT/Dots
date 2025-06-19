-- Drop all existing tables in correct order
DROP TABLE IF EXISTS pixel_placements CASCADE;
DROP TABLE IF EXISTS coding_time CASCADE;
DROP TABLE IF EXISTS pixels CASCADE;

-- Create coding_time table to track user's coding time
CREATE TABLE coding_time (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  total_seconds INTEGER NOT NULL DEFAULT 0,
  last_updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create pixel_placements table to track pixel placements and time deductions
CREATE TABLE pixel_placements (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  x INTEGER NOT NULL,
  y INTEGER NOT NULL,
  color TEXT NOT NULL,
  placed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  time_deducted_seconds INTEGER NOT NULL DEFAULT 600,
  FOREIGN KEY (user_id) REFERENCES coding_time(user_id),
  UNIQUE(x, y)
);

-- Enable realtime for pixel_placements
ALTER PUBLICATION supabase_realtime ADD TABLE pixel_placements;

-- Grant necessary permissions
GRANT ALL ON coding_time TO authenticated;
GRANT ALL ON pixel_placements TO authenticated; 