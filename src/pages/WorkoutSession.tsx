import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft, Check, Plus, Minus } from "lucide-react";

interface Exercise {
  id: string;
  name: string;
  description: string;
  category: string;
  muscle_groups: string[];
  equipment_needed: string;
}

interface WorkoutExercise {
  id: string;
  exercise_id: string;
  order_index: number;
  sets: number;
  target_reps: number;
  target_weight: number | null;
  rest_seconds: number | null;
  exercises: Exercise;
}

interface SessionExercise {
  exercise_id: string;
  order_index: number;
  sets_completed: number;
  reps: number[];
  weights: number[];
  completed: boolean;
}

const WorkoutSession = () => {
  const { workoutId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionExercises, setSessionExercises] = useState<SessionExercise[]>([]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !workoutId) {
      navigate("/");
      return;
    }
    loadWorkout();
  }, [user, workoutId]);

  const loadWorkout = async () => {
    try {
      // Get workout exercises
      const { data: exercises, error } = await supabase
        .from("workout_exercises")
        .select(`
          *,
          exercises (*)
        `)
        .eq("workout_id", workoutId)
        .order("order_index");

      if (error) throw error;

      setWorkoutExercises(exercises || []);

      // Create workout session
      const { data: session, error: sessionError } = await supabase
        .from("workout_sessions")
        .insert({
          user_id: user.id,
          workout_id: workoutId,
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      setSessionId(session.id);

      // Initialize session exercises
      const initialExercises: SessionExercise[] = (exercises || []).map((ex) => ({
        exercise_id: ex.exercise_id,
        order_index: ex.order_index,
        sets_completed: 0,
        reps: [],
        weights: [],
        completed: false,
      }));

      setSessionExercises(initialExercises);
      setLoading(false);
    } catch (error: any) {
      console.error("Error loading workout:", error);
      toast.error("Failed to load workout");
      navigate("/");
    }
  };

  const updateSet = (exerciseIndex: number, setIndex: number, field: 'reps' | 'weights', value: number) => {
    const updated = [...sessionExercises];
    const exercise = updated[exerciseIndex];
    
    if (field === 'reps') {
      exercise.reps[setIndex] = value;
    } else {
      exercise.weights[setIndex] = value;
    }
    
    setSessionExercises(updated);
  };

  const addSet = (exerciseIndex: number) => {
    const updated = [...sessionExercises];
    const exercise = updated[exerciseIndex];
    const workoutEx = workoutExercises[exerciseIndex];
    
    exercise.reps.push(workoutEx.target_reps);
    exercise.weights.push(workoutEx.target_weight || 0);
    exercise.sets_completed = exercise.reps.length;
    
    setSessionExercises(updated);
  };

  const removeSet = (exerciseIndex: number) => {
    const updated = [...sessionExercises];
    const exercise = updated[exerciseIndex];
    
    if (exercise.reps.length > 0) {
      exercise.reps.pop();
      exercise.weights.pop();
      exercise.sets_completed = exercise.reps.length;
    }
    
    setSessionExercises(updated);
  };

  const completeExercise = (exerciseIndex: number) => {
    const updated = [...sessionExercises];
    updated[exerciseIndex].completed = true;
    setSessionExercises(updated);
    toast.success("Exercise completed!");
  };

  const finishWorkout = async () => {
    if (!sessionId) return;

    try {
      // Save session exercises
      for (const exercise of sessionExercises) {
        await supabase.from("workout_session_exercises").insert({
          session_id: sessionId,
          exercise_id: exercise.exercise_id,
          order_index: exercise.order_index,
          sets_completed: exercise.sets_completed,
          reps: exercise.reps,
          weights: exercise.weights,
          completed: exercise.completed,
        });
      }

      // Complete session
      await supabase
        .from("workout_sessions")
        .update({ completed_at: new Date().toISOString(), notes })
        .eq("id", sessionId);

      // Log workout
      const totalDuration = Math.floor((Date.now() - new Date().getTime()) / 60000);
      await supabase.from("workout_logs").insert({
        user_id: user!.id,
        workout_id: workoutId,
        duration_minutes: totalDuration,
        notes,
      });

      // Update streak
      await supabase.rpc("update_user_streak", {
        p_user_id: user!.id,
        p_workout_date: new Date().toISOString().split("T")[0],
      });

      toast.success("Workout completed! 🎉");
      navigate("/");
    } catch (error: any) {
      console.error("Error finishing workout:", error);
      toast.error("Failed to save workout");
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const unitLabel = (profile as any)?.preferred_units || 'lbs';

  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Active Workout</h1>
        </div>

        <div className="space-y-4">
          {workoutExercises.map((workoutEx, exerciseIndex) => {
            const sessionEx = sessionExercises[exerciseIndex];
            
            return (
              <Card key={workoutEx.id} className="p-4">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{workoutEx.exercises.name}</h3>
                      <p className="text-sm text-muted-foreground">{workoutEx.exercises.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Target: {workoutEx.sets} sets × {workoutEx.target_reps} reps
                        {workoutEx.target_weight && ` @ ${workoutEx.target_weight} ${unitLabel}`}
                      </p>
                    </div>
                    {sessionEx.completed && (
                      <Check className="h-6 w-6 text-primary" />
                    )}
                  </div>

                  <div className="space-y-2">
                    {sessionEx.reps.map((reps, setIndex) => (
                      <div key={setIndex} className="grid grid-cols-3 gap-2 items-center">
                        <span className="text-sm font-medium">Set {setIndex + 1}</span>
                        <Input
                          type="number"
                          placeholder="Reps"
                          value={reps}
                          onChange={(e) => updateSet(exerciseIndex, setIndex, 'reps', parseInt(e.target.value) || 0)}
                          className="text-center"
                        />
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            placeholder="Weight"
                            value={sessionEx.weights[setIndex]}
                            onChange={(e) => updateSet(exerciseIndex, setIndex, 'weights', parseFloat(e.target.value) || 0)}
                            className="text-center"
                            step="0.5"
                          />
                          <span className="text-xs text-muted-foreground w-8">{unitLabel}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addSet(exerciseIndex)}
                      className="flex-1"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Set
                    </Button>
                    {sessionEx.reps.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeSet(exerciseIndex)}
                        className="flex-1"
                      >
                        <Minus className="h-4 w-4 mr-1" />
                        Remove Set
                      </Button>
                    )}
                    {!sessionEx.completed && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => completeExercise(exerciseIndex)}
                        disabled={sessionEx.reps.length === 0}
                        className="flex-1"
                      >
                        Complete
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <Card className="p-4 mt-6">
          <label className="text-sm font-medium mb-2 block">Workout Notes</label>
          <Textarea
            placeholder="How did the workout feel?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </Card>

        <Button
          onClick={finishWorkout}
          className="w-full mt-6"
          size="lg"
        >
          Finish Workout
        </Button>
      </div>
    </div>
  );
};

export default WorkoutSession;
