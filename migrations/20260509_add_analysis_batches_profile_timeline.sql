ALTER TABLE analysis_batches
  ADD COLUMN IF NOT EXISTS profile_id text,
  ADD COLUMN IF NOT EXISTS profile_name text,
  ADD COLUMN IF NOT EXISTS planted_date date,
  ADD COLUMN IF NOT EXISTS planted_time time,
  ADD COLUMN IF NOT EXISTS rice_variety text,
  ADD COLUMN IF NOT EXISTS maturity_days integer;

CREATE INDEX IF NOT EXISTS idx_analysis_batches_profile_id
  ON analysis_batches (profile_id);

CREATE INDEX IF NOT EXISTS idx_analysis_batches_profile_name
  ON analysis_batches (profile_name);
