import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

interface LogPastWorkoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userWeight: number;
  onWorkoutLogged: () => void;
}

interface Exercise {
  id: string;
  name: string;
  category: string;
  met_value: number;
}

export const LogPastWorkoutDialog = ({ open, onOpenChange, userId, userWeight, onWorkoutLogged }: LogPastWorkoutDialogProps) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<string>("");
  const [date, setDate] = useState<Date>(new Date());
  const [time, setTime] = useState<string>("12:00");
  const [duration, setDuration] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    const { data, error } = await supabase
      .from('exercises')
      .select('id, name, category, met_value')
      .eq('supports_time', true)
      .order('name');

    if (error) {
      toast({ title: "Error loading exercises", variant: "destructive" });
      return;
    }

    setExercises(data || []);
  };

  const handleSubmit = async () => {
    if (!selectedExercise || !duration || parseFloat(duration) <= 0) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }

    setIsSaving(true);

    try {
      const durationMinutes = parseFloat(duration);
      const workoutDate = format(date, 'yyyy-MM-dd');
      const startedAt = new Date(`${workoutDate}T${time}:00`);

      // Calculate calories
      const { data: calorieData, error: calorieError } = await supabase.functions.invoke('calculate-exercise-calories', {
        body: {
          exercise_id: selectedExercise,
          user_weight_lbs: userWeight,
          duration_minutes: durationMinutes,
        }
      });

      if (calorieError) {
        toast({ title: "Error calculating calories", variant: "destructive" });
        return;
      }

      // Create workout session
      const { data: sessionData, error: sessionError } = await supabase
        .from('workout_sessions')
        .insert({
          user_id: userId,
          workout_id: '00000000-0000-0000-0000-000000000001', // dummy workout for manual logs
          started_at: startedAt.toISOString(),
          completed_at: new Date(startedAt.getTime() + durationMinutes * 60000).toISOString(),
        })
        .select()
        .single();

      if (sessionError || !sessionData) {
        toast({ title: "Error creating session", variant: "destructive" });
        return;
      }

      // Create session exercise
      const { error: exerciseError } = await supabase
        .from('workout_session_exercises')
        .insert({
          session_id: sessionData.id,
          exercise_id: selectedExercise,
          order_index: 0,
          completed: true,
          duration_minutes: durationMinutes,
          calories_burned: calorieData.calories_burned,
          user_weight_at_time: userWeight,
          sets_completed: 1,
          reps: [],
          weights: [],
        });

      if (exerciseError) {
        toast({ title: "Error saving exercise", variant: "destructive" });
        return;
      }

      // Create workout log
      await supabase.from('workout_logs').insert({
        user_id: userId,
        workout_id: null,
        workout_date: workoutDate,
        duration_minutes: Math.round(durationMinutes),
        notes: `Past workout: ${exercises.find(e => e.id === selectedExercise)?.name}`,
      });

      // Update streak
      await supabase.rpc('update_user_streak', {
        p_user_id: userId,
        p_workout_date: workoutDate,
      });

      toast({
        title: "Workout logged!",
        description: `${Math.round(durationMinutes)} minutes, ${Math.round(calorieData.calories_burned)} calories burned`,
      });

      // Reset form
      setSelectedExercise("");
      setDuration("");
      setDate(new Date());
      setTime("12:00");
      onWorkoutLogged();
      onOpenChange(false);
    } catch (error) {
      console.error('Error logging workout:', error);
      toast({ title: "Error logging workout", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Log Past Workout</DialogTitle>
          <DialogDescription>
            Add a workout that you completed in the past
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="exercise">Exercise</Label>
            <Select value={selectedExercise} onValueChange={setSelectedExercise}>
              <SelectTrigger id="exercise">
                <SelectValue placeholder="Choose exercise..." />
              </SelectTrigger>
              <SelectContent>
                {exercises.map((exercise) => (
                  <SelectItem key={exercise.id} value={exercise.id}>
                    {exercise.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(date, "MMM d, yyyy")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              min="1"
              step="1"
              placeholder="30"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? "Saving..." : "Log Workout"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
