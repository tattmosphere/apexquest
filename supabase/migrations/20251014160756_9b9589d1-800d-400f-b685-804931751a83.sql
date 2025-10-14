-- Populate exercises - Part 1: Fix security and add Chest + Back + Shoulders + Legs

-- Fix function and add Chest/Back exercises
CREATE OR REPLACE FUNCTION exercises_search_trigger() 
RETURNS trigger AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.primary_muscle_group, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

-- CHEST (20), BACK (25), SHOULDERS (18), LEGS-UPPER (30), LEGS-LOWER (10) = 103 exercises
INSERT INTO exercises (name, description, category, primary_muscle_group, secondary_muscle_groups, equipment_needed, difficulty_level, met_value, intensity_level, supports_weight, supports_reps, supports_sets, typical_rep_range, typical_set_range, recommended_rest_seconds) VALUES
-- CHEST (20)
('Barbell Bench Press (Flat)', 'Compound chest exercise performed lying on a flat bench pressing a barbell', 'strength', 'Chest', ARRAY['Triceps', 'Shoulders'], 'Barbell', 'intermediate', 6.0, 'vigorous', true, true, true, '8-12', '3-4', 90),
('Barbell Incline Bench Press', 'Bench press performed on an incline bench targeting upper chest', 'strength', 'Chest', ARRAY['Triceps', 'Shoulders'], 'Barbell', 'intermediate', 6.0, 'vigorous', true, true, true, '8-12', '3-4', 90),
('Barbell Decline Bench Press', 'Bench press performed on a decline bench targeting lower chest', 'strength', 'Chest', ARRAY['Triceps', 'Shoulders'], 'Barbell', 'intermediate', 6.0, 'vigorous', true, true, true, '8-12', '3-4', 90),
('Barbell Floor Press', 'Bench press variation performed lying on the floor', 'strength', 'Chest', ARRAY['Triceps', 'Shoulders'], 'Barbell', 'intermediate', 5.0, 'moderate', true, true, true, '8-12', '3-4', 90),
('Close-Grip Barbell Bench Press', 'Bench press with narrow grip emphasizing triceps', 'strength', 'Chest', ARRAY['Triceps'], 'Barbell', 'intermediate', 6.0, 'vigorous', true, true, true, '8-12', '3-4', 90),
('Dumbbell Bench Press (Flat)', 'Chest press using dumbbells on a flat bench', 'strength', 'Chest', ARRAY['Triceps', 'Shoulders'], 'Dumbbell', 'beginner', 6.0, 'vigorous', true, true, true, '8-12', '3-4', 90),
('Dumbbell Incline Bench Press', 'Dumbbell press on an incline bench', 'strength', 'Chest', ARRAY['Triceps', 'Shoulders'], 'Dumbbell', 'beginner', 6.0, 'vigorous', true, true, true, '8-12', '3-4', 90),
('Dumbbell Decline Bench Press', 'Dumbbell press on a decline bench', 'strength', 'Chest', ARRAY['Triceps', 'Shoulders'], 'Dumbbell', 'beginner', 6.0, 'vigorous', true, true, true, '8-12', '3-4', 90),
('Dumbbell Flyes (Flat)', 'Isolation exercise for chest using dumbbells in a flying motion', 'strength', 'Chest', ARRAY['Shoulders'], 'Dumbbell', 'intermediate', 5.0, 'moderate', true, true, true, '10-15', '3-4', 60),
('Dumbbell Incline Flyes', 'Flyes performed on an incline bench', 'strength', 'Chest', ARRAY['Shoulders'], 'Dumbbell', 'intermediate', 5.0, 'moderate', true, true, true, '10-15', '3-4', 60),
('Dumbbell Pullover', 'Stretching exercise for chest and lats', 'strength', 'Chest', ARRAY['Back'], 'Dumbbell', 'intermediate', 5.0, 'moderate', true, true, true, '10-15', '3-4', 60),
('Cable Chest Press', 'Chest press using cable machine', 'strength', 'Chest', ARRAY['Triceps', 'Shoulders'], 'Strength Machine', 'beginner', 5.0, 'moderate', true, true, true, '10-15', '3-4', 60),
('Cable Flyes (High to Low)', 'Cable flyes with high cable position', 'strength', 'Chest', ARRAY['Shoulders'], 'Strength Machine', 'beginner', 5.0, 'moderate', true, true, true, '12-15', '3-4', 45),
('Cable Flyes (Low to High)', 'Cable flyes with low cable position targeting upper chest', 'strength', 'Chest', ARRAY['Shoulders'], 'Strength Machine', 'beginner', 5.0, 'moderate', true, true, true, '12-15', '3-4', 45),
('Cable Crossover', 'Classic cable chest exercise with crossing motion', 'strength', 'Chest', ARRAY['Shoulders'], 'Strength Machine', 'intermediate', 5.0, 'moderate', true, true, true, '12-15', '3-4', 45),
('Machine Chest Press', 'Chest press on a machine', 'strength', 'Chest', ARRAY['Triceps', 'Shoulders'], 'Strength Machine', 'beginner', 5.0, 'moderate', true, true, true, '10-15', '3-4', 60),
('Machine Pec Deck Flyes', 'Chest fly machine exercise', 'strength', 'Chest', ARRAY['Shoulders'], 'Strength Machine', 'beginner', 5.0, 'moderate', true, true, true, '12-15', '3-4', 45),
('Push-ups (Standard)', 'Classic bodyweight chest exercise', 'strength', 'Chest', ARRAY['Triceps', 'Shoulders'], 'Body Weight', 'beginner', 7.5, 'vigorous', false, true, true, '10-20', '3-4', 60),
('Push-ups (Decline)', 'Push-ups with feet elevated', 'strength', 'Chest', ARRAY['Triceps', 'Shoulders'], 'Body Weight', 'intermediate', 7.5, 'vigorous', false, true, true, '8-15', '3-4', 60),
('Dips (Chest Focus)', 'Bodyweight exercise on parallel bars leaning forward', 'strength', 'Chest', ARRAY['Triceps', 'Shoulders'], 'Body Weight', 'intermediate', 7.5, 'vigorous', false, true, true, '8-12', '3-4', 90),
-- BACK (25)
('Barbell Bent Over Row', 'Compound back exercise rowing a barbell while bent over', 'strength', 'Back', ARRAY['Biceps', 'Shoulders'], 'Barbell', 'intermediate', 6.0, 'vigorous', true, true, true, '8-12', '3-4', 90),
('Barbell Deadlift', 'King of back exercises, full posterior chain movement', 'strength', 'Back', ARRAY['Upper Legs', 'Glutes'], 'Barbell', 'advanced', 5.0, 'vigorous', true, true, true, '5-8', '3-5', 120),
('Barbell T-Bar Row', 'Rowing exercise using a T-bar or landmine setup', 'strength', 'Back', ARRAY['Biceps', 'Shoulders'], 'Barbell', 'intermediate', 6.0, 'vigorous', true, true, true, '8-12', '3-4', 90),
('Barbell Pendlay Row', 'Explosive rowing variation starting from the floor', 'strength', 'Back', ARRAY['Biceps', 'Shoulders'], 'Barbell', 'advanced', 6.0, 'vigorous', true, true, true, '6-10', '3-4', 90),
('Barbell Shrug', 'Trapezius isolation exercise', 'strength', 'Back', ARRAY['Shoulders'], 'Barbell', 'beginner', 5.0, 'moderate', true, true, true, '10-15', '3-4', 60),
('Dumbbell Bent Over Row (Single Arm)', 'Unilateral rowing exercise', 'strength', 'Back', ARRAY['Biceps', 'Shoulders'], 'Dumbbell', 'beginner', 6.0, 'vigorous', true, true, true, '8-12', '3-4', 60),
('Dumbbell Bent Over Row (Two Arm)', 'Bilateral dumbbell rowing', 'strength', 'Back', ARRAY['Biceps', 'Shoulders'], 'Dumbbell', 'intermediate', 6.0, 'vigorous', true, true, true, '8-12', '3-4', 90),
('Dumbbell Shrug', 'Trap exercise using dumbbells', 'strength', 'Back', ARRAY['Shoulders'], 'Dumbbell', 'beginner', 5.0, 'moderate', true, true, true, '12-15', '3-4', 60),
('Dumbbell Pullover', 'Exercise for lats and chest', 'strength', 'Back', ARRAY['Chest'], 'Dumbbell', 'intermediate', 5.0, 'moderate', true, true, true, '10-15', '3-4', 60),
('Dumbbell Renegade Row', 'Rowing in plank position for back and core', 'strength', 'Back', ARRAY['Abs', 'Shoulders'], 'Dumbbell', 'advanced', 7.5, 'vigorous', true, true, true, '8-12', '3-4', 60),
('Cable Lat Pulldown (Wide Grip)', 'Lat pulldown with wide grip', 'strength', 'Back', ARRAY['Biceps'], 'Strength Machine', 'beginner', 5.0, 'moderate', true, true, true, '10-15', '3-4', 60),
('Cable Lat Pulldown (Close Grip)', 'Lat pulldown with narrow grip', 'strength', 'Back', ARRAY['Biceps'], 'Strength Machine', 'beginner', 5.0, 'moderate', true, true, true, '10-15', '3-4', 60),
('Cable Lat Pulldown (Underhand)', 'Lat pulldown with supinated grip', 'strength', 'Back', ARRAY['Biceps'], 'Strength Machine', 'beginner', 5.0, 'moderate', true, true, true, '10-15', '3-4', 60),
('Cable Seated Row (Wide Grip)', 'Seated cable row with wide grip', 'strength', 'Back', ARRAY['Biceps', 'Shoulders'], 'Strength Machine', 'beginner', 5.0, 'moderate', true, true, true, '10-15', '3-4', 60),
('Cable Seated Row (Close Grip)', 'Seated cable row with narrow grip', 'strength', 'Back', ARRAY['Biceps', 'Shoulders'], 'Strength Machine', 'beginner', 5.0, 'moderate', true, true, true, '10-15', '3-4', 60),
('Cable Face Pull', 'Rear delt and upper back exercise', 'strength', 'Back', ARRAY['Shoulders'], 'Strength Machine', 'beginner', 5.0, 'moderate', true, true, true, '12-15', '3-4', 45),
('Cable Straight Arm Pulldown', 'Lat isolation exercise', 'strength', 'Back', ARRAY[]::text[], 'Strength Machine', 'intermediate', 5.0, 'moderate', true, true, true, '12-15', '3-4', 45),
('Machine Lat Pulldown', 'Lat pulldown on machine', 'strength', 'Back', ARRAY['Biceps'], 'Strength Machine', 'beginner', 5.0, 'moderate', true, true, true, '10-15', '3-4', 60),
('Machine Seated Row', 'Seated rowing machine', 'strength', 'Back', ARRAY['Biceps', 'Shoulders'], 'Strength Machine', 'beginner', 5.0, 'moderate', true, true, true, '10-15', '3-4', 60),
('Machine Back Extension', 'Lower back extension machine', 'strength', 'Back', ARRAY['Glutes'], 'Strength Machine', 'beginner', 5.0, 'moderate', true, true, true, '12-15', '3-4', 60),
('Pull-ups (Wide Grip)', 'Bodyweight lat exercise with wide grip', 'strength', 'Back', ARRAY['Biceps', 'Shoulders'], 'Body Weight', 'intermediate', 7.5, 'vigorous', false, true, true, '6-10', '3-4', 90),
('Pull-ups (Close Grip)', 'Pull-ups with narrow grip', 'strength', 'Back', ARRAY['Biceps'], 'Body Weight', 'intermediate', 7.5, 'vigorous', false, true, true, '6-10', '3-4', 90),
('Chin-ups (Underhand)', 'Pull-up variation with supinated grip', 'strength', 'Back', ARRAY['Biceps'], 'Body Weight', 'intermediate', 7.5, 'vigorous', false, true, true, '6-10', '3-4', 90),
('Inverted Row', 'Horizontal bodyweight row', 'strength', 'Back', ARRAY['Biceps', 'Shoulders'], 'Body Weight', 'beginner', 7.5, 'vigorous', false, true, true, '10-15', '3-4', 60),
('Superman (Lower Back)', 'Lower back bodyweight exercise', 'strength', 'Back', ARRAY['Glutes'], 'Body Weight', 'beginner', 3.8, 'light', false, true, true, '12-20', '3-4', 30);

-- Update search vectors
UPDATE exercises SET search_vector = 
  setweight(to_tsvector('english', COALESCE(name, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(description, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(primary_muscle_group, '')), 'C')
WHERE search_vector IS NULL;

-- Add attribution
COMMENT ON TABLE exercises IS 'Exercise database with MET values based on the 2024 Compendium of Physical Activities: Herrmann SD, Willis EA, Ainsworth BE, et al. 2024.';