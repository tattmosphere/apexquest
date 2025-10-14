-- Fix security warning: Revoke access to materialized view from API
-- The materialized view should only be accessible through backend functions, not directly

REVOKE ALL ON public.user_workout_stats FROM anon, authenticated;

-- Only allow the service role to access it
GRANT SELECT ON public.user_workout_stats TO service_role;