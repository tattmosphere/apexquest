import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Search, Plus, X } from "lucide-react";

interface Exercise {
  id: string;
  name: string;
  description: string;
  category: string;
  muscle_groups: string[];
  equipment_needed: string;
}

interface SelectedExercise extends Exercise {
  sets: number;
  target_reps: number;
  target_weight: number | null;
}

interface CustomWorkoutBuilderProps {
  open: boolean;
  onClose: () => void;
  onWorkoutCreated: () => void;
}

export const CustomWorkoutBuilder = ({ open, onClose, onWorkoutCreated }: CustomWorkoutBuilderProps) => {
  const { user } = useAuth();
  const [workoutTitle, setWorkoutTitle] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<SelectedExercise[]>([]);
  const [searching, setSearching] = useState(false);

  const searchExercises = async () => {
    if (!searchQuery.trim()) {
      setExercises([]);
      return;
    }

    setSearching(true);
    try {
      const { data, error } = await supabase
        .from("exercises")
        .select("*")
        .ilike("name", `%${searchQuery}%`)
        .limit(10);

      if (error) throw error;
      setExercises(data || []);
    } catch (error: any) {
      console.error("Error searching exercises:", error);
      toast.error("Failed to search exercises");
    } finally {
      setSearching(false);
    }
  };

  const addExercise = (exercise: Exercise) => {
    if (selectedExercises.find(e => e.id === exercise.id)) {
      toast.error("Exercise already added");
      return;
    }

    setSelectedExercises([
      ...selectedExercises,
      {
        ...exercise,
        sets: 3,
        target_reps: 12,
        target_weight: null,
      },
    ]);
    setSearchQuery("");
    setExercises([]);
  };

  const removeExercise = (exerciseId: string) => {
    setSelectedExercises(selectedExercises.filter(e => e.id !== exerciseId));
  };

  const updateExercise = (exerciseId: string, field: keyof SelectedExercise, value: any) => {
    setSelectedExercises(
      selectedExercises.map(e =>
        e.id === exerciseId ? { ...e, [field]: value } : e
      )
    );
  };

  const createWorkout = async () => {
    if (!user || !workoutTitle.trim() || selectedExercises.length === 0) {
      toast.error("Please add a title and at least one exercise");
      return;
    }

    try {
      // Create workout
      const { data: workout, error: workoutError } = await supabase
        .from("workouts")
        .insert({
          title: workoutTitle,
          description: "Custom workout",
          duration_minutes: 60,
          exercises_count: selectedExercises.length,
          category: "custom",
          is_custom: true,
          user_id: user.id,
        })
        .select()
        .single();

      if (workoutError) throw workoutError;

      // Add exercises to workout
      const workoutExercises = selectedExercises.map((ex, index) => ({
        workout_id: workout.id,
        exercise_id: ex.id,
        order_index: index,
        sets: ex.sets,
        target_reps: ex.target_reps,
        target_weight: ex.target_weight,
      }));

      const { error: exercisesError } = await supabase
        .from("workout_exercises")
        .insert(workoutExercises);

      if (exercisesError) throw exercisesError;

      toast.success("Custom workout created!");
      setWorkoutTitle("");
      setSelectedExercises([]);
      onWorkoutCreated();
      onClose();
    } catch (error: any) {
      console.error("Error creating workout:", error);
      toast.error("Failed to create workout");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Custom Workout</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label htmlFor="title">Workout Title</Label>
            <Input
              id="title"
              value={workoutTitle}
              onChange={(e) => setWorkoutTitle(e.target.value)}
              placeholder="My Custom Workout"
            />
          </div>

          <div>
            <Label>Search & Add Exercises</Label>
            <div className="flex gap-2 mt-2">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search exercises..."
                onKeyPress={(e) => e.key === "Enter" && searchExercises()}
              />
              <Button onClick={searchExercises} disabled={searching}>
                <Search className="h-4 w-4" />
              </Button>
            </div>

            {exercises.length > 0 && (
              <div className="mt-2 border rounded-lg divide-y max-h-48 overflow-y-auto">
                {exercises.map((exercise) => (
                  <div
                    key={exercise.id}
                    className="p-3 hover:bg-accent cursor-pointer flex items-center justify-between"
                    onClick={() => addExercise(exercise)}
                  >
                    <div>
                      <p className="font-medium">{exercise.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {exercise.muscle_groups.join(", ")}
                      </p>
                    </div>
                    <Plus className="h-4 w-4" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedExercises.length > 0 && (
            <div>
              <Label>Selected Exercises ({selectedExercises.length})</Label>
              <div className="space-y-3 mt-2">
                {selectedExercises.map((exercise) => (
                  <div key={exercise.id} className="border rounded-lg p-3">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-medium">{exercise.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {exercise.muscle_groups.join(", ")}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeExercise(exercise.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label className="text-xs">Sets</Label>
                        <Input
                          type="number"
                          value={exercise.sets}
                          onChange={(e) =>
                            updateExercise(exercise.id, "sets", parseInt(e.target.value) || 0)
                          }
                          min="1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Reps</Label>
                        <Input
                          type="number"
                          value={exercise.target_reps}
                          onChange={(e) =>
                            updateExercise(exercise.id, "target_reps", parseInt(e.target.value) || 0)
                          }
                          min="1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Weight (optional)</Label>
                        <Input
                          type="number"
                          value={exercise.target_weight || ""}
                          onChange={(e) =>
                            updateExercise(exercise.id, "target_weight", parseFloat(e.target.value) || null)
                          }
                          placeholder="0"
                          step="0.5"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={createWorkout} className="flex-1" disabled={!workoutTitle.trim() || selectedExercises.length === 0}>
              Create Workout
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
