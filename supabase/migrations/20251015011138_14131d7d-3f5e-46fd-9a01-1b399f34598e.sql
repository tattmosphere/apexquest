-- ============================================
-- FLAMEUP RPG GAMIFICATION SYSTEM
-- Database Schema for Phases 1-7
-- ============================================

-- ============================================
-- TABLE: characters (extends profiles)
-- ============================================
CREATE TABLE IF NOT EXISTS public.characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  class_type TEXT NOT NULL CHECK (class_type IN ('warrior', 'scout', 'endurance_athlete', 'monk', 'hybrid', 'survivor')),
  secondary_class TEXT CHECK (secondary_class IN ('warrior', 'scout', 'endurance_athlete', 'monk', 'hybrid', 'survivor')),
  xp INTEGER NOT NULL DEFAULT 0,
  strength INTEGER NOT NULL DEFAULT 10,
  agility INTEGER NOT NULL DEFAULT 10,
  endurance INTEGER NOT NULL DEFAULT 10,
  focus INTEGER NOT NULL DEFAULT 10,
  resourcefulness INTEGER NOT NULL DEFAULT 10,
  survival_credits INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;

-- RLS Policies for characters
CREATE POLICY "Users can view own character"
  ON public.characters FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own character"
  ON public.characters FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own character"
  ON public.characters FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- TABLE: abilities (master list)
-- ============================================
CREATE TABLE IF NOT EXISTS public.abilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  class_type TEXT NOT NULL CHECK (class_type IN ('warrior', 'scout', 'endurance_athlete', 'monk', 'hybrid', 'survivor')),
  tier INTEGER NOT NULL CHECK (tier BETWEEN 1 AND 4),
  unlock_workout_count INTEGER NOT NULL,
  unlock_level INTEGER NOT NULL,
  ability_type TEXT NOT NULL CHECK (ability_type IN ('active', 'passive', 'ultimate')),
  effect_type TEXT NOT NULL CHECK (effect_type IN ('xp_boost', 'calorie_multiplier', 'streak_shield', 'quest_accelerator', 'credit_bonus', 'cooldown_reset', 'workout_multiplier', 'streak_restore')),
  effect_value NUMERIC NOT NULL,
  icon_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.abilities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for abilities
CREATE POLICY "Anyone can view abilities"
  ON public.abilities FOR SELECT
  USING (true);

-- ============================================
-- TABLE: user_abilities (unlocked abilities)
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_abilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  ability_id UUID REFERENCES public.abilities(id) ON DELETE CASCADE NOT NULL,
  equipped BOOLEAN NOT NULL DEFAULT false,
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_used TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, ability_id)
);

-- Enable RLS
ALTER TABLE public.user_abilities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_abilities
CREATE POLICY "Users can view own abilities"
  ON public.user_abilities FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own abilities"
  ON public.user_abilities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own abilities"
  ON public.user_abilities FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- TABLE: daily_quests (3 per day)
-- ============================================
CREATE TABLE IF NOT EXISTS public.daily_quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  quest_date DATE NOT NULL DEFAULT CURRENT_DATE,
  quest_type TEXT NOT NULL CHECK (quest_type IN ('complete_workout', 'walk_steps', 'strength_workout', 'cardio_workout', 'endurance_workout', 'flexibility_workout', 'beat_pr', 'maintain_streak', 'workout_30min', 'workout_45min')),
  target_value INTEGER NOT NULL,
  current_progress INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  xp_reward INTEGER NOT NULL,
  credits_reward INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, quest_date, quest_type)
);

-- Enable RLS
ALTER TABLE public.daily_quests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for daily_quests
CREATE POLICY "Users can view own quests"
  ON public.daily_quests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quests"
  ON public.daily_quests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quests"
  ON public.daily_quests FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- TABLE: story_progress (choose-your-own-adventure)
-- ============================================
CREATE TABLE IF NOT EXISTS public.story_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  current_act INTEGER NOT NULL DEFAULT 1,
  current_chapter INTEGER NOT NULL DEFAULT 1,
  faction_choice TEXT CHECK (faction_choice IN ('military', 'commune', 'lone_wolf')),
  strategy_choice TEXT CHECK (strategy_choice IN ('aggressive', 'defensive', 'diplomatic')),
  resolution_choice TEXT CHECK (resolution_choice IN ('destroy', 'control', 'negotiate')),
  completed_chapters JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.story_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for story_progress
CREATE POLICY "Users can view own story progress"
  ON public.story_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own story progress"
  ON public.story_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own story progress"
  ON public.story_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- TABLE: user_equipment (cosmetics)
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  slot TEXT NOT NULL CHECK (slot IN ('weapon_primary', 'weapon_secondary', 'helmet', 'chest', 'gloves', 'pants', 'boots', 'accessory')),
  item_id TEXT NOT NULL,
  rarity TEXT NOT NULL CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic')),
  equipped BOOLEAN NOT NULL DEFAULT false,
  purchased_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_equipment ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_equipment
CREATE POLICY "Users can view own equipment"
  ON public.user_equipment FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own equipment"
  ON public.user_equipment FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own equipment"
  ON public.user_equipment FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own equipment"
  ON public.user_equipment FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- DATABASE FUNCTIONS
-- ============================================

-- Function: Increment character stats
CREATE OR REPLACE FUNCTION public.increment_character_stats(
  p_user_id UUID,
  p_strength INTEGER DEFAULT 0,
  p_agility INTEGER DEFAULT 0,
  p_endurance INTEGER DEFAULT 0,
  p_focus INTEGER DEFAULT 0,
  p_resourcefulness INTEGER DEFAULT 0
) RETURNS VOID AS $$
BEGIN
  UPDATE public.characters
  SET 
    strength = strength + p_strength,
    agility = agility + p_agility,
    endurance = endurance + p_endurance,
    focus = focus + p_focus,
    resourcefulness = resourcefulness + p_resourcefulness,
    updated_at = now()
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function: Get workout type counts for ability unlocks
CREATE OR REPLACE FUNCTION public.get_workout_type_counts(p_user_id UUID)
RETURNS TABLE(category TEXT, count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.category,
    COUNT(*)::BIGINT as count
  FROM public.workout_session_exercises wse
  JOIN public.workout_sessions ws ON ws.id = wse.session_id
  JOIN public.exercises e ON e.id = wse.exercise_id
  WHERE ws.user_id = p_user_id AND ws.completed_at IS NOT NULL
  GROUP BY e.category;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function: Calculate level from XP
CREATE OR REPLACE FUNCTION public.calculate_level_from_xp(p_xp INTEGER)
RETURNS INTEGER AS $$
BEGIN
  -- Level progression: 100 XP for levels 1-10, then scales up
  IF p_xp < 1000 THEN
    RETURN FLOOR(p_xp / 100.0) + 1;
  ELSIF p_xp < 5000 THEN
    RETURN FLOOR((p_xp - 1000) / 250.0) + 11;
  ELSE
    RETURN FLOOR((p_xp - 5000) / 500.0) + 27;
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function: Get total workout count
CREATE OR REPLACE FUNCTION public.get_total_workout_count(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*)::INTEGER INTO v_count
  FROM public.workout_sessions
  WHERE user_id = p_user_id AND completed_at IS NOT NULL;
  
  RETURN COALESCE(v_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================
-- SEED DATA: Abilities (24 core abilities)
-- ============================================

-- WARRIOR ABILITIES (Strength Training)
INSERT INTO public.abilities (name, description, class_type, tier, unlock_workout_count, unlock_level, ability_type, effect_type, effect_value, icon_name) VALUES
  ('Power Strike', 'Gain +10% XP from strength workouts', 'warrior', 1, 10, 5, 'passive', 'xp_boost', 0.10, 'zap'),
  ('Iron Wall', 'Gain 1 streak freeze per month automatically', 'warrior', 2, 25, 15, 'passive', 'streak_shield', 1, 'shield'),
  ('Berserker', 'Gain +20% XP from all workouts when on 7+ day streak', 'warrior', 3, 50, 30, 'passive', 'xp_boost', 0.20, 'flame'),
  ('Titans Rage', 'Double XP for your next workout (3-day cooldown)', 'warrior', 4, 100, 50, 'ultimate', 'workout_multiplier', 2.0, 'zap-off');

-- SCOUT ABILITIES (Running/Cardio)
INSERT INTO public.abilities (name, description, class_type, tier, unlock_workout_count, unlock_level, ability_type, effect_type, effect_value, icon_name) VALUES
  ('Quick Dash', 'Gain +15% XP from cardio workouts', 'scout', 1, 10, 5, 'passive', 'xp_boost', 0.15, 'wind'),
  ('Eagle Eye', 'Gain +10% calorie burn on all workouts', 'scout', 2, 25, 15, 'passive', 'calorie_multiplier', 0.10, 'eye'),
  ('Adrenaline Rush', 'Daily quest progress counts 1.5x', 'scout', 3, 50, 30, 'passive', 'quest_accelerator', 0.5, 'activity'),
  ('Shadow Step', 'Complete any daily quest instantly (1/week)', 'scout', 4, 100, 50, 'ultimate', 'quest_accelerator', 1.0, 'ghost');

-- ENDURANCE ATHLETE ABILITIES (Cycling/Rowing/Erg)
INSERT INTO public.abilities (name, description, class_type, tier, unlock_workout_count, unlock_level, ability_type, effect_type, effect_value, icon_name) VALUES
  ('Second Wind', 'Gain +12% XP from endurance workouts', 'endurance_athlete', 1, 10, 5, 'passive', 'xp_boost', 0.12, 'heart-pulse'),
  ('Healing Aura', 'Restore broken streak once per month (auto-trigger)', 'endurance_athlete', 2, 25, 15, 'passive', 'streak_restore', 1, 'heart'),
  ('Unbreakable Will', 'Workouts over 45 mins give 2x XP', 'endurance_athlete', 3, 50, 30, 'passive', 'workout_multiplier', 2.0, 'shield-check'),
  ('Phoenix Revival', 'Revive a lost streak up to 7 days back (1/year)', 'endurance_athlete', 4, 100, 50, 'ultimate', 'streak_restore', 7, 'heart-handshake');

-- MONK ABILITIES (Yoga/Tai Chi/Flexibility)
INSERT INTO public.abilities (name, description, class_type, tier, unlock_workout_count, unlock_level, ability_type, effect_type, effect_value, icon_name) VALUES
  ('Inner Balance', 'Gain +10% XP from flexibility workouts', 'monk', 1, 10, 5, 'passive', 'xp_boost', 0.10, 'circle-dot'),
  ('Meditation Shield', 'Gain +5 Survival Credits per workout', 'monk', 2, 25, 15, 'passive', 'credit_bonus', 5, 'shield-plus'),
  ('Chi Strike', 'Every 10th workout gives 3x XP', 'monk', 3, 50, 30, 'passive', 'workout_multiplier', 3.0, 'sparkles'),
  ('Zen Master', 'All ability cooldowns refresh (1/month)', 'monk', 4, 100, 50, 'ultimate', 'cooldown_reset', 1, 'brain');

-- HYBRID ABILITIES (Mixed Training)
INSERT INTO public.abilities (name, description, class_type, tier, unlock_workout_count, unlock_level, ability_type, effect_type, effect_value, icon_name) VALUES
  ('Adapt', 'Gain +8% XP from all workout types', 'hybrid', 1, 15, 5, 'passive', 'xp_boost', 0.08, 'shuffle'),
  ('Tactical Switch', 'Unlock secondary class 25% faster', 'hybrid', 2, 30, 15, 'passive', 'xp_boost', 0.25, 'repeat'),
  ('Swiss Army', 'Can equip 1 ability from any class', 'hybrid', 3, 60, 30, 'passive', 'xp_boost', 0.0, 'wrench'),
  ('Master of All', 'Activate any equipped ability (1/week)', 'hybrid', 4, 120, 50, 'ultimate', 'cooldown_reset', 1, 'crown');

-- SURVIVOR ABILITIES (Walking/Steps)
INSERT INTO public.abilities (name, description, class_type, tier, unlock_workout_count, unlock_level, ability_type, effect_type, effect_value, icon_name) VALUES
  ('Scavenger', 'Gain +10 Credits per 10k steps', 'survivor', 1, 0, 1, 'passive', 'credit_bonus', 10, 'coins'),
  ('Crafting Expert', 'Equipment costs 25% less', 'survivor', 2, 0, 10, 'passive', 'credit_bonus', 0.25, 'hammer'),
  ('Safe Haven', 'Gain 1 streak freeze per 50k steps', 'survivor', 3, 0, 25, 'passive', 'streak_shield', 1, 'tent'),
  ('Wasteland Wisdom', 'Reveal all story paths (1/playthrough)', 'survivor', 4, 0, 50, 'ultimate', 'xp_boost', 0.0, 'map');

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_characters_user_id ON public.characters(user_id);
CREATE INDEX IF NOT EXISTS idx_user_abilities_user_equipped ON public.user_abilities(user_id, equipped);
CREATE INDEX IF NOT EXISTS idx_daily_quests_user_date ON public.daily_quests(user_id, quest_date);
CREATE INDEX IF NOT EXISTS idx_daily_quests_completed ON public.daily_quests(user_id, completed);
CREATE INDEX IF NOT EXISTS idx_story_progress_user ON public.story_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_equipment_user_equipped ON public.user_equipment(user_id, equipped);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================
CREATE TRIGGER update_characters_updated_at
  BEFORE UPDATE ON public.characters
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_story_progress_updated_at
  BEFORE UPDATE ON public.story_progress
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();