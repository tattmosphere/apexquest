-- Create health_sync_log table to track sync history
CREATE TABLE public.health_sync_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sync_type TEXT NOT NULL CHECK (sync_type IN ('import', 'export')),
  data_type TEXT NOT NULL CHECK (data_type IN ('workout', 'body_weight', 'steps', 'calories', 'heart_rate')),
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android')),
  external_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
  error_message TEXT,
  synced_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add health sync columns to workout_sessions
ALTER TABLE public.workout_sessions
ADD COLUMN health_kit_id TEXT,
ADD COLUMN synced_to_health BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN health_sync_status TEXT DEFAULT 'not_synced' CHECK (health_sync_status IN ('not_synced', 'syncing', 'synced', 'failed'));

-- Add health sync preferences to profiles
ALTER TABLE public.profiles
ADD COLUMN health_sync_enabled BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN last_health_sync_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN health_permissions_granted JSONB DEFAULT '{}'::jsonb;

-- Enable RLS on health_sync_log
ALTER TABLE public.health_sync_log ENABLE ROW LEVEL SECURITY;

-- RLS policies for health_sync_log
CREATE POLICY "Users can view own health sync logs"
ON public.health_sync_log
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own health sync logs"
ON public.health_sync_log
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own health sync logs"
ON public.health_sync_log
FOR UPDATE
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_health_sync_log_user_id ON public.health_sync_log(user_id);
CREATE INDEX idx_health_sync_log_synced_at ON public.health_sync_log(synced_at DESC);
CREATE INDEX idx_workout_sessions_health_kit_id ON public.workout_sessions(health_kit_id) WHERE health_kit_id IS NOT NULL;