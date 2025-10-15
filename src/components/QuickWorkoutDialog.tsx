import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Play, Pause, Square } from "lucide-react";

interface QuickWorkoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userWeight: number;
  onWorkoutComplete: () => void;
}

interface Exercise {
  id: string;
  name: string;
  met_value: number;
}

export const QuickWorkoutDialog = ({ open, onOpenChange, userId, userWeight, onWorkoutComplete }: QuickWorkoutDialogProps) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<string>("");
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    loadCardioExercises();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const loadCardioExercises = async () => {
    const { data, error } = await supabase
      .from('exercises')
      .select('id, name, met_value')
      .eq('category', 'cardio')
      .eq('supports_time', true)
      .order('name');

    if (error) {
      toast({ title: "Error loading exercises", variant: "destructive" });
      return;
    }

    setExercises(data || []);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = async () => {
    if (!selectedExercise) {
      toast({ title: "Please select an exercise", variant: "destructive" });
      return;
    }

    // Create workout session
    const { data: sessionData, error: sessionError } = await supabase
      .from('workout_sessions')
      .insert({
        user_id: userId,
        workout_id: '00000000-0000-0000-0000-000000000001', // dummy workout for quick sessions
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (sessionError || !sessionData) {
      toast({ title: "Error starting workout", variant: "destructive" });
      return;
    }

    setSessionId(sessionData.id);
    setIsRunning(true);
    toast({ title: "Workout started!", description: "Timer is running" });
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleResume = () => {
    setIsRunning(true);
  };

  const handleFinish = async () => {
    if (!sessionId || elapsedSeconds === 0) return;

    setIsRunning(false);

    const durationMinutes = elapsedSeconds / 60;

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

    // Create session exercise
    const { error: exerciseError } = await supabase
      .from('workout_session_exercises')
      .insert({
        session_id: sessionId,
        exercise_id: selectedExercise,
        order_index: 0,
        completed: true,
        duration_minutes: Math.round(durationMinutes * 10) / 10,
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

    // Complete session
    const { error: updateError } = await supabase
      .from('workout_sessions')
      .update({ completed_at: new Date().toISOString() })
      .eq('id', sessionId);

    if (updateError) {
      toast({ title: "Error completing workout", variant: "destructive" });
      return;
    }

    // Create workout log
    await supabase.from('workout_logs').insert({
      user_id: userId,
      workout_id: null,
      workout_date: new Date().toISOString().split('T')[0],
      duration_minutes: Math.round(durationMinutes),
      notes: `Quick workout: ${exercises.find(e => e.id === selectedExercise)?.name}`,
    });

    // Update streak
    await supabase.rpc('update_user_streak', {
      p_user_id: userId,
      p_workout_date: new Date().toISOString().split('T')[0],
    });

    toast({
      title: "Workout completed!",
      description: `${Math.round(durationMinutes)} minutes, ${Math.round(calorieData.calories_burned)} calories burned`,
    });

    // Reset and close
    setElapsedSeconds(0);
    setSessionId(null);
    setSelectedExercise("");
    onWorkoutComplete();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Quick Workout</DialogTitle>
          <DialogDescription>
            Start a cardio workout and track your time
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Exercise</label>
            <Select value={selectedExercise} onValueChange={setSelectedExercise} disabled={isRunning || sessionId !== null}>
              <SelectTrigger>
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

          <div className="text-center py-8">
            <div className="text-6xl font-bold font-mono tabular-nums">
              {formatTime(elapsedSeconds)}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {elapsedSeconds > 0 && `${Math.round(elapsedSeconds / 60)} minutes`}
            </p>
          </div>

          <div className="flex gap-2 justify-center">
            {!sessionId ? (
              <Button onClick={handleStart} size="lg" className="gap-2">
                <Play className="h-4 w-4" />
                Start
              </Button>
            ) : (
              <>
                {isRunning ? (
                  <Button onClick={handlePause} variant="outline" size="lg" className="gap-2">
                    <Pause className="h-4 w-4" />
                    Pause
                  </Button>
                ) : (
                  <Button onClick={handleResume} size="lg" className="gap-2">
                    <Play className="h-4 w-4" />
                    Resume
                  </Button>
                )}
                <Button onClick={handleFinish} variant="default" size="lg" className="gap-2" disabled={elapsedSeconds === 0}>
                  <Square className="h-4 w-4" />
                  Finish
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
