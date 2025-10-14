import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Lock } from "lucide-react";

interface AchievementBadgeProps {
  title: string;
  description: string;
  unlocked: boolean;
  icon?: React.ReactNode;
}

export const AchievementBadge = ({ 
  title, 
  description, 
  unlocked,
  icon 
}: AchievementBadgeProps) => {
  return (
    <Card className={`relative overflow-hidden p-4 transition-all duration-300 ${
      unlocked 
        ? 'bg-gradient-card shadow-card hover:shadow-elevated border-accent/30' 
        : 'bg-muted/50 border-border/50 opacity-60'
    }`}>
      <div className="flex items-start gap-3">
        <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
          unlocked ? 'bg-gradient-streak shadow-md' : 'bg-muted'
        }`}>
          {unlocked ? (
            icon || <Award className="h-6 w-6 text-accent-foreground" />
          ) : (
            <Lock className="h-6 w-6 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-sm text-foreground">{title}</h4>
            {unlocked && (
              <Badge variant="secondary" className="text-xs">
                Unlocked
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>
        </div>
      </div>
      {unlocked && (
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-streak opacity-10 blur-2xl" />
      )}
    </Card>
  );
};
