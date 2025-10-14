import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";
import avatarDefault from "@/assets/avatar-default.png";

interface AvatarDisplayProps {
  level: number;
  totalPoints: number;
}

export const AvatarDisplay = ({ level, totalPoints }: AvatarDisplayProps) => {
  const pointsToNextLevel = (level + 1) * 100;
  const currentLevelPoints = totalPoints % 100;
  const progress = (currentLevelPoints / 100) * 100;

  return (
    <Card className="relative overflow-hidden bg-gradient-card p-6 shadow-card">
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="h-24 w-24 rounded-full bg-gradient-primary p-1 shadow-glow">
            <img 
              src={avatarDefault} 
              alt="Fitness Avatar" 
              className="h-full w-full rounded-full object-cover bg-background"
            />
          </div>
          <Badge 
            className="absolute -bottom-1 -right-1 bg-gradient-streak text-accent-foreground border-0 shadow-md"
          >
            <Trophy className="h-3 w-3 mr-1" />
            Lv {level}
          </Badge>
        </div>
        <div className="flex-1 space-y-2">
          <div>
            <h3 className="text-lg font-bold text-foreground">Fitness Champion</h3>
            <p className="text-sm text-muted-foreground">{totalPoints.toLocaleString()} total points</p>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Level Progress</span>
              <span>{currentLevelPoints}/{100} XP</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-primary rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
