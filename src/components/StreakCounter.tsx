import { Flame } from "lucide-react";
import { Card } from "@/components/ui/card";

interface StreakCounterProps {
  streakDays: number;
}

export const StreakCounter = ({ streakDays }: StreakCounterProps) => {
  return (
    <Card className="relative overflow-hidden bg-gradient-streak p-6 shadow-elevated border-0">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-accent-foreground/80">Current Streak</p>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold text-accent-foreground">{streakDays}</span>
            <span className="text-lg font-medium text-accent-foreground/80">days</span>
          </div>
        </div>
        <div className="relative">
          <Flame className="h-16 w-16 text-accent-foreground animate-pulse-glow" />
          <div className="absolute inset-0 blur-xl bg-accent-glow/30 animate-pulse-glow" />
        </div>
      </div>
      <div className="mt-4 h-2 bg-accent-foreground/20 rounded-full overflow-hidden">
        <div 
          className="h-full bg-accent-foreground/60 rounded-full transition-all duration-500"
          style={{ width: `${Math.min((streakDays % 7) * (100 / 7), 100)}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-accent-foreground/70">
        Keep going! {7 - (streakDays % 7)} day{7 - (streakDays % 7) !== 1 ? 's' : ''} until next milestone
      </p>
    </Card>
  );
};
