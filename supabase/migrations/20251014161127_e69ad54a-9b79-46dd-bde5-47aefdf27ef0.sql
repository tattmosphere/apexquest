-- Phase 3: Add BMR/TDEE fields to profiles
ALTER TABLE public.profiles
ADD COLUMN age INTEGER,
ADD COLUMN height_cm NUMERIC,
ADD COLUMN height_inches NUMERIC,
ADD COLUMN gender TEXT CHECK (gender IN ('male', 'female', 'other')),
ADD COLUMN activity_level TEXT CHECK (activity_level IN ('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active')) DEFAULT 'moderately_active';

-- Phase 4: Create personal_records table
CREATE TABLE public.personal_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  exercise_id UUID REFERENCES public.exercises(id) ON DELETE CASCADE NOT NULL,
  record_type TEXT CHECK (record_type IN ('max_weight', 'max_reps', 'max_volume', 'max_distance', 'min_time')) NOT NULL,
  value NUMERIC NOT NULL,
  achieved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  session_id UUID REFERENCES public.workout_sessions(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, exercise_id, record_type)
);

-- Enable RLS on personal_records
ALTER TABLE public.personal_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies for personal_records
CREATE POLICY "Users can view own PRs"
ON public.personal_records
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own PRs"
ON public.personal_records
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own PRs"
ON public.personal_records
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own PRs"
ON public.personal_records
FOR DELETE
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_personal_records_user_exercise ON public.personal_records(user_id, exercise_id);
CREATE INDEX idx_workout_session_exercises_session ON public.workout_session_exercises(session_id);
CREATE INDEX idx_workout_logs_user_date ON public.workout_logs(user_id, workout_date);

-- Phase 6: Create materialized view for analytics
CREATE MATERIALIZED VIEW public.user_workout_stats AS
SELECT 
  wl.user_id,
  COUNT(DISTINCT wl.id) as total_workouts,
  SUM(wl.duration_minutes) as total_minutes,
  SUM(wse.calories_burned) as total_calories,
  DATE_TRUNC('week', wl.workout_date) as week,
  COUNT(DISTINCT wl.workout_date) as unique_days
FROM public.workout_logs wl
LEFT JOIN public.workout_sessions ws ON ws.id = (
  SELECT id FROM public.workout_sessions 
  WHERE user_id = wl.user_id 
  AND DATE(started_at) = wl.workout_date 
  LIMIT 1
)
LEFT JOIN public.workout_session_exercises wse ON wse.session_id = ws.id
GROUP BY wl.user_id, week;

-- Create index on materialized view
CREATE INDEX idx_user_workout_stats_user ON public.user_workout_stats(user_id);

-- Add comment for materialized view refresh
COMMENT ON MATERIALIZED VIEW public.user_workout_stats IS 'Refresh this view periodically with: REFRESH MATERIALIZED VIEW CONCURRENTLY public.user_workout_stats;';