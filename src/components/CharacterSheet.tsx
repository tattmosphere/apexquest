import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Coins } from "lucide-react";
import { Character } from "@/hooks/useCharacter";
import { useAvatar } from "@/hooks/useAvatar";
import { useAuth } from "@/hooks/useAuth";
import { getChapter } from "@/data/storyChapters";

interface CharacterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  character: Character;
  level: number;
  currentChapter?: number;
}

export const CharacterSheet = ({ open, onOpenChange, character, level, currentChapter = 1 }: CharacterSheetProps) => {
  const { user } = useAuth();
  
  // Get full body avatar for hero banner
  const fullBodyAvatarUrl = useAvatar(
    user?.id || '', 
    character.class_type,
    [],
    level,
    character.avatar_skin_tone || 'medium',
    character.avatar_gender || 'male',
    true,
    'full'
  );
  
  // Get current chapter for background image
  const chapter = getChapter(currentChapter);
  const chapterBackground = chapter?.cards.find(card => card.image)?.image || '/story/chapter1/scene1.png';

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

        <div className="space-y-6">
          {/* Hero Banner with Story Background and Full Body Avatar */}
          <div className="relative h-64 -mx-6 -mt-6 overflow-hidden rounded-t-lg">
            {/* Background Image from Current Chapter */}
            <img 
              src={chapterBackground}
              alt="Story background"
              className="absolute inset-0 w-full h-full object-cover"
            />
            
            {/* Dark Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30" />
            
            {/* Content */}
            <div className="relative h-full flex items-end p-6 gap-6">
              {/* Full Body Avatar */}
              <div className="h-56 w-40 flex-shrink-0">
                <img 
                  src={fullBodyAvatarUrl} 
                  alt="Character" 
                  className="h-full w-full object-contain drop-shadow-2xl"
                />
              </div>
              
              {/* Character Info */}
              <div className="flex-1 space-y-2 pb-4">
                <div>
                  <h3 className="text-3xl font-bold text-white drop-shadow-lg">{info.name}</h3>
                  <p className="text-sm text-white/90 drop-shadow-md">{info.description}</p>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className="text-lg bg-primary/90 text-white border-white/30">
                    Level {level}
                  </Badge>
                  <div className="flex items-center gap-2 text-white/90">
                    <Coins className="h-4 w-4" />
                    <span className="font-semibold">{character.survival_credits} SC</span>
                  </div>
                </div>
                {chapter && (
                  <p className="text-xs text-white/70 italic">
                    Currently on: {chapter.title}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Core Stats */}
          <Card className="p-4 bg-card/50 mx-6">
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
          <Card className="p-4 bg-card/50 mx-6">
            <h4 className="font-semibold mb-2">Experience</h4>
            <p className="text-2xl font-bold mb-2">{character.xp.toLocaleString()} XP</p>
            <p className="text-xs text-muted-foreground">
              Keep training to level up and unlock new abilities!
            </p>
          </Card>

          {/* Secondary Class */}
          {character.secondary_class && (
            <Card className="p-4 bg-card/50 mx-6 mb-6">
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