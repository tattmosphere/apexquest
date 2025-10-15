import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Coins } from "lucide-react";
import { Character } from "@/hooks/useCharacter";
import { useAvatar } from "@/hooks/useAvatar";
import { useAuth } from "@/hooks/useAuth";

interface CharacterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  character: Character;
  level: number;
}

export const CharacterSheet = ({ open, onOpenChange, character, level }: CharacterSheetProps) => {
  const { user } = useAuth();
  const avatarUrl = useAvatar(
    user?.id || '', 
    character.class_type,
    [],
    level,
    character.avatar_skin_tone || 'medium',
    character.avatar_gender || 'male',
    true
  );

  const classInfo: Record<string, { name: string; description: string }> = {
    warrior: { name: "Warrior", description: "Masters of strength training and raw power" },
    scout: { name: "Scout", description: "Speed demons who excel at cardio and agility" },
    endurance_athlete: { name: "Endurance Athlete", description: "Stamina specialists from cycling, rowing, and erg" },
    monk: { name: "Monk", description: "Balance and focus through yoga and flexibility" },
    hybrid: { name: "Hybrid Fighter", description: "Versatile athletes who master all disciplines" },
    survivor: { name: "Survivor", description: "Resilient daily movers who thrive on consistency" }
  };

  const info = classInfo[character.class_type];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Character Sheet</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Avatar and Basic Info */}
          <div className="flex items-center gap-6">
            <div className="h-32 w-32 rounded-full border-4 border-primary overflow-hidden bg-background flex-shrink-0">
              <img 
                src={avatarUrl} 
                alt="Character" 
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex-1 space-y-2">
              <div>
                <h3 className="text-2xl font-bold">{info.name}</h3>
                <p className="text-sm text-muted-foreground">{info.description}</p>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="text-lg">
                  Level {level}
                </Badge>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Coins className="h-4 w-4" />
                  <span>{character.survival_credits} SC</span>
                </div>
              </div>
            </div>
          </div>

          {/* Core Stats */}
          <Card className="p-4 bg-card/50">
            <h4 className="font-semibold mb-4">Core Stats</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium flex items-center gap-2">
                    💪 Strength
                  </span>
                  <span className="text-lg font-bold">{character.strength}</span>
                </div>
                <Progress value={(character.strength / 200) * 100} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium flex items-center gap-2">
                    ⚡ Agility
                  </span>
                  <span className="text-lg font-bold">{character.agility}</span>
                </div>
                <Progress value={(character.agility / 200) * 100} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium flex items-center gap-2">
                    ❤️ Endurance
                  </span>
                  <span className="text-lg font-bold">{character.endurance}</span>
                </div>
                <Progress value={(character.endurance / 200) * 100} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium flex items-center gap-2">
                    🧠 Focus
                  </span>
                  <span className="text-lg font-bold">{character.focus}</span>
                </div>
                <Progress value={(character.focus / 200) * 100} className="h-2" />
              </div>

              <div className="space-y-2 col-span-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium flex items-center gap-2">
                    🎯 Resourcefulness
                  </span>
                  <span className="text-lg font-bold">{character.resourcefulness}</span>
                </div>
                <Progress value={(character.resourcefulness / 200) * 100} className="h-2" />
              </div>
            </div>
          </Card>

          {/* XP Progress */}
          <Card className="p-4 bg-card/50">
            <h4 className="font-semibold mb-2">Experience</h4>
            <p className="text-2xl font-bold mb-2">{character.xp.toLocaleString()} XP</p>
            <p className="text-xs text-muted-foreground">
              Keep training to level up and unlock new abilities!
            </p>
          </Card>

          {/* Secondary Class */}
          {character.secondary_class && (
            <Card className="p-4 bg-card/50">
              <h4 className="font-semibold mb-2">Secondary Class</h4>
              <Badge variant="secondary">
                {classInfo[character.secondary_class]?.name}
              </Badge>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};