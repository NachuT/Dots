-- Create coding_time table to track user's coding time
CREATE TABLE coding_time (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  total_seconds INTEGER NOT NULL DEFAULT 0,
  last_updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create pixel_placements table to track pixel placements and time deductions
CREATE TABLE pixel_placements (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  x INTEGER NOT NULL,
  y INTEGER NOT NULL,
  color TEXT NOT NULL,
  placed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  time_deducted_seconds INTEGER NOT NULL DEFAULT 600, -- 10 minutes in seconds
  FOREIGN KEY (user_id) REFERENCES coding_time(user_id)
);

-- Enable Row Level Security
ALTER TABLE coding_time ENABLE ROW LEVEL SECURITY;
ALTER TABLE pixel_placements ENABLE ROW LEVEL SECURITY;

-- Policies for coding_time
CREATE POLICY "Users can read their own coding time"
  ON coding_time FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own coding time"
  ON coding_time FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Policies for pixel_placements
CREATE POLICY "Anyone can read pixel placements"
  ON pixel_placements FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own pixel placements"
  ON pixel_placements FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid()); 