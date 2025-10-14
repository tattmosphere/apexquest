-- Phase 1: Database Schema Enhancement and Exercise Population (Fixed)

-- 1. Extend exercises table
ALTER TABLE exercises 
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
ADD COLUMN IF NOT EXISTS primary_muscle_group TEXT,
ADD COLUMN IF NOT EXISTS secondary_muscle_groups TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
ADD COLUMN IF NOT EXISTS met_value DECIMAL(4,2) DEFAULT 5.0,
ADD COLUMN IF NOT EXISTS intensity_level TEXT CHECK (intensity_level IN ('light', 'moderate', 'vigorous', 'very_vigorous')),
ADD COLUMN IF NOT EXISTS supports_weight BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS supports_reps BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS supports_sets BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS supports_time BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS supports_distance BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS typical_rep_range TEXT,
ADD COLUMN IF NOT EXISTS typical_set_range TEXT,
ADD COLUMN IF NOT EXISTS recommended_rest_seconds INTEGER DEFAULT 60,
ADD COLUMN IF NOT EXISTS is_custom BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES profiles(id) ON DELETE CASCADE;

-- Update existing exercises to have primary_muscle_group from muscle_groups array
UPDATE exercises 
SET primary_muscle_group = muscle_groups[1]
WHERE primary_muscle_group IS NULL AND array_length(muscle_groups, 1) > 0;

-- Set default values for existing exercises (separate statements)
UPDATE exercises SET met_value = 5.0 WHERE met_value IS NULL;
UPDATE exercises SET intensity_level = 'moderate' WHERE intensity_level IS NULL;
UPDATE exercises SET supports_weight = true WHERE supports_weight IS NULL;
UPDATE exercises SET supports_reps = true WHERE supports_reps IS NULL;
UPDATE exercises SET supports_sets = true WHERE supports_sets IS NULL;
UPDATE exercises SET difficulty_level = 'intermediate' WHERE difficulty_level IS NULL;
UPDATE exercises SET is_custom = false WHERE is_custom IS NULL;

-- 2. Add body weight tracking to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS body_weight_lbs DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS body_weight_kg DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS weight_updated_at TIMESTAMP WITH TIME ZONE;

-- 3. Add calorie tracking to workout_session_exercises
ALTER TABLE workout_session_exercises
ADD COLUMN IF NOT EXISTS duration_minutes INTEGER,
ADD COLUMN IF NOT EXISTS calories_burned DECIMAL(6,2),
ADD COLUMN IF NOT EXISTS user_weight_at_time DECIMAL(5,2);

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_exercises_primary_muscle ON exercises(primary_muscle_group);
CREATE INDEX IF NOT EXISTS idx_exercises_difficulty ON exercises(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_exercises_met_value ON exercises(met_value);
CREATE INDEX IF NOT EXISTS idx_exercises_custom_user ON exercises(user_id, is_custom) WHERE is_custom = true;
CREATE INDEX IF NOT EXISTS idx_exercises_equipment ON exercises(equipment_needed);
CREATE INDEX IF NOT EXISTS idx_exercises_intensity ON exercises(intensity_level);

-- 5. Add full-text search capability
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE INDEX IF NOT EXISTS idx_exercises_search ON exercises USING gin(search_vector);

CREATE OR REPLACE FUNCTION exercises_search_trigger() 
RETURNS trigger AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.primary_muscle_group, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS exercises_search_update ON exercises;
CREATE TRIGGER exercises_search_update 
BEFORE INSERT OR UPDATE ON exercises
FOR EACH ROW EXECUTE FUNCTION exercises_search_trigger();

-- 6. Update RLS policies for custom exercises
DROP POLICY IF EXISTS "Users can create custom exercises" ON exercises;
CREATE POLICY "Users can create custom exercises"
ON exercises FOR INSERT
WITH CHECK (auth.uid() = user_id AND is_custom = true);

DROP POLICY IF EXISTS "Users can view public and own custom exercises" ON exercises;
CREATE POLICY "Users can view public and own custom exercises"
ON exercises FOR SELECT
USING (is_custom = false OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can modify own custom exercises" ON exercises;
CREATE POLICY "Users can modify own custom exercises"
ON exercises FOR UPDATE
USING (auth.uid() = user_id AND is_custom = true);

DROP POLICY IF EXISTS "Users can delete own custom exercises" ON exercises;
CREATE POLICY "Users can delete own custom exercises"
ON exercises FOR DELETE
USING (auth.uid() = user_id AND is_custom = true);