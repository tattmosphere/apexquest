import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dumbbell, Clock, TrendingUp } from "lucide-react";

interface WorkoutCardProps {
  title: string;
  duration: string;
  exercises: number;
  onStart: () => void;
}

export const WorkoutCard = ({ title, duration, exercises, onStart }: WorkoutCardProps) => {
  return (
    <Card 
      className="group overflow-hidden bg-gradient-card hover:shadow-elevated transition-all duration-300 cursor-pointer border border-border/50"
      onClick={onStart}
    >
      <div className="p-5 space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
              {title}
            </h3>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {duration}
              </span>
              <span className="flex items-center gap-1">
                <Dumbbell className="h-4 w-4" />
                {exercises} exercises
              </span>
            </div>
          </div>
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <TrendingUp className="h-6 w-6 text-primary" />
          </div>
        </div>
        <Button 
          variant="hero"
          className="w-full"
        >
          Start Workout
        </Button>
      </div>
    </Card>
  );
};
