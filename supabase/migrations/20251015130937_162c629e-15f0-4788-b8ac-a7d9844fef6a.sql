-- Create table to track hidden workouts for users
CREATE TABLE IF NOT EXISTS public.hidden_workouts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  workout_id uuid NOT NULL,
  hidden_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, workout_id)
);

-- Enable RLS
ALTER TABLE public.hidden_workouts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own hidden workouts"
  ON public.hidden_workouts
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can hide workouts"
  ON public.hidden_workouts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unhide workouts"
  ON public.hidden_workouts
  FOR DELETE
  USING (auth.uid() = user_id);