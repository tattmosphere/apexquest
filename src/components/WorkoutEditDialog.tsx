import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Trash2, X } from "lucide-react";

interface Exercise {
  id: string;
  name: string;
  description: string;
}

interface WorkoutExercise {
  exercise_id: string;
  order_index: number;
  sets: number;
  target_reps: number;
  target_weight: number | null;
  exercises?: Exercise;
}

interface WorkoutEditDialogProps {
  open: boolean;
  onClose: () => void;
  workoutId: string | null;
  onWorkoutUpdated: () => void;
}

export const WorkoutEditDialog = ({ open, onClose, workoutId, onWorkoutUpdated }: WorkoutEditDialogProps) => {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && workoutId) {
      loadWorkout();
    }
  }, [open, workoutId]);

  const loadWorkout = async () => {
    if (!workoutId) return;

    try {
      // Load workout details
      const { data: workout, error: workoutError } = await supabase
        .from("workouts")
        .select("*")
        .eq("id", workoutId)
        .single();

      if (workoutError) throw workoutError;

      setTitle(workout.title);
      setDescription(workout.description || "");
      setCategory(workout.category);
      setDurationMinutes(workout.duration_minutes);

      // Load workout exercises
      const { data: workoutExercises, error: exercisesError } = await supabase
        .from("workout_exercises")
        .select(`
          exercise_id,
          order_index,
          sets,
          target_reps,
          target_weight,
          exercises (id, name, description)
        `)
        .eq("workout_id", workoutId)
        .order("order_index");

      if (exercisesError) throw exercisesError;

      setExercises(workoutExercises || []);
    } catch (error: any) {
      console.error("Error loading workout:", error);
      toast.error("Failed to load workout");
    }
  };

  const searchExercises = async (term: string) => {
    if (term.length < 2) {
      setAvailableExercises([]);
      return;
    }

    const { data, error } = await supabase
      .from("exercises")
      .select("id, name, description")
      .ilike("name", `%${term}%`)
      .limit(5);

    if (error) {
      console.error("Error searching exercises:", error);
      return;
    }

    setAvailableExercises(data || []);
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      searchExercises(searchTerm);
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchTerm]);

  const addExercise = (exercise: Exercise) => {
    const newExercise: WorkoutExercise = {
      exercise_id: exercise.id,
      order_index: exercises.length,
      sets: 3,
      target_reps: 12,
      target_weight: null,
      exercises: exercise,
    };
    setExercises([...exercises, newExercise]);
    setSearchTerm("");
    setAvailableExercises([]);
  };

  const removeExercise = (index: number) => {
    const updated = exercises.filter((_, i) => i !== index);
    // Reorder
    updated.forEach((ex, i) => {
      ex.order_index = i;
    });
    setExercises(updated);
  };

  const updateExercise = (index: number, field: keyof WorkoutExercise, value: any) => {
    const updated = [...exercises];
    updated[index] = { ...updated[index], [field]: value };
    setExercises(updated);
  };

  const saveWorkout = async () => {
    if (!workoutId || !user) return;

    if (!title.trim()) {
      toast.error("Please enter a workout title");
      return;
    }

    if (exercises.length === 0) {
      toast.error("Please add at least one exercise");
      return;
    }

    setLoading(true);

    try {
      // Update workout
      const { error: workoutError } = await supabase
        .from("workouts")
        .update({
          title: title.trim(),
          description: description.trim(),
          category,
          duration_minutes: durationMinutes,
          exercises_count: exercises.length,
        })
        .eq("id", workoutId);

      if (workoutError) throw workoutError;

      // Delete existing exercises
      const { error: deleteError } = await supabase
        .from("workout_exercises")
        .delete()
        .eq("workout_id", workoutId);

      if (deleteError) throw deleteError;

      // Insert new exercises
      const exercisesToInsert = exercises.map((ex) => ({
        workout_id: workoutId,
        exercise_id: ex.exercise_id,
        order_index: ex.order_index,
        sets: ex.sets,
        target_reps: ex.target_reps,
        target_weight: ex.target_weight,
      }));

      const { error: insertError } = await supabase
        .from("workout_exercises")
        .insert(exercisesToInsert);

      if (insertError) throw insertError;

      toast.success("Workout updated successfully!");
      onWorkoutUpdated();
      onClose();
    } catch (error: any) {
      console.error("Error updating workout:", error);
      toast.error("Failed to update workout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Workout</DialogTitle>
          <DialogDescription>
            Modify workout details and exercises
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div>
            <label className="text-sm font-medium">Workout Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Upper Body Strength"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your workout..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Category</label>
              <Input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., Strength, Cardio"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Duration (minutes)</label>
              <Input
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 30)}
                min={1}
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">Exercises</h3>
            
            <div className="space-y-3 mb-4">
              {exercises.map((exercise, index) => (
                <div key={index} className="flex gap-2 items-start p-3 border rounded-lg bg-card">
                  <div className="flex-1 space-y-2">
                    <div className="font-medium">{exercise.exercises?.name}</div>
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        type="number"
                        placeholder="Sets"
                        value={exercise.sets}
                        onChange={(e) => updateExercise(index, 'sets', parseInt(e.target.value) || 3)}
                        className="h-8"
                      />
                      <Input
                        type="number"
                        placeholder="Reps"
                        value={exercise.target_reps}
                        onChange={(e) => updateExercise(index, 'target_reps', parseInt(e.target.value) || 12)}
                        className="h-8"
                      />
                      <Input
                        type="number"
                        placeholder="Weight"
                        value={exercise.target_weight || ""}
                        onChange={(e) => updateExercise(index, 'target_weight', parseFloat(e.target.value) || null)}
                        className="h-8"
                      />
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeExercise(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Add Exercise</label>
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
                        onClick={() => addExercise(exercise)}
                        className="w-full px-4 py-2 text-left hover:bg-accent transition-colors"
                      >
                        <div className="font-medium">{exercise.name}</div>
                        <div className="text-sm text-muted-foreground">{exercise.description}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={saveWorkout} disabled={loading} className="flex-1">
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
