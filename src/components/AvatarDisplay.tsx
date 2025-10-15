import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Zap, Flame } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCharacter } from "@/hooks/useCharacter";
import { useAvatar } from "@/hooks/useAvatar";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { CharacterSheet } from "@/components/CharacterSheet";
import { getFitnessLevelName, getClassColor } from "@/utils/avatarAssets";

interface AvatarDisplayProps {
  level: number;
  totalPoints: number;
}

export const AvatarDisplay = ({ level, totalPoints }: AvatarDisplayProps) => {
  const { user } = useAuth();
  const { character, xpProgress } = useCharacter();
  const [imageError, setImageError] = useState(false);
  
  const avatarUrl = useAvatar(
    user?.id || '', 
    character?.class_type || 'warrior',
    [], // equipment
    level, // character level for fitness progression
    'medium', // skin tone - can be made customizable later
    'male', // gender - can be made customizable later
    !imageError // use real assets only if no error
  );
  const [showCharacterSheet, setShowCharacterSheet] = useState(false);

  // Debug logging
  useEffect(() => {
    if (character) {
      console.log('Avatar Debug Info:', {
        level,
        classType: character.class_type,
        avatarUrl,
        imageError
      });
    }
  }, [level, character, avatarUrl, imageError]);

  if (!character) return null;

  const classLabels: Record<string, string> = {
    warrior: "Warrior",
    scout: "Scout",
    endurance_athlete: "Endurance Athlete",
    monk: "Monk",
    hybrid: "Hybrid",
    survivor: "Survivor"
  };

  const fitnessLevel = getFitnessLevelName(level);
  const classColor = getClassColor(character.class_type);
  
  const classColors: Record<string, string> = {
    warrior: "border-warrior-red",
    scout: "border-scout-blue",
    endurance_athlete: "border-endurance-teal",
    monk: "border-elite-purple",
    hybrid: "border-apex-orange",
    survivor: "border-survivor-green"
  };

  const handleImageError = () => {
    console.error('Failed to load avatar image:', avatarUrl);
    setImageError(true);
  };

  return (
    <>
      <CharacterSheet 
        open={showCharacterSheet} 
        onOpenChange={setShowCharacterSheet}
        character={character}
        level={level}
      />
      <Card className="relative overflow-hidden bg-gradient-card p-6 shadow-card">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className={`h-24 w-24 rounded-full bg-gradient-primary p-1 shadow-glow border-2 ${classColors[character.class_type]}`}>
              <img 
                src={avatarUrl} 
                alt="Character Avatar" 
                className="h-full w-full rounded-full object-cover bg-background"
                onError={handleImageError}
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
              <h3 className="text-lg font-bold text-foreground">{classLabels[character.class_type]}</h3>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  <Flame className="h-3 w-3 mr-1" />
                  {fitnessLevel}
                </Badge>
                <p className="text-sm text-muted-foreground">{character.xp.toLocaleString()} XP</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <span>💪</span>
                <span>{character.strength} STR</span>
              </div>
              <div className="flex items-center gap-1">
                <span>⚡</span>
                <span>{character.agility} AGI</span>
              </div>
              <div className="flex items-center gap-1">
                <span>❤️</span>
                <span>{character.endurance} END</span>
              </div>
              <div className="flex items-center gap-1">
                <span>🧠</span>
                <span>{character.focus} FOC</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Level Progress</span>
                <span>{Math.floor(xpProgress)}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-primary rounded-full transition-all duration-500"
                  style={{ width: `${xpProgress}%` }}
                />
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowCharacterSheet(true)}
              className="w-full mt-2"
            >
              <Zap className="h-3 w-3 mr-1" />
              View Character
            </Button>
          </div>
        </div>
      </Card>
    </>
  );
};

