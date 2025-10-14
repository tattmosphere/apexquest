import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dumbbell, Clock, TrendingUp, Edit, Trash2 } from "lucide-react";

interface WorkoutCardProps {
  title: string;
  duration: string;
  exercises: number;
  onStart: () => void;
  isCustom?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const WorkoutCard = ({ title, duration, exercises, onStart, isCustom, onEdit, onDelete }: WorkoutCardProps) => {
  return (
    <Card 
      className="group overflow-hidden bg-gradient-card hover:shadow-elevated transition-all duration-300 border border-border/50"
    >
      <div className="p-5 space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
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
          <div className="flex items-center gap-2">
            {isCustom && onEdit && (
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="h-8 w-8"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {isCustom && onDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="h-8 w-8 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <Button 
          variant="hero"
          className="w-full"
          onClick={onStart}
        >
          Start Workout
        </Button>
      </div>
    </Card>
  );
};
