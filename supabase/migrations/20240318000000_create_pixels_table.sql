-- Create pixels table
CREATE TABLE pixels (
  id BIGSERIAL PRIMARY KEY,
  x INTEGER NOT NULL,
  y INTEGER NOT NULL,
  color TEXT NOT NULL,
  user_id TEXT NOT NULL,
  placed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  UNIQUE(x, y)
);

-- Create index for faster lookups
CREATE INDEX pixels_xy_idx ON pixels(x, y);

-- Enable Row Level Security
ALTER TABLE pixels ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read pixels
CREATE POLICY "Anyone can read pixels"
  ON pixels FOR SELECT
  USING (true);

-- Create policy to allow authenticated users to insert/update pixels
CREATE POLICY "Authenticated users can insert/update pixels"
  ON pixels FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update pixels"
  ON pixels FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true); 