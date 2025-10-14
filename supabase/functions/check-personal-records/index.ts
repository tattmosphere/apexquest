import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NewRecord {
  exercise_id: string;
  exercise_name: string;
  record_type: string;
  value: number;
  previous_value?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization')!;
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Unauthorized');
    }

    const { session_id } = await req.json();

    // Fetch all exercises from this session
    const { data: sessionExercises, error: sessionError } = await supabase
      .from('workout_session_exercises')
      .select('exercise_id, reps, weights, exercises!inner(name)')
      .eq('session_id', session_id);

    if (sessionError) throw sessionError;

    const newRecords: NewRecord[] = [];

    for (const sessionExercise of sessionExercises) {
      const exercise_id = sessionExercise.exercise_id;
      const exercise_name = (sessionExercise.exercises as any)?.name || 'Unknown';
      const reps = sessionExercise.reps as number[];
      const weights = sessionExercise.weights as number[];

      // Check max weight PR
      if (weights && weights.length > 0) {
        const max_weight = Math.max(...weights.filter(w => w > 0));
        if (max_weight > 0) {
          const { data: existingPR } = await supabase
            .from('personal_records')
            .select('value')
            .eq('user_id', user.id)
            .eq('exercise_id', exercise_id)
            .eq('record_type', 'max_weight')
            .maybeSingle();

          if (!existingPR || max_weight > existingPR.value) {
            await supabase.from('personal_records').upsert({
              user_id: user.id,
              exercise_id,
              record_type: 'max_weight',
              value: max_weight,
              session_id,
              achieved_at: new Date().toISOString()
            });

            newRecords.push({
              exercise_id,
              exercise_name,
              record_type: 'max_weight',
              value: max_weight,
              previous_value: existingPR?.value
            });
          }
        }
      }

      // Check max reps PR
      if (reps && reps.length > 0) {
        const max_reps = Math.max(...reps.filter(r => r > 0));
        if (max_reps > 0) {
          const { data: existingPR } = await supabase
            .from('personal_records')
            .select('value')
            .eq('user_id', user.id)
            .eq('exercise_id', exercise_id)
            .eq('record_type', 'max_reps')
            .maybeSingle();

          if (!existingPR || max_reps > existingPR.value) {
            await supabase.from('personal_records').upsert({
              user_id: user.id,
              exercise_id,
              record_type: 'max_reps',
              value: max_reps,
              session_id,
              achieved_at: new Date().toISOString()
            });

            newRecords.push({
              exercise_id,
              exercise_name,
              record_type: 'max_reps',
              value: max_reps,
              previous_value: existingPR?.value
            });
          }
        }
      }

      // Check max volume PR (sets × reps × weight)
      if (reps && weights && reps.length === weights.length) {
        let total_volume = 0;
        for (let i = 0; i < reps.length; i++) {
          total_volume += reps[i] * (weights[i] || 0);
        }

        if (total_volume > 0) {
          const { data: existingPR } = await supabase
            .from('personal_records')
            .select('value')
            .eq('user_id', user.id)
            .eq('exercise_id', exercise_id)
            .eq('record_type', 'max_volume')
            .maybeSingle();

          if (!existingPR || total_volume > existingPR.value) {
            await supabase.from('personal_records').upsert({
              user_id: user.id,
              exercise_id,
              record_type: 'max_volume',
              value: total_volume,
              session_id,
              achieved_at: new Date().toISOString()
            });

            newRecords.push({
              exercise_id,
              exercise_name,
              record_type: 'max_volume',
              value: total_volume,
              previous_value: existingPR?.value
            });
          }
        }
      }
    }

    console.log('New PRs detected:', newRecords);

    return new Response(
      JSON.stringify({ new_records: newRecords }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error checking PRs:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
