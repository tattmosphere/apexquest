import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Check, Plus, Minus, Dumbbell, Edit, X, Trash2 } from "lucide-react";
import { useXP } from "@/hooks/useXP";
import { useAbilities } from "@/hooks/useAbilities";
import { useDailyQuests } from "@/hooks/useDailyQuests";
import { WorkoutCompletionModal } from "@/components/WorkoutCompletionModal";

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

interface WorkoutSessionDialogProps {
  open: boolean;
  onClose: () => void;
  workoutId: string;
  workoutTitle: string;
}

export const WorkoutSessionDialog = ({ open, onClose, workoutId, workoutTitle }: WorkoutSessionDialogProps) => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { awardWorkoutXP, updateCharacterStats } = useXP();
  const { checkAbilityUnlocks } = useAbilities();
  const { updateQuestProgress } = useDailyQuests();
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionExercises, setSessionExercises] = useState<SessionExercise[]>([]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completionData, setCompletionData] = useState<any>(null);

  useEffect(() => {
    if (open && user && workoutId) {
      loadWorkout();
    }
  }, [open, user, workoutId]);

  const loadWorkout = async () => {
    try {
      setLoading(true);
      
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
          user_id: user!.id,
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
        reps: Array(ex.sets).fill(ex.target_reps),
        weights: Array(ex.sets).fill(ex.target_weight || 0),
        completed: false,
      }));

      setSessionExercises(initialExercises);
      setLoading(false);
    } catch (error: any) {
      console.error("Error loading workout:", error);
      toast.error("Failed to load workout");
      onClose();
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

  const searchExercises = async (term: string) => {
    if (term.length < 2) {
      setAvailableExercises([]);
      return;
    }

    const { data, error } = await supabase
      .from("exercises")
      .select("*")
      .ilike("name", `%${term}%`)
      .limit(5);

    if (error) {
      console.error("Error searching exercises:", error);
      return;
    }

    setAvailableExercises(data || []);
  };

  useEffect(() => {
    if (editMode) {
      const debounce = setTimeout(() => {
        searchExercises(searchTerm);
      }, 300);

      return () => clearTimeout(debounce);
    }
  }, [searchTerm, editMode]);

  const addExerciseToSession = (exercise: Exercise) => {
    const newWorkoutEx: WorkoutExercise = {
      id: `temp-${Date.now()}`,
      exercise_id: exercise.id,
      order_index: workoutExercises.length,
      sets: 3,
      target_reps: 12,
      target_weight: null,
      rest_seconds: 60,
      exercises: exercise,
    };

    const newSessionEx: SessionExercise = {
      exercise_id: exercise.id,
      order_index: sessionExercises.length,
      sets_completed: 0,
      reps: [12, 12, 12],
      weights: [0, 0, 0],
      completed: false,
    };

    setWorkoutExercises([...workoutExercises, newWorkoutEx]);
    setSessionExercises([...sessionExercises, newSessionEx]);
    setSearchTerm("");
    setAvailableExercises([]);
    toast.success("Exercise added to workout");
  };

  const removeExerciseFromSession = (index: number) => {
    if (!confirm("Remove this exercise from the workout?")) return;
    
    const updatedWorkoutEx = workoutExercises.filter((_, i) => i !== index);
    const updatedSessionEx = sessionExercises.filter((_, i) => i !== index);
    
    // Reorder
    updatedWorkoutEx.forEach((ex, i) => { ex.order_index = i; });
    updatedSessionEx.forEach((ex, i) => { ex.order_index = i; });
    
    setWorkoutExercises(updatedWorkoutEx);
    setSessionExercises(updatedSessionEx);
    toast.success("Exercise removed");
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

      // Log workout - calculate duration
      const workoutDuration = Math.floor((Date.now() - new Date().getTime()) / 60000) || 30;
      await supabase.from("workout_logs").insert({
        user_id: user!.id,
        workout_id: workoutId,
        duration_minutes: workoutDuration,
        notes,
      });

      // Update streak
      await supabase.rpc("update_user_streak", {
        p_user_id: user!.id,
        p_workout_date: new Date().toISOString().split("T")[0],
      });

      // RPG HOOKS: Award XP and update stats
      const exerciseCategory = workoutExercises[0]?.exercises?.category || 'strength';
      
      const xpResult = await awardWorkoutXP(user!.id, {
        duration_minutes: workoutDuration,
        category: exerciseCategory,
        exercises: sessionExercises.map(ex => ({
          category: workoutExercises.find(w => w.exercise_id === ex.exercise_id)?.exercises?.category || '',
          primary_muscle_group: workoutExercises.find(w => w.exercise_id === ex.exercise_id)?.exercises?.muscle_groups?.[0] || ''
        }))
      });

      await updateCharacterStats(user!.id, {
        category: exerciseCategory,
        exercises: sessionExercises.map(ex => ({
          category: workoutExercises.find(w => w.exercise_id === ex.exercise_id)?.exercises?.category || '',
          primary_muscle_group: workoutExercises.find(w => w.exercise_id === ex.exercise_id)?.exercises?.muscle_groups?.[0] || '',
          name: workoutExercises.find(w => w.exercise_id === ex.exercise_id)?.exercises?.name || ''
        }))
      });

      const newAbilities = await checkAbilityUnlocks(user!.id);

      await updateQuestProgress(user!.id, {
        category: exerciseCategory,
        duration_minutes: workoutDuration,
        beatPR: false
      });

      // Show completion modal
      setCompletionData({
        xpGained: xpResult.xpGained,
        newLevel: xpResult.newLevel,
        leveledUp: xpResult.leveledUp,
        newAbilities,
        statsGained: {
          strength: exerciseCategory === 'strength' ? sessionExercises.length * 3 : 0,
          agility: exerciseCategory === 'cardio' ? sessionExercises.length * 3 : 0,
          endurance: sessionExercises.length,
        }
      });
      setShowCompletionModal(true);

      toast.success("Workout completed! 🎉");
    } catch (error: any) {
      console.error("Error finishing workout:", error);
      toast.error("Failed to save workout");
    }
  };

  const unitLabel = (profile as any)?.preferred_units || 'lbs';

  return (
    <>
      <WorkoutCompletionModal
        open={showCompletionModal}
        onOpenChange={(open) => {
          setShowCompletionModal(open);
          if (!open) {
            onClose();
            window.location.reload();
          }
        }}
        xpGained={completionData?.xpGained || 0}
        statsGained={completionData?.statsGained || {}}
        newLevel={completionData?.newLevel}
        leveledUp={completionData?.leveledUp || false}
        newAbilities={completionData?.newAbilities || []}
      />
      <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Dumbbell className="h-6 w-6 text-primary" />
              {workoutTitle}
            </DialogTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditMode(!editMode)}
            >
              {editMode ? (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Done
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Exercises
                </>
              )}
            </Button>
          </div>
          <DialogDescription>
            Track your sets, reps, and weights for each exercise
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-muted-foreground">Loading workout...</div>
        ) : (
          <div className="space-y-4 pt-4">
            {workoutExercises.map((workoutEx, exerciseIndex) => {
              const sessionEx = sessionExercises[exerciseIndex];
              
              return (
                <Card key={workoutEx.id} className="p-4 bg-card/50">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                          {workoutEx.exercises.name}
                          {sessionEx.completed && (
                            <Check className="h-5 w-5 text-primary" />
                          )}
                        </h3>
                        <p className="text-sm text-muted-foreground">{workoutEx.exercises.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Target: {workoutEx.sets} sets × {workoutEx.target_reps} reps
                          {workoutEx.target_weight && ` @ ${workoutEx.target_weight} ${unitLabel}`}
                        </p>
                      </div>
                      {editMode && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeExerciseFromSession(exerciseIndex)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>

                    <div className="space-y-3">
                      {sessionEx.reps.map((reps, setIndex) => (
                        <div key={setIndex} className="flex items-center gap-2">
                          <span className="text-sm font-medium min-w-[60px]">Set {setIndex + 1}</span>
                          <div className="flex-1 grid grid-cols-2 gap-2">
                            <Input
                              type="number"
                              placeholder="Reps"
                              value={reps}
                              onChange={(e) => updateSet(exerciseIndex, setIndex, 'reps', parseInt(e.target.value) || 0)}
                              className="h-9"
                            />
                            <div className="flex items-center gap-1">
                              <Input
                                type="number"
                                placeholder="Weight"
                                value={sessionEx.weights[setIndex]}
                                onChange={(e) => updateSet(exerciseIndex, setIndex, 'weights', parseFloat(e.target.value) || 0)}
                                className="h-9"
                              />
                              <span className="text-xs text-muted-foreground min-w-[35px]">{unitLabel}</span>
                            </div>
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
                      {sessionEx.reps.length > 1 && (
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
                          className="flex-1"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Complete
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}

            {editMode && (
              <Card className="p-4 bg-card/50 border-2 border-dashed">
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Plus className="h-5 w-5 text-primary" />
                    Add Exercise to Workout
                  </h3>
                  <div className="relative">
                    <Input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search for exercises..."
                    />
                    {availableExercises.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-card border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {availableExercises.map((exercise) => (
                          <button
                            key={exercise.id}
                            onClick={() => addExerciseToSession(exercise)}
                            className="w-full px-4 py-3 text-left hover:bg-accent transition-colors border-b last:border-b-0"
                          >
                            <div className="font-medium">{exercise.name}</div>
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {exercise.description}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {exercise.muscle_groups.join(", ")} • {exercise.equipment_needed}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )}

            <div className="space-y-2 pt-2">
              <label className="text-sm font-medium">Workout Notes (Optional)</label>
              <Textarea
                placeholder="How did you feel? Any observations?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-4 sticky bottom-0 bg-background pb-2">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button onClick={finishWorkout} className="flex-1">
                Finish Workout
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
    </>
  );
};
