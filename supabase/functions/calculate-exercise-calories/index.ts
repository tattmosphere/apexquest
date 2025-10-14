import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { exercise_id, user_weight_lbs, sets, reps, rest_seconds, duration_minutes } = await req.json();

    // Fetch exercise MET value
    const { data: exercise, error: exerciseError } = await supabase
      .from('exercises')
      .select('met_value, supports_time, supports_sets, supports_reps')
      .eq('id', exercise_id)
      .single();

    if (exerciseError || !exercise) {
      throw new Error('Exercise not found');
    }

    const met_value = exercise.met_value || 5.0;
    const weight_kg = user_weight_lbs / 2.20462;

    let total_duration_minutes = 0;

    if (duration_minutes) {
      // For timed exercises (cardio, planks, etc.)
      total_duration_minutes = duration_minutes;
    } else if (sets && reps) {
      // For set-based exercises
      // Calculate active time: assume 3 seconds per rep (eccentric + concentric)
      const active_seconds_per_set = reps * 3;
      const rest_per_set = rest_seconds || 60;
      const total_seconds = sets * (active_seconds_per_set + rest_per_set);
      total_duration_minutes = total_seconds / 60;
    } else {
      throw new Error('Either duration_minutes or (sets and reps) must be provided');
    }

    // Calculate calories: MET × weight(kg) × time(hours)
    const calories_burned = met_value * weight_kg * (total_duration_minutes / 60);

    console.log('Calorie calculation:', {
      exercise_id,
      met_value,
      weight_kg,
      total_duration_minutes,
      calories_burned
    });

    return new Response(
      JSON.stringify({
        calories_burned: Math.round(calories_burned * 10) / 10,
        duration_minutes: Math.round(total_duration_minutes * 10) / 10
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error calculating calories:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
