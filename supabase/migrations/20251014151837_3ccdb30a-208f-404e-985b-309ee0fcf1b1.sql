-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  level INTEGER DEFAULT 1 NOT NULL,
  total_points INTEGER DEFAULT 0 NOT NULL,
  current_streak INTEGER DEFAULT 0 NOT NULL,
  longest_streak INTEGER DEFAULT 0 NOT NULL,
  last_workout_date DATE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create workouts table
CREATE TABLE public.workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL,
  exercises_count INTEGER NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS for workouts
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;

-- Everyone can view workouts
CREATE POLICY "Anyone can view workouts"
  ON public.workouts FOR SELECT
  TO authenticated
  USING (true);

-- Create workout logs table
CREATE TABLE public.workout_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  workout_id UUID REFERENCES public.workouts(id) ON DELETE SET NULL,
  workout_date DATE DEFAULT CURRENT_DATE NOT NULL,
  duration_minutes INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.workout_logs ENABLE ROW LEVEL SECURITY;

-- Workout logs policies
CREATE POLICY "Users can view own logs"
  ON public.workout_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own logs"
  ON public.workout_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own logs"
  ON public.workout_logs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own logs"
  ON public.workout_logs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create achievements table
CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  icon_name TEXT,
  unlock_criteria JSONB NOT NULL,
  points INTEGER DEFAULT 10 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- Anyone can view achievements
CREATE POLICY "Anyone can view achievements"
  ON public.achievements FOR SELECT
  TO authenticated
  USING (true);

-- Create user achievements table
CREATE TABLE public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  achievement_id UUID REFERENCES public.achievements(id) ON DELETE CASCADE NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, achievement_id)
);

-- Enable RLS
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- User achievements policies
CREATE POLICY "Users can view own achievements"
  ON public.user_achievements FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can unlock achievements"
  ON public.user_achievements FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Function to update profile updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to update streak
CREATE OR REPLACE FUNCTION public.update_user_streak(p_user_id UUID, p_workout_date DATE)
RETURNS void AS $$
DECLARE
  v_last_date DATE;
  v_current_streak INTEGER;
BEGIN
  -- Get current streak data
  SELECT last_workout_date, current_streak
  INTO v_last_date, v_current_streak
  FROM public.profiles
  WHERE id = p_user_id;

  -- Update streak logic
  IF v_last_date IS NULL THEN
    -- First workout ever
    UPDATE public.profiles
    SET current_streak = 1,
        longest_streak = GREATEST(longest_streak, 1),
        last_workout_date = p_workout_date
    WHERE id = p_user_id;
  ELSIF p_workout_date = v_last_date THEN
    -- Same day workout, no streak change
    RETURN;
  ELSIF p_workout_date = v_last_date + 1 THEN
    -- Consecutive day
    UPDATE public.profiles
    SET current_streak = current_streak + 1,
        longest_streak = GREATEST(longest_streak, current_streak + 1),
        last_workout_date = p_workout_date
    WHERE id = p_user_id;
  ELSE
    -- Streak broken
    UPDATE public.profiles
    SET current_streak = 1,
        last_workout_date = p_workout_date
    WHERE id = p_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Insert sample workouts
INSERT INTO public.workouts (title, description, duration_minutes, exercises_count, difficulty, category) VALUES
('Upper Body Strength', 'Build strength in chest, shoulders, and arms', 45, 8, 'intermediate', 'strength'),
('HIIT Cardio', 'High-intensity interval training for fat burning', 30, 6, 'intermediate', 'cardio'),
('Core & Abs', 'Strengthen your core with targeted exercises', 20, 5, 'beginner', 'core'),
('Full Body Power', 'Complete full-body workout for strength and power', 60, 10, 'advanced', 'strength'),
('Yoga Flow', 'Relaxing yoga session for flexibility', 40, 8, 'beginner', 'flexibility'),
('Lower Body Blast', 'Intense leg and glute workout', 45, 7, 'intermediate', 'strength');

-- Insert sample achievements
INSERT INTO public.achievements (title, description, category, icon_name, unlock_criteria, points) VALUES
('First Step', 'Complete your first workout', 'beginner', 'Zap', '{"type": "workout_count", "value": 1}', 10),
('Week Warrior', 'Maintain a 7-day streak', 'streak', 'Flame', '{"type": "streak", "value": 7}', 25),
('Two Week Champion', 'Maintain a 14-day streak', 'streak', 'Flame', '{"type": "streak", "value": 14}', 50),
('Heavy Lifter', 'Complete 10 strength workouts', 'workout', 'Dumbbell', '{"type": "category_count", "category": "strength", "value": 10}', 30),
('Cardio King', 'Complete 10 cardio workouts', 'workout', 'Heart', '{"type": "category_count", "category": "cardio", "value": 10}', 30),
('Consistency is Key', 'Log workouts for 30 days', 'consistency', 'Calendar', '{"type": "total_days", "value": 30}', 100),
('Century Club', 'Complete 100 total workouts', 'milestone', 'Trophy', '{"type": "workout_count", "value": 100}', 200);
