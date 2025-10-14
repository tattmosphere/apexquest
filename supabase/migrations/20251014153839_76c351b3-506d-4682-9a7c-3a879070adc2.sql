-- Add more exercises to the database (50+ common gym exercises)
INSERT INTO public.exercises (name, description, category, muscle_groups, equipment_needed) VALUES
  -- Chest exercises
  ('Incline Barbell Bench Press', 'Press barbell on incline bench targeting upper chest', 'strength', ARRAY['chest', 'triceps', 'shoulders'], 'barbell'),
  ('Decline Barbell Bench Press', 'Press barbell on decline bench targeting lower chest', 'strength', ARRAY['chest', 'triceps'], 'barbell'),
  ('Dumbbell Flyes', 'Lying dumbbell flyes for chest stretch', 'strength', ARRAY['chest'], 'dumbbells'),
  ('Cable Crossover', 'Cable chest flyes from high to low', 'strength', ARRAY['chest'], 'cable machine'),
  ('Pec Deck Machine', 'Machine chest flyes', 'strength', ARRAY['chest'], 'machine'),
  
  -- Back exercises
  ('Barbell Row', 'Bent over barbell row', 'strength', ARRAY['back', 'biceps'], 'barbell'),
  ('T-Bar Row', 'Landmine row for back thickness', 'strength', ARRAY['back', 'biceps'], 'barbell'),
  ('Seated Cable Row', 'Seated row using cable', 'strength', ARRAY['back', 'biceps'], 'cable machine'),
  ('Face Pulls', 'Cable face pulls for rear delts', 'strength', ARRAY['back', 'shoulders'], 'cable machine'),
  ('Chin-ups', 'Underhand pull-ups emphasizing biceps', 'strength', ARRAY['back', 'biceps'], 'pull-up bar'),
  
  -- Shoulder exercises
  ('Military Press', 'Standing barbell overhead press', 'strength', ARRAY['shoulders', 'triceps'], 'barbell'),
  ('Lateral Raises', 'Dumbbell side raises for medial delts', 'strength', ARRAY['shoulders'], 'dumbbells'),
  ('Front Raises', 'Dumbbell front raises', 'strength', ARRAY['shoulders'], 'dumbbells'),
  ('Rear Delt Flyes', 'Bent over rear delt raises', 'strength', ARRAY['shoulders'], 'dumbbells'),
  ('Arnold Press', 'Rotating dumbbell press', 'strength', ARRAY['shoulders', 'triceps'], 'dumbbells'),
  ('Upright Row', 'Barbell upright row', 'strength', ARRAY['shoulders', 'traps'], 'barbell'),
  
  -- Arm exercises
  ('Barbell Curl', 'Standing barbell bicep curl', 'strength', ARRAY['biceps'], 'barbell'),
  ('Hammer Curls', 'Neutral grip dumbbell curls', 'strength', ARRAY['biceps', 'forearms'], 'dumbbells'),
  ('Preacher Curl', 'Isolated bicep curl on preacher bench', 'strength', ARRAY['biceps'], 'preacher bench'),
  ('Concentration Curl', 'Seated single arm curl', 'strength', ARRAY['biceps'], 'dumbbells'),
  ('Tricep Pushdown', 'Cable tricep extension', 'strength', ARRAY['triceps'], 'cable machine'),
  ('Overhead Tricep Extension', 'Dumbbell or cable overhead extension', 'strength', ARRAY['triceps'], 'dumbbells'),
  ('Skull Crushers', 'Lying tricep extensions', 'strength', ARRAY['triceps'], 'barbell'),
  ('Close Grip Bench Press', 'Narrow grip bench for triceps', 'strength', ARRAY['triceps', 'chest'], 'barbell'),
  
  -- Leg exercises
  ('Front Squat', 'Barbell front squat', 'strength', ARRAY['quads', 'glutes', 'core'], 'barbell'),
  ('Bulgarian Split Squat', 'Elevated rear foot split squat', 'strength', ARRAY['quads', 'glutes'], 'dumbbells'),
  ('Leg Extension', 'Machine quad isolation', 'strength', ARRAY['quads'], 'machine'),
  ('Leg Curl', 'Machine hamstring curl', 'strength', ARRAY['hamstrings'], 'machine'),
  ('Romanian Deadlift', 'Stiff leg deadlift for hamstrings', 'strength', ARRAY['hamstrings', 'glutes', 'back'], 'barbell'),
  ('Hip Thrust', 'Barbell hip thrust for glutes', 'strength', ARRAY['glutes'], 'barbell'),
  ('Calf Raises', 'Standing or seated calf raises', 'strength', ARRAY['calves'], 'machine'),
  ('Goblet Squat', 'Dumbbell or kettlebell front squat', 'strength', ARRAY['quads', 'glutes'], 'dumbbells'),
  ('Hack Squat', 'Machine hack squat', 'strength', ARRAY['quads', 'glutes'], 'machine'),
  
  -- Core exercises
  ('Ab Wheel Rollout', 'Ab wheel core exercise', 'core', ARRAY['core'], 'ab wheel'),
  ('Russian Twists', 'Seated rotational core exercise', 'core', ARRAY['core', 'obliques'], 'bodyweight'),
  ('Hanging Leg Raises', 'Hanging knee or leg raises', 'core', ARRAY['core'], 'pull-up bar'),
  ('Cable Crunches', 'Kneeling cable crunches', 'core', ARRAY['core'], 'cable machine'),
  ('Side Plank', 'Lateral plank hold', 'core', ARRAY['core', 'obliques'], 'bodyweight'),
  ('Bicycle Crunches', 'Alternating elbow to knee crunches', 'core', ARRAY['core', 'obliques'], 'bodyweight'),
  
  -- Cardio exercises
  ('Rowing Machine', 'Indoor rowing cardio', 'cardio', ARRAY['full body', 'cardiovascular'], 'rowing machine'),
  ('Cycling', 'Stationary or outdoor cycling', 'cardio', ARRAY['legs', 'cardiovascular'], 'bike'),
  ('Jump Rope', 'Skipping rope cardio', 'cardio', ARRAY['legs', 'cardiovascular'], 'jump rope'),
  ('Burpees', 'Full body explosive movement', 'cardio', ARRAY['full body', 'cardiovascular'], 'bodyweight'),
  ('Box Jumps', 'Explosive box jump', 'cardio', ARRAY['legs', 'cardiovascular'], 'plyometric box'),
  ('Battle Ropes', 'Heavy rope waves', 'cardio', ARRAY['arms', 'core', 'cardiovascular'], 'battle ropes'),
  
  -- Machine exercises
  ('Smith Machine Squat', 'Guided barbell squat', 'strength', ARRAY['quads', 'glutes'], 'smith machine'),
  ('Smith Machine Bench Press', 'Guided barbell bench press', 'strength', ARRAY['chest', 'triceps'], 'smith machine'),
  ('Smith Machine Incline Bench', 'Guided incline bench press', 'strength', ARRAY['chest', 'shoulders', 'triceps'], 'smith machine'),
  ('Chest Press Machine', 'Seated chest press machine', 'strength', ARRAY['chest', 'triceps'], 'machine'),
  ('Shoulder Press Machine', 'Seated shoulder press machine', 'strength', ARRAY['shoulders', 'triceps'], 'machine')
ON CONFLICT DO NOTHING;