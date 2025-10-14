-- Create exercises table
CREATE TABLE public.exercises (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- e.g., 'strength', 'cardio', 'flexibility'
  muscle_groups TEXT[] NOT NULL DEFAULT '{}', -- e.g., ['chest', 'triceps']
  equipment_needed TEXT, -- e.g., 'dumbbells', 'barbell', 'bodyweight'
  video_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create workout_exercises junction table
CREATE TABLE public.workout_exercises (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_id UUID NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  sets INTEGER NOT NULL DEFAULT 3,
  target_reps INTEGER NOT NULL DEFAULT 12,
  target_weight DECIMAL(10,2),
  rest_seconds INTEGER DEFAULT 60,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(workout_id, order_index)
);

-- Add preferred units to profiles
ALTER TABLE public.profiles
ADD COLUMN preferred_units TEXT NOT NULL DEFAULT 'lbs' CHECK (preferred_units IN ('kg', 'lbs'));

-- Add is_custom flag to workouts to distinguish user-created workouts
ALTER TABLE public.workouts
ADD COLUMN is_custom BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Create workout_sessions table for active workout tracking
CREATE TABLE public.workout_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  workout_id UUID NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create workout_session_exercises for tracking actual performance
CREATE TABLE public.workout_session_exercises (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.workout_sessions(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  sets_completed INTEGER NOT NULL DEFAULT 0,
  reps JSONB NOT NULL DEFAULT '[]', -- Array of reps per set: [12, 10, 8]
  weights JSONB NOT NULL DEFAULT '[]', -- Array of weights per set: [20, 22.5, 25]
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_session_exercises ENABLE ROW LEVEL SECURITY;

-- RLS Policies for exercises (public read)
CREATE POLICY "Anyone can view exercises"
  ON public.exercises FOR SELECT
  USING (true);

-- RLS Policies for workout_exercises (public read)
CREATE POLICY "Anyone can view workout exercises"
  ON public.workout_exercises FOR SELECT
  USING (true);

-- RLS Policies for workouts - update to allow custom workouts
CREATE POLICY "Users can create custom workouts"
  ON public.workouts FOR INSERT
  WITH CHECK (auth.uid() = user_id AND is_custom = true);

CREATE POLICY "Users can update own custom workouts"
  ON public.workouts FOR UPDATE
  USING (auth.uid() = user_id AND is_custom = true);

CREATE POLICY "Users can delete own custom workouts"
  ON public.workouts FOR DELETE
  USING (auth.uid() = user_id AND is_custom = true);

-- RLS Policies for workout_exercises - allow users to manage custom workout exercises
CREATE POLICY "Users can add exercises to custom workouts"
  ON public.workout_exercises FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workouts
      WHERE workouts.id = workout_exercises.workout_id
        AND workouts.user_id = auth.uid()
        AND workouts.is_custom = true
    )
  );

CREATE POLICY "Users can update exercises in custom workouts"
  ON public.workout_exercises FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.workouts
      WHERE workouts.id = workout_exercises.workout_id
        AND workouts.user_id = auth.uid()
        AND workouts.is_custom = true
    )
  );

CREATE POLICY "Users can delete exercises from custom workouts"
  ON public.workout_exercises FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.workouts
      WHERE workouts.id = workout_exercises.workout_id
        AND workouts.user_id = auth.uid()
        AND workouts.is_custom = true
    )
  );

-- RLS Policies for workout_sessions
CREATE POLICY "Users can view own workout sessions"
  ON public.workout_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own workout sessions"
  ON public.workout_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workout sessions"
  ON public.workout_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workout sessions"
  ON public.workout_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for workout_session_exercises
CREATE POLICY "Users can view own session exercises"
  ON public.workout_session_exercises FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workout_sessions
      WHERE workout_sessions.id = workout_session_exercises.session_id
        AND workout_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own session exercises"
  ON public.workout_session_exercises FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workout_sessions
      WHERE workout_sessions.id = workout_session_exercises.session_id
        AND workout_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own session exercises"
  ON public.workout_session_exercises FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.workout_sessions
      WHERE workout_sessions.id = workout_session_exercises.session_id
        AND workout_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own session exercises"
  ON public.workout_session_exercises FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.workout_sessions
      WHERE workout_sessions.id = workout_session_exercises.session_id
        AND workout_sessions.user_id = auth.uid()
    )
  );

-- Insert sample exercises
INSERT INTO public.exercises (name, description, category, muscle_groups, equipment_needed) VALUES
  ('Barbell Bench Press', 'Lie on bench, lower bar to chest, press up', 'strength', ARRAY['chest', 'triceps', 'shoulders'], 'barbell'),
  ('Barbell Squat', 'Bar on shoulders, squat down, stand up', 'strength', ARRAY['quads', 'glutes', 'hamstrings'], 'barbell'),
  ('Deadlift', 'Lift bar from ground to standing position', 'strength', ARRAY['back', 'glutes', 'hamstrings'], 'barbell'),
  ('Pull-ups', 'Hang from bar, pull body up until chin over bar', 'strength', ARRAY['back', 'biceps'], 'pull-up bar'),
  ('Dumbbell Bicep Curls', 'Curl dumbbells up to shoulders', 'strength', ARRAY['biceps'], 'dumbbells'),
  ('Dumbbell Shoulder Press', 'Press dumbbells overhead from shoulders', 'strength', ARRAY['shoulders', 'triceps'], 'dumbbells'),
  ('Lat Pulldown', 'Pull bar down to chest while seated', 'strength', ARRAY['back', 'biceps'], 'cable machine'),
  ('Leg Press', 'Push weight away using legs', 'strength', ARRAY['quads', 'glutes'], 'leg press machine'),
  ('Dumbbell Rows', 'Row dumbbell to hip while bent over', 'strength', ARRAY['back', 'biceps'], 'dumbbells'),
  ('Tricep Dips', 'Lower body by bending elbows, push back up', 'strength', ARRAY['triceps', 'chest'], 'dip bars'),
  ('Running', 'Cardiovascular running exercise', 'cardio', ARRAY['legs', 'cardiovascular'], 'treadmill or outdoors'),
  ('Plank', 'Hold body straight in push-up position', 'core', ARRAY['core', 'shoulders'], 'bodyweight'),
  ('Push-ups', 'Lower chest to ground, push back up', 'strength', ARRAY['chest', 'triceps', 'shoulders'], 'bodyweight'),
  ('Lunges', 'Step forward and lower body', 'strength', ARRAY['quads', 'glutes'], 'bodyweight'),
  ('Mountain Climbers', 'Alternate bringing knees to chest in plank', 'cardio', ARRAY['core', 'legs', 'cardiovascular'], 'bodyweight');

-- Link exercises to existing workouts
INSERT INTO public.workout_exercises (workout_id, exercise_id, order_index, sets, target_reps, target_weight)
SELECT 
  w.id,
  e.id,
  ROW_NUMBER() OVER (PARTITION BY w.id ORDER BY e.name) as order_index,
  3 as sets,
  12 as target_reps,
  NULL as target_weight
FROM public.workouts w
CROSS JOIN LATERAL (
  SELECT * FROM public.exercises e
  WHERE 
    (w.title = 'Full Body Blast' AND e.name IN ('Barbell Bench Press', 'Barbell Squat', 'Pull-ups', 'Plank'))
    OR (w.title = 'Upper Body Strength' AND e.name IN ('Barbell Bench Press', 'Dumbbell Rows', 'Dumbbell Shoulder Press', 'Dumbbell Bicep Curls', 'Tricep Dips'))
    OR (w.title = 'Leg Day Power' AND e.name IN ('Barbell Squat', 'Deadlift', 'Leg Press', 'Lunges'))
    OR (w.title = 'Core & Cardio' AND e.name IN ('Running', 'Mountain Climbers', 'Plank', 'Push-ups'))
) e
WHERE w.is_custom = false;