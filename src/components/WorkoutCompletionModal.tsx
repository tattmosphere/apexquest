import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp } from "lucide-react";

interface WorkoutCompletionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  xpGained: number;
  statsGained: {
    strength?: number;
    agility?: number;
    endurance?: number;
    focus?: number;
    resourcefulness?: number;
  };
  newLevel?: number;
  leveledUp: boolean;
  newAbilities?: any[];
  creditsGained?: number;
}

export const WorkoutCompletionModal = ({
  open,
  onOpenChange,
  xpGained,
  statsGained,
  newLevel,
  leveledUp,
  newAbilities = [],
  creditsGained = 0,
}: WorkoutCompletionModalProps) => {
  const [displayXP, setDisplayXP] = useState(0);

  useEffect(() => {
    if (open && xpGained > 0) {
      // Animate XP counter
      let current = 0;
      const increment = Math.ceil(xpGained / 30);
      const timer = setInterval(() => {
        current += increment;
        if (current >= xpGained) {
          setDisplayXP(xpGained);
          clearInterval(timer);
        } else {
          setDisplayXP(current);
        }
      }, 50);

      // Confetti animation removed for now

      return () => clearInterval(timer);
    }
  }, [open, xpGained, leveledUp]);

  const statEntries = Object.entries(statsGained).filter(([_, value]) => value && value > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <div className="text-center space-y-6 py-4">
          {leveledUp && newLevel && (
            <div className="space-y-2">
              <Sparkles className="h-16 w-16 mx-auto text-primary animate-pulse" />
              <h2 className="text-3xl font-bold text-primary">LEVEL UP!</h2>
              <p className="text-5xl font-bold">{newLevel}</p>
            </div>
          )}

          {!leveledUp && (
            <div className="space-y-2">
              <TrendingUp className="h-12 w-12 mx-auto text-primary" />
              <h2 className="text-2xl font-bold">Workout Complete!</h2>
            </div>
          )}

          <div className="space-y-3">
            <div className="p-4 bg-primary/10 rounded-lg">
              <p className="text-sm text-muted-foreground">XP Gained</p>
              <p className="text-3xl font-bold text-primary">+{displayXP}</p>
            </div>

            {creditsGained > 0 && (
              <div className="p-3 bg-accent/10 rounded-lg">
                <p className="text-sm text-muted-foreground">Survival Credits</p>
                <p className="text-2xl font-bold text-accent">+{creditsGained} SC</p>
              </div>
            )}

            {statEntries.length > 0 && (
              <div className="p-3 bg-secondary/10 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Stats Increased</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {statsGained.strength && statsGained.strength > 0 && (
                    <div>💪 Strength +{statsGained.strength}</div>
                  )}
                  {statsGained.agility && statsGained.agility > 0 && (
                    <div>⚡ Agility +{statsGained.agility}</div>
                  )}
                  {statsGained.endurance && statsGained.endurance > 0 && (
                    <div>❤️ Endurance +{statsGained.endurance}</div>
                  )}
                  {statsGained.focus && statsGained.focus > 0 && (
                    <div>🧠 Focus +{statsGained.focus}</div>
                  )}
                  {statsGained.resourcefulness && statsGained.resourcefulness > 0 && (
                    <div>🎯 Resourcefulness +{statsGained.resourcefulness}</div>
                  )}
                </div>
              </div>
            )}

            {newAbilities.length > 0 && (
              <div className="p-3 bg-primary/10 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">New Abilities Unlocked!</p>
                <div className="space-y-1">
                  {newAbilities.map((ability) => (
                    <p key={ability.id} className="text-sm font-semibold">
                      ⚡ {ability.name}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Button onClick={() => onOpenChange(false)} size="lg" className="w-full">
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
